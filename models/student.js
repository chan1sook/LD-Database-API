const mongoose = require("mongoose");
const ScoreModel = require("./score");

const StudentSchema = new mongoose.Schema({
  username: { type: String, required: true },
  hashedPassword: { type: String, required: true, select: false },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  gender: {
    type: String,
    enum: ["male", "female", "others"],
    default: "others",
  },
  grade: { type: String, required: true },
  maxScoreDisplay: { type: Number, min: 0, default: 5 },
  saveData: { type: String, default: null },

  registerTimestamp: { type: Date, default: Date.now },
  lastUpdateTimestamp: { type: Date, default: Date.now },
});
StudentSchema.index({ username: 1 }, { unique: true });

// Compute Current Difficulty
StudentSchema.method("scoreRecordCount", async function (stage) {
  const count = await ScoreModel.countDocuments({
    studentId: this._id,
    countStatistic: true,
    stage,
  });

  return count;
});

// Compute Current Difficulty
StudentSchema.method("currentDifficulty", async function (stage) {
  const scoreLastestDoc = await ScoreModel.findOne({
    studentId: this._id,
    countStatistic: true,
    stage,
  }).sort({ timestamp: -1 });

  if (scoreLastestDoc == null) {
    return 0;
  } else {
    return scoreLastestDoc.difficulty + scoreLastestDoc.difficultyAdjustment;
  }
});

module.exports = mongoose.model("student", StudentSchema);
