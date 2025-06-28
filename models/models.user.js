const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  role: {
    type: String,
    enum: ["students", "teacher", "admin"],
    default: "student",
  },
});

module.exports = mongoose.model("User", userSchema);
