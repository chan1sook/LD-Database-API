const mongoose = require("mongoose");
const LoginLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  loginFrom: { type: String, default: "unknown" },
  macAddress: { type: String, default: "" },
});

module.exports = mongoose.model("login-log", LoginLogSchema);
