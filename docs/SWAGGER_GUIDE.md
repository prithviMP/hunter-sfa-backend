# Swagger Documentation Guide

This guide explains how to extend the Swagger documentation for the Hunter SFA Backend.

## Overview

The Swagger documentation is organized into modules, with each module defined in a separate YAML file in the `docs` directory. The main configuration is in `swagger.ts`, which imports and combines all module definitions.

## Directory Structure

```
hunter-sfa-backend/
├── src/
│   ├── swagger.ts           # Main Swagger configuration
│   └── server.ts            # Server setup with Swagger middleware
└── docs/
    ├── dsr.yaml             # DSR module documentation
    ├── calls.yaml           # Call Manager module documentation
    └── [other-module].yaml  # Other module documentation
```

## Adding a New Module

To add documentation for a new module:

1. Create a new YAML file in the `docs` directory (e.g., `docs/new-module.yaml`)
2. Define your schemas and paths in the YAML file
3. Import and add the module to `swagger.ts`

### Step 1: Create a YAML File

Create a new YAML file with the following structure:

```yaml
# docs/new-module.yaml
components:
  schemas:
    # Define your data models here
    NewEntity:
      type: object
      properties:
        id:
          type: string
          format: uuid
        name:
          type: string
        # Add more properties as needed
      required:
        - id
        - name

paths:
  /api/new-module:
    get:
      summary: Get all entities
      tags:
        - NewModule
      responses:
        '200':
          description: Successful operation
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/NewEntity'
        '401':
          description: Unauthorized
    
    post:
      summary: Create a new entity
      tags:
        - NewModule
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                name:
                  type: string
              required:
                - name
      responses:
        '201':
          description: Created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/NewEntity'
        '400':
          description: Bad request
        '401':
          description: Unauthorized

  /api/new-module/{id}:
    parameters:
      - name: id
        in: path
        required: true
        schema:
          type: string
          format: uuid
    
    get:
      summary: Get entity by ID
      tags:
        - NewModule
      responses:
        '200':
          description: Successful operation
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/NewEntity'
        '404':
          description: Entity not found
        '401':
          description: Unauthorized
    
    put:
      summary: Update entity
      tags:
        - NewModule
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                name:
                  type: string
      responses:
        '200':
          description: Updated
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/NewEntity'
        '400':
          description: Bad request
        '404':
          description: Entity not found
        '401':
          description: Unauthorized
    
    delete:
      summary: Delete entity
      tags:
        - NewModule
      responses:
        '204':
          description: No content
        '404':
          description: Entity not found
        '401':
          description: Unauthorized
```

### Step 2: Update swagger.ts

Update the `swagger.ts` file to include your new module:

```typescript
// src/swagger.ts
import { readFileSync } from 'fs';
import { join } from 'path';
import { parse } from 'yaml';

// Import your new module
const dsrDoc = parse(readFileSync(join(__dirname, '../docs/dsr.yaml'), 'utf8'));
const callsDoc = parse(readFileSync(join(__dirname, '../docs/calls.yaml'), 'utf8'));
const newModuleDoc = parse(readFileSync(join(__dirname, '../docs/new-module.yaml'), 'utf8'));

// Merge schemas and paths
export const swaggerDocument = {
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
      ...newModuleDoc.components.schemas,
      // Add more module schemas as needed
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
    ...newModuleDoc.paths,
    // Add more module paths as needed
  },
  tags: [
    { name: 'DSR', description: 'Daily Sales Reporting operations' },
    { name: 'Calls', description: 'Call Manager operations' },
    { name: 'NewModule', description: 'New Module operations' },
    // Add more tags as needed
  ],
  security: [
    {
      bearerAuth: [],
    },
  ],
};
```

## Best Practices

1. **Organize by Module**: Keep each module's documentation in a separate YAML file.
2. **Consistent Naming**: Use consistent naming conventions for schemas and endpoints.
3. **Complete Documentation**: Document all parameters, request bodies, and responses.
4. **Use Tags**: Group endpoints using tags for better organization.
5. **Include Examples**: Provide examples for request and response bodies.
6. **Security**: Document security requirements for each endpoint.

## Common Patterns

### Pagination

For endpoints that return lists of items, use the following pattern:

```yaml
responses:
  '200':
    description: Successful operation
    content:
      application/json:
        schema:
          type: object
          properties:
            items:
              type: array
              items:
                $ref: '#/components/schemas/YourEntity'
            pagination:
              type: object
              properties:
                total:
                  type: integer
                page:
                  type: integer
                limit:
                  type: integer
                totalPages:
                  type: integer
```

### Error Responses

For error responses, use the following pattern:

```yaml
responses:
  '400':
    description: Bad request
    content:
      application/json:
        schema:
          type: object
          properties:
            message:
              type: string
            errors:
              type: array
              items:
                type: object
                properties:
                  field:
                    type: string
                  message:
                    type: string
```

## Testing Your Documentation

After adding a new module, run the documentation server to verify that your changes appear correctly:

```bash
npm run docs
```

Visit `http://localhost:8080/docs` in your browser to see the updated documentation.

## Troubleshooting

### Common Issues

1. **YAML Syntax Errors**: Ensure your YAML file has valid syntax.
2. **Missing References**: Check that all `$ref` references point to valid schemas.
3. **Duplicate Schemas**: Avoid duplicate schema names across different modules.

### Validation

You can validate your Swagger documentation using online tools like:
- [Swagger Editor](https://editor.swagger.io/)
- [Swagger Inspector](https://inspector.swagger.io/)

## Resources

- [OpenAPI Specification](https://swagger.io/specification/)
- [Swagger UI Documentation](https://swagger.io/tools/swagger-ui/) 