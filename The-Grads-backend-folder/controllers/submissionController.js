const axios = require("axios");
const User = require("../models/User");
const Challenge = require("../models/Challenge");
const Submission = require("../models/Submission");

const createSubmission = async (req, res) => {
  try {
    const { challengeId, code, language } = req.body;
    const studentId = req.user.id;

    // 1. 🛡️ Fetch Challenge & Test Cases
    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ message: "Challenge Not Found" });
    }

    // 2. 💉 THE MULTI-LANGUAGE INJECTOR
    let injectedCode = "";
    let jdoodleLang = "";
    let jdoodleVersion = "0";
    const lang = language.toLowerCase();

    switch (lang) {
      case "python":
        jdoodleLang = "python3";
        jdoodleVersion = "3";
        // Python imports what it needs, but 'math' is common
        injectedCode = `import math\n${code}\n\n# --- AUTOMATED TESTS ---\n`;
        challenge.testCases.forEach((tc) => {
          injectedCode += `print(${tc.input})\n`;
        });
        break;

      case "javascript":
      case "js":
        jdoodleLang = "nodejs";
        jdoodleVersion = "4";
        // JS needs no imports for basic algorithms
        injectedCode = `${code}\n\n// --- AUTOMATED TESTS ---\n`;
        challenge.testCases.forEach((tc) => {
          injectedCode += `console.log(${tc.input});\n`;
        });
        break;

      case "cpp":
      case "c++":
        jdoodleLang = "cpp17";
        jdoodleVersion = "0";
        // The CP Catch-All Header
        injectedCode = `#include <bits/stdc++.h>\nusing namespace std;\n\n${code}\n\nint main() {\n`;
        challenge.testCases.forEach((tc) => {
          injectedCode += `    cout << ${tc.input} << "\\n";\n`;
        });
        injectedCode += `    return 0;\n}`;
        break;

      case "java":
        jdoodleLang = "java";
        jdoodleVersion = "4";
        // The Java Catch-All Import
        injectedCode = `import java.util.*;\n\npublic class Main {\n    ${code}\n\n    public static void main(String[] args) {\n`;
        challenge.testCases.forEach((tc) => {
          injectedCode += `        System.out.println(${tc.input});\n`;
        });
        injectedCode += `    }\n}`;
        break;

      default:
        return res
          .status(400)
          .json({ message: "Unsupported language selected." });
    }

    // 3. 🚀 SEND TO JDOODLE
    const jdoodleResponse = await axios.post(
      "https://api.jdoodle.com/v1/execute",
      {
        clientId: process.env.JDOODLE_CLIENT_ID,
        clientSecret: process.env.JDOODLE_CLIENT_SECRET,
        script: injectedCode,
        language: jdoodleLang,
        versionIndex: jdoodleVersion,
      },
    );

    // JDoodle sends the raw text output inside 'data.output'
    const rawOutput = jdoodleResponse.data.output || "";

    // 4. 🧑‍🏫 THE GRADER
    const outputLines = rawOutput.trim().split("\n");
    let passedCases = 0;
    const totalCases = challenge.testCases.length;

    challenge.testCases.forEach((tc, index) => {
      if (
        outputLines[index] &&
        outputLines[index].trim() === tc.output.trim()
      ) {
        passedCases++;
      }
    });

    // 5. 💰 PARTIAL SCORE MATH
    const passedPercentage = passedCases / totalCases;
    const expAwarded = Math.floor(challenge.expReward * passedPercentage);

    let status = "FAILED";
    if (passedCases === totalCases) {
      status = "PASSED";
    } else if (passedCases > 0) {
      status = "PARTIAL";
    }

    // 6. 🛡️ ANTI-FARMING (Check highest historical score)
    const prevSubmissions = await Submission.find({
      student: studentId,
      challenge: challengeId,
    });
    let highestPrevExp = 0;
    if (prevSubmissions.length > 0) {
      highestPrevExp = Math.max(
        ...prevSubmissions.map((eachSub) => eachSub.expAwarded),
      );
    }

    let actualExpToAward = 0;
    if (expAwarded > highestPrevExp) {
      actualExpToAward = expAwarded - highestPrevExp;
    }

    // 7. 💾 SAVE SUBMISSION
    const newSubmission = new Submission({
      student: studentId,
      challenge: challengeId,
      code,
      language,
      status,
      expAwarded,
    });
    await newSubmission.save();

    // 8. 👤 USER GAMIFICATION UPDATES
    const user = await User.findById(studentId);
    let newStreak = user.streak || 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let isStreakProtected = false;
    let clearPause = false;

    if (user.lastSubmissionDate) {
      const lastDate = new Date(user.lastSubmissionDate);
      lastDate.setHours(0, 0, 0, 0);

      if (user.pauseStartDate && user.pauseEndDate) {
        const pauseStart = new Date(user.pauseStartDate);
        pauseStart.setHours(0, 0, 0, 0);
        const pauseEnd = new Date(user.pauseEndDate);
        pauseEnd.setHours(0, 0, 0, 0);

        if (today >= pauseStart) {
          const daysAfterPause = Math.round(
            (today - pauseEnd) / (1000 * 60 * 60 * 24),
          );
          const daysMissedBeforePause = Math.round(
            (pauseStart - lastDate) / (1000 * 60 * 60 * 24),
          );

          if (daysAfterPause <= 1 && daysMissedBeforePause <= 1) {
            isStreakProtected = true;
          }
          clearPause = true;
        }
      }

      const diffTime = Math.abs(today - lastDate);
      const diffDays = Math.ceil((diffTime / 1000) * 60 * 60 * 24);
      if (diffDays === 1 || (diffDays > 1 && isStreakProtected)) {
        newStreak += 1;
      } else if (diffDays > 1 && !isStreakProtected) {
        newStreak = 1;
      }
    } else {
      newStreak = 1;
    }

    const updatedData = {
      streak: newStreak,
      lastSubmissionDate: new Date(),
    };

    if (clearPause) {
      updatedData.pauseStartDate = null;
      updatedData.pauseEndDate = null;
    }

    if (actualExpToAward > 0) {
      updatedData.$inc = { experiencePoints: actualExpToAward };
    }

    // ==========================================
    // 🔥 NEW ADMIN ANALYTICS ENGINE INJECTION 🔥
    // ==========================================
    // Only count it as "solved" if they passed 100% of the tests
    if (status === "PASSED") {
      // Make sure the array exists
      if (!user.solvedQuestions) user.solvedQuestions = [];

      // Check if they already solved this exact challenge before to prevent double-counting
      const alreadySolved = user.solvedQuestions.some(
        (sq) => sq.question && sq.question.toString() === challengeId,
      );

      if (!alreadySolved) {
        // We push this directly to the array (we'll save it at the end)
        user.solvedQuestions.push({
          question: challengeId,
          language: language, // The language they used for this successful attempt
        });

        // We use $set to force mongoose to save the updated array
        updatedData.solvedQuestions = user.solvedQuestions;
      }
    }
    // ==========================================
    // 8.5 UPDATE CHALLENGE ANALYTICS
    const challengeUpdate = {
      $inc: { totalAttempts: 1 }, // Every run counts as an attempt
    };

    if (status === "PASSED") {
      challengeUpdate.$inc.successfulAttempts = 1; // Only count full success
    }

    await Challenge.findByIdAndUpdate(challengeId, challengeUpdate);
    // --- MONTHLY ARENA MATH ---
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    let lastMonth = -1;
    let lastYear = -1;

    if (user.lastSubmissionDate) {
      const previousDate = new Date(user.lastSubmissionDate);
      lastMonth = previousDate.getMonth();
      lastYear = previousDate.getFullYear();

      if (currentMonth === lastMonth && currentYear === lastYear) {
        updatedData.monthlyExp = (user.monthlyExp || 0) + actualExpToAward;
      } else {
        updatedData.monthlyExp = actualExpToAward;
      }
    }

    await User.findByIdAndUpdate(studentId, updatedData);

    // 9. 🏁 THE RECEIPT
    res.status(201).json({
      message: `Execution complete! You passed ${passedCases}/${totalCases} cases and earned ${actualExpToAward} NEW EXP.`,
      status: status,
      compilerOutput: rawOutput,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Error Saving Submission", error: err.message });
  }
};

module.exports = { createSubmission };
