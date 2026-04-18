const { pgTable, text, uuid, bigint, timestamp } = require("drizzle-orm/pg-core");

const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  snowflake: bigint("snowflake", { mode: "string" }).notNull(),
  username: text("username").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

module.exports = { messages };