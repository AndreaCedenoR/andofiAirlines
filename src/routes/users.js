const express = require("express");
const { randomUUID } = require("crypto");
const { getDb } = require("../db");
const { EMPLOYEES } = require("../data/employees");
const { SEED_CUSTOMERS } = require("../data/customers");

const router = express.Router();

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function hasCustomerQuery(params) {
  return ["page", "limit", "search", "segment", "status"].some((key) => Object.prototype.hasOwnProperty.call(params, key));
}

async function getCustomersCollection() {
  const db = await getDb();
  const collection = db.collection("customers");

  const count = await collection.countDocuments();
  if (count === 0) {
    await collection.insertMany(SEED_CUSTOMERS.map((customer) => ({ ...customer })));
  }

  return collection;
}

router.get("/", async (req, res, next) => {
  try {
    if (!hasCustomerQuery(req.query)) {
      return res.json(EMPLOYEES);
    }

    const page = Math.max(Number.parseInt(req.query.page || "1", 10), 1);
    const limit = Math.max(Number.parseInt(req.query.limit || "10", 10), 1);
    const search = normalize(req.query.search);
    const segment = normalize(req.query.segment);
    const status = normalize(req.query.status);

    const filter = {};

    if (search) {
      const pattern = new RegExp(escapeRegex(search), "i");
      filter.$or = [
        { firstName: pattern },
        { lastName: pattern },
        { email: pattern },
        { identification: pattern },
        { phone: pattern },
        { lastFlightNumber: pattern }
      ];
    }

    if (segment) {
      filter.segment = new RegExp(`^${escapeRegex(segment)}$`, "i");
    }

    if (status) {
      filter.status = new RegExp(`^${escapeRegex(status)}$`, "i");
    }

    const collection = await getCustomersCollection();
    const total = await collection.countDocuments(filter);
    const start = (page - 1) * limit;
    const paged = await collection
      .find(filter, { projection: { _id: 0 } })
      .skip(start)
      .limit(limit)
      .toArray();

    return res.json({
      data: paged,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(Math.ceil(total / limit), 1)
      }
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone, identification, city, nationality, segment, status } = req.body || {};

    if (!firstName || !lastName || !email) {
      return res.status(400).json({
        error: "ValidationError",
        message: "firstName, lastName and email are required"
      });
    }

    const collection = await getCustomersCollection();
    const normalizedEmail = normalize(email);
    const emailTaken = await collection.findOne({
      email: new RegExp(`^${escapeRegex(normalizedEmail)}$`, "i")
    });

    if (emailTaken) {
      return res.status(409).json({
        error: "Conflict",
        message: "A customer with this email already exists"
      });
    }

    const newCustomer = {
      id: randomUUID(),
      firstName,
      lastName,
      email,
      phone: phone || "",
      identification: identification || "",
      city: city || "",
      nationality: nationality || "",
      isLasLindasPlus: false,
      lasLindasPlusNumber: "",
      sex: "",
      birthDate: "",
      preferredRoute: "",
      preferredPaymentMethod: "",
      purchaseChannel: "",
      totalPurchasesUSD: 0,
      lastContactDate: "",
      lastFlightDate: "",
      lastFlightNumber: "",
      status: status || "active",
      segment: segment || "new",
      createdAt: new Date().toISOString(),
      tags: []
    };

    await collection.insertOne({ ...newCustomer });

    return res.status(201).json({ data: newCustomer });
  } catch (error) {
    return next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const collection = await getCustomersCollection();
    const customer = await collection.findOne({ id: req.params.id }, { projection: { _id: 0 } });

    if (!customer) {
      return res.status(404).json({
        error: "NotFound",
        message: `Customer not found: ${req.params.id}`
      });
    }

    return res.json({ data: customer });
  } catch (error) {
    return next(error);
  }
});

module.exports = {
  usersRouter: router
};
