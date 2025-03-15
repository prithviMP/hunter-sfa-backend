#!/usr/bin/env node

/**
 * Swagger YAML Validation Script
 * 
 * This script validates Swagger YAML files in the docs directory.
 * It checks for syntax errors and basic OpenAPI compliance.
 * 
 * Usage:
 *   node scripts/validate-swagger.js [file-path]
 * 
 * If file-path is provided, it validates only that file.
 * Otherwise, it validates all YAML files in the docs directory.
 */

const fs = require('fs');
const path = require('path');
const yaml = require('yaml');
const { OpenAPISchemaValidator } = require('openapi-schema-validator');

// Initialize the validator
const validator = new OpenAPISchemaValidator({ version: 3 });

// Get the file path from command line arguments
const filePath = process.argv[2];

/**
 * Validates a single YAML file
 * @param {string} filePath - Path to the YAML file
 * @returns {boolean} - Whether the file is valid
 */
function validateFile(filePath) {
  console.log(`Validating ${filePath}...`);
  
  try {
    // Read the file
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // Parse YAML
    const parsedYaml = yaml.parse(fileContent);
    
    // If it's a partial Swagger file (just components and paths)
    // we need to wrap it in a valid OpenAPI structure for validation
    const docToValidate = parsedYaml.openapi 
      ? parsedYaml 
      : {
          openapi: '3.0.0',
          info: {
            title: 'Temporary for validation',
            version: '1.0.0'
          },
          paths: parsedYaml.paths || {},
          components: parsedYaml.components || {}
        };
    
    // Validate against OpenAPI schema
    const result = validator.validate(docToValidate);
    
    if (result.errors.length === 0) {
      console.log(`✅ ${filePath} is valid`);
      return true;
    } else {
      console.error(`❌ ${filePath} has validation errors:`);
      result.errors.forEach(error => {
        console.error(`   - ${error.path}: ${error.message}`);
      });
      return false;
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`);
    console.error(`   ${error.message}`);
    return false;
  }
}

/**
 * Validates all YAML files in a directory
 * @param {string} dirPath - Path to the directory
 * @returns {boolean} - Whether all files are valid
 */
function validateDirectory(dirPath) {
  console.log(`Validating all YAML files in ${dirPath}...`);
  
  try {
    const files = fs.readdirSync(dirPath);
    const yamlFiles = files.filter(file => 
      file.endsWith('.yaml') || file.endsWith('.yml')
    );
    
    if (yamlFiles.length === 0) {
      console.log('No YAML files found.');
      return true;
    }
    
    let allValid = true;
    
    for (const file of yamlFiles) {
      const fullPath = path.join(dirPath, file);
      const isValid = validateFile(fullPath);
      allValid = allValid && isValid;
    }
    
    return allValid;
  } catch (error) {
    console.error(`Error reading directory ${dirPath}:`);
    console.error(error.message);
    return false;
  }
}

// Main execution
(async function main() {
  try {
    let isValid;
    
    if (filePath) {
      // Validate a specific file
      isValid = validateFile(filePath);
    } else {
      // Validate all YAML files in the docs directory
      const docsDir = path.join(__dirname, '..', 'docs');
      isValid = validateDirectory(docsDir);
    }
    
    if (isValid) {
      console.log('\n✅ All validations passed!');
      process.exit(0);
    } else {
      console.error('\n❌ Validation failed!');
      process.exit(1);
    }
  } catch (error) {
    console.error('Unexpected error:');
    console.error(error);
    process.exit(1);
  }
})(); 