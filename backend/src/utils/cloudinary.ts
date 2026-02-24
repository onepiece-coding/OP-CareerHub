import {
  v2 as cloudinary,
  UploadApiResponse,
  UploadApiErrorResponse,
} from 'cloudinary';
import streamifier from 'streamifier';
import { env } from '../env.js';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

/**
 * Generic: upload a buffer to Cloudinary via upload_stream
 * - resource_type: 'auto' | 'raw' | 'image' | 'video' | etc
 */
export const uploadBufferToCloudinary = async (
  buffer: Buffer,
  options?: {
    folder?: string;
    public_id?: string;
    resource_type?: 'auto' | 'raw' | 'image' | 'video' | string;
  },
  client = cloudinary,
  uploaderFactory: (
    opts: any,
    cb: (err?: UploadApiErrorResponse, res?: UploadApiResponse) => void,
  ) => NodeJS.WritableStream = client.uploader.upload_stream.bind(
    client.uploader,
  ),
): Promise<UploadApiResponse> => {
  return new Promise<UploadApiResponse>((resolve, reject) => {
    const uploadStream = uploaderFactory(
      {
        folder: options?.folder,
        public_id: options?.public_id,
        resource_type: options?.resource_type ?? 'auto',
      },
      (
        error: UploadApiErrorResponse | undefined,
        result: UploadApiResponse | undefined,
      ) => {
        if (error) return reject(error);
        if (!result) return reject(new Error('Empty response from Cloudinary'));
        resolve(result);
      },
    );

    streamifier
      .createReadStream(buffer)
      .pipe(uploadStream as unknown as NodeJS.WritableStream);
  });
};

/* ---------- Image helpers ---------- */

export const uploadImageBuffer = async (
  buffer: Buffer,
  options?: { folder?: string; public_id?: string },
  client = cloudinary,
) => {
  // resource_type 'auto' is suitable for images
  return uploadBufferToCloudinary(
    buffer,
    { ...options, resource_type: 'auto' },
    client,
  );
};

export const removeImage = async (publicId: string, client = cloudinary) => {
  try {
    const result = await client.uploader.destroy(publicId);
    return result;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    throw new Error('Internal Server Error (cloudinary removeImage)');
  }
};

export const removeMultipleImages = async (
  publicIds: string[],
  client = cloudinary,
) => {
  try {
    const result = await client.api.delete_resources(publicIds);
    return result;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    throw new Error('Internal Server Error (cloudinary removeMultipleImages)');
  }
};

/* ---------- PDF / raw-file helpers ---------- */

/**
 * Upload a PDF (or other non-image file) from a Buffer.
 * Uses resource_type = "raw" so the file is stored as a raw asset (preserves PDF).
 */
export const uploadPDFBuffer = async (
  buffer: Buffer,
  options?: { folder?: string; public_id?: string },
  client = cloudinary,
) => {
  return uploadBufferToCloudinary(
    buffer,
    { ...options, resource_type: 'raw' },
    client,
  );
};

/**
 * Convenience: upload a PDF (or other raw file) from a local path or URL.
 * Uses the normal uploader.upload (not streaming).
 * We will not use this currently in out app
 */
export const uploadPDFFromPath = async (
  pathOrUrl: string,
  options?: { folder?: string; public_id?: string },
  client = cloudinary,
): Promise<UploadApiResponse> => {
  try {
    const data = await client.uploader.upload(pathOrUrl, {
      resource_type: 'raw',
      folder: options?.folder,
      public_id: options?.public_id,
    });
    return data;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    throw new Error('Internal Server Error (cloudinary uploadPDF)');
  }
};

export const removePDF = async (publicId: string, client = cloudinary) => {
  try {
    const result = await client.uploader.destroy(publicId, {
      resource_type: 'raw',
    });
    return result;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    throw new Error('Internal Server Error (cloudinary removePDF)');
  }
};

export const removeMultiplePDFs = async (
  publicIds: string[],
  client = cloudinary,
) => {
  try {
    return await client.api.delete_resources(publicIds, {
      resource_type: 'raw',
      type: 'upload',
      invalidate: true,
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    throw new Error('Internal Server Error (cloudinary removeMultiplePDFs)');
  }
};

/* ---------- default export ---------- */

export default {
  uploadBufferToCloudinary,
  uploadImageBuffer,
  uploadPDFBuffer,
  uploadPDFFromPath,
  removeImage,
  removeMultipleImages,
  removePDF,
  removeMultiplePDFs,
};
