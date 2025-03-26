import { Step, Workflow } from '@mastra/core/workflows';
import { z } from 'zod';
import { sendTelegramMessageTool } from '../tools/telegramTools';
import { searchNoteArticlesTool, saveDraftNoteTool } from '../tools/noteApiTools';

const processMessage = new Step({
  id: 'process-telegram-message',
  description: 'Process a message received from Telegram and generate a response',
  inputSchema: z.object({
    chatId: z.string().describe('Telegram chat ID'),
    message: z.string().describe('Message text received from Telegram'),
    userId: z.string().describe('Telegram user ID'),
  }),
  execute: async ({ context, mastra }) => {
    const triggerData = context?.triggerData;
    
    if (!triggerData) {
      throw new Error('Input data not found');
    }

    const message = triggerData.message || '';
    
    if (message.startsWith('/note ')) {
      return await handleNoteCreation(triggerData, mastra);
    } else if (message.startsWith('/search ')) {
      return await handleNoteSearch(triggerData, mastra);
    } else {
      return await handleGeneralMessage(triggerData, mastra);
    }
  },
});

async function handleGeneralMessage(triggerData: any, mastra: any) {
  const responseContent = `Hello! I can help you create and publish content to note.com.
  
Use these commands:
- /note [title] - Create a new note with the given title
- /search [keyword] - Search for notes with the given keyword`;

  if (sendTelegramMessageTool && sendTelegramMessageTool.execute) {
    await sendTelegramMessageTool.execute({
      context: {
        chatId: triggerData.chatId,
        message: responseContent,
        parseMode: 'Markdown',
      },
      mastra,
    });
  }

  return {
    responseContent,
    chatId: triggerData.chatId,
    userId: triggerData.userId,
  };
}

async function handleNoteCreation(triggerData: any, mastra: any) {
  const messageLines = triggerData.message.split('\n');
  let title = '';
  let content = '';

  if (messageLines.length > 0) {
    title = messageLines[0].replace('/note ', '').trim();
    content = messageLines.slice(1).join('\n').trim();
  }

  if (!title || !content) {
    const errorMessage = 'Please provide both a title and content for your note. Format: /note Title\nContent';
    
    if (sendTelegramMessageTool && sendTelegramMessageTool.execute) {
      await sendTelegramMessageTool.execute({
        context: {
          chatId: triggerData.chatId,
          message: errorMessage,
          parseMode: 'Markdown',
        },
        mastra,
      });
    }
    
    return {
      success: false,
      error: 'Missing title or content',
      chatId: triggerData.chatId,
    };
  }

  let note = { success: false, message: 'Tool execution failed', id: '', key: '' };
  
  if (saveDraftNoteTool && saveDraftNoteTool.execute) {
    const result = await saveDraftNoteTool.execute({
      context: {
        title: title,
        body: content,
      },
      mastra,
    });
    
    if (result) {
      note = {
        success: result.success || false,
        message: result.message || 'Unknown error',
        id: result.id || '',
        key: result.key || '',
      };
    }
  }

  let responseMessage = '';
  if (note.success) {
    responseMessage = `✅ Note created successfully!\n\nTitle: ${title}\n\nYou can view it on note.com soon.`;
  } else {
    responseMessage = `❌ Failed to create note: ${note.message}`;
  }

  if (sendTelegramMessageTool && sendTelegramMessageTool.execute) {
    await sendTelegramMessageTool.execute({
      context: {
        chatId: triggerData.chatId,
        message: responseMessage,
        parseMode: 'Markdown',
      },
      mastra,
    });
  }

  return {
    success: note.success,
    noteId: note.id,
    noteKey: note.key,
    title,
    chatId: triggerData.chatId,
  };
}

async function handleNoteSearch(triggerData: any, mastra: any) {
  const keyword = triggerData.message.replace('/search ', '').trim();

  if (!keyword) {
    const errorMessage = 'Please provide a search keyword. Format: /search keyword';
    
    if (sendTelegramMessageTool && sendTelegramMessageTool.execute) {
      await sendTelegramMessageTool.execute({
        context: {
          chatId: triggerData.chatId,
          message: errorMessage,
          parseMode: 'Markdown',
        },
        mastra,
      });
    }
    
    return {
      success: false,
      error: 'Missing keyword',
      chatId: triggerData.chatId,
    };
  }

  interface NoteArticle {
    title: string;
    id: string;
    author: string;
    url: string;
    publishedAt: string;
  }
  
  interface NoteSearchResult {
    articles: NoteArticle[];
    totalCount: number;
  }
  
  let searchResults: NoteSearchResult = { articles: [], totalCount: 0 };
  
  if (searchNoteArticlesTool && searchNoteArticlesTool.execute) {
    const result = await searchNoteArticlesTool.execute({
      context: {
        keyword,
        size: 5,
      },
      mastra,
    });
    
    if (result && result.articles) {
      searchResults = result as NoteSearchResult;
    }
  }

  let responseMessage = '';
  if (searchResults.articles.length > 0) {
    responseMessage = `🔍 Search results for "${keyword}":\n\n`;
    searchResults.articles.forEach((article, index) => {
      responseMessage += `${index + 1}. [${article.title}](${article.url})\n`;
      responseMessage += `   by ${article.author} - ${new Date(article.publishedAt).toLocaleDateString()}\n\n`;
    });
  } else {
    responseMessage = `No results found for "${keyword}"`;
  }

  if (sendTelegramMessageTool && sendTelegramMessageTool.execute) {
    await sendTelegramMessageTool.execute({
      context: {
        chatId: triggerData.chatId,
        message: responseMessage,
        parseMode: 'Markdown',
      },
      mastra,
    });
  }

  return {
    success: true,
    keyword,
    resultsCount: searchResults.articles.length,
    chatId: triggerData.chatId,
  };
}

const telegramMessageWorkflow = new Workflow({
  name: 'telegram-message-workflow',
  triggerSchema: z.object({
    chatId: z.string().describe('Telegram chat ID'),
    message: z.string().describe('Message text received from Telegram'),
    userId: z.string().describe('Telegram user ID'),
  }),
})
.step(processMessage);

telegramMessageWorkflow.commit();

export { telegramMessageWorkflow };
