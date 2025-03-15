# Hunter SFA Backend

A comprehensive Sales Force Automation (SFA) backend API for managing contacts, companies, and sales calls.

## Overview

Hunter SFA Backend provides a complete API solution for sales teams to manage their customer relationships and sales activities. The system offers two main API collections:

1. **Contact Management API** - For managing companies and individual contacts
2. **Calls Management API** - For scheduling, tracking, and reporting on sales calls

## Features

### Contact Management

- Company management (create, read, update, deactivate)
- Company approval workflow
- Contact management within companies
- Filtering and search capabilities

### Calls Management

- Schedule and manage sales calls
- Track call statuses (scheduled, started, completed, canceled)
- Record call logs and outcomes
- Generate daily, weekly, and monthly reports

## Documentation

For detailed information on API endpoints and integration with frontend applications, please refer to:

- [API Integration Guide](./API_INTEGRATION_GUIDE.md) - Comprehensive guide for implementing and integrating with frontend applications

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

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

3. Set up environment variables:
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

## API Testing

The repository includes Postman collections for testing all API endpoints:

- Contact Management Collection
- Calls Management Collection

Import these collections into Postman to quickly test and explore the API functionality.

## Architecture

The Hunter SFA Backend follows a modular architecture with:

- RESTful API design
- JWT authentication
- MongoDB database
- Express.js framework

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.