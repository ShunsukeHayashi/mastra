
import { Mastra } from '@mastra/core/mastra';
import { createLogger } from '@mastra/core/logger';
import { weatherWorkflow } from './workflows';
import { weatherAgent, memoryAgent } from './agents';

export const mastra = new Mastra({
  workflows: { weatherWorkflow },
  agents: { weatherAgent, memoryAgent },
  logger: createLogger({
    name: 'Mastra',
    level: 'info',
  }),
});
