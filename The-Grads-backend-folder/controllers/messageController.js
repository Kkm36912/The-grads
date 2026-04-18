const { db } = require("../db/sql");
const { messages } = require("../db/schema");
const { lt, desc } = require("drizzle-orm");

const { messageBuffer, recentMessages } = require("../socket/chatSocket");

async function getMessages(req, res) {
  try {
    const LIMIT = Math.min(Number(req.query.limit ?? 50), 100);
    const before = req.query.before ? BigInt(req.query.before) : null;

    const canSkipDb =
      !before &&
      recentMessages.length >= LIMIT &&
      messageBuffer.size === 0;

    if (canSkipDb) {
      return res.json({
        messages: recentMessages.slice(-LIMIT).map((m) => ({
          ...m,
          delivered: true,
        })),
        hasMore: true,
      });
    }

    let query = db
      .select()
      .from(messages)
      .orderBy(desc(messages.snowflake))
      .limit(LIMIT);

    if (before) {
      query = query.where(lt(messages.snowflake, before.toString()));
    }

    const dbMessages = await query;

    const merged = dbMessages.map((m) => ({
      ...m,
      snowflake: m.snowflake.toString(),
      delivered: true,
    }));

    res.json({
      messages: merged,
      hasMore: merged.length === LIMIT,
    });
  } catch (err) {
    console.error("[GET /messages]", err);
    res.status(500).json({ error: "Failed to load messages" });
  }
}

module.exports = { getMessages };