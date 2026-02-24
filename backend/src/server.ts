import mongoose from "mongoose";
import http from "node:http";
import app from "./app.js";
import { env } from "./env.js";
import connectToDB from "./config/connectToDb.js";
import logger from "./utils/logger.js";
import { initSocket } from "./services/socketService.js";

// Global error handlers
process.on("uncaughtException", (err: unknown) => {
  logger.error("Uncaught Exception", err);
  process.exit(1);
});
process.on("unhandledRejection", (err: unknown) => {
  logger.error("Unhandled Rejection", err);
  process.exit(1);
});

const PORT = env.PORT ?? 8000;

let server: http.Server<
  typeof http.IncomingMessage,
  typeof http.ServerResponse
>;

if (env.NODE_ENV !== "test") {
  try {
    // Create HTTP server
    server = http.createServer(app);

    // Initialize the socket service
    initSocket(server);

    await connectToDB(env.MONGO_URI);
  } catch (err) {
    logger.error("Failed to connect to DB at startup", err);
    process.exit(1);
  }

  server.listen(PORT, () => {
    logger.info(`Server running in ${env.NODE_ENV} mode on port ${PORT}`);
  });

  // Graceful shutdown handlers
  for (const sig of ["SIGINT", "SIGTERM"] as const) {
    process.on(sig, async () => {
      logger.info(`${sig} received, shutting down gracefully…`);
      server.close(async (err?: Error) => {
        if (err) logger.error("Error closing HTTP server", err);
        try {
          await mongoose.disconnect();
          logger.info("MongoDB connection closed");
        } catch (dbErr) {
          logger.error("Error disconnecting MongoDB", dbErr);
        }
        process.exit(0);
      });
    });
  }
}
