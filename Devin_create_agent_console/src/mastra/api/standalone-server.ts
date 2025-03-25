import express from 'express';
import cors from 'cors';
import path from 'path';
import { logger } from '../utils/logger';
import { processBusinessCardHandler, getWorkflowStatusHandler } from './businessCardHandlers';

// Create Express server
const app = express();
const port = process.env.PORT || 4112;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files
app.use(express.static(path.join(process.cwd(), 'public')));

// Business Card API routes
app.post('/api/business-card/process', processBusinessCardHandler as unknown as express.RequestHandler);
app.get('/api/business-card/status/:workflowId', getWorkflowStatusHandler as unknown as express.RequestHandler);

// Business Card UI route
app.get('/', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'business-card.html'));
});

// Start server
export const startStandaloneServer = () => {
  app.listen(port, () => {
    logger.info(`Business Card UI server running on port ${port}`);
    logger.info(`Business Card UI available at http://localhost:${port}`);
  });
};

// Start the server if this file is run directly
if (require.main === module) {
  startStandaloneServer();
}

// Export app for testing
export default app;
