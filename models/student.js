const mongoose = require("mongoose");
const ScoreModel = require("./score");

const StudentSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  gender: {
    type: String,
    enum: ["male", "female", "others"],
    default: "others",
  },
  grade: { type: String, required: true },
  maxScoreDisplay: { type: Number, min: 0, default: 5 },

  registerTimestamp: { type: Date, default: Date.now },
  lastUpdateTimestamp: { type: Date, default: Date.now },
});

// Compute Current Difficulty
StudentSchema.virtual("scoreRecordCount").get(async function () {
  const count = await ScoreModel.countDocuments({
    studentId: this._id,
    countStatistic: true,
  });

  return count;
});

// Compute Current Difficulty
StudentSchema.virtual("currentDifficulty").get(async function () {
  const scoreLastestDoc = await ScoreModel.findOne({
    studentId: this._id,
    countStatistic: true,
  }).sort({ timestamp: -1 });

  if (scoreLastestDoc == null) {
    return 0;
  } else {
    return scoreLastestDoc.difficulty + scoreLastestDoc.difficultyAdjustment;
  }
});

module.exports = mongoose.model("student", StudentSchema);
