import express from 'express';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import path from 'path';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Hunter SFA API',
      version: '1.0.0',
      description: 'API for Hunter Sales Force Automation',
      contact: {
        name: 'Hunter SFA Team',
        email: 'info@huntersfa.com',
      },
    },
    servers: [
      {
        url: '/api/v1',
        description: 'API v1',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'Authentication failed - invalid credentials or token',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: {
                    type: 'string',
                    example: 'error',
                  },
                  message: {
                    type: 'string',
                    example: 'Unauthorized - invalid token',
                  },
                },
              },
            },
          },
        },
        BadRequestError: {
          description: 'Invalid request parameters',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: {
                    type: 'string',
                    example: 'error',
                  },
                  message: {
                    type: 'string',
                    example: 'Invalid request parameters',
                  },
                  errors: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        field: {
                          type: 'string',
                          example: 'email',
                        },
                        message: {
                          type: 'string',
                          example: 'Invalid email format',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        ServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: {
                    type: 'string',
                    example: 'error',
                  },
                  message: {
                    type: 'string',
                    example: 'Internal server error',
                  },
                },
              },
            },
          },
        },
      },
      schemas: {
        Pagination: {
          type: 'object',
          properties: {
            totalItems: {
              type: 'integer',
              example: 100,
            },
            totalPages: {
              type: 'integer',
              example: 10,
            },
            currentPage: {
              type: 'integer',
              example: 1,
            },
            pageSize: {
              type: 'integer',
              example: 10,
            },
            hasNext: {
              type: 'boolean',
              example: true,
            },
            hasPrev: {
              type: 'boolean',
              example: false,
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              example: '550e8400-e29b-41d4-a716-446655440000',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'user@example.com',
            },
            name: {
              type: 'string',
              example: 'John Doe',
            },
            role: {
              type: 'string',
              enum: ['ADMIN', 'MANAGER', 'SALESPERSON'],
              example: 'SALESPERSON',
            },
            status: {
              type: 'string',
              enum: ['ACTIVE', 'INACTIVE'],
              example: 'ACTIVE',
            },
            phone: {
              type: 'string',
              example: '+1234567890',
            },
            profilePicture: {
              type: 'string',
              format: 'uri',
              example: 'https://hunter-sfa-uploads.s3.amazonaws.com/users/550e8400-e29b-41d4-a716-446655440000/profile.jpg',
            },
            lastLogin: {
              type: 'string',
              format: 'date-time',
              example: '2023-01-01T12:00:00Z',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2023-01-01T00:00:00Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2023-01-01T00:00:00Z',
            },
          },
        },
        Company: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              example: '550e8400-e29b-41d4-a716-446655440000',
            },
            name: {
              type: 'string',
              example: 'Acme Corporation',
            },
            address: {
              type: 'string',
              example: '123 Main St, Anytown, AN 12345',
            },
            location: {
              type: 'string',
              description: 'Geolocation in PostGIS format',
              example: 'POINT(-122.4194 37.7749)',
            },
            phone: {
              type: 'string',
              example: '+1234567890',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'info@acme.com',
            },
            website: {
              type: 'string',
              format: 'uri',
              example: 'https://www.acme.com',
            },
            category: {
              type: 'string',
              example: 'TECHNOLOGY',
            },
            size: {
              type: 'string',
              enum: ['SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE'],
              example: 'MEDIUM',
            },
            notes: {
              type: 'string',
              example: 'Potential client for our new product line.',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2023-01-01T00:00:00Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2023-01-01T00:00:00Z',
            },
          },
        },
        Contact: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              example: '550e8400-e29b-41d4-a716-446655440000',
            },
            companyId: {
              type: 'string',
              format: 'uuid',
              example: '550e8400-e29b-41d4-a716-446655440000',
            },
            firstName: {
              type: 'string',
              example: 'Jane',
            },
            lastName: {
              type: 'string',
              example: 'Smith',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'jane.smith@acme.com',
            },
            phone: {
              type: 'string',
              example: '+1234567890',
            },
            position: {
              type: 'string',
              example: 'Purchasing Manager',
            },
            notes: {
              type: 'string',
              example: 'Key decision maker for our product line.',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2023-01-01T00:00:00Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2023-01-01T00:00:00Z',
            },
            company: {
              $ref: '#/components/schemas/Company',
            },
          },
        },
      },
    },
  },
  apis: [
    path.resolve(__dirname, './components/*.yaml'),
    path.resolve(__dirname, '../api/v1/**/*.ts'),
  ],
};

const specs = swaggerJSDoc(options);

const router = express.Router();

router.use('/', swaggerUi.serve);
router.get(
  '/',
  swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
  })
);

export default router; 