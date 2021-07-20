const mongoose = require("mongoose");
const ScoreModel = require("./score");

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  hashedPassword: { type: String, required: true, select: false },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  gender: {
    type: String,
    enum: ["male", "female", "others"],
    default: "others",
  },
  school: { type: String, default: "" },
  room: { type: String, default: "" },
  grade: { type: String, default: "" },
  role: {
    type: String,
    enum: ["student", "teacher", "school", "admin"],
    default: "student",
  },
  saveData: { type: String, default: null },

  registerTimestamp: { type: Date, default: Date.now },
  lastUpdateTimestamp: { type: Date, default: Date.now },
});
UserSchema.index({ username: 1 }, { unique: true });

module.exports = mongoose.model("user", UserSchema);
