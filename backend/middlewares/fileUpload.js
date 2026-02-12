const path = require("node:path");
const multer = require("multer");

// Photo Storage
const photoStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../images"));
  },
  filename: function (req, file, cb) {
    if (file) {
      cb(null, new Date().toISOString().replace(/:/g, "-") + file.originalname);
    } else {
      cb(null, false);
    }
  },
});

// Photo Upload Middleware
const photoUpload = multer({
  storage: photoStorage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith("image")) {
      cb(null, true);
    } else {
      cb({ message: "unsupported file format" }, false);
    }
  },
  limits: { fileSize: 1024 * 1024 }, // 1 megabyte
});

// Use memory storage so that file is not stored on disk
const pdfStorage = multer.memoryStorage();

const pdfUpload = multer({
  storage: pdfStorage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb({ message: "Unsupported file format. Only PDFs are allowed." }, false);
    }
  },
  limits: { fileSize: 2 * 1024 * 1024 }, // e.g., 5 megabytes limit
});

module.exports = {
  pdfUpload,
  photoUpload,
};
