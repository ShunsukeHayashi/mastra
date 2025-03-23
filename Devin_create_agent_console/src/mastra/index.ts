
import { Mastra } from '@mastra/core/mastra';
import { createLogger } from '@mastra/core/logger';
import { noteAgent } from './agents/index';
import { articleGenerationAgents } from './agents/articleGeneration';
import { noteCreateWorkflow, noteGetWorkflow, noteListWorkflow } from './workflows/noteWorkflow';
import { articleGenerationWorkflow } from './workflows/articleGenerationWorkflow';

export const mastra = new Mastra({
  workflows: { 
    noteCreateWorkflow, 
    noteGetWorkflow, 
    noteListWorkflow,
    articleGenerationWorkflow
  },
  agents: { 
    noteAgent,
    ...articleGenerationAgents
  },
  logger: createLogger({
    name: 'Mastra',
    level: 'info',
  }),
});
