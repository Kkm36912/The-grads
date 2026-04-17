const {
  pgTable,
  text,
  integer,
  timestamp,
  uuid,
  bigint,
  primaryKey,
} = require("drizzle-orm/pg-core");

/* ---------------- MESSAGES ---------------- */
const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),

  // 🔥 THE BRIDGE: This will hold your 24-character MongoDB User _id
  userId: text("user_id").notNull(),

  snowflake: bigint("snowflake", { mode: "string" }).notNull(),
  username: text("username").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

/* ---------------- REACTIONS ---------------- */
const messageReactions = pgTable("message_reactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  messageId: uuid("message_id").notNull(),

  // 🔥 THE BRIDGE: This holds the MongoDB User _id
  userId: text("user_id").notNull(),

  emojiCode: integer("emoji_code").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

const messageReactionCounts = pgTable(
  "message_reaction_counts",
  {
    messageId: uuid("message_id")
      .notNull()
      .references(() => messages.id, { onDelete: "cascade" }),
    emojiCode: integer("emoji_code").notNull(),
    count: integer("count").notNull().default(0),
  },
  // Notice the { columns: [...] } syntax here
  (t) => [primaryKey({ columns: [t.messageId, t.emojiCode] })],
);

module.exports = { messages, messageReactions, messageReactionCounts };
