
import { Mastra } from '@mastra/core/mastra';
import { createLogger } from '@mastra/core/logger';
import { noteAgent } from './agents/index';
import { requirementsTranslatorAgent } from './agents/requirementsTranslatorAgent';
import { noteCreateWorkflow, noteGetWorkflow, noteListWorkflow } from './workflows/noteWorkflow';
import { requirementsTranslatorWorkflow } from './workflows/requirementsWorkflow';

export const mastra = new Mastra({
  workflows: { 
    noteCreateWorkflow, 
    noteGetWorkflow, 
    noteListWorkflow,
    requirementsTranslatorWorkflow
  },
  agents: { 
    noteAgent,
    requirementsTranslatorAgent
  },
  logger: createLogger({
    name: 'Mastra',
    level: 'info',
  }),
});
