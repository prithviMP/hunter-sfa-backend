import prisma from '../core/database/prisma';
import { s3DeleteFile } from '../utils/s3';

/**
 * Cleanup job to remove temporary files and data
 */
export const cleanupTempFiles = async (): Promise<void> => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  // Find temporary files older than 30 days
  const oldTempFiles = await prisma.temporaryFile.findMany({
    where: {
      createdAt: {
        lt: thirtyDaysAgo,
      },
    },
  });
  
  console.log(`Found ${oldTempFiles.length} temporary files to clean up`);
  
  // Delete files from S3 and database
  for (const file of oldTempFiles) {
    try {
      // Delete from S3
      await s3DeleteFile(file.fileKey);
      
      // Delete from database
      await prisma.temporaryFile.delete({
        where: { id: file.id },
      });
      
      console.log(`Deleted temporary file: ${file.fileKey}`);
    } catch (error) {
      console.error(`Error deleting temporary file ${file.fileKey}:`, error);
    }
  }
  
  console.log('Temporary file cleanup completed');
  
  // Clean up expired sessions
  try {
    const deletedSessions = await prisma.session.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
    
    console.log(`Deleted ${deletedSessions.count} expired sessions`);
  } catch (error) {
    console.error('Error cleaning up expired sessions:', error);
  }
}; 