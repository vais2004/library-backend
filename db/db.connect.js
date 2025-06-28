const mongoose = require("mongoose");
require("dotenv").config();

const mongoUri = process.env.MONGODB;

const initializeDatabase = async () => {
  await mongoose
    .connect(mongoUri)
    .then(() => {
      console.log("Connected to Database");
    })
    .catch((error) =>
      console.error("Error occurs while connecting to the database", error)
    );
};

module.exports = { initializeDatabase };
