import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

// Define VisitStatus type
type VisitStatus = 'PLANNED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'COMPLETED' | 'CANCELLED';

const prisma = new PrismaClient();

async function seedDsrData() {
  console.log('Seeding DSR data...');

  try {
    // Get admin user
    const user = await prisma.user.findFirst({
      where: { email: 'admin@example.com' },
    });

    if (!user) {
      console.log('Admin user not found. Please run the main seed first.');
      return;
    }

    // Get companies
    const companies = await prisma.company.findMany({
      take: 5,
    });

    if (companies.length === 0) {
      console.log('No companies found. Please run the contact management seed first.');
      return;
    }

    // Create visits
    for (const company of companies) {
      // Create a completed visit
      const completedVisit = await prisma.visit.create({
        data: {
          userId: user.id,
          companyId: company.id,
          startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
          endTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours after start
          status: 'COMPLETED' as VisitStatus,
          purpose: 'Product demonstration and client meeting',
          notes: 'Client was interested in our new product line.',
          location: JSON.stringify({ latitude: 37.7749, longitude: -122.4194 }),
          followUps: {
            create: {
              dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
              status: 'PENDING',
              priority: 'HIGH',
              notes: 'Send Product Brochure',
            },
          },
          payments: {
            create: {
              amount: 1500.00,
              paymentMethod: 'CASH',
              reference: 'INV-2023-001',
              notes: 'Advance payment for new order',
            },
          },
          photos: {
            create: {
              photoUrl: 'https://example.com/demo-photo.jpg',
              caption: 'Product demonstration with client',
            },
          },
        },
      });

      console.log(`Created completed visit for company ${company.name}`);

      // Create a planned visit
      const plannedVisit = await prisma.visit.create({
        data: {
          userId: user.id,
          companyId: company.id,
          startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
          status: 'PLANNED' as VisitStatus,
          purpose: 'Follow-up meeting and product showcase',
          notes: 'Will present the new product line and discuss pricing.',
          location: JSON.stringify({ latitude: 37.7749, longitude: -122.4194 }),
        },
      });

      console.log(`Created planned visit for company ${company.name}`);
    }

    // Create some follow-ups
    const visits = await prisma.visit.findMany({
      where: { status: 'COMPLETED' },
      take: 3,
    });

    for (const visit of visits) {
      // High priority follow-up
      await prisma.followUp.upsert({
        where: { id: uuidv4() },
        update: {},
        create: {
          visitId: visit.id,
          dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
          status: 'PENDING',
          priority: 'HIGH',
          notes: 'Send quotation for new order',
        },
      });

      // Medium priority follow-up
      await prisma.followUp.upsert({
        where: { id: uuidv4() },
        update: {},
        create: {
          visitId: visit.id,
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
          status: 'PENDING',
          priority: 'MEDIUM',
          notes: 'Schedule product training session',
        },
      });
    }

    console.log('DSR data seeded successfully');
  } catch (error) {
    console.error('Error seeding DSR data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedDsrData(); 