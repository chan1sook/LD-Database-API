const mongoose = require("mongoose");
const ScoreSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "student" },
  timestamp: { type: Date, default: Date.now },
  stage: { type: String, default: "" },

  score: { type: Number, required: true },
  maxScore: { type: Number, required: true },

  duration: { type: Number, min: 0, required: true },
  difficulty: { type: Number, required: true },

  answerCorrects: { type: [Boolean], default: [] },
  answerScores: { type: [Number], default: [] },
  alphabets: { type: [String], default: [] },

  countStatistic: { type: Boolean, default: true },
});

module.exports = mongoose.model("score", ScoreSchema);
