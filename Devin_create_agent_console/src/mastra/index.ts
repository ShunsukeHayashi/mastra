
import { Mastra } from '@mastra/core/mastra';
import { createLogger } from '@mastra/core/logger';
import { contractAgent } from './agents/index';
import { contractUploadWorkflow, contractFinalizationWorkflow } from './workflows/contractWorkflow';

export const mastra = new Mastra({
  workflows: { 
    contractUploadWorkflow,
    contractFinalizationWorkflow
  },
  agents: { 
    contractAgent 
  },
  logger: createLogger({
    name: 'Mastra',
    level: 'info',
  }),
});
