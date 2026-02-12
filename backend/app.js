const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const { errorHandler, notFound } = require("./middlewares/error");

// Initialize app
const app = express();

// Security Middlewares
app.use(helmet());
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS.split(","),
    methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
    credentials: true,
  })
);
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 100 requests per window
  })
);

// Body parsers and cookie parser
app.use(express.json({ limit: "10kb" })); // Adjust based on your needs
app.use(cookieParser(process.env.COOKIE_SECRET));

// Routes
app.use("/api/v1/auth", require("./routes/authRoute"));
app.use("/api/v1/users", require("./routes/usersRoute"));
app.use("/api/v1/jobs", require("./routes/jobsRoute"));
app.use("/api/v1/admin", require("./routes/adminRoute"));
app.use("/api/v1/applications", require("./routes/applicationsRoute"));
app.use("/api/v1/notifications", require("./routes/notificationsRoute"));
app.use("/api/v1/chatbot", require("./routes/chatbotRoute"));
app.use("/api/v1/password", require("./routes/passwordRoute"));

// Home Route (Replacing home route with a JSON health-check endpoint)
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// 404 Handler
app.use(notFound);

// Global Error Handler
app.use(errorHandler);

module.exports = app;
