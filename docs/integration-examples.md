# Frontend Integration Examples

This document provides practical examples of integrating the Hunter SFA API with a frontend application using React and modern best practices.

## Table of Contents
1. [Setup](#setup)
2. [API Integration](#api-integration)
3. [State Management](#state-management)
4. [Component Examples](#component-examples)
5. [Error Handling](#error-handling)
6. [Authentication](#authentication)

## Setup

### API Service Setup
```typescript
// src/services/api.ts
import axios, { AxiosInstance } from 'axios';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.REACT_APP_API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for authentication
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle token expiration
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // API methods
  async getCompanies(params: any) {
    const response = await this.api.get('/companies', { params });
    return response.data;
  }

  async createCompany(data: any) {
    const response = await this.api.post('/companies', data);
    return response.data;
  }

  // ... other API methods
}

export const apiService = new ApiService();
```

## State Management

### Redux Setup
```typescript
// src/store/slices/companiesSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiService } from '../../services/api';

export const fetchCompanies = createAsyncThunk(
  'companies/fetchCompanies',
  async (params: any) => {
    const response = await apiService.getCompanies(params);
    return response;
  }
);

const companiesSlice = createSlice({
  name: 'companies',
  initialState: {
    data: [],
    loading: false,
    error: null,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
    },
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCompanies.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCompanies.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchCompanies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default companiesSlice.reducer;
```

## Component Examples

### Companies List Component
```typescript
// src/components/Companies/CompaniesList.tsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCompanies } from '../../store/slices/companiesSlice';

export const CompaniesList: React.FC = () => {
  const dispatch = useDispatch();
  const { data, loading, error, pagination } = useSelector(
    (state) => state.companies
  );

  useEffect(() => {
    dispatch(fetchCompanies({ page: 1, limit: 10 }));
  }, [dispatch]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Companies</h2>
      <div className="grid gap-4">
        {data.map((company) => (
          <CompanyCard key={company.id} company={company} />
        ))}
      </div>
      <Pagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        onPageChange={(page) =>
          dispatch(fetchCompanies({ page, limit: 10 }))
        }
      />
    </div>
  );
};
```

### Company Form Component
```typescript
// src/components/Companies/CompanyForm.tsx
import React from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { useDispatch } from 'react-redux';
import { createCompany } from '../../store/slices/companiesSlice';

const validationSchema = Yup.object({
  name: Yup.string().required('Required'),
  industry: Yup.string().required('Required'),
  email: Yup.string().email('Invalid email').required('Required'),
  phone: Yup.string().required('Required'),
});

export const CompanyForm: React.FC = () => {
  const dispatch = useDispatch();

  return (
    <Formik
      initialValues={{
        name: '',
        industry: '',
        email: '',
        phone: '',
      }}
      validationSchema={validationSchema}
      onSubmit={async (values, { setSubmitting }) => {
        try {
          await dispatch(createCompany(values));
          // Show success notification
        } catch (error) {
          // Show error notification
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({ isSubmitting, errors, touched }) => (
        <Form className="space-y-4">
          <div>
            <label htmlFor="name">Company Name</label>
            <Field
              name="name"
              type="text"
              className={`form-input ${
                errors.name && touched.name ? 'error' : ''
              }`}
            />
            {errors.name && touched.name && (
              <div className="error">{errors.name}</div>
            )}
          </div>
          {/* Other form fields */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary"
          >
            {isSubmitting ? 'Submitting...' : 'Create Company'}
          </button>
        </Form>
      )}
    </Formik>
  );
};
```

## Error Handling

### Custom Error Boundary
```typescript
// src/components/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    // You can also log to an error reporting service here
  }

  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="error-boundary">
            <h2>Something went wrong</h2>
            <details>
              <summary>Error details</summary>
              {this.state.error?.toString()}
            </details>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
```

## Authentication

### Auth Context
```typescript
// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/api';

interface AuthContextType {
  user: any;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC = ({ children }) => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check for stored token and validate it
    const token = localStorage.getItem('token');
    if (token) {
      apiService.validateToken(token)
        .then(user => setUser(user))
        .catch(() => {
          localStorage.removeItem('token');
          setUser(null);
        });
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await apiService.login(email, password);
    localStorage.setItem('token', response.token);
    setUser(response.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

### Protected Route Component
```typescript
// src/components/ProtectedRoute.tsx
import React from 'react';
import { Route, Redirect, RouteProps } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps extends RouteProps {
  component: React.ComponentType<any>;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  component: Component,
  ...rest
}) => {
  const { isAuthenticated } = useAuth();

  return (
    <Route
      {...rest}
      render={(props) =>
        isAuthenticated ? (
          <Component {...props} />
        ) : (
          <Redirect
            to={{
              pathname: '/login',
              state: { from: props.location },
            }}
          />
        )
      }
    />
  );
};
```

## Usage Examples

### Setting Up Routes
```typescript
// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';

import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Companies } from './pages/Companies';
import { Contacts } from './pages/Contacts';
import { Calls } from './pages/Calls';

export const App: React.FC = () => {
  return (
    <Provider store={store}>
      <AuthProvider>
        <ErrorBoundary>
          <Router>
            <Switch>
              <Route exact path="/login" component={Login} />
              <ProtectedRoute exact path="/" component={Dashboard} />
              <ProtectedRoute exact path="/companies" component={Companies} />
              <ProtectedRoute exact path="/contacts" component={Contacts} />
              <ProtectedRoute exact path="/calls" component={Calls} />
            </Switch>
          </Router>
        </ErrorBoundary>
      </AuthProvider>
    </Provider>
  );
};
```

These examples demonstrate modern frontend development practices including:
- Type safety with TypeScript
- State management with Redux Toolkit
- Form handling with Formik
- Validation with Yup
- Error boundaries for graceful error handling
- Protected routes for authentication
- Context API for global state
- Proper API service structure
- Component composition and reusability