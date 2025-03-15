# Hunter SFA API Integration Guide

This comprehensive guide provides instructions for implementing and integrating the Hunter SFA (Sales Force Automation) Backend API with frontend applications.

## Table of Contents

- [Overview](#overview)
- [API Setup](#api-setup)
- [Authentication](#authentication)
- [API Structure](#api-structure)
- [Frontend Integration](#frontend-integration)
- [Best Practices](#best-practices)
- [Error Handling](#error-handling)
- [Security Considerations](#security-considerations)
- [Performance Optimization](#performance-optimization)
- [Troubleshooting](#troubleshooting)

## Overview

The Hunter SFA Backend provides two primary API collections:

1. **Contact Management API** - For managing companies and contacts
2. **Calls Management API** - For scheduling, managing, and reporting on sales calls

These APIs enable your frontend application to provide a complete sales force automation experience.

## API Setup

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- A database (MongoDB recommended)
- Development environment with access to the API endpoints

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/prithviMP/hunter-sfa-backend.git
   cd hunter-sfa-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Create a `.env` file with the following variables:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/hunter-sfa
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRY=24h
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication.

### Authentication Flow

1. **User Login**:
   ```javascript
   // Frontend example (using fetch API)
   async function login(email, password) {
     const response = await fetch('https://api.hunter-sfa.com/auth/login', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json'
       },
       body: JSON.stringify({ email, password })
     });
     
     const data = await response.json();
     
     if (response.ok) {
       // Store token in secure storage
       localStorage.setItem('token', data.token);
       return data;
     } else {
       throw new Error(data.message || 'Login failed');
     }
   }
   ```

2. **Making Authenticated Requests**:
   ```javascript
   // Helper function for authenticated requests
   async function apiRequest(endpoint, method = 'GET', body = null) {
     const token = localStorage.getItem('token');
     
     const headers = {
       'Content-Type': 'application/json',
       'Authorization': `Bearer ${token}`
     };
     
     const config = {
       method,
       headers,
       body: body ? JSON.stringify(body) : null
     };
     
     const response = await fetch(`https://api.hunter-sfa.com${endpoint}`, config);
     const data = await response.json();
     
     if (!response.ok) {
       if (response.status === 401) {
         // Handle token expiration
         localStorage.removeItem('token');
         window.location.href = '/login';
       }
       throw new Error(data.message || 'Request failed');
     }
     
     return data;
   }
   ```

## API Structure

### Contact Management API

#### Companies Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/companies` | GET | Get all companies with filtering |
| `/api/companies` | POST | Create a new company |
| `/api/companies/:id` | GET | Get company by ID |
| `/api/companies/:id` | PUT | Update company |
| `/api/companies/:id/deactivate` | PUT | Deactivate company |
| `/api/companies/:id/approve` | PUT | Approve company |
| `/api/companies/:id/reject` | PUT | Reject company |

#### Contacts Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/contacts` | GET | Get all contacts with filtering |
| `/api/contacts/company/:companyId` | GET | Get contacts by company |
| `/api/contacts` | POST | Create a new contact |
| `/api/contacts/:id` | PUT | Update contact |
| `/api/contacts/:id` | DELETE | Delete contact |

### Calls Management API

#### Calls Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/calls` | GET | Get all calls with filtering |
| `/api/calls` | POST | Create a scheduled call |
| `/api/calls/:id` | PUT | Update call |
| `/api/calls/:id` | DELETE | Delete call |

#### Call Status Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/calls/:id/start` | PUT | Start a call |
| `/api/calls/:id/end` | PUT | End a call |
| `/api/calls/:id/cancel` | PUT | Cancel a call |

#### Call Logs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/call-logs` | GET | Get call logs |
| `/api/call-logs/pending` | GET | Get pending call logs |

#### Reports

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/reports/daily` | GET | Get daily call activity report |
| `/api/reports/weekly` | GET | Get weekly call activity report |
| `/api/reports/monthly` | GET | Get monthly call activity report |

## Frontend Integration

### Setting Up API Service Classes

Create dedicated service classes for each API domain:

```javascript
// services/ContactService.js
class ContactService {
  static async getAllCompanies(filters = {}) {
    const queryString = new URLSearchParams(filters).toString();
    return apiRequest(`/api/companies?${queryString}`);
  }
  
  static async createCompany(companyData) {
    return apiRequest('/api/companies', 'POST', companyData);
  }
  
  static async getContactsByCompany(companyId) {
    return apiRequest(`/api/contacts/company/${companyId}`);
  }
  
  // Additional methods...
}
```

```javascript
// services/CallsService.js
class CallsService {
  static async getAllCalls(filters = {}) {
    const queryString = new URLSearchParams(filters).toString();
    return apiRequest(`/api/calls?${queryString}`);
  }
  
  static async scheduleCall(callData) {
    return apiRequest('/api/calls', 'POST', callData);
  }
  
  static async startCall(callId) {
    return apiRequest(`/api/calls/${callId}/start`, 'PUT');
  }
  
  // Additional methods...
}
```

### State Management Integration

#### React with Redux Example

```javascript
// Redux action creators
export const fetchCompanies = (filters) => async (dispatch) => {
  dispatch({ type: 'FETCH_COMPANIES_REQUEST' });
  
  try {
    const companies = await ContactService.getAllCompanies(filters);
    dispatch({ 
      type: 'FETCH_COMPANIES_SUCCESS', 
      payload: companies 
    });
  } catch (error) {
    dispatch({ 
      type: 'FETCH_COMPANIES_FAILURE', 
      payload: error.message 
    });
  }
};
```

#### Vue with Vuex Example

```javascript
// Vuex store
const actions = {
  async fetchCompanies({ commit }, filters) {
    commit('SET_LOADING', true);
    
    try {
      const companies = await ContactService.getAllCompanies(filters);
      commit('SET_COMPANIES', companies);
    } catch (error) {
      commit('SET_ERROR', error.message);
    } finally {
      commit('SET_LOADING', false);
    }
  }
};
```

### Component Implementation

```jsx
// React Component Example
function CompanyList() {
  const [filters, setFilters] = useState({});
  const companies = useSelector(state => state.companies.list);
  const loading = useSelector(state => state.companies.loading);
  const dispatch = useDispatch();
  
  useEffect(() => {
    dispatch(fetchCompanies(filters));
  }, [filters, dispatch]);
  
  return (
    <div>
      <h1>Companies</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {companies.map(company => (
            <li key={company.id}>
              <h3>{company.name}</h3>
              <p>{company.industry}</p>
              <button 
                onClick={() => dispatch(navigateToContacts(company.id))}
              >
                View Contacts
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

## Best Practices

### API Requests

1. **Centralize API Logic**:
   - Create dedicated API service classes
   - Use a single API client for consistent handling

2. **Request Batching**:
   - Batch related API requests where possible
   - Use techniques like Promise.all for parallel requests

3. **Caching**:
   - Implement a caching strategy (e.g., React Query, SWR)
   - Cache results to minimize redundant requests

### State Management

1. **Normalized State**:
   - Store entities in a normalized format
   - Use libraries like normalizr to format API responses

2. **Optimistic Updates**:
   - Update UI immediately before API completion
   - Roll back changes if API request fails

3. **Loading States**:
   - Maintain granular loading states per request
   - Avoid showing empty screens during data fetching

### Authentication

1. **Token Management**:
   - Store tokens securely (preferably in HTTP-only cookies)
   - Implement token refresh logic
   - Clear tokens on logout or expiration

2. **Secure Routes**:
   - Protect routes requiring authentication
   - Redirect unauthenticated users to login

### Versioning

1. **API Versioning**:
   - Include version in API URLs (e.g., `/api/v1/companies`)
   - Plan for backward compatibility

## Error Handling

### Frontend Error Handling

```javascript
// Generic error handler
function handleApiError(error, context) {
  // Log error for debugging
  console.error(`Error in ${context}:`, error);
  
  // Handle specific error types
  if (error.status === 401) {
    // Unauthorized - redirect to login
    logout();
    redirectToLogin();
  } else if (error.status === 403) {
    // Forbidden - show permission error
    showNotification({
      type: 'error',
      message: 'You do not have permission to perform this action'
    });
  } else if (error.status === 404) {
    // Not found
    showNotification({
      type: 'error',
      message: 'The requested resource was not found'
    });
  } else {
    // Generic error
    showNotification({
      type: 'error',
      message: error.message || 'An unexpected error occurred'
    });
  }
  
  // Return a rejected promise to allow for chaining
  return Promise.reject(error);
}
```

### Implementing a Global Error Boundary (React)

```jsx
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to monitoring service
    logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorDisplay error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

## Security Considerations

1. **Input Validation**:
   - Validate all user inputs on both client and server
   - Use a validation library like Yup or Joi

2. **CSRF Protection**:
   - Implement CSRF tokens for sensitive operations
   - Use SameSite cookie attributes

3. **Content Security Policy**:
   - Set appropriate CSP headers
   - Limit inline scripts and styles

4. **Rate Limiting**:
   - Implement client-side throttling for form submissions
   - Handle server-side rate limit responses gracefully

## Performance Optimization

1. **Pagination and Infinite Scrolling**:
   ```javascript
   async function loadCompanies(page, limit) {
     return apiRequest(`/api/companies?page=${page}&limit=${limit}`);
   }
   
   // Implementation in a React component with infinite scroll
   function CompanyListInfinite() {
     const [companies, setCompanies] = useState([]);
     const [page, setPage] = useState(1);
     const [loading, setLoading] = useState(false);
     const [hasMore, setHasMore] = useState(true);
     
     const loadMore = useCallback(async () => {
       if (loading || !hasMore) return;
       
       setLoading(true);
       try {
         const result = await loadCompanies(page, 20);
         if (result.data.length === 0) {
           setHasMore(false);
         } else {
           setCompanies(prev => [...prev, ...result.data]);
           setPage(prev => prev + 1);
         }
       } catch (error) {
         console.error("Failed to load companies:", error);
       } finally {
         setLoading(false);
       }
     }, [page, loading, hasMore]);
     
     // Use with an IntersectionObserver or scroll event
     // ...
   }
   ```

2. **Memoization**:
   - Use React.memo, useMemo, and useCallback
   - Avoid unnecessary re-renders

3. **Code Splitting**:
   - Implement lazy loading for routes
   - Split code by feature or route

## Troubleshooting

### Common Issues and Solutions

1. **Authentication Issues**:
   - Check token expiration and refresh mechanism
   - Verify correct token format in requests

2. **CORS Errors**:
   - Ensure API server has proper CORS headers
   - Check request origin matches allowed origins

3. **Data Inconsistency**:
   - Implement optimistic updates with rollback
   - Add retry logic for failed requests

4. **Performance Problems**:
   - Use pagination for large data sets
   - Implement data caching
   - Consider using WebSockets for real-time updates

### Debugging Tools

1. **Network Monitoring**:
   - Use browser DevTools Network tab
   - Implement request/response logging

2. **State Debugging**:
   - Use Redux DevTools for state inspection
   - Implement logging middleware

---

## Contributing to This Guide

If you find areas for improvement in this integration guide, please submit a pull request or open an issue in the repository.

## License

This documentation is licensed under the MIT License.