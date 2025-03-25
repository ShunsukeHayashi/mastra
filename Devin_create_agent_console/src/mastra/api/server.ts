import express from 'express';
import cors from 'cors';
import path from 'path';
import apiRoutes from './index';
import swaggerRoutes from './swagger';
import { errorHandler, requestLogger } from './middleware';
import { logger } from '../utils/logger';

// Create Express server
const app = express();
const port = process.env.PORT || 4111;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(requestLogger);

// Serve static files
app.use(express.static(path.join(process.cwd(), 'public')));

// API routes
app.use('/api', apiRoutes);

// Swagger UI
app.use('/docs', swaggerRoutes);

// Business Card UI route
app.get('/business-card', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'business-card.html'));
});

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
    logger.info(`Business Card UI available at http://localhost:${port}/business-card`);
  });
};

// Export app for testing
export default app;
