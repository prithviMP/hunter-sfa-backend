import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

// Configure AWS S3 client
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1',
});

/**
 * Upload a file to S3 bucket
 * @param file File to upload (from multer)
 * @param folder Folder path in S3 bucket
 * @param customFilename Optional custom filename (defaults to UUID)
 * @returns Object with file URL and key
 */
export const s3UploadFile = async (
  file: Express.Multer.File,
  folder: string = 'uploads',
  customFilename?: string
): Promise<{ fileUrl: string; fileKey: string }> => {
  // Validate file
  if (!file || !file.buffer) {
    throw new Error('Invalid file');
  }

  // Generate unique filename if not provided
  const fileExtension = path.extname(file.originalname);
  const filename = customFilename || `${uuidv4()}${fileExtension}`;
  
  // Create file key with folder path
  const fileKey = folder ? `${folder}/${filename}` : filename;
  
  // Set up S3 upload parameters
  const params = {
    Bucket: process.env.AWS_S3_BUCKET || 'hunter-sfa-uploads',
    Key: fileKey,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'public-read', // Make file publicly accessible
  };

  // Upload to S3
  const result = await s3.upload(params).promise();
  
  return {
    fileUrl: result.Location,
    fileKey: result.Key,
  };
};

/**
 * Delete a file from S3 bucket
 * @param fileKey Key of the file to delete
 * @returns Success status
 */
export const s3DeleteFile = async (fileKey: string): Promise<boolean> => {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET || 'hunter-sfa-uploads',
    Key: fileKey,
  };

  try {
    await s3.deleteObject(params).promise();
    return true;
  } catch (error) {
    console.error('Error deleting file from S3:', error);
    return false;
  }
};

/**
 * Generate a temporary signed URL for private S3 objects
 * @param fileKey Key of the file to generate URL for
 * @param expirySeconds Expiration time in seconds (default: 1 hour)
 * @returns Signed URL with temporary access
 */
export const s3GetSignedUrl = async (
  fileKey: string,
  expirySeconds: number = 3600
): Promise<string> => {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET || 'hunter-sfa-uploads',
    Key: fileKey,
    Expires: expirySeconds,
  };

  return s3.getSignedUrlPromise('getObject', params);
}; 