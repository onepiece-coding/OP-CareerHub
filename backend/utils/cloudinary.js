const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cloudinary Upload PDF
const cloudinaryUploadPDF = async (fileToUpload) => {
  try {
    const data = await cloudinary.uploader.upload(fileToUpload, {
      resource_type: "raw", // Use "raw" for non-image files such as PDFs
    });
    return data;
  } catch (error) {
    throw new Error("internal server error(cloudinary)");
  }
};

// Cloudinary Remove PDF
const cloudinaryRemovePDF = async (pdfPublicId) => {
  try {
    const result = await cloudinary.uploader.destroy(pdfPublicId, {
      resource_type: "raw", // Ensure removal is done for raw files
    });
    return result;
  } catch (error) {
    throw new Error("internal server error(cloudinary)");
  }
};

// Cloudinary Remove Multiple PDFs
const cloudinaryRemoveMultiplePDFs = async (publicIds) => {
  try {
    return await cloudinary.api.delete_resources(publicIds, {
      resource_type: "raw",
      type: "upload",
      invalidate: true,
    });
  } catch (error) {
    throw new Error("internal server error(cloudinary)");
  }
};

// Cloudinary Upload Image
const cloudinaryUploadImage = async (fileToUpload) => {
  try {
    const data = await cloudinary.uploader.upload(fileToUpload, {
      resourse_type: "auto",
    });
    return data;
  } catch (error) {
    throw new Error("internal server error(cloudinary)");
  }
};

// Cloudinary Remove Image
const cloudinaryRemoveImage = async (imagePublicId) => {
  try {
    const result = await cloudinary.uploader.destroy(imagePublicId);
    return result;
  } catch (error) {
    throw new Error("internal server error(cloudinary)");
  }
};

// Cloudinary Remove Multiple Images
const cloudinaryRemoveMultipleImages = async (publicIds) => {
  try {
    const result = await cloudinary.api.delete_resources(publicIds);
    return result;
  } catch (error) {
    throw new Error("internal server error(cloudinary)");
  }
};

module.exports = {
  cloudinaryUploadPDF,
  cloudinaryRemovePDF,
  cloudinaryRemoveMultiplePDFs,
  cloudinaryUploadImage,
  cloudinaryRemoveImage,
  cloudinaryRemoveMultipleImages,
};
