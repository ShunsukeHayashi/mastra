import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import apiRouter from './mastra/api';
import { logger } from './mastra/utils/logger';

dotenv.config({ path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env' });

const config = process.env.NODE_ENV === 'production' 
  ? require('./production_config')
  : { api: { port: 3000, cors: { origin: '*' } } };

const app = express();
const port = process.env.PORT || config.api.port || 3000;

if (process.env.NODE_ENV === 'production') {
  app.use(helmet(config.security.helmet));
  
  const limiter = rateLimit({
    windowMs: config.api.rateLimit.windowMs,
    max: config.api.rateLimit.max,
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use(limiter);
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: config.api.cors.origin,
  methods: config.api.cors.methods,
  allowedHeaders: config.api.cors.allowedHeaders,
}));

app.use('/api', apiRouter);

app.get('/', (_req: express.Request, res: express.Response) => {
  res.json({
    name: 'Mastra Agent Generator',
    version: '1.0.0',
    description: 'API for generating Mastra agents, workflows, and tools',
    documentation: '/api/docs',
    environment: process.env.NODE_ENV || 'development',
  });
});

const server = app.listen(port, () => {
  logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${port}`);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
  });
});

export default app;
