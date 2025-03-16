# Hunter SFA (Sales Force Automation) API Documentation

## Table of Contents
1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [API Documentation](#api-documentation)
4. [Frontend Integration Guide](#frontend-integration-guide)
5. [Best Practices](#best-practices)
6. [Error Handling](#error-handling)
7. [Security](#security)

## Overview

Hunter SFA is a Sales Force Automation system that provides comprehensive APIs for Contact Management and Calls Management. This documentation covers both backend implementation details and frontend integration guidelines.

### Key Features
- Contact Management (Companies and Individual Contacts)
- Calls Management and Scheduling
- Call Status Tracking
- Reporting and Analytics

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/prithviMP/hunter-sfa-backend.git

# Install dependencies
cd hunter-sfa-backend
npm install

# Set up environment variables
cp .env.example .env
```

### Environment Variables
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/hunter-sfa
JWT_SECRET=your_jwt_secret
```

## API Documentation

### Authentication
All API endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### 1. Contact Management API

#### Companies Endpoints

##### Get All Companies
```http
GET /api/v1/companies
```
Query Parameters:
- `page` (optional): Page number for pagination
- `limit` (optional): Items per page
- `status`: Filter by status (active/inactive)

##### Create Company
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

#### Contacts Endpoints

##### Get Contacts by Company
```http
GET /api/v1/companies/{companyId}/contacts
```

##### Create Contact
```http
POST /api/v1/contacts
```
Request Body:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@company.com",
  "phone": "+1234567890",
  "companyId": "company_id",
  "role": "Manager"
}
```

### 2. Calls Management API

#### Schedule Call
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

#### Update Call Status
```http
PATCH /api/v1/calls/{callId}/status
```
Request Body:
```json
{
  "status": "completed",
  "notes": "Call completed successfully"
}
```

## Frontend Integration Guide

### Best Practices for Frontend Integration

1. **State Management**
```javascript
// Using Redux Toolkit example
import { createSlice } from '@reduxjs/toolkit';

const contactsSlice = createSlice({
  name: 'contacts',
  initialState: {
    data: [],
    loading: false,
    error: null
  },
  reducers: {
    // ... reducers
  }
});
```

2. **API Integration**
```javascript
// Create an API service
class ApiService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL;
    this.headers = {
      'Content-Type': 'application/json'
    };
  }

  setAuthToken(token) {
    this.headers.Authorization = `Bearer ${token}`;
  }

  async get(endpoint) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      headers: this.headers
    });
    return this.handleResponse(response);
  }

  // ... other methods
}
```

3. **Error Handling**
```javascript
// Custom hook for API calls
const useApiCall = (apiFunction) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const execute = async (...params) => {
    try {
      setLoading(true);
      const result = await apiFunction(...params);
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { execute, loading, error, data };
};
```

## Best Practices

### Backend Best Practices

1. **Input Validation**
- Use Joi or Yup for request validation
- Implement middleware for common validations

2. **Error Handling**
- Create custom error classes
- Implement global error handling middleware
- Return consistent error responses

3. **Security**
- Implement rate limiting
- Use helmet for security headers
- Sanitize user inputs
- Implement CORS properly

4. **Performance**
- Implement caching strategies
- Use database indexing
- Implement pagination
- Optimize database queries

### Frontend Best Practices

1. **State Management**
- Use Redux/Context API for global state
- Implement local state when appropriate
- Use proper state initialization

2. **Performance**
- Implement lazy loading
- Use proper memoization
- Optimize re-renders
- Implement proper error boundaries

3. **Security**
- Sanitize displayed data
- Implement proper XSS protection
- Store sensitive data securely
- Use HTTPS for all API calls

## Error Handling

### Error Response Format
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

### Common Error Codes
- `VALIDATION_ERROR`: Input validation failed
- `AUTHENTICATION_ERROR`: Authentication failed
- `AUTHORIZATION_ERROR`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `INTERNAL_ERROR`: Server internal error

## Security

1. **Authentication**
- JWT-based authentication
- Token refresh mechanism
- Session management

2. **Authorization**
- Role-based access control
- Permission-based access
- Resource-level permissions

3. **Data Protection**
- Data encryption at rest
- Secure communication (HTTPS)
- Input sanitization
- Output encoding

4. **API Security**
- Rate limiting
- CORS configuration
- Security headers
- Request validation

## Testing

### Backend Testing
```javascript
// Example Jest test
describe('Company API', () => {
  it('should create a new company', async () => {
    const response = await request(app)
      .post('/api/v1/companies')
      .send(companyData);
    expect(response.status).toBe(201);
  });
});
```

### Frontend Testing
```javascript
// Example React Testing Library test
describe('CompanyList Component', () => {
  it('renders company list correctly', () => {
    render(<CompanyList companies={mockCompanies} />);
    expect(screen.getByText('Company Name')).toBeInTheDocument();
  });
});
```

---

For more detailed information about specific endpoints or integration patterns, please refer to our [API Reference](./docs/api-reference.md) or [Integration Examples](./docs/integration-examples.md).

For support or questions, please open an issue in the repository.