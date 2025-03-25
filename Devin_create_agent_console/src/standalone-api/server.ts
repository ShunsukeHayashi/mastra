import express from 'express';
import cors from 'cors';
import { json } from 'body-parser';
import routes from './routes';
import { logger } from '../mastra/utils/logger';

const app = express();
const PORT = process.env.STANDALONE_API_PORT || 4112;

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
app.use(json({ limit: '50mb' }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });
  next();
});

// API routes
app.use('/api', routes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('API Error', { error: err });
  res.status(err.status || 500).json({
    code: err.status || 500,
    message: err.message || 'Internal Server Error',
    details: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
});

// Start the server
export const startStandaloneServer = () => {
  app.listen(PORT, () => {
    logger.info(`🚀 Contract API Server running on port ${PORT}`);
    logger.info(`📝 Contract API available at http://localhost:${PORT}/api/contracts`);
    logger.info(`💓 Health check available at http://localhost:${PORT}/health`);
  });
};

// If this file is run directly
if (require.main === module) {
  startStandaloneServer();
}

export default app;
