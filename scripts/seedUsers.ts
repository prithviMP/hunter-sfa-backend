import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function seedUsers() {
  console.log('Seeding users for different roles...');

  try {
    // Get existing roles
    const roles = await prisma.role.findMany({
      where: {
        name: {
          in: ['Administrator', 'Manager', 'Sales Representative']
        }
      }
    });

    const adminRole = roles.find(role => role.name === 'Administrator');
    const managerRole = roles.find(role => role.name === 'Manager');
    const salesRepRole = roles.find(role => role.name === 'Sales Representative');

    if (!adminRole || !managerRole || !salesRepRole) {
      console.log('Required roles not found. Please run the main seed first.');
      return;
    }

    // Get existing departments
    const departments = await prisma.department.findMany({
      where: {
        code: {
          in: ['HQ', 'SALES', 'MKT']
        }
      }
    });

    const hqDepartment = departments.find(dept => dept.code === 'HQ');
    const salesDepartment = departments.find(dept => dept.code === 'SALES');
    const marketingDepartment = departments.find(dept => dept.code === 'MKT');

    if (!hqDepartment || !salesDepartment || !marketingDepartment) {
      console.log('Required departments not found. Please run the main seed first.');
      return;
    }

    // Create users for each role
    const users = [
      // Admin users
      {
        firstName: 'John',
        lastName: 'Admin',
        email: 'john.admin@example.com',
        username: 'johnadmin',
        password: 'Admin123!',
        phoneNumber: '1234567890',
        roleId: adminRole.id,
        departmentId: hqDepartment.id,
      },
      {
        firstName: 'Jane',
        lastName: 'Admin',
        email: 'jane.admin@example.com',
        username: 'janeadmin',
        password: 'Admin123!',
        phoneNumber: '1234567891',
        roleId: adminRole.id,
        departmentId: hqDepartment.id,
      },
      
      // Manager users
      {
        firstName: 'Mike',
        lastName: 'Manager',
        email: 'mike.manager@example.com',
        username: 'mikemanager',
        password: 'Manager123!',
        phoneNumber: '1234567892',
        roleId: managerRole.id,
        departmentId: salesDepartment.id,
      },
      {
        firstName: 'Mary',
        lastName: 'Manager',
        email: 'mary.manager@example.com',
        username: 'marymanager',
        password: 'Manager123!',
        phoneNumber: '1234567893',
        roleId: managerRole.id,
        departmentId: marketingDepartment.id,
      },
      
      // Sales Representative users
      {
        firstName: 'Sam',
        lastName: 'Sales',
        email: 'sam.sales@example.com',
        username: 'samsales',
        password: 'Sales123!',
        phoneNumber: '1234567894',
        roleId: salesRepRole.id,
        departmentId: salesDepartment.id,
      },
      {
        firstName: 'Sarah',
        lastName: 'Sales',
        email: 'sarah.sales@example.com',
        username: 'sarahsales',
        password: 'Sales123!',
        phoneNumber: '1234567895',
        roleId: salesRepRole.id,
        departmentId: salesDepartment.id,
      },
      {
        firstName: 'Steve',
        lastName: 'Sales',
        email: 'steve.sales@example.com',
        username: 'stevesales',
        password: 'Sales123!',
        phoneNumber: '1234567896',
        roleId: salesRepRole.id,
        departmentId: salesDepartment.id,
      },
    ];

    // Create each user with proper password hashing
    for (const userData of users) {
      const { password, ...rest } = userData;
      const hashedPassword = await hash(password, 10);
      
      const existingUser = await prisma.user.findUnique({
        where: { email: rest.email }
      });
      
      if (existingUser) {
        console.log(`User ${rest.email} already exists, skipping...`);
        continue;
      }
      
      const user = await prisma.user.create({
        data: {
          ...rest,
          password: hashedPassword,
          isActive: true,
        }
      });
      
      // Create user settings
      await prisma.userSettings.create({
        data: {
          userId: user.id,
          notifications: {
            email: true,
            push: true,
            inApp: true,
            sms: false,
          },
          display: {
            theme: 'light',
            language: 'en',
          },
        }
      });
      
      console.log(`Created user: ${user.firstName} ${user.lastName} (${user.email})`);
    }

    console.log('Users seeded successfully!');
  } catch (error) {
    console.error('Error seeding users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedUsers();