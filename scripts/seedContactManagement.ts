import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function seedContactManagement() {
  console.log('Seeding contact management data...');

  try {
    // Ensure we have a user for creating companies
    const adminPassword = await hash('admin123', 10);
    
    const admin = await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {},
      create: {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        password: adminPassword,
        role: {
          connectOrCreate: {
            where: { name: 'Admin' },
            create: {
              name: 'Admin',
              permissions: [
                'read:companies', 
                'create:companies', 
                'update:companies', 
                'delete:companies'
              ],
            },
          },
        },
      },
    });

    // Ensure we have a sales user for creating companies
    const salesPassword = await hash('sales123', 10);
    
    const salesUser = await prisma.user.upsert({
      where: { email: 'sales@example.com' },
      update: {},
      create: {
        firstName: 'Sales',
        lastName: 'User',
        email: 'sales@example.com',
        password: salesPassword,
        role: {
          connectOrCreate: {
            where: { name: 'Sales' },
            create: {
              name: 'Sales',
              permissions: ['read:companies', 'create:companies'],
            },
          },
        },
      },
    });

    // Create sample areas if they don't exist
    const mumbaiArea = await prisma.area.upsert({
      where: { code: 'MUM' },
      update: {},
      create: {
        name: 'Mumbai',
        code: 'MUM',
        isActive: true,
      },
    });

    const delhiArea = await prisma.area.upsert({
      where: { code: 'DEL' },
      update: {},
      create: {
        name: 'Delhi',
        code: 'DEL',
        isActive: true,
      },
    });

    // Create sample regions if they don't exist
    const westRegion = await prisma.region.upsert({
      where: { code: 'WEST' },
      update: {},
      create: {
        name: 'West Region',
        code: 'WEST',
        description: 'Western Region of India',
        isActive: true,
      },
    });

    const northRegion = await prisma.region.upsert({
      where: { code: 'NORTH' },
      update: {},
      create: {
        name: 'North Region',
        code: 'NORTH',
        description: 'Northern Region of India',
        isActive: true,
      },
    });

    // Create sample companies
    const techSolutions = await prisma.company.upsert({
      where: { code: 'TECHSOL' },
      update: {},
      create: {
        name: 'Tech Solutions Ltd',
        code: 'TECHSOL',
        type: 'customer',
        address: {
          street: '123 Tech Avenue',
          city: 'Mumbai',
          state: 'Maharashtra',
          postalCode: '400001',
          country: 'India',
        },
        phone: '+91 9876543210',
        email: 'info@techsolutions.com',
        website: 'https://techsolutions.com',
        gstNumber: 'GST123456789',
        panNumber: 'PAN123456789',
        description: 'A leading technology solutions provider',
        status: 'approved',
        createdById: admin.id,
        approvedById: admin.id,
        areaId: mumbaiArea.id,
        regionId: westRegion.id,
      },
    });

    const innovateTech = await prisma.company.upsert({
      where: { code: 'INNTECH' },
      update: {},
      create: {
        name: 'Innovate Technologies',
        code: 'INNTECH',
        type: 'partner',
        address: {
          street: '456 Innovation Road',
          city: 'Delhi',
          state: 'Delhi',
          postalCode: '110001',
          country: 'India',
        },
        phone: '+91 9876543211',
        email: 'info@innovatetech.com',
        website: 'https://innovatetech.com',
        gstNumber: 'GST987654321',
        description: 'Innovative technology solutions for businesses',
        status: 'pending',
        createdById: salesUser.id,
        areaId: delhiArea.id,
        regionId: northRegion.id,
      },
    });

    const globalDistributor = await prisma.company.upsert({
      where: { code: 'GLODIST' },
      update: {},
      create: {
        name: 'Global Distributors Pvt Ltd',
        code: 'GLODIST',
        type: 'distributor',
        address: {
          street: '789 Distribution Avenue',
          city: 'Mumbai',
          state: 'Maharashtra',
          postalCode: '400002',
          country: 'India',
        },
        phone: '+91 9876543212',
        email: 'info@globaldist.com',
        website: 'https://globaldist.com',
        gstNumber: 'GST567891234',
        panNumber: 'PAN567891234',
        description: 'Leading distributor of technology products',
        status: 'approved',
        createdById: admin.id,
        approvedById: admin.id,
        areaId: mumbaiArea.id,
        regionId: westRegion.id,
      },
    });

    // Create sample contacts for the companies
    const johnDoe = await prisma.contact.upsert({
      where: {
        id: 'contact-john-doe', // This is dummy ID that won't exist
      },
      update: {},
      create: {
        id: 'contact-john-doe', // We'll explicitly set an ID for upsert
        firstName: 'John',
        lastName: 'Doe',
        designation: 'Chief Technology Officer',
        email: 'john.doe@techsolutions.com',
        phone: '+91 9876543220',
        isDecisionMaker: true,
        notes: 'Key decision maker for technology purchases',
        companyId: techSolutions.id,
      },
    });

    const janeSmith = await prisma.contact.upsert({
      where: {
        id: 'contact-jane-smith',
      },
      update: {},
      create: {
        id: 'contact-jane-smith',
        firstName: 'Jane',
        lastName: 'Smith',
        designation: 'CEO',
        email: 'jane.smith@innovatetech.com',
        phone: '+91 9876543221',
        alternatePhone: '+91 9876543222',
        isDecisionMaker: true,
        companyId: innovateTech.id,
      },
    });

    const bobJohnson = await prisma.contact.upsert({
      where: {
        id: 'contact-bob-johnson',
      },
      update: {},
      create: {
        id: 'contact-bob-johnson',
        firstName: 'Bob',
        lastName: 'Johnson',
        designation: 'Procurement Manager',
        email: 'bob.johnson@techsolutions.com',
        phone: '+91 9876543223',
        isDecisionMaker: false,
        notes: 'Handles all procurement related queries',
        companyId: techSolutions.id,
      },
    });

    const amitPatel = await prisma.contact.upsert({
      where: {
        id: 'contact-amit-patel',
      },
      update: {},
      create: {
        id: 'contact-amit-patel',
        firstName: 'Amit',
        lastName: 'Patel',
        designation: 'Managing Director',
        email: 'amit.patel@globaldist.com',
        phone: '+91 9876543224',
        isDecisionMaker: true,
        companyId: globalDistributor.id,
      },
    });

    console.log('Contact management data seeded successfully');
  } catch (error) {
    console.error('Error seeding contact management data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedContactManagement()
  .catch((error) => {
    console.error('Error running seed script:', error);
    process.exit(1);
  }); 