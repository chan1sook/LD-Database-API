const mongoose = require("mongoose");
const ScoreSchema = new mongoose.Schema({
  stageScoreId: { type: mongoose.Schema.Types.ObjectId, ref: "stage-score" },
  timestamp: { type: Date, default: Date.now },

  questionNo: { type: Number, default: 1 },
  questionAlphabet: { type: String, required: true },
  questionWord: { type: String, required: true },

  answerAlphabet: { type: String, required: true },
  answerDuration: { type: Number, min: 0, required: true },
  isCorrect: { type: Boolean, default: true },
  answerScore: { type: Number, default: 1 },

  countStatistic: { type: Boolean, default: true, select: false },
});

module.exports = mongoose.model("stage-question", ScoreSchema);
