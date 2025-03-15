import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { readFileSync } from 'fs';
import { join } from 'path';
import { parse } from 'yaml';
import cors from 'cors';
import morgan from 'morgan';

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Import Swagger documentation
try {
  // Import module documentation
  const dsrDoc = parse(readFileSync(join(__dirname, '../docs/dsr.yaml'), 'utf8'));
  const callsDoc = parse(readFileSync(join(__dirname, '../docs/calls.yaml'), 'utf8'));

  // Merge schemas and paths
  const swaggerDocument = {
    openapi: '3.0.0',
    info: {
      title: 'Hunter SFA API',
      version: '1.0.0',
      description: 'API documentation for Hunter Sales Force Automation platform',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        ...dsrDoc.components.schemas,
        ...callsDoc.components.schemas,
      },
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    paths: {
      ...dsrDoc.paths,
      ...callsDoc.paths,
    },
    tags: [
      { name: 'DSR', description: 'Daily Sales Reporting operations' },
      { name: 'Calls', description: 'Call Manager operations' },
    ],
    security: [
      {
        bearerAuth: [],
      },
    ],
  };

  // Serve Swagger documentation
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  console.log('Swagger documentation loaded successfully');
} catch (error) {
  console.error('Error loading Swagger documentation:', error);
}

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Documentation server is running',
    timestamp: new Date().toISOString(),
  });
});

// Start server
const PORT = process.env.DOCS_PORT || 8080;
app.listen(PORT, () => {
  console.log(`Documentation server running on port ${PORT}`);
  console.log(`Swagger UI available at http://localhost:${PORT}/docs`);
}); 