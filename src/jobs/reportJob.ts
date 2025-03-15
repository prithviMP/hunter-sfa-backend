import prisma from '../core/database/prisma';
import fs from 'fs';
import path from 'path';
import { s3UploadFile } from '../utils/s3';

/**
 * Generate daily reports for all users
 */
export const generateReports = async (): Promise<void> => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  console.log(`Generating reports for ${yesterday.toISOString().split('T')[0]}`);
  
  try {
    // Get all active users with sales rep or manager roles
    const users = await prisma.user.findMany({
      where: {
        isActive: true,
        role: {
          name: {
            in: ['SALES_REP', 'SALES_MANAGER'],
          },
        },
      },
    });
    
    console.log(`Generating reports for ${users.length} users`);
    
    // For each user, generate reports
    for (const user of users) {
      try {
        // 1. Visit reports
        const visits = await prisma.visit.count({
          where: {
            userId: user.id,
            createdAt: {
              gte: yesterday,
              lt: today,
            },
          },
        });
        
        // 2. Call reports
        const calls = await prisma.call.count({
          where: {
            userId: user.id,
            createdAt: {
              gte: yesterday,
              lt: today,
            },
          },
        });
        
        // 3. Payments collected
        const payments = await prisma.payment.findMany({
          where: {
            visit: {
              userId: user.id,
              createdAt: {
                gte: yesterday,
                lt: today,
              },
            },
          },
          select: {
            amount: true,
          },
        });
        
        const totalPayments = payments.reduce((sum, payment) => sum + payment.amount, 0);
        
        // 4. New contacts
        const newContacts = await prisma.contact.count({
          where: {
            createdBy: user.id,
            createdAt: {
              gte: yesterday,
              lt: today,
            },
          },
        });
        
        // Create report record
        await prisma.dailyReport.create({
          data: {
            userId: user.id,
            date: yesterday,
            visitsCount: visits,
            callsCount: calls,
            paymentsCollected: totalPayments,
            newContactsCount: newContacts,
          },
        });
        
        console.log(`Report generated for user ${user.id}`);
      } catch (error) {
        console.error(`Error generating report for user ${user.id}:`, error);
      }
    }
    
    // Generate an organization-wide report
    generateOrganizationReport(yesterday);
    
  } catch (error) {
    console.error('Error generating reports:', error);
    throw error;
  }
};

/**
 * Generate an organization-wide report
 * @param date Date to generate report for
 */
const generateOrganizationReport = async (date: Date): Promise<void> => {
  try {
    // Get aggregated data
    const [
      totalVisits,
      totalCalls,
      totalPayments,
      totalNewContacts,
    ] = await Promise.all([
      prisma.visit.count({
        where: {
          createdAt: {
            gte: date,
            lt: new Date(date.getTime() + 24 * 60 * 60 * 1000),
          },
        },
      }),
      prisma.call.count({
        where: {
          createdAt: {
            gte: date,
            lt: new Date(date.getTime() + 24 * 60 * 60 * 1000),
          },
        },
      }),
      prisma.payment.aggregate({
        where: {
          visit: {
            createdAt: {
              gte: date,
              lt: new Date(date.getTime() + 24 * 60 * 60 * 1000),
            },
          },
        },
        _sum: {
          amount: true,
        },
      }),
      prisma.contact.count({
        where: {
          createdAt: {
            gte: date,
            lt: new Date(date.getTime() + 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);
    
    // Create CSV report
    const reportData = `Date,Total Visits,Total Calls,Total Payments,Total New Contacts
${date.toISOString().split('T')[0]},${totalVisits},${totalCalls},${totalPayments._sum.amount || 0},${totalNewContacts}`;
    
    const tempFilePath = path.join(
      process.cwd(),
      'temp',
      `org_report_${date.toISOString().split('T')[0]}.csv`
    );
    
    // Ensure temp directory exists
    fs.mkdirSync(path.dirname(tempFilePath), { recursive: true });
    
    // Write report to temp file
    fs.writeFileSync(tempFilePath, reportData);
    
    // Upload to S3
    const file = {
      fieldname: 'report',
      originalname: `org_report_${date.toISOString().split('T')[0]}.csv`,
      encoding: '7bit',
      mimetype: 'text/csv',
      buffer: fs.readFileSync(tempFilePath),
      size: fs.statSync(tempFilePath).size,
    } as Express.Multer.File;
    
    const s3Result = await s3UploadFile(
      file,
      `reports/organization/${date.getFullYear()}/${date.getMonth() + 1}`
    );
    
    // Clean up temp file
    fs.unlinkSync(tempFilePath);
    
    // Store reference in database
    await prisma.organizationReport.create({
      data: {
        date,
        reportUrl: s3Result.fileUrl,
        visitsCount: totalVisits,
        callsCount: totalCalls,
        paymentsCollected: totalPayments._sum.amount || 0,
        newContactsCount: totalNewContacts,
      },
    });
    
    console.log(`Organization report generated for ${date.toISOString().split('T')[0]}`);
  } catch (error) {
    console.error(`Error generating organization report for ${date.toISOString().split('T')[0]}:`, error);
  }
}; 