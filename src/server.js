const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const { authMiddleware } = require("./middleware/auth");
const { authRouter } = require("./routes/auth");
const { invoicesRouter } = require("./routes/invoices");
const { usersRouter } = require("./routes/users");
const { openApiSpec } = require("./openapi");

const app = express();
const PORT = Number.parseInt(process.env.PORT || "3000", 10);

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/openapi.json", (_req, res) => {
  res.json(openApiSpec);
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));

app.use("/auth", authRouter);
app.use(authMiddleware);
app.use("/invoices", invoicesRouter);
app.use("/users", usersRouter);

app.use((req, res) => {
  res.status(404).json({
    error: "NotFound",
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${PORT}`);
});
