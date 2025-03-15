import cron from 'node-cron';
import { cleanupTempFiles } from './cleanupJob';
import { generateReports } from './reportJob';

/**
 * Initialize all scheduled jobs
 */
export const initializeJobs = (): void => {
  // Run cleanup job every day at 2:00 AM
  cron.schedule('0 2 * * *', async () => {
    console.log('Running cleanup job...');
    try {
      await cleanupTempFiles();
      console.log('Cleanup job completed successfully');
    } catch (error) {
      console.error('Error running cleanup job:', error);
    }
  });

  // Run report generation job every day at 1:00 AM
  cron.schedule('0 1 * * *', async () => {
    console.log('Running report generation job...');
    try {
      await generateReports();
      console.log('Report generation job completed successfully');
    } catch (error) {
      console.error('Error running report generation job:', error);
    }
  });

  console.log('Scheduled jobs initialized');
}; 