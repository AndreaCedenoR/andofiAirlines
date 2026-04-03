const express = require("express");
const { FLIGHT_TEMPLATES } = require("../data/flights");

const router = express.Router();

function isISODate(date) {
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
}

function buildFlightsForDate(date) {
  return FLIGHT_TEMPLATES.map((flight) => ({
    FlightNumber: flight.flightNumber,
    DepartureAirport: flight.departureAirport,
    ArrivalAirport: flight.arrivalAirport,
    DepartureDateTime: `${date} ${flight.departureTime}`,
    ArrivalDateTime: `${date} ${flight.arrivalTime}`
  }));
}

function buildInvoicesForFlight(flightNumber) {
  return [
    {
      _id: `invoice_${flightNumber}_1`,
      pnr: "ABC123",
      email: "client@mail.com",
      phone: "04141234567",
      passengers: [
        {
          first_name: "JUAN",
          last_name: "PEREZ",
          document: "V12345678",
          ticket_number: "742000001"
        },
        {
          first_name: "MARIA",
          last_name: "PEREZ",
          document: "V99887766",
          ticket_number: "742000002"
        }
      ]
    },
    {
      _id: `invoice_${flightNumber}_2`,
      pnr: "XYZ789",
      email: "another.client@mail.com",
      phone: "04149990000",
      passengers: [
        {
          first_name: "CARLOS",
          last_name: "RODRIGUEZ",
          document: "E11223344",
          ticket_number: "742000003"
        }
      ]
    }
  ];
}

router.get("/flights", (req, res) => {
  const { date } = req.query;

  if (!date || !isISODate(date)) {
    return res.status(400).json({
      error: "ValidationError",
      message: "date is required in format YYYY-MM-DD"
    });
  }

  return res.json({
    data: buildFlightsForDate(date)
  });
});

router.get("/", (req, res) => {
  const { flightNumber, date } = req.query;

  if (!flightNumber) {
    return res.status(400).json({
      error: "ValidationError",
      message: "flightNumber is required"
    });
  }

  if (!date || !isISODate(date)) {
    return res.status(400).json({
      error: "ValidationError",
      message: "date is required in format YYYY-MM-DD"
    });
  }

  const exists = FLIGHT_TEMPLATES.some((flight) => flight.flightNumber === String(flightNumber));

  return res.json({
    docs: exists ? buildInvoicesForFlight(String(flightNumber)) : []
  });
});

module.exports = {
  invoicesRouter: router
};
