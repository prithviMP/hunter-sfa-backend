import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create default roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'Administrator' },
    update: {},
    create: {
      name: 'Administrator',
      description: 'Full access to all system functions',
      permissions: [
        'read:users', 'create:users', 'update:users', 'delete:users',
        'read:roles', 'create:roles', 'update:roles', 'delete:roles',
        'read:departments', 'create:departments', 'update:departments', 'delete:departments',
        'read:apps', 'create:apps', 'update:apps', 'delete:apps',
        'read:email-configurations', 'create:email-configurations', 'update:email-configurations', 'delete:email-configurations',
        'read:settings', 'update:settings',
        'read:areas', 'create:areas', 'update:areas', 'delete:areas',
        'read:visits', 'create:visits', 'update:visits', 'delete:visits',
      ],
      isDefault: false,
      isActive: true,
    },
  });

  const managerRole = await prisma.role.upsert({
    where: { name: 'Manager' },
    update: {},
    create: {
      name: 'Manager',
      description: 'Access to manage teams and view reports',
      permissions: [
        'read:users', 'update:users',
        'read:roles',
        'read:departments',
        'read:apps',
        'read:email-configurations',
        'read:areas',
        'read:visits', 'create:visits', 'update:visits',
      ],
      isDefault: true,
      isActive: true,
    },
  });

  const salesRepRole = await prisma.role.upsert({
    where: { name: 'Sales Representative' },
    update: {},
    create: {
      name: 'Sales Representative',
      description: 'Access to create and manage visits',
      permissions: [
        'read:visits', 'create:visits', 'update:visits',
      ],
      isDefault: true,
      isActive: true,
    },
  });

  console.log('Created roles:', { adminRole, managerRole, salesRepRole });

  // Create main department
  const mainDepartment = await prisma.department.upsert({
    where: { code: 'HQ' },
    update: {},
    create: {
      name: 'Headquarters',
      code: 'HQ',
      description: 'Main company department',
      isActive: true,
    },
  });

  const salesDepartment = await prisma.department.upsert({
    where: { code: 'SALES' },
    update: {},
    create: {
      name: 'Sales',
      code: 'SALES',
      description: 'Sales department',
      parentId: mainDepartment.id,
      isActive: true,
    },
  });

  const marketingDepartment = await prisma.department.upsert({
    where: { code: 'MKT' },
    update: {},
    create: {
      name: 'Marketing',
      code: 'MKT',
      description: 'Marketing department',
      parentId: mainDepartment.id,
      isActive: true,
    },
  });

  console.log('Created departments:', { mainDepartment, salesDepartment, marketingDepartment });

  // Create admin user if it doesn't exist
  const adminPassword = await hash('password123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      phoneNumber: '1234567890',
      password: adminPassword,
      roleId: adminRole.id,
      departmentId: mainDepartment.id,
      isActive: true,
    },
  });

  console.log('Created admin user:', adminUser);

  // Create default apps
  const mobileApp = await prisma.app.upsert({
    where: { key: 'mobile-app' },
    update: {},
    create: {
      name: 'Mobile App',
      key: 'mobile-app',
      description: 'SFA Mobile Application',
      iconUrl: 'https://example.com/mobile-icon.png',
      baseUrl: 'https://mobile.example.com',
      isActive: true,
    },
  });

  const webApp = await prisma.app.upsert({
    where: { key: 'web-portal' },
    update: {},
    create: {
      name: 'Web Portal',
      key: 'web-portal',
      description: 'SFA Web Portal',
      iconUrl: 'https://example.com/web-icon.png',
      baseUrl: 'https://web.example.com',
      isActive: true,
    },
  });

  console.log('Created apps:', { mobileApp, webApp });

  // Create system settings
  const emailSettings = await prisma.systemSettings.upsert({
    where: { key: 'smtp' },
    update: {
      value: JSON.stringify({
        host: 'smtp.example.com',
        port: 587,
        user: 'noreply@example.com',
        password: 'password123',
        secure: true,
      }),
    },
    create: {
      key: 'smtp',
      category: 'email',
      value: JSON.stringify({
        host: 'smtp.example.com',
        port: 587,
        user: 'noreply@example.com',
        password: 'password123',
        secure: true,
      }),
    },
  });

  const securitySettings = await prisma.systemSettings.upsert({
    where: { key: 'passwordPolicy' },
    update: {},
    create: {
      key: 'passwordPolicy',
      category: 'security',
      value: JSON.stringify({
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        expiryDays: 90,
      }),
    },
  });

  console.log('Created system settings');

  // Create default location data
  const country = await prisma.country.upsert({
    where: { code: 'US' },
    update: {},
    create: {
      name: 'United States',
      code: 'US',
      phoneCode: '+1',
      isActive: true,
    },
  });

  const state = await prisma.state.upsert({
    where: { code: 'CA' },
    update: {},
    create: {
      name: 'California',
      code: 'CA',
      countryId: country.id,
      isActive: true,
    },
  });

  const city = await prisma.city.upsert({
    where: { 
      name_stateId: {
        name: 'San Francisco',
        stateId: state.id
      }
    },
    update: {},
    create: {
      name: 'San Francisco',
      code: 'SF',
      stateId: state.id,
      isActive: true,
    },
  });

  console.log('Created location data');

  // Create default region
  const region = await prisma.region.upsert({
    where: { code: 'WEST' },
    update: {},
    create: {
      name: 'West Region',
      code: 'WEST',
      description: 'Western United States',
      isActive: true,
    },
  });

  console.log('Created region:', region);

  // Create default area
  const area = await prisma.area.upsert({
    where: { code: 'BAY-AREA' },
    update: {},
    create: {
      name: 'Bay Area',
      code: 'BAY-AREA',
      cityId: city.id,
      stateId: state.id,
      isActive: true,
    },
  });

  console.log('Created area:', area);

  // Create user settings for admin
  const userSettings = await prisma.userSettings.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: {
      userId: adminUser.id,
      notifications: {
        email: true,
        push: true,
        inApp: true,
        sms: false,
      },
      display: {
        theme: 'light',
        language: 'en',
        timezone: 'America/Los_Angeles',
      },
    },
  });

  console.log('Created user settings for admin');

  console.log('Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 