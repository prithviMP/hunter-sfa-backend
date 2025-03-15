"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const uuid_1 = require("uuid");
const prisma = new client_1.PrismaClient();
/**
 * Seed data for the Call Manager feature
 */
async function main() {
    console.log('Starting to seed Call Manager data...');
    // Check if we already have call data to avoid duplicates
    const existingCallsCount = await prisma.call.count();
    if (existingCallsCount > 0) {
        console.log('Call data already exists. Skipping Call Manager seed.');
        return;
    }
    // Get users to associate with calls
    const users = await prisma.user.findMany({
        where: {
            role: {
                name: {
                    in: ['SALES_REP', 'SALES_MANAGER'],
                },
            },
        },
        take: 5,
    });
    if (users.length === 0) {
        console.log('No sales users found. Please run the main seed first.');
        return;
    }
    // Get companies to associate with calls
    const companies = await prisma.company.findMany({
        take: 10,
    });
    if (companies.length === 0) {
        console.log('No companies found. Please run the main seed first.');
        return;
    }
    // Get contacts to associate with calls
    const contacts = await prisma.contact.findMany({
        take: 20,
    });
    if (contacts.length === 0) {
        console.log('No contacts found. Please run the main seed first.');
        return;
    }
    // Call purposes
    const callPurposes = [
        'Sales Introduction',
        'Product Demo',
        'Follow-up on Quotation',
        'Account Review',
        'Renewal Discussion',
        'Complaint Resolution',
        'Upselling Opportunity',
        'Payment Collection',
        'Service Update',
        'New Product Introduction',
    ];
    // Call outcomes
    const callOutcomes = [
        'Interested - Follow Up Scheduled',
        'Interested - Needs More Information',
        'Not Interested - Budget Constraints',
        'Not Interested - Already Using Competitor',
        'Call Back Later',
        'Wrong Number',
        'No Answer',
        'Voicemail Left',
        'Purchase Confirmed',
        'Meeting Scheduled',
    ];
    // Current date
    const now = new Date();
    // Create past, current, and future calls
    const calls = [];
    // Past completed calls (last 30 days)
    for (let i = 0; i < 30; i++) {
        const user = users[Math.floor(Math.random() * users.length)];
        const company = companies[Math.floor(Math.random() * companies.length)];
        const contact = contacts[Math.floor(Math.random() * contacts.length)];
        const purpose = callPurposes[Math.floor(Math.random() * callPurposes.length)];
        const outcome = callOutcomes[Math.floor(Math.random() * callOutcomes.length)];
        // Random date between 1-30 days ago
        const daysAgo = Math.floor(Math.random() * 30) + 1;
        const scheduledDate = new Date(now);
        scheduledDate.setDate(scheduledDate.getDate() - daysAgo);
        // Random start time (0-60 minutes after scheduled time)
        const startDate = new Date(scheduledDate);
        startDate.setMinutes(startDate.getMinutes() + Math.floor(Math.random() * 60));
        // Random duration (5-45 minutes)
        const durationMinutes = Math.floor(Math.random() * 40) + 5;
        const endDate = new Date(startDate);
        endDate.setMinutes(endDate.getMinutes() + durationMinutes);
        // 80% completed, 10% missed, 10% cancelled
        const statusRandom = Math.random();
        let status = client_1.CallStatus.COMPLETED;
        if (statusRandom > 0.9) {
            status = client_1.CallStatus.CANCELLED;
        }
        else if (statusRandom > 0.8) {
            status = client_1.CallStatus.MISSED;
        }
        calls.push({
            id: (0, uuid_1.v4)(),
            userId: user.id,
            companyId: company.id,
            contactId: contact.id,
            scheduledTime: scheduledDate,
            actualStartTime: status !== client_1.CallStatus.MISSED ? startDate : null,
            actualEndTime: status === client_1.CallStatus.COMPLETED ? endDate : null,
            duration: status === client_1.CallStatus.COMPLETED ? durationMinutes : null,
            status,
            purpose,
            notes: status === client_1.CallStatus.COMPLETED ? `Call with ${contact.firstName} was ${Math.random() > 0.5 ? 'productive' : 'informative'}.` : null,
            outcome: status === client_1.CallStatus.COMPLETED ? outcome : null,
            createdAt: new Date(scheduledDate),
            updatedAt: new Date(),
        });
    }
    // Current day scheduled calls
    for (let i = 0; i < 10; i++) {
        const user = users[Math.floor(Math.random() * users.length)];
        const company = companies[Math.floor(Math.random() * companies.length)];
        const contact = contacts[Math.floor(Math.random() * contacts.length)];
        const purpose = callPurposes[Math.floor(Math.random() * callPurposes.length)];
        // Scheduled time today (future hours)
        const currentHour = now.getHours();
        const futureHours = 24 - currentHour - 1;
        const hoursAhead = Math.floor(Math.random() * futureHours) + 1;
        const scheduledDate = new Date(now);
        scheduledDate.setHours(currentHour + hoursAhead, Math.floor(Math.random() * 60), 0, 0);
        calls.push({
            id: (0, uuid_1.v4)(),
            userId: user.id,
            companyId: company.id,
            contactId: contact.id,
            scheduledTime: scheduledDate,
            actualStartTime: null,
            actualEndTime: null,
            duration: null,
            status: client_1.CallStatus.SCHEDULED,
            purpose,
            notes: null,
            outcome: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }
    // Future scheduled calls (next 7 days)
    for (let i = 0; i < 20; i++) {
        const user = users[Math.floor(Math.random() * users.length)];
        const company = companies[Math.floor(Math.random() * companies.length)];
        const contact = contacts[Math.floor(Math.random() * contacts.length)];
        const purpose = callPurposes[Math.floor(Math.random() * callPurposes.length)];
        // Random date between 1-7 days in future
        const daysAhead = Math.floor(Math.random() * 7) + 1;
        const scheduledDate = new Date(now);
        scheduledDate.setDate(scheduledDate.getDate() + daysAhead);
        scheduledDate.setHours(9 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 60), 0, 0);
        calls.push({
            id: (0, uuid_1.v4)(),
            userId: user.id,
            companyId: company.id,
            contactId: contact.id,
            scheduledTime: scheduledDate,
            actualStartTime: null,
            actualEndTime: null,
            duration: null,
            status: client_1.CallStatus.SCHEDULED,
            purpose,
            notes: null,
            outcome: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }
    // In progress calls (small chance)
    if (Math.random() > 0.7) {
        const user = users[Math.floor(Math.random() * users.length)];
        const company = companies[Math.floor(Math.random() * companies.length)];
        const contact = contacts[Math.floor(Math.random() * contacts.length)];
        const purpose = callPurposes[Math.floor(Math.random() * callPurposes.length)];
        // Started within the last 20 minutes
        const startedMinutesAgo = Math.floor(Math.random() * 20);
        const startDate = new Date(now);
        startDate.setMinutes(startDate.getMinutes() - startedMinutesAgo);
        calls.push({
            id: (0, uuid_1.v4)(),
            userId: user.id,
            companyId: company.id,
            contactId: contact.id,
            scheduledTime: new Date(startDate.getTime() - 1000 * 60 * 5), // 5 minutes before actual start
            actualStartTime: startDate,
            actualEndTime: null,
            duration: null,
            status: client_1.CallStatus.IN_PROGRESS,
            purpose,
            notes: null,
            outcome: null,
            createdAt: new Date(startDate.getTime() - 1000 * 60 * 60), // Created 1 hour before start
            updatedAt: new Date(),
        });
    }
    // Create all calls in a transaction
    await prisma.$transaction(calls.map((call) => prisma.call.create({
        data: call,
    })));
    console.log(`Created ${calls.length} calls for testing.`);
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed-calls.js.map