import { startServer } from './server';
import { logger } from '../utils/logger';

// Start the API server
try {
  logger.info('Starting Mastra API server...');
  startServer();
} catch (error) {
  logger.error('Failed to start API server', { error });
  process.exit(1);
}
