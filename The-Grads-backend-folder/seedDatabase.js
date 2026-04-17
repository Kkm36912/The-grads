require("dotenv").config();
const mongoose = require("mongoose");
const fs = require("fs");

// Import your Challenge model
const Challenge = require("./models/Challenge");

const importData = async () => {
  try {
    // 1. 🛑 WAIT for the connection to establish FIRST
    console.log("⏳ Connecting to MongoDB Vault...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("🟢 Connected successfully!");

    // 2. Read the JSON file
    const fileData = fs.readFileSync(`${__dirname}/dataset.json`, "utf-8");
    const questions = JSON.parse(fileData);

    console.log(
      `📦 Loaded ${questions.length} questions from dataset.json. Injecting...`,
    );

    // 3. Blast them all into the database at once
    await Challenge.insertMany(questions);

    console.log(
      "✅ SUCCESS: All questions have been seeded into Binary Battalions!",
    );

    // 4. Kill the script cleanly
    process.exit();
  } catch (error) {
    console.error("❌ ERROR SEEDING DATABASE:", error);
    process.exit(1);
  }
};

// Execute the injection
importData();
