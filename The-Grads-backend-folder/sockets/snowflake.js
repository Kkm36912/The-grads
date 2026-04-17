// sockets/snowflake.js

// Custom Epoch (e.g., Jan 1, 2024). Once set, NEVER change this!
const EPOCH = 1704067200000n;

let sequence = 0n;
let lastTimestamp = -1n;

// Worker ID (0-1023). If you run multiple servers, each needs a unique ID.
// For a single server, 1n is perfectly fine.
const workerId = 1n;

function generateSnowflake() {
  let timestamp = BigInt(Date.now());

  if (timestamp === lastTimestamp) {
    // If multiple messages happen in the exact same millisecond, increment the sequence
    sequence = (sequence + 1n) & 4095n; // 4095 is max sequence (12 bits)
    if (sequence === 0n) {
      // Sequence overflowed, wait for the next millisecond
      while (timestamp <= lastTimestamp) {
        timestamp = BigInt(Date.now());
      }
    }
  } else {
    // New millisecond, reset sequence
    sequence = 0n;
  }

  lastTimestamp = timestamp;

  // The Snowflake Formula:
  // 42 bits for time | 10 bits for worker | 12 bits for sequence
  const snowflake = ((timestamp - EPOCH) << 22n) | (workerId << 12n) | sequence;

  return snowflake.toString(); // Return as string so Postgres and JSON don't truncate the BigInt
}

module.exports = { generateSnowflake };
