
import { Mastra } from '@mastra/core/mastra';
import { createLogger } from '@mastra/core/logger';
import { weatherWorkflow, noteArticleWorkflow } from './workflows';
import { weatherAgent, noteArticleAgentWithTools } from './agents';

export const mastra = new Mastra({
  workflows: { weatherWorkflow, noteArticleWorkflow },
  agents: { weatherAgent, noteArticleAgentWithTools },
  logger: createLogger({
    name: 'Mastra',
    level: 'info',
  }),
});
