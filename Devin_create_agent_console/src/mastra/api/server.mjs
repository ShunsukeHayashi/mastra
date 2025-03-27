import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { dxProposalApiRouter } from './dxProposalApi.mjs';
import { setupSwagger } from './swagger.mjs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4111;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// API Routes
app.use('/api', dxProposalApiRouter);

// Setup Swagger documentation
setupSwagger(app);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Mastra DX Proposal API',
    version: '1.0.0',
    documentation: '/docs',
    endpoints: [
      {
        path: '/api/dx-proposal',
        method: 'POST',
        description: 'Generate a DX proposal for a company'
      },
      {
        path: '/api/dx-proposal/:workflowId',
        method: 'GET',
        description: 'Get the status or result of a DX proposal generation'
      },
      {
        path: '/api/dx-proposal/:workflowId/pdf',
        method: 'GET',
        description: 'Get the DX proposal as a PDF'
      }
    ]
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('API error:', err);
  
  return res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' ? undefined : err.message
  });
});

// Start server
const startServer = () => {
  return new Promise((resolve) => {
    const server = app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}`);
      console.log(`API documentation available at http://localhost:${PORT}/docs`);
      resolve(server);
    });
  });
};

// Start the server immediately if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}`);
    console.log(`API documentation available at http://localhost:${PORT}/docs`);
  });
}

export { startServer };
export default app;
