const mongoose = require("mongoose");

module.exports = async() => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB ^_^");
  } catch (err) {
    console.log("Database connection failed:", err.message);
    process.exit(1);
  };
};