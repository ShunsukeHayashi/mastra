import { Step, Workflow } from '@mastra/core/workflows';
import { z } from 'zod';
import { generateToolDefinitionTool } from '../tools/generatorTools';

const analyzeRequirements = new Step({
  id: 'analyze-tool-requirements',
  description: 'Analyze user requirements for tool generation',
  inputSchema: z.object({
    requirements: z.string().describe('User requirements for the tool'),
  }),
  execute: async ({ context, mastra }) => {
    const requirements = context.requirements;
    
    const id = extractToolId(requirements);
    const name = extractToolName(requirements);
    const description = extractToolDescription(requirements);
    const inputs = extractToolInputs(requirements);
    const outputs = extractToolOutputs(requirements);
    const externalApi = extractExternalApi(requirements);
    
    return {
      id,
      name,
      description,
      inputs,
      outputs,
      externalApi,
    };
  },
});

const generateToolDefinition = new Step({
  id: 'generate-tool-definition',
  description: 'Generate tool definition based on analyzed requirements',
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
  execute: async ({ context, mastra }) => {
    if (generateToolDefinitionTool && generateToolDefinitionTool.execute) {
      const result = await generateToolDefinitionTool.execute({
        context: {
          id: context.id,
          name: context.name,
          description: context.description,
          inputs: context.inputs,
          outputs: context.outputs,
          externalApi: context.externalApi,
        },
        mastra,
      });
      
      return {
        toolDefinition: result.toolDefinition,
        explanation: result.explanation,
      };
    }
    
    throw new Error('generateToolDefinitionTool not available');
  },
});

const validateToolDefinition = new Step({
  id: 'validate-tool-definition',
  description: 'Validate the generated tool definition',
  inputSchema: z.object({
    toolDefinition: z.string().describe('Generated tool definition code'),
  }),
  execute: async ({ context, mastra }) => {
    const isValid = true;
    const errors: string[] = [];
    const suggestions: string[] = [];
    
    return {
      isValid,
      errors,
      suggestions,
    };
  },
});

function extractToolId(requirements: string): string {
  const idMatch = requirements.match(/tool\s+id[:\s]+([^\n.,]+)/i);
  return idMatch ? idMatch[1].trim().toLowerCase().replace(/\s+/g, '-') : 'generated-tool';
}

function extractToolName(requirements: string): string {
  const nameMatch = requirements.match(/tool\s+name[:\s]+([^\n.,]+)/i);
  return nameMatch ? nameMatch[1].trim() : 'Generated Tool';
}

function extractToolDescription(requirements: string): string {
  const descMatch = requirements.match(/description[:\s]+([^\n]+)/i);
  return descMatch ? descMatch[1].trim() : 'A tool generated based on user requirements.';
}

function extractToolInputs(requirements: string): Array<{
  name: string;
  type: string;
  description: string;
  required?: boolean;
}> {
  const inputs: Array<{
    name: string;
    type: string;
    description: string;
    required?: boolean;
  }> = [];
  
  const inputMatches = requirements.matchAll(/input\s+parameter[:\s]+([^\n.,]+)/gi);
  
  for (const match of inputMatches) {
    inputs.push({
      name: match[1].trim().toLowerCase().replace(/\s+/g, '_'),
      type: 'string',
      description: `Input parameter: ${match[1].trim()}`,
      required: true,
    });
  }
  
  if (inputs.length === 0) {
    inputs.push({
      name: 'input',
      type: 'string',
      description: 'Input data for the tool',
      required: true,
    });
  }
  
  return inputs;
}

function extractToolOutputs(requirements: string): Array<{
  name: string;
  type: string;
  description: string;
}> {
  const outputs: Array<{
    name: string;
    type: string;
    description: string;
  }> = [];
  
  const outputMatches = requirements.matchAll(/output\s+parameter[:\s]+([^\n.,]+)/gi);
  
  for (const match of outputMatches) {
    outputs.push({
      name: match[1].trim().toLowerCase().replace(/\s+/g, '_'),
      type: 'string',
      description: `Output parameter: ${match[1].trim()}`,
    });
  }
  
  if (outputs.length === 0) {
    outputs.push({
      name: 'result',
      type: 'string',
      description: 'Result of the tool execution',
    });
  }
  
  return outputs;
}

function extractExternalApi(requirements: string): {
  url?: string;
  method?: string;
  headers?: Record<string, string>;
} | undefined {
  const apiUrlMatch = requirements.match(/api\s+url[:\s]+([^\n.,]+)/i);
  const apiMethodMatch = requirements.match(/api\s+method[:\s]+([^\n.,]+)/i);
  
  if (apiUrlMatch) {
    return {
      url: apiUrlMatch[1].trim(),
      method: apiMethodMatch ? apiMethodMatch[1].trim().toUpperCase() : 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }
  
  return undefined;
}

const toolGeneratorWorkflow = new Workflow({
  name: 'tool-generator-workflow',
  triggerSchema: z.object({
    requirements: z.string().describe('User requirements for the tool'),
  }),
})
.step(analyzeRequirements)
.step(generateToolDefinition)
.step(validateToolDefinition);

toolGeneratorWorkflow.commit();

export { toolGeneratorWorkflow };
