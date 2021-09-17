const mongoose = require("mongoose");
const ScoreSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  timestamp: { type: Date, default: Date.now },
  stage: { type: String, default: "" },
  difficulty: { type: Number, required: true },

  playCount: { type: Number, default: 1 },
  score: { type: Number, required: true },
  maxScore: { type: Number, required: true },
  duration: { type: Number, min: 0, required: true },
  star: { type: Number, min: 0, max: 5, required: true },

  countStatistic: { type: Boolean, default: true, select: false },
});

module.exports = mongoose.model("stage-score", ScoreSchema);
