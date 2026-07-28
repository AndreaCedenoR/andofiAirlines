const express = require("express");
const cors = require("cors");
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
