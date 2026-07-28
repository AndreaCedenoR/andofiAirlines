require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { authMiddleware } = require("./middleware/auth");
const { authRouter } = require("./routes/auth");
const { invoicesRouter } = require("./routes/invoices");
const { usersRouter } = require("./routes/users");
const { openApiSpec } = require("./openapi");
const { getSql } = require("./db");

const app = express();
const PORT = Number.parseInt(process.env.PORT || "3000", 10);

// Vercel actua como proxy: sin esto, req.protocol siempre reporta "http"
// aunque el cliente haya entrado por https (causa mixed-content en /docs).
app.set("trust proxy", true);

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/openapi.json", (req, res) => {
  res.json({
    ...openApiSpec,
    servers: [{ url: `${req.protocol}://${req.get("host")}`, description: "Current" }]
  });
});

// Swagger UI se sirve con assets por CDN (en vez de swagger-ui-express estatico)
// porque el tracing de archivos de Vercel no empaqueta bien swagger-ui-dist en serverless.
app.get("/docs", (_req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Las Lindas API Docs</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      window.onload = () => {
        window.ui = SwaggerUIBundle({
          url: "/openapi.json",
          dom_id: "#swagger-ui"
        });
      };
    </script>
  </body>
</html>`);
});

// Vercel invoca este endpoint con Authorization: Bearer <CRON_SECRET> (si esta configurado).
// Sirve para que el cron mantenga vivo el compute de Neon (free tier se auto-suspende por inactividad).
app.get("/cron/keep-alive", async (req, res) => {
  if (process.env.CRON_SECRET) {
    const expected = `Bearer ${process.env.CRON_SECRET}`;
    if (req.headers.authorization !== expected) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Invalid cron secret"
      });
    }
  }

  try {
    const sql = getSql();
    await sql`SELECT 1`;
    return res.json({ status: "ok", pingedAt: new Date().toISOString() });
  } catch (error) {
    return res.status(500).json({
      error: "InternalError",
      message: "Database ping failed"
    });
  }
});

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

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // eslint-disable-next-line no-console
  console.error(err);
  res.status(500).json({
    error: "InternalError",
    message: "Unexpected server error"
  });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${PORT}`);
});
