import express from 'express';
import { z } from 'zod';
import { sendTelegramMessageTool, getTelegramUpdatesTool, setTelegramWebhookTool } from '../tools/telegramTools';
import { telegramMessageWorkflow } from '../workflows/telegramWorkflow';
import { mastra } from '../index';

const logger = {
  info: (message: string, meta?: any) => console.log(`[INFO] ${message}`, meta || ''),
  warn: (message: string, meta?: any) => console.warn(`[WARN] ${message}`, meta || ''),
  error: (message: string, meta?: any) => console.error(`[ERROR] ${message}`, meta || ''),
  debug: (message: string, meta?: any) => console.debug(`[DEBUG] ${message}`, meta || ''),
};

export const telegramRouter = express.Router();

const telegramUpdateSchema = z.object({
  update_id: z.number(),
  message: z.object({
    message_id: z.number(),
    from: z.object({
      id: z.number(),
      is_bot: z.boolean(),
      first_name: z.string(),
      username: z.string().optional(),
    }),
    chat: z.object({
      id: z.number(),
      type: z.string(),
      title: z.string().optional(),
      first_name: z.string().optional(),
      username: z.string().optional(),
    }),
    date: z.number(),
    text: z.string().optional(),
  }).optional(),
});

telegramRouter.post('/send-message', (req: any, res: any) => {
  try {
    const { chatId, message, parseMode } = req.body;

    if (!chatId || !message) {
      return res.status(400).json({
        success: false,
        error: 'chatId and message are required',
      });
    }

    if (sendTelegramMessageTool && sendTelegramMessageTool.execute) {
      sendTelegramMessageTool.execute({
        context: {
          chatId,
          message,
          parseMode,
        },
        mastra,
      }).then(result => {
        res.json(result);
      }).catch(error => {
        logger.error('Error sending Telegram message:', { error: error.message || 'Unknown error' });
        res.status(500).json({
          success: false,
          error: error.message || 'Unknown error occurred',
        });
      });
    } else {
      throw new Error('sendTelegramMessageTool not available');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    logger.error('Error in send-message handler:', { error: errorMessage });
    res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
});

telegramRouter.get('/updates', (req: any, res: any) => {
  try {
    const { offset, limit, timeout } = req.query;

    if (getTelegramUpdatesTool && getTelegramUpdatesTool.execute) {
      getTelegramUpdatesTool.execute({
        context: {
          offset: offset ? parseInt(offset.toString()) : undefined,
          limit: limit ? parseInt(limit.toString()) : undefined,
          timeout: timeout ? parseInt(timeout.toString()) : undefined,
        },
        mastra,
      }).then(result => {
        res.json(result);
      }).catch(error => {
        logger.error('Error getting Telegram updates:', { error: error.message || 'Unknown error' });
        res.status(500).json({
          success: false,
          error: error.message || 'Unknown error occurred',
        });
      });
    } else {
      throw new Error('getTelegramUpdatesTool not available');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    logger.error('Error in updates handler:', { error: errorMessage });
    res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
});

telegramRouter.post('/set-webhook', (req: any, res: any) => {
  try {
    const { url, maxConnections, allowedUpdates } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'url is required',
      });
    }

    if (setTelegramWebhookTool && setTelegramWebhookTool.execute) {
      setTelegramWebhookTool.execute({
        context: {
          url,
          maxConnections,
          allowedUpdates,
        },
        mastra,
      }).then(result => {
        res.json(result);
      }).catch(error => {
        logger.error('Error setting Telegram webhook:', { error: error.message || 'Unknown error' });
        res.status(500).json({
          success: false,
          error: error.message || 'Unknown error occurred',
        });
      });
    } else {
      throw new Error('setTelegramWebhookTool not available');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    logger.error('Error in set-webhook handler:', { error: errorMessage });
    res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
});

telegramRouter.post('/webhook', (req: any, res: any) => {
  try {
    const updateResult = telegramUpdateSchema.safeParse(req.body);
    
    if (!updateResult.success) {
      logger.error('Invalid Telegram update format:', { error: updateResult.error });
      return res.status(400).json({
        success: false,
        error: 'Invalid update format',
      });
    }
    
    const update = updateResult.data;
    
    if (update.message && update.message.text) {
      const chatId = update.message.chat.id.toString();
      const userId = update.message.from.id.toString();
      const messageText = update.message.text;
      
      if (telegramMessageWorkflow) {
        const workflowRun = telegramMessageWorkflow.createRun();
        workflowRun.start({
          triggerData: {
            chatId,
            message: messageText,
            userId
          }
        }).then(() => {
          logger.info(`Processing message from ${userId} in chat ${chatId}: ${messageText}`);
          res.status(200).json({ success: true });
        }).catch((error: any) => {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error in workflow';
          logger.error('Error starting workflow:', { error: errorMessage });
          res.status(200).json({ 
            success: false,
            error: errorMessage,
          });
        });
      } else {
        throw new Error('telegramMessageWorkflow not available');
      }
    } else {
      res.status(200).json({ success: true, message: 'Update received but not processed' });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    logger.error('Error processing Telegram webhook:', { error: errorMessage });
    res.status(200).json({
      success: false,
      error: errorMessage,
    });
  }
});
