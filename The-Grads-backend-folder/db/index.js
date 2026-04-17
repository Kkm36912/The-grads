require("dotenv").config();
const { neon, neonConfig } = require("@neondatabase/serverless");
const { drizzle } = require("drizzle-orm/neon-http");
const schema = require("./schema");

// 🔥 1. THIS IS THE MAGIC: Increases the timeout limit to 30 seconds
// This prevents the "ConnectTimeoutError" on slow/strict networks
neonConfig.fetchConnectionTimeout = 30000;

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql, { schema });

module.exports = { db };
