import express from 'express';
import generatorRouter from './generatorApi';
import demoRouter from './demo';
import gradioRouter from './gradioInterface';
import { logger } from '../utils/logger';
import swaggerUi from 'swagger-ui-express';

const router = express.Router();

const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Mastra Agent Generator API',
    version: '1.0.0',
    description: 'API for generating Mastra agents, workflows, and tools',
  },
  paths: {
    '/api/generator/generate-agent': {
      post: {
        summary: 'Generate a Mastra agent',
        description: 'Generate a Mastra agent based on user requirements',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['requirements'],
                properties: {
                  requirements: {
                    type: 'string',
                    description: 'User requirements for the agent',
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Agent generation workflow started',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                      example: true,
                    },
                    message: {
                      type: 'string',
                      example: 'Agent generation workflow started',
                    },
                    runId: {
                      type: 'string',
                      example: '123e4567-e89b-12d3-a456-426614174000',
                    },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Invalid request data',
          },
          '500': {
            description: 'Server error',
          },
        },
      },
    },
    '/api/generator/generate-workflow': {
      post: {
        summary: 'Generate a Mastra workflow',
        description: 'Generate a Mastra workflow based on user requirements',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['requirements'],
                properties: {
                  requirements: {
                    type: 'string',
                    description: 'User requirements for the workflow',
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Workflow generation workflow started',
          },
          '400': {
            description: 'Invalid request data',
          },
          '500': {
            description: 'Server error',
          },
        },
      },
    },
    '/api/generator/generate-tool': {
      post: {
        summary: 'Generate a Mastra tool',
        description: 'Generate a Mastra tool based on user requirements',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['requirements'],
                properties: {
                  requirements: {
                    type: 'string',
                    description: 'User requirements for the tool',
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Tool generation workflow started',
          },
          '400': {
            description: 'Invalid request data',
          },
          '500': {
            description: 'Server error',
          },
        },
      },
    },
    '/api/generator/status/{runId}': {
      get: {
        summary: 'Get generation status',
        description: 'Get the status of a generation workflow run',
        parameters: [
          {
            name: 'runId',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
            },
            description: 'ID of the workflow run',
          },
        ],
        responses: {
          '200': {
            description: 'Generation status',
          },
          '404': {
            description: 'Run not found',
          },
          '500': {
            description: 'Server error',
          },
        },
      },
    },
    '/api/demo/generate-agent': {
      post: {
        summary: 'Demo: Generate a Mastra agent',
        description: 'Demo endpoint for generating a Mastra agent based on user requirements',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['requirements'],
                properties: {
                  requirements: {
                    type: 'string',
                    description: 'User requirements for the agent',
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Agent generation result',
          },
          '400': {
            description: 'Invalid request data',
          },
          '500': {
            description: 'Server error',
          },
        },
      },
    },
    '/api/gradio/gradio-agent': {
      post: {
        summary: 'Gradio: Generate a Mastra agent',
        description: 'Gradio interface for generating a Mastra agent',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['requirements'],
                properties: {
                  requirements: {
                    type: 'string',
                    description: 'User requirements for the agent',
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Agent generation result',
          },
          '400': {
            description: 'Invalid request data',
          },
          '500': {
            description: 'Server error',
          },
        },
      },
    },
  },
};

router.use('/docs', swaggerUi.serve);
router.get('/docs', swaggerUi.setup(openApiSpec));

router.use('/generator', generatorRouter);
router.use('/demo', demoRouter);
router.use('/gradio', gradioRouter);

router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

export default router;
