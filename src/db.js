const { MongoClient } = require("mongodb");

const DB_NAME = process.env.MONGODB_DB_NAME || "laslindas";

let clientPromise = null;

function connect() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI no esta configurada");
  }

  const client = new MongoClient(uri, {
    maxPoolSize: 5,
    minPoolSize: 0,
    // Bajo a proposito: en serverless, Vercel "congela" la funcion entre
    // requests y un socket viejo puede quedar invalido al despertar (bug
    // conocido del driver, NODE-6179). Reciclar sockets idle seguido reduce
    // la chance de reusar uno muerto.
    maxIdleTimeMS: 10000,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 20000
  });

  // Si la conexion falla, limpia el cache: sin esto, una promesa rechazada
  // quedaba guardada para siempre y cada request futura en esa misma
  // instancia repetia el mismo error sin volver a intentar.
  return client.connect().catch((error) => {
    clientPromise = null;
    throw error;
  });
}

function getClient() {
  if (!clientPromise) {
    clientPromise = connect();
  }

  return clientPromise;
}

async function getDb() {
  try {
    const client = await getClient();
    return client.db(DB_NAME);
  } catch (error) {
    // Reintento unico: cubre el caso de un socket cacheado que murio
    // mientras la funcion estaba congelada.
    const client = await getClient();
    return client.db(DB_NAME);
  }
}

module.exports = {
  getDb
};
