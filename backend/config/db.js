const mongoose = require("mongoose");

const connectDatabase = async () => {
  if (!process.env.MONGODB_URI) {
    return false;
  }

  await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10000
  });

  return true;
};

module.exports = {
  connectDatabase
};
