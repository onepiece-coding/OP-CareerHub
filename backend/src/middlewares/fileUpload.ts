import multer, { FileFilterCallback, Multer } from 'multer';
import type { Request } from 'express';

// File filters
export const imageFileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
) => {
  const mimetype = file.mimetype ?? '';
  if (mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file format. Only images are allowed.'));
  }
};

export const pdfFileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
) => {
  const mimetype = file.mimetype ?? '';
  if (mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file format. Only PDFs are allowed.'));
  }
};

// Default limits
export const DEFAULT_IMAGE_LIMITS = { fileSize: 1 * 1024 * 1024 }; // 1MB
export const DEFAULT_PDF_LIMITS = { fileSize: 2 * 1024 * 1024 }; // 2MB

/**
 * Default memory-storage based upload (good for uploading to Cloudinary directly)
 * - This uses memoryStorage for both images and pdfs so we can pipe buffers/streams to cloudinary.
 */
export const memoryUpload: Multer = multer({
  storage: multer.memoryStorage(),
});

/**
 * Convenience multer instances with filters & limits pre-applied.
 */
export const photoUploadMemory = multer({
  storage: multer.memoryStorage(),
  fileFilter: imageFileFilter,
  limits: DEFAULT_IMAGE_LIMITS,
});

export const pdfUploadMemory = multer({
  storage: multer.memoryStorage(),
  fileFilter: pdfFileFilter,
  limits: DEFAULT_PDF_LIMITS,
});

/**
 * Helper to create a disk-storage multer for images
 * Example destination: path.join(__dirname, "../images")
 * we don't use this in our app but I added it for diversity
 */
export const createPhotoDiskUpload = (
  imagesDir: string,
  limits = DEFAULT_IMAGE_LIMITS,
) =>
  multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, imagesDir);
      },
      filename: (req, file, cb) => {
        const safeTs = new Date().toISOString().replace(/:/g, '-');
        cb(null, `${safeTs}-${file.originalname}`);
      },
    }),
    fileFilter: imageFileFilter,
    limits,
  });

/**
 * Small helpers to return express middlewares for common patterns:
 * - singleImage('avatar')
 * - multipleImages('photos', 5)
 * - singlePDF('file')
 * - multiplePDFs('files', 3)
 * - uploadFields([{ name: 'image', maxCount: 1 }, { name: 'pdf', maxCount: 1 }])
 *
 * Note: these functions use the memory-based upload instances by default.
 */
export const singleImage = (fieldName = 'image') =>
  photoUploadMemory.single(fieldName);
export const multipleImages = (fieldName = 'images', maxCount = 5) =>
  photoUploadMemory.array(fieldName, maxCount);

export const singlePDF = (fieldName = 'pdf') =>
  pdfUploadMemory.single(fieldName);
export const multiplePDFs = (fieldName = 'pdfs', maxCount = 3) =>
  pdfUploadMemory.array(fieldName, maxCount);

/**
 * Fields uploader: accepts an array of { name, maxCount } descriptors.
 * Uses memory storage. Good for endpoints that accept both image and pdf fields.(we don't need this in our app as well)
 *
 * Example:
 *  uploadFields([{ name: 'image', maxCount: 1 }, { name: 'pdf', maxCount: 1 }])
 */
export const uploadFields = (fields: { name: string; maxCount?: number }[]) =>
  memoryUpload.fields(
    fields.map((f) => ({ name: f.name, maxCount: f.maxCount ?? 1 })),
  );
