import express from 'express';
import { logger } from '../utils/logger';
import { generatorAgent } from '../agents/generatorAgent';

export const gradioRouter = express.Router();

gradioRouter.post('/gradio-agent', async (req: any, res: any) => {
  try {
    const { requirements } = req.body;
    
    if (!requirements) {
      return res.status(400).json({
        success: false,
        error: 'Missing requirements parameter',
      });
    }
    
    logger.info('Processing Gradio agent generation request', { requirements: requirements.substring(0, 50) + '...' });
    
    const response = await generatorAgent.generate({
      messages: [
        {
          role: 'user',
          content: `Generate a Mastra agent based on these requirements: ${requirements}`,
        },
      ],
    });
    
    const formattedResponse = {
      agent_code: response.content,
      explanation: "Agent generated successfully based on your requirements.",
    };
    
    res.status(200).json(formattedResponse);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    logger.error('Error processing Gradio agent generation request:', { error: errorMessage });
    res.status(500).json({
      error: errorMessage,
    });
  }
});

gradioRouter.post('/gradio-workflow', async (req: any, res: any) => {
  try {
    const { requirements } = req.body;
    
    if (!requirements) {
      return res.status(400).json({
        success: false,
        error: 'Missing requirements parameter',
      });
    }
    
    logger.info('Processing Gradio workflow generation request', { requirements: requirements.substring(0, 50) + '...' });
    
    const response = await generatorAgent.generate({
      messages: [
        {
          role: 'user',
          content: `Generate a Mastra workflow based on these requirements: ${requirements}`,
        },
      ],
    });
    
    const formattedResponse = {
      workflow_code: response.content,
      explanation: "Workflow generated successfully based on your requirements.",
    };
    
    res.status(200).json(formattedResponse);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    logger.error('Error processing Gradio workflow generation request:', { error: errorMessage });
    res.status(500).json({
      error: errorMessage,
    });
  }
});

gradioRouter.post('/gradio-tool', async (req: any, res: any) => {
  try {
    const { requirements } = req.body;
    
    if (!requirements) {
      return res.status(400).json({
        success: false,
        error: 'Missing requirements parameter',
      });
    }
    
    logger.info('Processing Gradio tool generation request', { requirements: requirements.substring(0, 50) + '...' });
    
    const response = await generatorAgent.generate({
      messages: [
        {
          role: 'user',
          content: `Generate a Mastra tool based on these requirements: ${requirements}`,
        },
      ],
    });
    
    const formattedResponse = {
      tool_code: response.content,
      explanation: "Tool generated successfully based on your requirements.",
    };
    
    res.status(200).json(formattedResponse);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    logger.error('Error processing Gradio tool generation request:', { error: errorMessage });
    res.status(500).json({
      error: errorMessage,
    });
  }
});

export default gradioRouter;
