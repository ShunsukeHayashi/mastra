import { startStandaloneServer } from './server';
import { logger } from '../mastra/utils/logger';

// Start the standalone API server
try {
  logger.info('Starting Contract Management API server...');
  startStandaloneServer();
} catch (error) {
  logger.error('Failed to start Contract API server', { error });
  process.exit(1);
}
