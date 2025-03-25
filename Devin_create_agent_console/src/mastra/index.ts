
import { Mastra } from '@mastra/core/mastra';
import { createLogger } from '@mastra/core/logger';
import { noteAgent, contractAgent } from './agents/index';
import { noteCreateWorkflow, noteGetWorkflow, noteListWorkflow } from './workflows/noteWorkflow';
import { contractUploadWorkflow, contractFinalizationWorkflow } from './workflows/contractWorkflow';

export const mastra = new Mastra({
  workflows: { 
    noteCreateWorkflow, 
    noteGetWorkflow, 
    noteListWorkflow,
    contractUploadWorkflow,
    contractFinalizationWorkflow
  },
  agents: { 
    noteAgent,
    contractAgent 
  },
  logger: createLogger({
    name: 'Mastra',
    level: 'info',
  }),
});
