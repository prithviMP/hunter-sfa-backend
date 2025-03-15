import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file before any other imports
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Import server
import app from './server';
import { config } from './config';

// Start the server
const PORT = config.port || 3000;
app.listen(PORT, () => {
  console.log(`ℹ️  Server is running at http://localhost:${PORT}`);
  console.log(`ℹ️  Environment: ${config.environment}`);
  console.log(`ℹ️  API Documentation: http://localhost:${PORT}/api/v1/docs`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 UNCAUGHT EXCEPTION! Shutting down...', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  console.error('💥 UNHANDLED REJECTION! Shutting down...', error);
  process.exit(1);
});

// Handle SIGTERM signal
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  process.exit(0);
}); 