import express from 'express';
import { logger } from '../utils/logger';
import { mastra } from '../index';
import { generatorAgent } from '../agents/generatorAgent';

export const demoRouter = express.Router();

demoRouter.post('/generate-agent', async (req: any, res: any) => {
  try {
    const { requirements } = req.body;
    
    if (!requirements) {
      return res.status(400).json({
        success: false,
        error: 'Missing requirements parameter',
      });
    }
    
    logger.info('Processing agent generation demo request', { requirements: requirements.substring(0, 50) + '...' });
    
    const response = await generatorAgent.generate({
      messages: [
        {
          role: 'user',
          content: `Generate a Mastra agent based on these requirements: ${requirements}`,
        },
      ],
    });
    
    res.status(200).json({
      success: true,
      result: response.content,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    logger.error('Error processing agent generation demo request:', { error: errorMessage });
    res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
});

demoRouter.post('/generate-workflow', async (req: any, res: any) => {
  try {
    const { requirements } = req.body;
    
    if (!requirements) {
      return res.status(400).json({
        success: false,
        error: 'Missing requirements parameter',
      });
    }
    
    logger.info('Processing workflow generation demo request', { requirements: requirements.substring(0, 50) + '...' });
    
    const response = await generatorAgent.generate({
      messages: [
        {
          role: 'user',
          content: `Generate a Mastra workflow based on these requirements: ${requirements}`,
        },
      ],
    });
    
    res.status(200).json({
      success: true,
      result: response.content,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    logger.error('Error processing workflow generation demo request:', { error: errorMessage });
    res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
});

demoRouter.post('/generate-tool', async (req: any, res: any) => {
  try {
    const { requirements } = req.body;
    
    if (!requirements) {
      return res.status(400).json({
        success: false,
        error: 'Missing requirements parameter',
      });
    }
    
    logger.info('Processing tool generation demo request', { requirements: requirements.substring(0, 50) + '...' });
    
    const response = await generatorAgent.generate({
      messages: [
        {
          role: 'user',
          content: `Generate a Mastra tool based on these requirements: ${requirements}`,
        },
      ],
    });
    
    res.status(200).json({
      success: true,
      result: response.content,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    logger.error('Error processing tool generation demo request:', { error: errorMessage });
    res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
});

export default demoRouter;
