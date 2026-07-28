const express = require("express");
const { randomUUID } = require("crypto");
const { getSql } = require("../db");
const { EMPLOYEES } = require("../data/employees");
const { SEED_CUSTOMERS } = require("../data/customers");

const router = express.Router();

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function hasCustomerQuery(params) {
  return ["page", "limit", "search", "segment", "status"].some((key) => Object.prototype.hasOwnProperty.call(params, key));
}

function rowToCustomer(row) {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone,
    identification: row.identification,
    city: row.city,
    nationality: row.nationality,
    isLasLindasPlus: row.is_las_lindas_plus,
    lasLindasPlusNumber: row.las_lindas_plus_number,
    sex: row.sex,
    birthDate: row.birth_date,
    preferredRoute: row.preferred_route,
    preferredPaymentMethod: row.preferred_payment_method,
    purchaseChannel: row.purchase_channel,
    totalPurchasesUSD: Number(row.total_purchases_usd),
    lastContactDate: row.last_contact_date,
    lastFlightDate: row.last_flight_date,
    lastFlightNumber: row.last_flight_number,
    status: row.status,
    segment: row.segment,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    tags: row.tags || []
  };
}

async function ensureCustomersTable(sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT DEFAULT '',
      identification TEXT DEFAULT '',
      city TEXT DEFAULT '',
      nationality TEXT DEFAULT '',
      is_las_lindas_plus BOOLEAN DEFAULT false,
      las_lindas_plus_number TEXT DEFAULT '',
      sex TEXT DEFAULT '',
      birth_date TEXT DEFAULT '',
      preferred_route TEXT DEFAULT '',
      preferred_payment_method TEXT DEFAULT '',
      purchase_channel TEXT DEFAULT '',
      total_purchases_usd NUMERIC DEFAULT 0,
      last_contact_date TEXT DEFAULT '',
      last_flight_date TEXT DEFAULT '',
      last_flight_number TEXT DEFAULT '',
      status TEXT DEFAULT 'active',
      segment TEXT DEFAULT 'new',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      tags TEXT[] DEFAULT '{}'
    )
  `;

  const [{ count }] = await sql`SELECT COUNT(*)::int AS count FROM customers`;

  if (count === 0) {
    for (const customer of SEED_CUSTOMERS) {
      await sql`
        INSERT INTO customers (
          id, first_name, last_name, email, phone, identification, city, nationality,
          is_las_lindas_plus, las_lindas_plus_number, sex, birth_date, preferred_route,
          preferred_payment_method, purchase_channel, total_purchases_usd, last_contact_date,
          last_flight_date, last_flight_number, status, segment, created_at, tags
        ) VALUES (
          ${customer.id}, ${customer.firstName}, ${customer.lastName}, ${customer.email},
          ${customer.phone}, ${customer.identification}, ${customer.city}, ${customer.nationality},
          ${customer.isLasLindasPlus}, ${customer.lasLindasPlusNumber}, ${customer.sex}, ${customer.birthDate},
          ${customer.preferredRoute}, ${customer.preferredPaymentMethod}, ${customer.purchaseChannel},
          ${customer.totalPurchasesUSD}, ${customer.lastContactDate}, ${customer.lastFlightDate},
          ${customer.lastFlightNumber}, ${customer.status}, ${customer.segment}, ${customer.createdAt}, ${customer.tags}
        )
        ON CONFLICT (id) DO NOTHING
      `;
    }
  }
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
    const offset = (page - 1) * limit;
    const searchPattern = `%${search}%`;

    const sql = getSql();
    await ensureCustomersTable(sql);

    const rows = await sql`
      SELECT * FROM customers
      WHERE (
        ${search} = '' OR
        first_name ILIKE ${searchPattern} OR
        last_name ILIKE ${searchPattern} OR
        email ILIKE ${searchPattern} OR
        identification ILIKE ${searchPattern} OR
        phone ILIKE ${searchPattern} OR
        last_flight_number ILIKE ${searchPattern}
      )
      AND (${segment} = '' OR segment ILIKE ${segment})
      AND (${status} = '' OR status ILIKE ${status})
      ORDER BY created_at ASC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const [{ count }] = await sql`
      SELECT COUNT(*)::int AS count FROM customers
      WHERE (
        ${search} = '' OR
        first_name ILIKE ${searchPattern} OR
        last_name ILIKE ${searchPattern} OR
        email ILIKE ${searchPattern} OR
        identification ILIKE ${searchPattern} OR
        phone ILIKE ${searchPattern} OR
        last_flight_number ILIKE ${searchPattern}
      )
      AND (${segment} = '' OR segment ILIKE ${segment})
      AND (${status} = '' OR status ILIKE ${status})
    `;

    return res.json({
      data: rows.map(rowToCustomer),
      meta: {
        page,
        limit,
        total: count,
        totalPages: Math.max(Math.ceil(count / limit), 1)
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

    const sql = getSql();
    await ensureCustomersTable(sql);

    const normalizedEmail = normalize(email);
    const existing = await sql`SELECT 1 FROM customers WHERE email ILIKE ${normalizedEmail} LIMIT 1`;

    if (existing.length > 0) {
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

    await sql`
      INSERT INTO customers (
        id, first_name, last_name, email, phone, identification, city, nationality,
        is_las_lindas_plus, las_lindas_plus_number, sex, birth_date, preferred_route,
        preferred_payment_method, purchase_channel, total_purchases_usd, last_contact_date,
        last_flight_date, last_flight_number, status, segment, created_at, tags
      ) VALUES (
        ${newCustomer.id}, ${newCustomer.firstName}, ${newCustomer.lastName}, ${newCustomer.email},
        ${newCustomer.phone}, ${newCustomer.identification}, ${newCustomer.city}, ${newCustomer.nationality},
        ${newCustomer.isLasLindasPlus}, ${newCustomer.lasLindasPlusNumber}, ${newCustomer.sex}, ${newCustomer.birthDate},
        ${newCustomer.preferredRoute}, ${newCustomer.preferredPaymentMethod}, ${newCustomer.purchaseChannel},
        ${newCustomer.totalPurchasesUSD}, ${newCustomer.lastContactDate}, ${newCustomer.lastFlightDate},
        ${newCustomer.lastFlightNumber}, ${newCustomer.status}, ${newCustomer.segment}, ${newCustomer.createdAt}, ${newCustomer.tags}
      )
    `;

    return res.status(201).json({ data: newCustomer });
  } catch (error) {
    return next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const sql = getSql();
    await ensureCustomersTable(sql);

    const rows = await sql`SELECT * FROM customers WHERE id = ${req.params.id} LIMIT 1`;

    if (rows.length === 0) {
      return res.status(404).json({
        error: "NotFound",
        message: `Customer not found: ${req.params.id}`
      });
    }

    return res.json({ data: rowToCustomer(rows[0]) });
  } catch (error) {
    return next(error);
  }
});

module.exports = {
  usersRouter: router
};
