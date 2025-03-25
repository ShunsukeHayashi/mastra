import express from 'express';
import cors from 'cors';
import apiRoutes from './index';
import swaggerRoutes from './swagger';
import { errorHandler, requestLogger } from './middleware';
import { logger } from '../utils/logger';

// Create Express server
const app = express();
const port = process.env.PORT || 4111;

// CORS configuration for DocuFlow UI
const corsOptions = {
  origin: [
    'https://docu-flow-agent.lovable.app',
    'https://v0-mastra-contract-agent.vercel.app',
    'http://localhost:3000',
    'http://localhost:4111',
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(requestLogger);

// API routes
app.use('/api', apiRoutes);

// Swagger UI
app.use('/docs', swaggerRoutes);

// Root route
app.get('/', (req, res) => {
  res.redirect('/docs');
});

// Error handler
app.use(errorHandler as express.ErrorRequestHandler);

// Start server
export const startServer = () => {
  app.listen(port, () => {
    logger.info(`API server running on port ${port}`);
    logger.info(`API documentation available at http://localhost:${port}/docs`);
  });
};

// Export app for testing
export default app;
