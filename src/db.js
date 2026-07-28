const { MongoClient } = require("mongodb");

const DB_NAME = process.env.MONGODB_DB_NAME || "laslindas";

let clientPromise = null;

// Cachea la conexion entre invocaciones de la misma instancia serverless
// para no reabrir un socket a Mongo en cada request.
function getClient() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI no esta configurada");
  }

  if (!clientPromise) {
    clientPromise = new MongoClient(uri).connect();
  }

  return clientPromise;
}

async function getDb() {
  const client = await getClient();
  return client.db(DB_NAME);
}

module.exports = {
  getDb
};
