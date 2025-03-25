import { startStandaloneServer } from './server';
// Use console logging instead of the logger module to avoid dependencies
const logger = {
  info: (message: string, meta?: any) => console.info(`[INFO] ${message}`, meta || ''),
  error: (message: string, meta?: any) => console.error(`[ERROR] ${message}`, meta || '')
};

// Start the standalone API server
try {
  logger.info('Starting Contract Management API server...');
  startStandaloneServer();
} catch (error) {
  logger.error('Failed to start Contract API server', { error });
  process.exit(1);
}
