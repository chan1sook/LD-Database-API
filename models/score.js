const mongoose = require("mongoose");
const ScoreSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "student" },
  timestamp: { type: Date, default: Date.now },
  stage: { type: String, default: "" },

  minParScore: { type: Number, required: true },
  maxParScore: { type: Number, required: true },
  score: { type: Number, required: true },

  minParDuration: { type: Number, min: 0, required: true },
  maxParDuration: { type: Number, min: 0, required: true },
  duration: { type: Number, min: 0, required: true },

  difficulty: { type: Number, required: true },
  scoreDifficultyFactor: { type: Number, required: true },
  durationDifficultyFactor: { type: Number, required: true },
  countStatistic: { type: Boolean, default: true },
});

// Compute Difficulty Adjustment Value
ScoreSchema.virtual("difficultyAdjustment").get(function () {
  let scoreDiffFactor = 0;
  if (this.score >= this.maxParScore) {
    scoreDiffFactor =
      (this.score - this.maxParScore) * this.scoreDifficultyFactor;
  } else if (this.score <= this.minParScore) {
    scoreDiffFactor =
      (this.minParScore - this.score) * this.scoreDifficultyFactor;
  }

  let durationDiffFactor = 0;
  if (this.duration >= this.maxParDuration) {
    durationDiffFactor =
      (this.duration - this.maxParDuration) * this.durationDifficultyFactor;
  } else if (this.duration <= this.minParDuration) {
    durationDiffFactor =
      (this.minParDuration - this.duration) * this.durationDifficultyFactor;
  }

  return scoreDiffFactor + durationDiffFactor;
});

ScoreSchema.virtual("nextDifficulty").get(function () {
  return this.difficulty + this.difficultyAdjustment;
});

module.exports = mongoose.model("score", ScoreSchema);
