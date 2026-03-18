const app = require("./app");
const { connectDatabase } = require("./config/db");

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  const isDatabaseConnected = await connectDatabase();

  if (isDatabaseConnected) {
    console.log("MongoDB connected successfully");
  } else {
    console.warn(
      "MONGODB_URI is not configured. Chat can run, but admin knowledge saving is disabled until MongoDB is set."
    );
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
