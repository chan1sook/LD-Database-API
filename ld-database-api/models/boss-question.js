const mongoose = require("mongoose");
const BossSchema = new mongoose.Schema({
  bossScoreId: { type: mongoose.Schema.Types.ObjectId, ref: "boss-score" },
  timestamp: { type: Date, default: Date.now },

  questionNo: { type: Number, default: 1 },
  questionAlphabet: { type: String, required: true },

  answerAlphabet: { type: String, required: true },
  answerDuration: { type: Number, min: 0, required: true },
  isCorrect: { type: Boolean, default: true },
  answerScore: { type: Number, default: 1 },

  countStatistic: { type: Boolean, default: true, select: false },
});

module.exports = mongoose.model("boss-question", BossSchema);
