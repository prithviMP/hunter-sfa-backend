# API Reference

## Authentication

### Login
```http
POST /api/v1/auth/login
```

Request body:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "role": "admin"
  }
}
```

## Companies API

### List Companies
```http
GET /api/v1/companies
```

Query Parameters:
| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 10) |
| status | string | Filter by status (active/inactive) |
| search | string | Search by company name |

Response:
```json
{
  "data": [
    {
      "id": "company_id",
      "name": "Company Name",
      "industry": "Industry Type",
      "status": "active",
      "createdAt": "2024-03-15T10:00:00Z",
      "updatedAt": "2024-03-15T10:00:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 10
  }
}
```

### Create Company
```http
POST /api/v1/companies
```

Request Body:
```json
{
  "name": "Company Name",
  "industry": "Industry Type",
  "address": {
    "street": "Street Address",
    "city": "City",
    "state": "State",
    "country": "Country",
    "zipCode": "Zip Code"
  },
  "contactInfo": {
    "email": "company@example.com",
    "phone": "+1234567890"
  }
}
```

Response:
```json
{
  "id": "company_id",
  "name": "Company Name",
  "industry": "Industry Type",
  "status": "active",
  "address": {
    "street": "Street Address",
    "city": "City",
    "state": "State",
    "country": "Country",
    "zipCode": "Zip Code"
  },
  "contactInfo": {
    "email": "company@example.com",
    "phone": "+1234567890"
  },
  "createdAt": "2024-03-15T10:00:00Z",
  "updatedAt": "2024-03-15T10:00:00Z"
}
```

## Contacts API

### List Contacts
```http
GET /api/v1/contacts
```

Query Parameters:
| Parameter | Type | Description |
|-----------|------|-------------|
| companyId | string | Filter by company |
| page | number | Page number |
| limit | number | Items per page |
| search | string | Search by name or email |

Response:
```json
{
  "data": [
    {
      "id": "contact_id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@company.com",
      "phone": "+1234567890",
      "companyId": "company_id",
      "role": "Manager",
      "createdAt": "2024-03-15T10:00:00Z",
      "updatedAt": "2024-03-15T10:00:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 10
  }
}
```

## Calls API

### Schedule Call
```http
POST /api/v1/calls
```

Request Body:
```json
{
  "contactId": "contact_id",
  "scheduledTime": "2024-03-15T10:00:00Z",
  "duration": 30,
  "purpose": "Sales Discussion",
  "notes": "Initial meeting with client"
}
```

Response:
```json
{
  "id": "call_id",
  "contactId": "contact_id",
  "scheduledTime": "2024-03-15T10:00:00Z",
  "duration": 30,
  "purpose": "Sales Discussion",
  "notes": "Initial meeting with client",
  "status": "scheduled",
  "createdAt": "2024-03-15T10:00:00Z",
  "updatedAt": "2024-03-15T10:00:00Z"
}
```

### Update Call Status
```http
PATCH /api/v1/calls/{callId}/status
```

Request Body:
```json
{
  "status": "completed",
  "notes": "Call completed successfully",
  "duration": 25
}
```

Response:
```json
{
  "id": "call_id",
  "status": "completed",
  "notes": "Call completed successfully",
  "duration": 25,
  "updatedAt": "2024-03-15T10:30:00Z"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "status": "error",
  "code": "VALIDATION_ERROR",
  "message": "Invalid input provided",
  "details": {
    "field": "email",
    "error": "Invalid email format"
  }
}
```

### 401 Unauthorized
```json
{
  "status": "error",
  "code": "AUTHENTICATION_ERROR",
  "message": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "status": "error",
  "code": "AUTHORIZATION_ERROR",
  "message": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "status": "error",
  "code": "NOT_FOUND",
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "status": "error",
  "code": "INTERNAL_ERROR",
  "message": "An unexpected error occurred"
}
```