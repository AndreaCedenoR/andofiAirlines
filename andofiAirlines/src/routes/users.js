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
      const haystack = [customer.firstName, customer.lastName, customer.email, customer.identification, customer.phone, customer.lastFlightNumber].join(" ").toLowerCase();
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

module.exports = {
  usersRouter: router
};
