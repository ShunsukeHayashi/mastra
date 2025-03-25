import express from 'express';
import cors from 'cors';
import routes from './routes';

// Simple logger implementation
const logger = {
  info: (message: string, meta?: any) => console.info(`[INFO] ${message}`, meta || ''),
  error: (message: string, meta?: any) => console.error(`[ERROR] ${message}`, meta || '')
};

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
app.use(express.json({ limit: '50mb' }));

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

// This file is imported by index.ts which calls startStandaloneServer

export default app;
