import { Mastra } from '@mastra/core/mastra';
import { createLogger } from '@mastra/core/logger';
import { agentGeneratorWorkflow } from './workflows/agentGeneratorWorkflow';
import { workflowGeneratorWorkflow } from './workflows/workflowGeneratorWorkflow';
import { toolGeneratorWorkflow } from './workflows/toolGeneratorWorkflow';
import { generatorAgent } from './agents/generatorAgent';

export const mastra = new Mastra({
  workflows: { 
    agentGeneratorWorkflow,
    workflowGeneratorWorkflow,
    toolGeneratorWorkflow
  },
  agents: { 
    generatorAgent 
  },
  logger: createLogger({
    name: 'Mastra Agent Generator',
    level: 'info',
  }),
});
