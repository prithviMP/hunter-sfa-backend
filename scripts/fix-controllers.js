const fs = require('fs');
const path = require('path');

// Directories to search for controller files
const directories = [
  'src/api/v1/calls',
  'src/api/v1/contact-management',
  'src/api/v1/data-control',
  'src/api/v1/dsr',
  'src/api/v1/user-control',
  'src/api/v1/users',
  'src/api/v1/contacts',
];

// Function to update a controller file
function updateControllerFile(filePath) {
  console.log(`Processing ${filePath}...`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Add import for AuthRequest if not already present
  if (!content.includes('import { AuthRequest }')) {
    content = content.replace(
      'import { Request, Response, NextFunction } from \'express\';',
      'import { Request, Response, NextFunction } from \'express\';\nimport { AuthRequest } from \'../../../utils/requestUtils\';'
    );
  }
  
  // Find all controller functions
  const functionRegex = /export const \w+ = async\s*\(\s*req:\s*Request,\s*res:\s*Response,\s*next:\s*NextFunction\s*\)\s*=>\s*{\s*try\s*{/g;
  
  // Replace direct user access with safe access pattern
  content = content.replace(functionRegex, (match) => {
    return match + `
    const authReq = req as AuthRequest;
    if (authReq.user && authReq.user.id) {
      // User is authenticated
    `;
  });
  
  // Replace direct user.id access with safe access
  content = content.replace(/\(req as AuthRequest\)\.user\.id/g, 'authReq.user.id');
  content = content.replace(/\(req as AuthRequest\)\.user/g, 'authReq.user');
  
  // Replace remaining req.user.id with safe access
  content = content.replace(/req\.user\.id/g, 'authReq.user.id');
  content = content.replace(/req\.user(?!\.id)/g, 'authReq.user');
  
  fs.writeFileSync(filePath, content);
  console.log(`Updated ${filePath}`);
}

// Process all controller files
directories.forEach(dir => {
  const controllersPath = path.join(process.cwd(), dir, 'controllers.ts');
  if (fs.existsSync(controllersPath)) {
    updateControllerFile(controllersPath);
  } else {
    console.log(`File not found: ${controllersPath}`);
  }
});

console.log('All controller files updated successfully!'); 