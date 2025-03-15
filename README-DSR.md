# DSR (Daily Sales Report) Module

## Overview

The DSR module is a comprehensive system designed for field sales representatives to track customer visits, check-ins/outs, follow-ups, payments, and generate performance reports. It enables the mobile app to function as a field sales force automation tool.

## Features

- **Visit Management**: Plan, track, and complete customer visits
- **Check-In/Out System**: Record visit timestamps with geo-location tracking
- **Photo Capture**: Upload photos during visits for documentation
- **Follow-Up Management**: Create and track follow-up actions from visits
- **Payment Collection**: Record payments received during visits
- **Nearby Companies**: Find companies near the current location
- **Reporting**: Generate daily, weekly, and monthly performance reports

## Technical Implementation

### Models (Prisma Schema)

The DSR module utilizes the following models:

- **Visit**: Stores visit details, including company, time, status, and purpose
- **VisitPhoto**: Stores photos uploaded during visits
- **Payment**: Records payments collected during visits
- **FollowUp**: Tracks follow-up tasks from visits

### API Structure

#### Controllers

- **Visit Controllers**: Manage CRUD operations for visits
- **Check-In/Out Controllers**: Handle check-in and check-out processes
- **Photo Controllers**: Manage photo uploads
- **Follow-Up Controllers**: Handle creation and updates of follow-ups
- **Payment Controllers**: Record payments
- **Nearby Companies Controller**: Find companies near a location
- **Report Controllers**: Generate various reports

#### Validation Schemas

All API endpoints are protected with Zod validation schemas to ensure data integrity.

#### Routes

All routes are protected with authentication and appropriate permission checks.

### Technologies Used

- **Node.js & Express**: Backend server
- **Prisma ORM**: Database operations
- **S3 (or equivalent)**: Photo storage
- **PostgreSQL**: Database with PostGIS extension for geo-queries
- **Redis**: Caching for performance optimization
- **JWT**: Authentication and authorization

## Getting Started

### Prerequisites

- Node.js (v14+)
- PostgreSQL with PostGIS extension
- Redis (optional, for caching)

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Generate Prisma client:
   ```
   npm run prisma:generate
   ```
4. Run database migrations:
   ```
   npm run prisma:migrate:dev
   ```

### Seeding Data for Testing

To seed test data for the DSR module:

```
npm run seed:dsr
```

This will create test visits, follow-ups, and payments for development and testing purposes.

## API Documentation

For detailed API documentation, refer to the [DSR API Documentation](./docs/dsr-api.md).

## Mobile App Integration

The DSR module is designed to be integrated with a mobile app for field sales representatives. The app should implement:

1. **Visit Planning**: Allow sales reps to plan their visits
2. **Check-In/Out**: Use device GPS to record visit locations
3. **Photo Capture**: Use the device camera to take and upload photos
4. **Offline Support**: Cache data when offline and sync when connectivity is restored
5. **Location Services**: Show nearby companies and navigation assistance

## Web Dashboard Integration

The web dashboard should implement:

1. **Visit Calendar**: Show scheduled and completed visits
2. **Performance Reports**: Display daily, weekly, and monthly metrics
3. **Follow-Up Tracking**: Monitor pending follow-ups
4. **Payment Reconciliation**: Track payments collected by field reps
5. **Map View**: Visualize visit locations and patterns

## Best Practices Implemented

- **Error Handling**: Comprehensive error handling throughout the API
- **Validation**: Input validation using Zod schemas
- **Authentication**: JWT-based authentication with role-based permissions
- **Pagination**: All list endpoints support pagination for performance
- **Filtering & Sorting**: Advanced filtering and sorting options
- **Caching**: Strategic caching for frequently accessed data
- **Audit Logging**: Track who created and modified records

## Future Enhancements

- **Route Optimization**: Suggest optimal visit routes based on location
- **AI-Powered Recommendations**: Suggest follow-ups based on visit patterns
- **Advanced Analytics**: Provide deeper insights into sales performance
- **Customer Feedback**: Allow collection of customer feedback during visits
- **Integration with CRM**: Sync with CRM systems for a unified view 