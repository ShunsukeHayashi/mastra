import express from 'express';
import { z } from 'zod';
import { agentGeneratorWorkflow } from '../workflows/agentGeneratorWorkflow';
import { workflowGeneratorWorkflow } from '../workflows/workflowGeneratorWorkflow';
import { toolGeneratorWorkflow } from '../workflows/toolGeneratorWorkflow';
import { mastra } from '../index';
import { logger } from '../utils/logger';

export const generatorRouter = express.Router();

const generateAgentSchema = z.object({
  requirements: z.string().describe('User requirements for the agent'),
});

const generateWorkflowSchema = z.object({
  requirements: z.string().describe('User requirements for the workflow'),
});

const generateToolSchema = z.object({
  requirements: z.string().describe('User requirements for the tool'),
});

const validateRequest = (schema: z.ZodType<any, any>) => {
  return (req: any, res: any, next: any) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      logger.error('Validation error', { error });
      res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: error instanceof z.ZodError ? error.errors : 'Unknown validation error',
      });
    }
  };
};

generatorRouter.post('/generate-agent', validateRequest(generateAgentSchema), (req: any, res: any) => {
  try {
    const { requirements } = req.body;
    
    if (agentGeneratorWorkflow) {
      const workflowRun = agentGeneratorWorkflow.createRun();
      workflowRun.start({
        triggerData: {
          requirements,
        }
      }).then(() => {
        logger.info(`Processing agent generation request: ${requirements.substring(0, 50)}...`);
        res.status(200).json({ 
          success: true,
          message: 'Agent generation workflow started',
          runId: workflowRun.runId,
        });
      }).catch((error: any) => {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error in workflow';
        logger.error('Error starting agent generator workflow:', { error: errorMessage });
        res.status(500).json({ 
          success: false,
          error: errorMessage,
        });
      });
    } else {
      throw new Error('agentGeneratorWorkflow not available');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    logger.error('Error processing agent generation request:', { error: errorMessage });
    res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
});

generatorRouter.post('/generate-workflow', validateRequest(generateWorkflowSchema), (req: any, res: any) => {
  try {
    const { requirements } = req.body;
    
    if (workflowGeneratorWorkflow) {
      const workflowRun = workflowGeneratorWorkflow.createRun();
      workflowRun.start({
        triggerData: {
          requirements,
        }
      }).then(() => {
        logger.info(`Processing workflow generation request: ${requirements.substring(0, 50)}...`);
        res.status(200).json({ 
          success: true,
          message: 'Workflow generation workflow started',
          runId: workflowRun.runId,
        });
      }).catch((error: any) => {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error in workflow';
        logger.error('Error starting workflow generator workflow:', { error: errorMessage });
        res.status(500).json({ 
          success: false,
          error: errorMessage,
        });
      });
    } else {
      throw new Error('workflowGeneratorWorkflow not available');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    logger.error('Error processing workflow generation request:', { error: errorMessage });
    res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
});

generatorRouter.post('/generate-tool', validateRequest(generateToolSchema), (req: any, res: any) => {
  try {
    const { requirements } = req.body;
    
    if (toolGeneratorWorkflow) {
      const workflowRun = toolGeneratorWorkflow.createRun();
      workflowRun.start({
        triggerData: {
          requirements,
        }
      }).then(() => {
        logger.info(`Processing tool generation request: ${requirements.substring(0, 50)}...`);
        res.status(200).json({ 
          success: true,
          message: 'Tool generation workflow started',
          runId: workflowRun.runId,
        });
      }).catch((error: any) => {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error in workflow';
        logger.error('Error starting tool generator workflow:', { error: errorMessage });
        res.status(500).json({ 
          success: false,
          error: errorMessage,
        });
      });
    } else {
      throw new Error('toolGeneratorWorkflow not available');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    logger.error('Error processing tool generation request:', { error: errorMessage });
    res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
});

generatorRouter.get('/status/:runId', (req: any, res: any) => {
  try {
    const { runId } = req.params;
    
    
    res.status(200).json({
      success: true,
      status: 'completed',
      result: {
        code: '// Generated code would be here',
        explanation: 'Explanation of the generated code would be here',
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    logger.error('Error getting generation status:', { error: errorMessage });
    res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
});

export default generatorRouter;
