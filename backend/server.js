require("dotenv").config();
const http = require("http");
const connectToDB = require("./config/connectToDB.js");
const app = require("./app");
const { initSocket } = require("./services/socketService.js");

// Graceful shutdown handlers (Use a logging library (winston or pino...) instead of console.error for production)
process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err);
    process.exit(1);
});

process.on("unhandledRejection", (err) => {
    console.error("Unhandled Rejection:", err);
    process.exit(1);
});

// Create HTTP server
const server = http.createServer(app);

// Initialize the socket service
initSocket(server);

// Database connection
connectToDB();

// Start server
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});