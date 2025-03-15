# DSR (Daily Sales Report) API Documentation

## Overview

The DSR API provides endpoints for managing sales visits, check-ins/outs, follow-ups, payments, and generating reports. It's designed for field sales representatives to track their customer visits and interactions.

## Base URL

```
/api/v1/dsr
```

## Authentication

All routes require authentication using a JWT token in the `Authorization` header.

```
Authorization: Bearer <your_jwt_token>
```

## Permissions

The DSR API requires specific permissions for different operations:

- `read:visits`: Required to view visits
- `create:visits`: Required to create visits and check-ins
- `update:visits`: Required to update visits and check-outs
- `read:follow-ups`: Required to view follow-ups
- `create:follow-ups`: Required to create follow-ups
- `update:follow-ups`: Required to update follow-ups
- `create:payments`: Required to record payments
- `read:companies`: Required to access nearby companies
- `read:reports`: Required to access reports

## Endpoints

### Visits

#### Get All Visits

Retrieves a paginated list of visits with filtering and sorting options.

- **URL**: `/visits`
- **Method**: `GET`
- **Permissions Required**: `read:visits`
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Number of items per page (default: 10)
  - `startDate`: Filter by start date (ISO string)
  - `endDate`: Filter by end date (ISO string)
  - `status`: Filter by visit status (PLANNED, CHECKED_IN, CHECKED_OUT, COMPLETED, CANCELLED)
  - `companyId`: Filter by company ID
  - `areaId`: Filter by area ID
  - `search`: Search term for company name
  - `sortBy`: Field to sort by (default: startTime)
  - `order`: Sort order (asc or desc, default: desc)

**Response Example**:
```json
{
  "status": "success",
  "data": [
    {
      "id": "visit-123",
      "company": {
        "id": "company-456",
        "name": "Tech Solutions Ltd",
        "address": "123 Main St, Mumbai"
      },
      "startTime": "2023-05-15T09:30:00Z",
      "endTime": "2023-05-15T10:45:00Z",
      "status": "COMPLETED",
      "purpose": "Product Demo",
      "notes": "Client interested in new product line"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalItems": 45,
    "totalPages": 5
  }
}
```

#### Get Visit by ID

Retrieves a single visit by its ID with detailed information.

- **URL**: `/visits/:id`
- **Method**: `GET`
- **Permissions Required**: `read:visits`
- **URL Parameters**:
  - `id`: Visit ID

**Response Example**:
```json
{
  "status": "success",
  "data": {
    "id": "visit-123",
    "company": {
      "id": "company-456",
      "name": "Tech Solutions Ltd",
      "address": "123 Main St, Mumbai",
      "contactPerson": "John Doe",
      "phone": "+91 98765 43210"
    },
    "startTime": "2023-05-15T09:30:00Z",
    "endTime": "2023-05-15T10:45:00Z",
    "status": "COMPLETED",
    "purpose": "Product Demo",
    "notes": "Client interested in new product line",
    "location": {
      "latitude": 19.0760,
      "longitude": 72.8777
    },
    "photos": [
      {
        "id": "photo-789",
        "url": "https://example.com/visit-photo.jpg",
        "caption": "Meeting with procurement team",
        "createdAt": "2023-05-15T10:15:00Z"
      }
    ],
    "followUps": [
      {
        "id": "followup-987",
        "title": "Send Price Quote",
        "dueDate": "2023-05-18T00:00:00Z",
        "status": "PENDING"
      }
    ],
    "payments": [
      {
        "id": "payment-654",
        "amount": 5000,
        "method": "CASH",
        "referenceNumber": "REF123",
        "createdAt": "2023-05-15T10:40:00Z"
      }
    ]
  }
}
```

#### Create Visit

Creates a new planned visit.

- **URL**: `/visits`
- **Method**: `POST`
- **Permissions Required**: `create:visits`
- **Request Body**:
  ```json
  {
    "companyId": "company-456",
    "startTime": "2023-05-20T10:00:00Z",
    "purpose": "Contract Renewal"
  }
  ```

**Response Example**:
```json
{
  "status": "success",
  "data": {
    "id": "visit-789",
    "companyId": "company-456",
    "startTime": "2023-05-20T10:00:00Z",
    "status": "PLANNED",
    "purpose": "Contract Renewal"
  },
  "message": "Visit created successfully"
}
```

#### Update Visit

Updates an existing visit.

- **URL**: `/visits/:id`
- **Method**: `PATCH`
- **Permissions Required**: `update:visits`
- **URL Parameters**:
  - `id`: Visit ID
- **Request Body**:
  ```json
  {
    "endTime": "2023-05-15T11:30:00Z",
    "status": "COMPLETED",
    "notes": "Contract successfully renewed for another year"
  }
  ```

**Response Example**:
```json
{
  "status": "success",
  "data": {
    "id": "visit-123",
    "companyId": "company-456",
    "startTime": "2023-05-15T09:30:00Z",
    "endTime": "2023-05-15T11:30:00Z",
    "status": "COMPLETED",
    "purpose": "Contract Renewal",
    "notes": "Contract successfully renewed for another year"
  },
  "message": "Visit updated successfully"
}
```

### Check-In/Out

#### Check-In

Performs a check-in at a company location.

- **URL**: `/check-in`
- **Method**: `POST`
- **Permissions Required**: `create:visits`
- **Request Body**:
  ```json
  {
    "companyId": "company-456",
    "purpose": "Routine Visit",
    "location": {
      "latitude": 19.0760,
      "longitude": 72.8777
    }
  }
  ```

**Response Example**:
```json
{
  "status": "success",
  "data": {
    "id": "visit-123",
    "companyId": "company-456",
    "startTime": "2023-05-15T09:30:00Z",
    "status": "CHECKED_IN",
    "purpose": "Routine Visit",
    "location": {
      "latitude": 19.0760,
      "longitude": 72.8777
    }
  },
  "message": "Check-in completed successfully"
}
```

#### Check-Out

Performs a check-out from a current visit.

- **URL**: `/check-out/:visitId`
- **Method**: `POST`
- **Permissions Required**: `update:visits`
- **URL Parameters**:
  - `visitId`: Visit ID
- **Request Body**:
  ```json
  {
    "notes": "Discussed new product offerings",
    "location": {
      "latitude": 19.0762,
      "longitude": 72.8779
    }
  }
  ```

**Response Example**:
```json
{
  "status": "success",
  "data": {
    "id": "visit-123",
    "companyId": "company-456",
    "startTime": "2023-05-15T09:30:00Z",
    "endTime": "2023-05-15T10:45:00Z",
    "status": "CHECKED_OUT",
    "purpose": "Routine Visit",
    "notes": "Discussed new product offerings",
    "location": {
      "latitude": 19.0762,
      "longitude": 72.8779
    }
  },
  "message": "Check-out completed successfully"
}
```

### Photos

#### Upload Visit Photo

Uploads a photo related to a visit.

- **URL**: `/visits/:visitId/photos`
- **Method**: `POST`
- **Permissions Required**: `update:visits`
- **URL Parameters**:
  - `visitId`: Visit ID
- **Request Body**: Multipart form data
  - `photo`: Image file
  - `caption`: Photo caption (optional)

**Response Example**:
```json
{
  "status": "success",
  "data": {
    "id": "photo-789",
    "visitId": "visit-123",
    "url": "https://example.com/visit-photo.jpg",
    "caption": "Meeting with procurement team",
    "createdAt": "2023-05-15T10:15:00Z"
  },
  "message": "Photo uploaded successfully"
}
```

### Follow-ups

#### Create Follow-up

Creates a follow-up task for a visit.

- **URL**: `/visits/:visitId/follow-ups`
- **Method**: `POST`
- **Permissions Required**: `create:follow-ups`
- **URL Parameters**:
  - `visitId`: Visit ID
- **Request Body**:
  ```json
  {
    "title": "Send Product Catalog",
    "description": "Email the detailed product catalog with pricing",
    "dueDate": "2023-05-18T00:00:00Z",
    "priority": "HIGH"
  }
  ```

**Response Example**:
```json
{
  "status": "success",
  "data": {
    "id": "followup-987",
    "visitId": "visit-123",
    "title": "Send Product Catalog",
    "description": "Email the detailed product catalog with pricing",
    "dueDate": "2023-05-18T00:00:00Z",
    "status": "PENDING",
    "priority": "HIGH",
    "createdAt": "2023-05-15T10:45:00Z"
  },
  "message": "Follow-up created successfully"
}
```

#### Get Follow-ups

Retrieves a paginated list of follow-ups with filtering and sorting options.

- **URL**: `/follow-ups`
- **Method**: `GET`
- **Permissions Required**: `read:follow-ups`
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Number of items per page (default: 10)
  - `startDate`: Filter by due date start (ISO string)
  - `endDate`: Filter by due date end (ISO string)
  - `status`: Filter by status (PENDING, COMPLETED, CANCELLED)
  - `priority`: Filter by priority (LOW, MEDIUM, HIGH)
  - `sortBy`: Field to sort by (default: dueDate)
  - `order`: Sort order (asc or desc, default: asc)

**Response Example**:
```json
{
  "status": "success",
  "data": [
    {
      "id": "followup-987",
      "visit": {
        "id": "visit-123",
        "company": {
          "id": "company-456",
          "name": "Tech Solutions Ltd"
        },
        "startTime": "2023-05-15T09:30:00Z"
      },
      "title": "Send Product Catalog",
      "dueDate": "2023-05-18T00:00:00Z",
      "status": "PENDING",
      "priority": "HIGH"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalItems": 8,
    "totalPages": 1
  }
}
```

#### Update Follow-up

Updates an existing follow-up.

- **URL**: `/follow-ups/:id`
- **Method**: `PATCH`
- **Permissions Required**: `update:follow-ups`
- **URL Parameters**:
  - `id`: Follow-up ID
- **Request Body**:
  ```json
  {
    "status": "COMPLETED",
    "notes": "Sent catalog via email on May 16th"
  }
  ```

**Response Example**:
```json
{
  "status": "success",
  "data": {
    "id": "followup-987",
    "title": "Send Product Catalog",
    "description": "Email the detailed product catalog with pricing",
    "dueDate": "2023-05-18T00:00:00Z",
    "status": "COMPLETED",
    "priority": "HIGH",
    "notes": "Sent catalog via email on May 16th",
    "updatedAt": "2023-05-16T14:30:00Z"
  },
  "message": "Follow-up updated successfully"
}
```

### Payments

#### Create Payment

Records a payment received during a visit.

- **URL**: `/visits/:visitId/payments`
- **Method**: `POST`
- **Permissions Required**: `create:payments`
- **URL Parameters**:
  - `visitId`: Visit ID
- **Request Body**:
  ```json
  {
    "amount": 10000,
    "method": "CHEQUE",
    "referenceNumber": "CH123456",
    "notes": "Payment for April invoice"
  }
  ```

**Response Example**:
```json
{
  "status": "success",
  "data": {
    "id": "payment-654",
    "visitId": "visit-123",
    "amount": 10000,
    "method": "CHEQUE",
    "referenceNumber": "CH123456",
    "notes": "Payment for April invoice",
    "createdAt": "2023-05-15T10:40:00Z"
  },
  "message": "Payment recorded successfully"
}
```

### Nearby Companies

#### Get Nearby Companies

Retrieves companies near a specified location.

- **URL**: `/nearby-companies`
- **Method**: `GET`
- **Permissions Required**: `read:companies`
- **Query Parameters**:
  - `latitude`: Current latitude
  - `longitude`: Current longitude
  - `radius`: Search radius in kilometers (default: 5)
  - `limit`: Maximum number of results (default: 10)

**Response Example**:
```json
{
  "status": "success",
  "data": [
    {
      "id": "company-456",
      "name": "Tech Solutions Ltd",
      "address": "123 Main St, Mumbai",
      "distance": 0.8,
      "latitude": 19.0760,
      "longitude": 72.8777
    },
    {
      "id": "company-789",
      "name": "Innovate Technologies",
      "address": "456 Park Ave, Mumbai",
      "distance": 1.2,
      "latitude": 19.0850,
      "longitude": 72.8900
    }
  ]
}
```

### Reports

#### Get Daily Report

Generates a daily activity report.

- **URL**: `/reports/daily`
- **Method**: `GET`
- **Permissions Required**: `read:reports`
- **Query Parameters**:
  - `startDate`: Report date (ISO string, required)
  - `endDate`: End date for date range (optional)
  - `areaId`: Filter by area (optional)
  - `regionId`: Filter by region (optional)

**Response Example**:
```json
{
  "status": "success",
  "data": {
    "date": "2023-05-15",
    "summary": {
      "totalVisits": 5,
      "completedVisits": 3,
      "cancelledVisits": 0,
      "plannedVisits": 2,
      "totalDistanceTravelled": 28.5,
      "totalTimeSpent": 285,
      "totalPaymentsCollected": 15000
    },
    "visits": [
      {
        "id": "visit-123",
        "company": {
          "name": "Tech Solutions Ltd"
        },
        "startTime": "2023-05-15T09:30:00Z",
        "endTime": "2023-05-15T10:45:00Z",
        "status": "COMPLETED",
        "purpose": "Product Demo"
      }
    ]
  }
}
```

#### Get Weekly Report

Generates a weekly activity report.

- **URL**: `/reports/weekly`
- **Method**: `GET`
- **Permissions Required**: `read:reports`
- **Query Parameters**:
  - `startDate`: Start of week (ISO string, required)
  - `endDate`: End of week (optional, defaults to 7 days after startDate)
  - `areaId`: Filter by area (optional)
  - `regionId`: Filter by region (optional)

**Response Example**:
```json
{
  "status": "success",
  "data": {
    "startDate": "2023-05-15",
    "endDate": "2023-05-21",
    "summary": {
      "totalVisits": 18,
      "completedVisits": 12,
      "cancelledVisits": 1,
      "plannedVisits": 5,
      "totalDistanceTravelled": 125.8,
      "totalTimeSpent": 1240,
      "totalPaymentsCollected": 45000,
      "visitsByDay": [
        { "date": "2023-05-15", "count": 5 },
        { "date": "2023-05-16", "count": 3 },
        { "date": "2023-05-17", "count": 4 },
        { "date": "2023-05-18", "count": 2 },
        { "date": "2023-05-19", "count": 4 },
        { "date": "2023-05-20", "count": 0 },
        { "date": "2023-05-21", "count": 0 }
      ]
    },
    "topCompanies": [
      {
        "name": "Tech Solutions Ltd",
        "visitCount": 3
      }
    ]
  }
}
```

#### Get Monthly Report

Generates a monthly activity report.

- **URL**: `/reports/monthly`
- **Method**: `GET`
- **Permissions Required**: `read:reports`
- **Query Parameters**:
  - `startDate`: Start of month (ISO string, required)
  - `endDate`: End of month (optional)
  - `areaId`: Filter by area (optional)
  - `regionId`: Filter by region (optional)

**Response Example**:
```json
{
  "status": "success",
  "data": {
    "month": "May 2023",
    "summary": {
      "totalVisits": 65,
      "completedVisits": 48,
      "cancelledVisits": 5,
      "plannedVisits": 12,
      "totalDistanceTravelled": 560.2,
      "totalTimeSpent": 5240,
      "totalPaymentsCollected": 180000,
      "visitsByWeek": [
        { "week": "Week 1 (May 1-7)", "count": 15 },
        { "week": "Week 2 (May 8-14)", "count": 18 },
        { "week": "Week 3 (May 15-21)", "count": 18 },
        { "week": "Week 4 (May 22-28)", "count": 14 },
        { "week": "Week 5 (May 29-31)", "count": 0 }
      ]
    },
    "topPerformance": {
      "mostVisitedCompany": "Tech Solutions Ltd",
      "mostVisitedArea": "Mumbai Central",
      "mostProductiveDay": "Wednesday"
    }
  }
}
```

## Error Responses

All endpoints return standardized error responses:

```json
{
  "status": "error",
  "message": "Error message describing what went wrong"
}
```

Common error codes:

- `400`: Bad Request - The request was invalid or missing required parameters
- `401`: Unauthorized - Authentication is required or failed
- `403`: Forbidden - The authenticated user doesn't have the required permissions
- `404`: Not Found - The requested resource was not found
- `500`: Internal Server Error - Something went wrong on the server 