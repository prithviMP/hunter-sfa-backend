# Hunter SFA Backend

The backend API server for Hunter Sales Force Automation platform.

## Features

- **Authentication & Authorization**: JWT-based auth system with role-based access control
- **User Management**: Create, update, and manage user accounts
- **Company & Contact Management**: Store and retrieve company and contact information
- **DSR (Daily Sales Reporting)**: Track visits, check-ins, follow-ups, and payments
- **Call Manager**: Schedule and manage calls with contacts and companies
- **Reports**: Generate detailed reports for various metrics
- **Mobile & Web Support**: APIs designed to work with both mobile and web clients

## API Documentation

The API is fully documented using Swagger/OpenAPI. You can access the documentation by running:

```bash
npm run docs
```

This will start a server on port 8080 with the Swagger UI, which you can access at `http://localhost:8080/docs`.

### Swagger Documentation Structure

The Swagger documentation is organized into modules:

- **Main Configuration**: `swagger.ts` - Contains the main Swagger configuration and imports all module definitions
- **DSR Module**: `docs/dsr.yaml` - Documentation for Daily Sales Reporting endpoints
- **Call Manager**: `docs/calls.yaml` - Documentation for Call Management endpoints
- **Other modules**: Additional YAML files for other API modules

To add a new module to the documentation:
1. Create a new YAML file in the `docs` directory
2. Define your schemas and paths
3. Import and add the module to `swagger.ts`

## Tech Stack

- Node.js & TypeScript
- Express.js for API routing
- Prisma ORM with PostgreSQL
- Redis for caching
- Socket.io for real-time communication
- JWT for authentication
- Swagger/OpenAPI for documentation
- Jest for testing

## Getting Started

### Prerequisites

- Node.js (v16 or newer)
- PostgreSQL
- Redis (optional, for caching)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/hunter-sfa-backend.git
   cd hunter-sfa-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit the .env file with your configuration
   ```

4. Run database migrations:
   ```bash
   npm run migrate
   ```

5. Seed the database (optional):
   ```bash
   npm run seed
   ```

### Development

Run the development server:

```bash
npm run dev
```

This will start the server on port 3000 (or the port specified in your .env file).

To run only the documentation server:

```bash
npm run docs
```

### Building for Production

```bash
npm run build
npm start
```

## Available Scripts

- `npm run build`: Build the TypeScript project
- `npm run start`: Start the production server
- `npm run dev`: Start the development server with hot-reload
- `npm run lint`: Run ESLint
- `npm run test`: Run Jest tests
- `npm run migrate`: Run Prisma migrations
- `npm run seed`: Seed the database
- `npm run docs`: Run the documentation server (Swagger UI)
- `npm run format`: Format code with Prettier

## API Modules

### Authentication
- Login
- Logout
- Register
- Password reset

### Users
- User CRUD operations
- Profile management

### Companies
- Company CRUD operations
- Company search and filtering

### Contacts
- Contact CRUD operations
- Contact search and filtering

### DSR (Daily Sales Reporting)
- Visit tracking
- Check-in/check-out
- Follow-up management
- Payment recording

### Call Manager
- Call scheduling
- Call status management
- Call logs and history
- Call reports

## Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit your changes (`git commit -m 'Add some amazing feature'`)
3. Push to the branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

## License

Proprietary - All rights reserved 