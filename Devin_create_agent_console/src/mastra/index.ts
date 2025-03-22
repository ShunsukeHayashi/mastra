
import { Mastra } from '@mastra/core/mastra';
import { createLogger } from '@mastra/core/logger';
import { noteAgent } from './agents/index';
import { noteCreateWorkflow, noteGetWorkflow, noteListWorkflow } from './workflows/noteWorkflow';

export const mastra = new Mastra({
  workflows: { noteCreateWorkflow, noteGetWorkflow, noteListWorkflow },
  agents: { noteAgent },
  logger: createLogger({
    name: 'Mastra',
    level: 'info',
  }),
});
