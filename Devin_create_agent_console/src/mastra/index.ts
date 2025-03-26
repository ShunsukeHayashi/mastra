
import { Mastra } from '@mastra/core/mastra';
import { createLogger } from '@mastra/core/logger';
import { telegramMessageWorkflow } from './workflows/telegramWorkflow';
import { telegramAgent } from './agents/telegramAgent';

export const mastra = new Mastra({
  workflows: { telegramMessageWorkflow },
  agents: { telegramAgent },
  logger: createLogger({
    name: 'Mastra',
    level: 'info',
  }),
});
