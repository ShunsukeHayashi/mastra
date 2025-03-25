import express from 'express';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import * as YAML from 'yaml';
import { logger } from '../utils/logger';

// Create router
const router = express.Router();

// Read OpenAPI specification
try {
  const openApiPath = path.join(__dirname, 'openapi.yaml');
  const openApiYaml = fs.readFileSync(openApiPath, 'utf8');
  const openApiSpec = YAML.parse(openApiYaml);
  
  // Set up Swagger UI
  router.use('/', swaggerUi.serve);
  router.get('/', swaggerUi.setup(openApiSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Mastra API Documentation',
    customfavIcon: '',
  }));
  
  logger.info('Swagger UI initialized successfully');
} catch (error) {
  const err = error as Error;
  logger.error('Failed to initialize Swagger UI', { error: err });
  
  // Fallback route
  router.get('/', (req, res) => {
    res.status(500).json({
      code: 500,
      message: 'Failed to load API documentation',
      details: process.env.NODE_ENV === 'production' ? undefined : err.message,
    });
  });
}

export default router;
