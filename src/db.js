const { neon } = require("@neondatabase/serverless");

let sqlClient = null;

// El driver de Neon corre sobre HTTP (fetch), no mantiene un socket TCP/TLS
// persistente entre invocaciones. Evita a proposito el tipo de bug de
// conexion "congelada" que se sufrio con el driver nativo de MongoDB en
// Vercel serverless.
function getSql() {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL no esta configurada");
  }

  if (!sqlClient) {
    sqlClient = neon(connectionString);
  }

  return sqlClient;
}

module.exports = {
  getSql
};
