// socketService.js
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

let io; // Socket.io instance
const connectedUsers = new Map(); // userId -> socketId

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.ALLOWED_ORIGINS.split(","),
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      credentials: true,
    },
  });

  // Socket.io authentication middleware
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error("Authentication error"));
      
      // Assuming you have a jwt.verify process here:
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      next();
    } catch (err) {
      next(new Error("Authentication error"));
    }
  });

  // Handle socket connections
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.userId}`);
    connectedUsers.set(socket.userId.toString(), socket.id);

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.userId}`);
      connectedUsers.delete(socket.userId.toString());
    });
  });
};

const sendNotification = (userId, notificationData) => {
  const socketId = connectedUsers.get(userId.toString());
  if (socketId && io) {
    io.to(socketId).emit("new_notification", notificationData);
  }
};

module.exports = { initSocket, sendNotification };
