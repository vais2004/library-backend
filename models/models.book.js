const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  name: String,
  author: String,
  category: String,
  available: { type: Boolean, default: true },
});

module.exports = mongoose.model("Book", bookSchema);
