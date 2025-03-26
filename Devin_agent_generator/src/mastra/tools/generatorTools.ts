import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { logger } from '../utils/logger';
import { 
  generateAgentDefinition, 
  generateWorkflowDefinition, 
  generateToolDefinition,
  validateAgentDefinition,
  validateWorkflowDefinition,
  validateToolDefinition
} from '../generator/definitionGenerator';

export const generateAgentDefinitionTool = createTool({
  id: 'generate-agent-definition',
  description: 'Generate a Mastra agent definition based on requirements',
  inputSchema: z.object({
    name: z.string().describe('Name of the agent'),
    description: z.string().describe('Description of the agent\'s purpose and functionality'),
    capabilities: z.array(z.string()).describe('List of capabilities the agent should have'),
    tools: z.array(z.string()).optional().describe('List of tools the agent should use'),
    model: z.string().optional().describe('LLM model to use (e.g., "gpt-4o", "claude-3-5-sonnet")'),
    provider: z.string().optional().describe('LLM provider (e.g., "openai", "anthropic")'),
    memory: z.boolean().optional().describe('Whether the agent should have memory capabilities'),
  }),
  outputSchema: z.object({
    agentDefinition: z.string().describe('Generated agent definition code'),
    explanation: z.string().describe('Explanation of the agent definition structure'),
  }),
  execute: async ({ context }) => {
    try {
      logger.info('Generating agent definition', { name: context.name });
      
      const result = await generateAgentDefinition({
        name: context.name,
        description: context.description,
        capabilities: context.capabilities,
        tools: context.tools || [],
        model: context.model || 'gpt-4o',
        provider: context.provider || 'openai',
        memory: context.memory || false,
      });
      
      return {
        agentDefinition: result.code,
        explanation: result.explanation,
      };
    } catch (error) {
      logger.error('Error generating agent definition', { error: error instanceof Error ? error.message : 'Unknown error' });
      throw new Error(`Failed to generate agent definition: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});

export const generateWorkflowDefinitionTool = createTool({
  id: 'generate-workflow-definition',
  description: 'Generate a Mastra workflow definition based on requirements',
  inputSchema: z.object({
    name: z.string().describe('Name of the workflow'),
    description: z.string().describe('Description of the workflow\'s purpose and functionality'),
    steps: z.array(z.object({
      id: z.string().describe('Step ID'),
      description: z.string().describe('Step description'),
      inputs: z.array(z.object({
        name: z.string().describe('Input parameter name'),
        type: z.string().describe('Input parameter type'),
        description: z.string().describe('Input parameter description'),
      })).optional(),
      outputs: z.array(z.object({
        name: z.string().describe('Output parameter name'),
        type: z.string().describe('Output parameter type'),
        description: z.string().describe('Output parameter description'),
      })).optional(),
    })).describe('List of workflow steps'),
    triggerSchema: z.array(z.object({
      name: z.string().describe('Trigger parameter name'),
      type: z.string().describe('Trigger parameter type'),
      description: z.string().describe('Trigger parameter description'),
    })).describe('Schema for workflow trigger data'),
    conditions: z.array(z.object({
      description: z.string().describe('Condition description'),
      fromStep: z.string().describe('Step ID that the condition branches from'),
      toStep: z.string().describe('Step ID that the condition branches to'),
      condition: z.string().describe('Condition expression'),
    })).optional().describe('Conditional branches in the workflow'),
  }),
  outputSchema: z.object({
    workflowDefinition: z.string().describe('Generated workflow definition code'),
    explanation: z.string().describe('Explanation of the workflow definition structure'),
  }),
  execute: async ({ context }) => {
    try {
      logger.info('Generating workflow definition', { name: context.name });
      
      const result = await generateWorkflowDefinition({
        name: context.name,
        description: context.description,
        steps: context.steps,
        triggerSchema: context.triggerSchema,
        conditions: context.conditions || [],
      });
      
      return {
        workflowDefinition: result.code,
        explanation: result.explanation,
      };
    } catch (error) {
      logger.error('Error generating workflow definition', { error: error instanceof Error ? error.message : 'Unknown error' });
      throw new Error(`Failed to generate workflow definition: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});

export const generateToolDefinitionTool = createTool({
  id: 'generate-tool-definition',
  description: 'Generate a Mastra tool definition based on requirements',
  inputSchema: z.object({
    id: z.string().describe('Tool ID'),
    name: z.string().describe('Name of the tool'),
    description: z.string().describe('Description of the tool\'s purpose and functionality'),
    inputs: z.array(z.object({
      name: z.string().describe('Input parameter name'),
      type: z.string().describe('Input parameter type'),
      description: z.string().describe('Input parameter description'),
      required: z.boolean().optional().describe('Whether the parameter is required'),
    })).describe('List of tool input parameters'),
    outputs: z.array(z.object({
      name: z.string().describe('Output parameter name'),
      type: z.string().describe('Output parameter type'),
      description: z.string().describe('Output parameter description'),
    })).describe('List of tool output parameters'),
    externalApi: z.object({
      url: z.string().optional().describe('External API URL'),
      method: z.string().optional().describe('HTTP method'),
      headers: z.record(z.string()).optional().describe('HTTP headers'),
    }).optional().describe('External API details if the tool calls an external service'),
  }),
  outputSchema: z.object({
    toolDefinition: z.string().describe('Generated tool definition code'),
    explanation: z.string().describe('Explanation of the tool definition structure'),
  }),
  execute: async ({ context }) => {
    try {
      logger.info('Generating tool definition', { id: context.id });
      
      const result = await generateToolDefinition({
        id: context.id,
        name: context.name,
        description: context.description,
        inputs: context.inputs,
        outputs: context.outputs,
        externalApi: context.externalApi,
      });
      
      return {
        toolDefinition: result.code,
        explanation: result.explanation,
      };
    } catch (error) {
      logger.error('Error generating tool definition', { error: error instanceof Error ? error.message : 'Unknown error' });
      throw new Error(`Failed to generate tool definition: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});

export const validateAgentDefinitionTool = createTool({
  id: 'validate-agent-definition',
  description: 'Validate a generated agent definition',
  inputSchema: z.object({
    agentDefinition: z.string().describe('Agent definition code to validate'),
  }),
  outputSchema: z.object({
    isValid: z.boolean().describe('Whether the agent definition is valid'),
    errors: z.array(z.string()).describe('List of validation errors'),
    suggestions: z.array(z.string()).optional().describe('Suggestions for improvement'),
  }),
  execute: async ({ context }) => {
    try {
      logger.info('Validating agent definition');
      
      const result = await validateAgentDefinition(context.agentDefinition);
      
      return {
        isValid: result.isValid,
        errors: result.errors,
        suggestions: result.suggestions,
      };
    } catch (error) {
      logger.error('Error validating agent definition', { error: error instanceof Error ? error.message : 'Unknown error' });
      throw new Error(`Failed to validate agent definition: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});

export const validateWorkflowDefinitionTool = createTool({
  id: 'validate-workflow-definition',
  description: 'Validate a generated workflow definition',
  inputSchema: z.object({
    workflowDefinition: z.string().describe('Workflow definition code to validate'),
  }),
  outputSchema: z.object({
    isValid: z.boolean().describe('Whether the workflow definition is valid'),
    errors: z.array(z.string()).describe('List of validation errors'),
    suggestions: z.array(z.string()).optional().describe('Suggestions for improvement'),
  }),
  execute: async ({ context }) => {
    try {
      logger.info('Validating workflow definition');
      
      const result = await validateWorkflowDefinition(context.workflowDefinition);
      
      return {
        isValid: result.isValid,
        errors: result.errors,
        suggestions: result.suggestions,
      };
    } catch (error) {
      logger.error('Error validating workflow definition', { error: error instanceof Error ? error.message : 'Unknown error' });
      throw new Error(`Failed to validate workflow definition: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});

export const validateToolDefinitionTool = createTool({
  id: 'validate-tool-definition',
  description: 'Validate a generated tool definition',
  inputSchema: z.object({
    toolDefinition: z.string().describe('Tool definition code to validate'),
  }),
  outputSchema: z.object({
    isValid: z.boolean().describe('Whether the tool definition is valid'),
    errors: z.array(z.string()).describe('List of validation errors'),
    suggestions: z.array(z.string()).optional().describe('Suggestions for improvement'),
  }),
  execute: async ({ context }) => {
    try {
      logger.info('Validating tool definition');
      
      const result = await validateToolDefinition(context.toolDefinition);
      
      return {
        isValid: result.isValid,
        errors: result.errors,
        suggestions: result.suggestions,
      };
    } catch (error) {
      logger.error('Error validating tool definition', { error: error instanceof Error ? error.message : 'Unknown error' });
      throw new Error(`Failed to validate tool definition: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});
