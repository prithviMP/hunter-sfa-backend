# Contact Management API Documentation

This document outlines the API endpoints for the Contact Management module, which manages companies and their contacts.

## Base URL

```
/api/v1/contact-management
```

## Authentication

All routes require authentication using JWT tokens. Include the token in the `Authorization` header:

```
Authorization: Bearer your_jwt_token
```

## Permissions

Different operations require different permissions:
- `read:companies` - Required to view companies and contacts
- `create:companies` - Required to create companies and contacts
- `update:companies` - Required to update companies and contacts, approve/reject companies
- `delete:companies` - Required to deactivate companies and delete contacts

## Companies API

### Get All Companies

Retrieves a paginated list of companies with filtering and sorting options.

**URL**: `/companies`  
**Method**: `GET`  
**Auth required**: Yes  
**Permissions required**: `read:companies`  

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of items per page (default: 10)
- `search` (optional): Search term to filter companies by name, code, email, or phone
- `type` (optional): Filter by company type (customer, distributor, supplier, partner, other)
- `status` (optional): Filter by company status (pending, approved, rejected)
- `areaId` (optional): Filter by area ID
- `regionId` (optional): Filter by region ID
- `isActive` (optional): Filter by active status (true, false)
- `sortBy` (optional): Field to sort by (default: createdAt)
- `order` (optional): Sort order (asc, desc) (default: desc)

**Success Response**:
```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "name": "Company Name",
      "code": "COMP001",
      "type": "customer",
      "address": { ... },
      "phone": "+91 1234567890",
      "email": "info@company.com",
      "website": "https://company.com",
      "status": "approved",
      "isActive": true,
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z",
      "createdBy": {
        "id": "uuid",
        "firstName": "John",
        "lastName": "Doe"
      },
      "approvedBy": {
        "id": "uuid",
        "firstName": "Admin",
        "lastName": "User"
      },
      "area": {
        "id": "uuid",
        "name": "Area Name"
      },
      "region": {
        "id": "uuid",
        "name": "Region Name"
      },
      "contactsCount": 5
    }
  ],
  "meta": {
    "totalCount": 20,
    "page": 1,
    "limit": 10,
    "totalPages": 2,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Get Company by ID

Retrieves a single company by ID.

**URL**: `/companies/:id`  
**Method**: `GET`  
**Auth required**: Yes  
**Permissions required**: `read:companies`  

**Success Response**:
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "name": "Company Name",
    "code": "COMP001",
    "type": "customer",
    "address": { ... },
    "phone": "+91 1234567890",
    "email": "info@company.com",
    "website": "https://company.com",
    "gstNumber": "GST1234567890",
    "panNumber": "PAN1234567890",
    "description": "Company description",
    "logo": "https://example.com/logo.png",
    "status": "approved",
    "statusReason": "Approved by admin",
    "isActive": true,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z",
    "createdBy": {
      "id": "uuid",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com"
    },
    "approvedBy": {
      "id": "uuid",
      "firstName": "Admin",
      "lastName": "User",
      "email": "admin@example.com"
    },
    "area": {
      "id": "uuid",
      "name": "Area Name",
      "code": "AREA1"
    },
    "region": {
      "id": "uuid",
      "name": "Region Name",
      "code": "REG1"
    },
    "contacts": [
      {
        "id": "uuid",
        "firstName": "Contact",
        "lastName": "Person",
        "designation": "CEO",
        "email": "contact@company.com",
        "phone": "+91 9876543210",
        "alternatePhone": null,
        "isDecisionMaker": true,
        "isActive": true,
        "notes": "Important contact",
        "createdAt": "2023-01-01T00:00:00.000Z",
        "updatedAt": "2023-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

### Create Company

Creates a new company.

**URL**: `/companies`  
**Method**: `POST`  
**Auth required**: Yes  
**Permissions required**: `create:companies`  

**Request Body**:
```json
{
  "name": "New Company",
  "code": "NEWCOM",
  "type": "customer",
  "address": {
    "street": "123 Main St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "postalCode": "400001",
    "country": "India"
  },
  "phone": "+91 1234567890",
  "email": "info@newcompany.com",
  "website": "https://newcompany.com",
  "gstNumber": "GST1234567890",
  "panNumber": "PAN1234567890",
  "description": "New company description",
  "logo": "https://example.com/logo.png",
  "areaId": "uuid",
  "regionId": "uuid"
}
```

**Success Response**:
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "name": "New Company",
    "code": "NEWCOM",
    "type": "customer",
    "address": { ... },
    "phone": "+91 1234567890",
    "email": "info@newcompany.com",
    "website": "https://newcompany.com",
    "gstNumber": "GST1234567890",
    "panNumber": "PAN1234567890",
    "description": "New company description",
    "logo": "https://example.com/logo.png",
    "status": "pending",
    "statusReason": null,
    "isActive": true,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z",
    "createdBy": {
      "id": "uuid",
      "firstName": "John",
      "lastName": "Doe"
    },
    "area": {
      "id": "uuid",
      "name": "Area Name"
    },
    "region": {
      "id": "uuid",
      "name": "Region Name"
    }
  },
  "message": "Company created successfully and pending approval"
}
```

### Update Company

Updates an existing company.

**URL**: `/companies/:id`  
**Method**: `PATCH`  
**Auth required**: Yes  
**Permissions required**: `update:companies`  

**Request Body**:
```json
{
  "name": "Updated Company Name",
  "description": "Updated description",
  "phone": "+91 9876543210",
  "areaId": "uuid"
}
```

**Success Response**:
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "name": "Updated Company Name",
    "code": "COMP001",
    "type": "customer",
    "address": { ... },
    "phone": "+91 9876543210",
    "email": "info@company.com",
    "website": "https://company.com",
    "gstNumber": "GST1234567890",
    "panNumber": "PAN1234567890",
    "description": "Updated description",
    "logo": "https://example.com/logo.png",
    "status": "pending",
    "statusReason": null,
    "isActive": true,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z",
    "createdBy": {
      "id": "uuid",
      "firstName": "John",
      "lastName": "Doe"
    },
    "approvedBy": null,
    "area": {
      "id": "uuid",
      "name": "Area Name"
    },
    "region": {
      "id": "uuid",
      "name": "Region Name"
    }
  },
  "message": "Company updated successfully"
}
```

### Approve Company

Approves a pending company.

**URL**: `/companies/:id/approve`  
**Method**: `POST`  
**Auth required**: Yes  
**Permissions required**: `update:companies`  

**Request Body**:
```json
{
  "reason": "Company meets all requirements"
}
```

**Success Response**:
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "name": "Company Name",
    "code": "COMP001",
    "status": "approved",
    "statusReason": "Company meets all requirements",
    "updatedAt": "2023-01-01T00:00:00.000Z",
    "createdBy": {
      "id": "uuid",
      "firstName": "John",
      "lastName": "Doe"
    },
    "approvedBy": {
      "id": "uuid",
      "firstName": "Admin",
      "lastName": "User"
    }
  },
  "message": "Company approved successfully"
}
```

### Reject Company

Rejects a pending company.

**URL**: `/companies/:id/reject`  
**Method**: `POST`  
**Auth required**: Yes  
**Permissions required**: `update:companies`  

**Request Body**:
```json
{
  "reason": "Missing required documentation"
}
```

**Success Response**:
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "name": "Company Name",
    "code": "COMP001",
    "status": "rejected",
    "statusReason": "Missing required documentation",
    "updatedAt": "2023-01-01T00:00:00.000Z",
    "createdBy": {
      "id": "uuid",
      "firstName": "John",
      "lastName": "Doe"
    },
    "approvedBy": {
      "id": "uuid",
      "firstName": "Admin",
      "lastName": "User"
    }
  },
  "message": "Company rejected successfully"
}
```

### Deactivate Company

Deactivates a company (soft delete).

**URL**: `/companies/:id`  
**Method**: `DELETE`  
**Auth required**: Yes  
**Permissions required**: `delete:companies`  

**Success Response**:
```json
{
  "status": "success",
  "message": "Company deactivated successfully"
}
```

## Contacts API

### Get Contacts for a Company

Retrieves a paginated list of contacts for a company with filtering and sorting options.

**URL**: `/companies/:companyId/contacts`  
**Method**: `GET`  
**Auth required**: Yes  
**Permissions required**: `read:companies`  

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of items per page (default: 10)
- `search` (optional): Search term to filter contacts by name, email, phone, or designation
- `isDecisionMaker` (optional): Filter by decision maker status (true, false)
- `isActive` (optional): Filter by active status (true, false)
- `sortBy` (optional): Field to sort by (default: createdAt)
- `order` (optional): Sort order (asc, desc) (default: desc)

**Success Response**:
```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "firstName": "John",
      "lastName": "Doe",
      "designation": "CEO",
      "email": "john@company.com",
      "phone": "+91 1234567890",
      "alternatePhone": "+91 9876543210",
      "isDecisionMaker": true,
      "isActive": true,
      "notes": "Important contact",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z",
      "companyId": "uuid"
    }
  ],
  "meta": {
    "totalCount": 5,
    "page": 1,
    "limit": 10,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

### Get Contact by ID

Retrieves a single contact by ID.

**URL**: `/contacts/:id`  
**Method**: `GET`  
**Auth required**: Yes  
**Permissions required**: `read:companies`  

**Success Response**:
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "firstName": "John",
    "lastName": "Doe",
    "designation": "CEO",
    "email": "john@company.com",
    "phone": "+91 1234567890",
    "alternatePhone": "+91 9876543210",
    "isDecisionMaker": true,
    "isActive": true,
    "notes": "Important contact",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z",
    "companyId": "uuid",
    "company": {
      "id": "uuid",
      "name": "Company Name",
      "code": "COMP001"
    }
  }
}
```

### Create Contact

Creates a new contact for a company.

**URL**: `/companies/:companyId/contacts`  
**Method**: `POST`  
**Auth required**: Yes  
**Permissions required**: `create:companies`  

**Request Body**:
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "designation": "CTO",
  "email": "jane@company.com",
  "phone": "+91 1234567890",
  "alternatePhone": "+91 9876543210",
  "isDecisionMaker": true,
  "notes": "Technical decision maker"
}
```

**Success Response**:
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "firstName": "Jane",
    "lastName": "Smith",
    "designation": "CTO",
    "email": "jane@company.com",
    "phone": "+91 1234567890",
    "alternatePhone": "+91 9876543210",
    "isDecisionMaker": true,
    "isActive": true,
    "notes": "Technical decision maker",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z",
    "companyId": "uuid",
    "company": {
      "id": "uuid",
      "name": "Company Name"
    }
  },
  "message": "Contact created successfully"
}
```

### Update Contact

Updates an existing contact.

**URL**: `/contacts/:id`  
**Method**: `PATCH`  
**Auth required**: Yes  
**Permissions required**: `update:companies`  

**Request Body**:
```json
{
  "firstName": "Jane",
  "lastName": "Johnson",
  "designation": "CIO",
  "phone": "+91 9876543210",
  "isDecisionMaker": false
}
```

**Success Response**:
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "firstName": "Jane",
    "lastName": "Johnson",
    "designation": "CIO",
    "email": "jane@company.com",
    "phone": "+91 9876543210",
    "alternatePhone": "+91 9876543210",
    "isDecisionMaker": false,
    "isActive": true,
    "notes": "Technical decision maker",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z",
    "companyId": "uuid",
    "company": {
      "id": "uuid",
      "name": "Company Name"
    }
  },
  "message": "Contact updated successfully"
}
```

### Delete Contact

Deletes a contact.

**URL**: `/contacts/:id`  
**Method**: `DELETE`  
**Auth required**: Yes  
**Permissions required**: `delete:companies`  

**Success Response**:
```json
{
  "status": "success",
  "message": "Contact deleted successfully"
}
```

## Error Responses

All endpoints return standardized error responses:

```json
{
  "status": "error",
  "code": 400,
  "message": "Descriptive error message",
  "details": {
    "field": ["Error details for specific field"]
  }
}
```

Common error codes:
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource not found)
- `500` - Internal Server Error (server-side issue) 