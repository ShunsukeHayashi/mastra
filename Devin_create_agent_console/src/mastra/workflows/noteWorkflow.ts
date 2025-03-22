import { anthropic } from '@ai-sdk/anthropic';
import { Agent } from '@mastra/core/agent';
import { Step, Workflow } from '@mastra/core/workflows';
import { z } from 'zod';
import { createNoteTool, getNoteByIdTool, listNotesTool } from '../tools';

const llm = anthropic('claude-3-5-sonnet-20241022');

const agent = new Agent({
  name: 'Note Agent',
  model: llm,
  instructions: `
    You are a helpful note-taking assistant that helps users create well-structured notes.
    
    When creating notes:
    - Organize content into logical sections with clear headings
    - Use bullet points for lists and key points
    - Format important information appropriately
    - Suggest improvements to make notes more clear and concise
    
    Follow the user's instructions carefully and help them create notes that are well-organized and easy to reference later.
  `,
});

const createNote = new Step({
  id: 'create-note',
  description: 'Creates a new note with the provided title and content',
  inputSchema: z.object({
    title: z.string().describe('Title of the note'),
    content: z.string().describe('Content of the note'),
    tags: z.array(z.string()).optional().describe('Optional tags for categorizing the note'),
  }),
  execute: async ({ context, mastra }) => {
    const triggerData = context?.getStepResult<{ 
      title: string;
      content: string;
      tags?: string[];
    }>('trigger');

    if (!triggerData) {
      throw new Error('Trigger data not found');
    }

    // Format the note content
    const prompt = `
      Please help me format and structure the following note content:
      
      Title: ${triggerData.title}
      
      Content:
      ${triggerData.content}
      
      Please organize this into a well-structured note with appropriate headings, bullet points, and formatting.
    `;

    const response = await agent.stream([
      {
        role: 'user',
        content: prompt,
      },
    ]);

    let formattedContent = '';
    for await (const chunk of response.textStream) {
      process.stdout.write(chunk);
      formattedContent += chunk;
    }

    // Create the note using the tool
    const note = await createNoteTool.execute({
      context: {
        title: triggerData.title,
        content: formattedContent,
        tags: triggerData.tags || [],
      },
      mastra,
    });

    return note;
  },
});

const getNoteById = new Step({
  id: 'get-note-by-id',
  description: 'Retrieves a note by its ID',
  inputSchema: z.object({
    id: z.string().describe('ID of the note to retrieve'),
  }),
  execute: async ({ context, mastra }) => {
    const triggerData = context?.getStepResult<{ id: string }>('trigger');

    if (!triggerData) {
      throw new Error('Trigger data not found');
    }

    const note = await getNoteByIdTool.execute({
      context: {
        id: triggerData.id,
      },
      mastra,
    });

    return note;
  },
});

const listNotes = new Step({
  id: 'list-notes',
  description: 'Lists all notes, optionally filtered by tags',
  inputSchema: z.object({
    tags: z.array(z.string()).optional().describe('Optional tags to filter notes by'),
    limit: z.number().optional().describe('Maximum number of notes to return'),
  }),
  execute: async ({ context, mastra }) => {
    const triggerData = context?.getStepResult<{ 
      tags?: string[];
      limit?: number;
    }>('trigger');

    const notes = await listNotesTool.execute({
      context: {
        tags: triggerData?.tags,
        limit: triggerData?.limit,
      },
      mastra,
    });

    return {
      notes,
    };
  },
});

const noteCreateWorkflow = new Workflow({
  name: 'note-create-workflow',
  triggerSchema: z.object({
    title: z.string().describe('Title of the note'),
    content: z.string().describe('Content of the note'),
    tags: z.array(z.string()).optional().describe('Optional tags for categorizing the note'),
  }),
})
  .step(createNote);

const noteGetWorkflow = new Workflow({
  name: 'note-get-workflow',
  triggerSchema: z.object({
    id: z.string().describe('ID of the note to retrieve'),
  }),
})
  .step(getNoteById);

const noteListWorkflow = new Workflow({
  name: 'note-list-workflow',
  triggerSchema: z.object({
    tags: z.array(z.string()).optional().describe('Optional tags to filter notes by'),
    limit: z.number().optional().describe('Maximum number of notes to return'),
  }),
})
  .step(listNotes);

noteCreateWorkflow.commit();
noteGetWorkflow.commit();
noteListWorkflow.commit();

export { noteCreateWorkflow, noteGetWorkflow, noteListWorkflow };
