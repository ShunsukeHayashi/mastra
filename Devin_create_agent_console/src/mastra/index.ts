
import { Mastra } from '@mastra/core/mastra';
import { createLogger } from '@mastra/core/logger';
import { noteAgent } from './agents/index';
import { businessCardAgent } from './agents/businessCardAgent';
import { noteCreateWorkflow, noteGetWorkflow, noteListWorkflow } from './workflows/noteWorkflow';
import { businessCardProcessWorkflow } from './workflows/businessCardWorkflow';

export const mastra = new Mastra({
  workflows: { 
    noteCreateWorkflow, 
    noteGetWorkflow, 
    noteListWorkflow,
    businessCardProcessWorkflow
  },
  agents: { 
    noteAgent,
    businessCardAgent
  },
  logger: createLogger({
    name: 'Mastra',
    level: 'info',
  }),
});
