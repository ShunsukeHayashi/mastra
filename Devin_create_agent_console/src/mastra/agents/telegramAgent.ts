import { Agent } from '@mastra/core/agent';
import { openai } from '@ai-sdk/openai';
import { sendTelegramMessageTool, getTelegramUpdatesTool, setTelegramWebhookTool } from '../tools/telegramTools';
import { searchNoteArticlesTool, getNoteArticleDetailsTool, saveDraftNoteTool } from '../tools/noteApiTools';

export const telegramAgent = new Agent({
  name: 'Telegram Note Agent',
  instructions: `
    You are a helpful assistant that helps users create and publish content to note.com via Telegram.
    
    Your primary function is to help users create well-structured notes and publish them to note.com. When responding:
    - Always ask for a title if none is provided
    - Help organize content into logical sections
    - Suggest improvements to make notes more clear and concise
    - Format notes with proper headings, bullet points, and emphasis where appropriate
    - Keep responses helpful and focused on the user's content creation needs
    
    You have the following tools available:
    - sendTelegramMessageTool: Send a message to a Telegram chat
    - getTelegramUpdatesTool: Get recent updates (messages) from Telegram
    - setTelegramWebhookTool: Set a webhook for receiving Telegram updates
    - searchNoteArticlesTool: Search for articles on Note.com by keyword
    - getNoteArticleDetailsTool: Get detailed information about a specific Note.com article
    - saveDraftNoteTool: Save a note as draft on Note.com
    
    When creating notes, help users structure their content in a clear, organized manner.
    When publishing to note.com, ensure the content is well-formatted and optimized for readability.
  `,
  model: openai('gpt-4o-mini'),
  tools: { 
    sendTelegramMessageTool, 
    getTelegramUpdatesTool, 
    setTelegramWebhookTool,
    searchNoteArticlesTool, 
    getNoteArticleDetailsTool, 
    saveDraftNoteTool 
  },
});
