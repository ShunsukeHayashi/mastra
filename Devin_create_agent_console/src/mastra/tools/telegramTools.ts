import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

const TELEGRAM_API_BASE_URL = 'https://api.telegram.org/bot';
const TELEGRAM_BOT_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN || '';

/**
 * Tool to send a message via Telegram
 */
export const sendTelegramMessageTool = createTool({
  id: 'send-telegram-message',
  description: 'Send a message to a Telegram chat',
  inputSchema: z.object({
    chatId: z.string().describe('Telegram chat ID'),
    message: z.string().describe('Message text to send'),
    parseMode: z.enum(['Markdown', 'HTML']).optional().describe('Parse mode for the message'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    messageId: z.number().optional(),
    error: z.string().optional(),
  }),
  execute: async ({ context }) => {
    try {
      if (!TELEGRAM_BOT_TOKEN) {
        throw new Error('Telegram bot token not configured');
      }

      const { chatId, message, parseMode } = context;
      
      if (!chatId || !message) {
        throw new Error('Chat ID and message are required');
      }

      const params = new URLSearchParams();
      params.append('chat_id', chatId);
      params.append('text', message);
      
      if (parseMode) {
        params.append('parse_mode', parseMode);
      }

      const response = await fetch(`${TELEGRAM_API_BASE_URL}${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(`Telegram API error: ${data.description || response.statusText}`);
      }

      return {
        success: true,
        messageId: data.result?.message_id,
      };
    } catch (error) {
      console.error('Error sending Telegram message:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  },
});

/**
 * Tool to get updates from Telegram
 */
export const getTelegramUpdatesTool = createTool({
  id: 'get-telegram-updates',
  description: 'Get recent updates (messages) from Telegram',
  inputSchema: z.object({
    offset: z.number().optional().describe('Identifier of the first update to be returned'),
    limit: z.number().optional().describe('Limits the number of updates to be retrieved'),
    timeout: z.number().optional().describe('Timeout in seconds for long polling'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    updates: z.array(z.any()).optional(),
    error: z.string().optional(),
  }),
  execute: async ({ context }) => {
    try {
      if (!TELEGRAM_BOT_TOKEN) {
        throw new Error('Telegram bot token not configured');
      }

      const { offset, limit, timeout } = context;
      
      const params = new URLSearchParams();
      
      if (offset !== undefined) {
        params.append('offset', offset.toString());
      }
      
      if (limit !== undefined) {
        params.append('limit', limit.toString());
      }
      
      if (timeout !== undefined) {
        params.append('timeout', timeout.toString());
      }

      const url = `${TELEGRAM_API_BASE_URL}${TELEGRAM_BOT_TOKEN}/getUpdates`;
      const queryString = params.toString();
      const fullUrl = queryString ? `${url}?${queryString}` : url;

      const response = await fetch(fullUrl);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(`Telegram API error: ${data.description || response.statusText}`);
      }

      return {
        success: true,
        updates: data.result,
      };
    } catch (error) {
      console.error('Error getting Telegram updates:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  },
});

/**
 * Tool to set a webhook for Telegram
 */
export const setTelegramWebhookTool = createTool({
  id: 'set-telegram-webhook',
  description: 'Set a webhook for receiving updates from Telegram',
  inputSchema: z.object({
    url: z.string().url().describe('HTTPS URL to send updates to'),
    maxConnections: z.number().optional().describe('Maximum allowed number of simultaneous HTTPS connections'),
    allowedUpdates: z.array(z.string()).optional().describe('List of the update types you want your bot to receive'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    description: z.string().optional(),
    error: z.string().optional(),
  }),
  execute: async ({ context }) => {
    try {
      if (!TELEGRAM_BOT_TOKEN) {
        throw new Error('Telegram bot token not configured');
      }

      const { url, maxConnections, allowedUpdates } = context;
      
      if (!url) {
        throw new Error('Webhook URL is required');
      }

      const params = new URLSearchParams();
      params.append('url', url);
      
      if (maxConnections !== undefined) {
        params.append('max_connections', maxConnections.toString());
      }
      
      if (allowedUpdates !== undefined && allowedUpdates.length > 0) {
        params.append('allowed_updates', JSON.stringify(allowedUpdates));
      }

      const response = await fetch(`${TELEGRAM_API_BASE_URL}${TELEGRAM_BOT_TOKEN}/setWebhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(`Telegram API error: ${data.description || response.statusText}`);
      }

      return {
        success: true,
        description: data.description,
      };
    } catch (error) {
      console.error('Error setting Telegram webhook:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  },
});
