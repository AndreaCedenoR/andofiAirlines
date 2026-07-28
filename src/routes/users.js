const express = require("express");
const { CUSTOMERS } = require("../data/customers");
const { EMPLOYEES } = require("../data/employees");

const router = express.Router();

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function hasCustomerQuery(params) {
  return ["page", "limit", "search", "segment", "status"].some((key) => Object.prototype.hasOwnProperty.call(params, key));
}

router.get("/", (req, res) => {
  if (!hasCustomerQuery(req.query)) {
    return res.json(EMPLOYEES);
  }

  const page = Math.max(Number.parseInt(req.query.page || "1", 10), 1);
  const limit = Math.max(Number.parseInt(req.query.limit || "10", 10), 1);
  const search = normalize(req.query.search);
  const segment = normalize(req.query.segment);
  const status = normalize(req.query.status);

  let filtered = CUSTOMERS;

  if (search) {
    filtered = filtered.filter((customer) => {
      const haystack = [
        customer.firstName,
        customer.lastName,
        customer.email,
        customer.identification,
        customer.phone,
        customer.lastFlightNumber
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(search);
    });
  }

  if (segment) {
    filtered = filtered.filter((customer) => normalize(customer.segment) === segment);
  }

  if (status) {
    filtered = filtered.filter((customer) => normalize(customer.status) === status);
  }

  const start = (page - 1) * limit;
  const paged = filtered.slice(start, start + limit);

  return res.json({
    data: paged,
    meta: {
      page,
      limit,
      total: filtered.length,
      totalPages: Math.max(Math.ceil(filtered.length / limit), 1)
    }
  });
});

router.post("/", (req, res) => {
  const { firstName, lastName, email, phone, identification, city, nationality, segment, status } = req.body || {};

  if (!firstName || !lastName || !email) {
    return res.status(400).json({
      error: "ValidationError",
      message: "firstName, lastName and email are required"
    });
  }

  const normalizedEmail = normalize(email);
  const emailTaken = CUSTOMERS.some((customer) => normalize(customer.email) === normalizedEmail);

  if (emailTaken) {
    return res.status(409).json({
      error: "Conflict",
      message: "A customer with this email already exists"
    });
  }

  const newCustomer = {
    id: `cust_${CUSTOMERS.length + 1}`,
    firstName,
    lastName,
    email,
    phone: phone || "",
    identification: identification || "",
    city: city || "",
    nationality: nationality || "",
    isAviorPlus: false,
    aviorPlusNumber: "",
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

  CUSTOMERS.push(newCustomer);

  return res.status(201).json({ data: newCustomer });
});

router.get("/:id", (req, res) => {
  const customer = CUSTOMERS.find((item) => item.id === req.params.id);

  if (!customer) {
    return res.status(404).json({
      error: "NotFound",
      message: `Customer not found: ${req.params.id}`
    });
  }

  return res.json({ data: customer });
});

module.exports = {
  usersRouter: router
};
