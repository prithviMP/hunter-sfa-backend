#!/bin/bash

# Setup Swagger Documentation Environment
# This script sets up the necessary directories and files for Swagger documentation

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Print with color
print_green() {
  echo -e "${GREEN}$1${NC}"
}

print_yellow() {
  echo -e "${YELLOW}$1${NC}"
}

print_red() {
  echo -e "${RED}$1${NC}"
}

# Create docs directory if it doesn't exist
if [ ! -d "docs" ]; then
  print_yellow "Creating docs directory..."
  mkdir -p docs
  print_green "✓ docs directory created"
else
  print_green "✓ docs directory already exists"
fi

# Check if swagger.ts exists
if [ ! -f "src/swagger.ts" ]; then
  print_yellow "Creating swagger.ts..."
  
  # Create the file
  cat > src/swagger.ts << 'EOF'
import { readFileSync } from 'fs';
import { join } from 'path';
import { parse } from 'yaml';

// Import module documentation
const dsrDoc = parse(readFileSync(join(__dirname, '../docs/dsr.yaml'), 'utf8'));
const callsDoc = parse(readFileSync(join(__dirname, '../docs/calls.yaml'), 'utf8'));

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
EOF
  
  print_green "✓ swagger.ts created"
else
  print_green "✓ swagger.ts already exists"
fi

# Create sample YAML files if they don't exist
if [ ! -f "docs/dsr.yaml" ]; then
  print_yellow "Creating sample DSR YAML file..."
  
  # Create the file
  cat > docs/dsr.yaml << 'EOF'
components:
  schemas:
    DSR:
      type: object
      properties:
        id:
          type: string
          format: uuid
        userId:
          type: string
          format: uuid
        date:
          type: string
          format: date
        status:
          type: string
          enum: [draft, submitted, approved, rejected]
        notes:
          type: string
      required:
        - id
        - userId
        - date
        - status

paths:
  /api/dsr:
    get:
      summary: Get all DSRs
      tags:
        - DSR
      parameters:
        - name: status
          in: query
          schema:
            type: string
            enum: [draft, submitted, approved, rejected]
        - name: fromDate
          in: query
          schema:
            type: string
            format: date
        - name: toDate
          in: query
          schema:
            type: string
            format: date
      responses:
        '200':
          description: Successful operation
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/DSR'
        '401':
          description: Unauthorized
EOF
  
  print_green "✓ Sample DSR YAML file created"
else
  print_green "✓ DSR YAML file already exists"
fi

if [ ! -f "docs/calls.yaml" ]; then
  print_yellow "Creating sample Calls YAML file..."
  
  # Create the file
  cat > docs/calls.yaml << 'EOF'
components:
  schemas:
    Call:
      type: object
      properties:
        id:
          type: string
          format: uuid
        userId:
          type: string
          format: uuid
        contactId:
          type: string
          format: uuid
        scheduledAt:
          type: string
          format: date-time
        status:
          type: string
          enum: [scheduled, completed, missed, cancelled]
        notes:
          type: string
      required:
        - id
        - userId
        - contactId
        - scheduledAt
        - status

paths:
  /api/calls:
    get:
      summary: Get all calls
      tags:
        - Calls
      parameters:
        - name: status
          in: query
          schema:
            type: string
            enum: [scheduled, completed, missed, cancelled]
        - name: fromDate
          in: query
          schema:
            type: string
            format: date
        - name: toDate
          in: query
          schema:
            type: string
            format: date
      responses:
        '200':
          description: Successful operation
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Call'
        '401':
          description: Unauthorized
EOF
  
  print_green "✓ Sample Calls YAML file created"
else
  print_green "✓ Calls YAML file already exists"
fi

# Install required dependencies
print_yellow "Installing required dependencies..."
npm install --save swagger-ui-express swagger-jsdoc yaml openapi-schema-validator
npm install --save-dev @types/swagger-ui-express @types/swagger-jsdoc
print_green "✓ Dependencies installed"

# Make the validation script executable
chmod +x scripts/validate-swagger.js
print_green "✓ Made validation script executable"

# Validate the Swagger files
print_yellow "Validating Swagger files..."
npm run validate:swagger
if [ $? -eq 0 ]; then
  print_green "✓ All Swagger files are valid"
else
  print_red "✗ Some Swagger files have validation errors"
fi

print_green "\nSwagger documentation environment setup complete!"
print_yellow "Run 'npm run docs' to start the documentation server"
print_yellow "Access the documentation at http://localhost:8080/docs" 