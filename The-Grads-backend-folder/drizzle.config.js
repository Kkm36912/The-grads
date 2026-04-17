/** @type { import("drizzle-kit").Config } */
module.exports = {
  schema: "./db/schema.js", // Points to the Postgres schema we made
  dialect: "postgresql", // Tells Drizzle we are using Postgres
  dbCredentials: {
    url: "postgresql://neondb_owner:npg_pvo3hs6MxPEQ@ep-billowing-butterfly-anoev9sr.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
  },
};
