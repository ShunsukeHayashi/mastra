import { Step, Workflow } from '@mastra/core/workflows';
import { z } from 'zod';
import { generateWorkflowDefinitionTool } from '../tools/generatorTools';

const analyzeRequirements = new Step({
  id: 'analyze-workflow-requirements',
  description: 'Analyze user requirements for workflow generation',
  inputSchema: z.object({
    requirements: z.string().describe('User requirements for the workflow'),
  }),
  execute: async ({ context, mastra }) => {
    const requirements = context.requirements;
    
    const name = extractWorkflowName(requirements);
    const description = extractWorkflowDescription(requirements);
    const steps = extractWorkflowSteps(requirements);
    const triggerSchema = extractTriggerSchema(requirements);
    const conditions = extractWorkflowConditions(requirements);
    
    return {
      name,
      description,
      steps,
      triggerSchema,
      conditions,
    };
  },
});

const generateWorkflowDefinition = new Step({
  id: 'generate-workflow-definition',
  description: 'Generate workflow definition based on analyzed requirements',
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
  execute: async ({ context, mastra }) => {
    if (generateWorkflowDefinitionTool && generateWorkflowDefinitionTool.execute) {
      const result = await generateWorkflowDefinitionTool.execute({
        context: {
          name: context.name,
          description: context.description,
          steps: context.steps,
          triggerSchema: context.triggerSchema,
          conditions: context.conditions || [],
        },
        mastra,
      });
      
      return {
        workflowDefinition: result.workflowDefinition,
        explanation: result.explanation,
      };
    }
    
    throw new Error('generateWorkflowDefinitionTool not available');
  },
});

const validateWorkflowDefinition = new Step({
  id: 'validate-workflow-definition',
  description: 'Validate the generated workflow definition',
  inputSchema: z.object({
    workflowDefinition: z.string().describe('Generated workflow definition code'),
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

function extractWorkflowName(requirements: string): string {
  const nameMatch = requirements.match(/workflow\s+name[:\s]+([^\n.,]+)/i);
  return nameMatch ? nameMatch[1].trim() : 'GeneratedWorkflow';
}

function extractWorkflowDescription(requirements: string): string {
  const descMatch = requirements.match(/description[:\s]+([^\n]+)/i);
  return descMatch ? descMatch[1].trim() : 'A workflow generated based on user requirements.';
}

function extractWorkflowSteps(requirements: string): Array<{
  id: string;
  description: string;
  inputs?: Array<{ name: string; type: string; description: string }>;
  outputs?: Array<{ name: string; type: string; description: string }>;
}> {
  const steps: Array<{
    id: string;
    description: string;
    inputs?: Array<{ name: string; type: string; description: string }>;
    outputs?: Array<{ name: string; type: string; description: string }>;
  }> = [];
  
  const stepMatches = requirements.matchAll(/step[:\s]+([^\n.,]+)/gi);
  
  let stepIndex = 1;
  for (const match of stepMatches) {
    steps.push({
      id: `step-${stepIndex}`,
      description: match[1].trim(),
      inputs: [{ name: 'input', type: 'string', description: 'Input for the step' }],
      outputs: [{ name: 'output', type: 'string', description: 'Output from the step' }],
    });
    stepIndex++;
  }
  
  if (steps.length === 0) {
    steps.push({
      id: 'process-data',
      description: 'Process the input data',
      inputs: [{ name: 'data', type: 'string', description: 'Input data to process' }],
      outputs: [{ name: 'result', type: 'string', description: 'Processed result' }],
    });
  }
  
  return steps;
}

function extractTriggerSchema(requirements: string): Array<{
  name: string;
  type: string;
  description: string;
}> {
  const triggerSchema: Array<{
    name: string;
    type: string;
    description: string;
  }> = [];
  
  const triggerMatches = requirements.matchAll(/trigger\s+parameter[:\s]+([^\n.,]+)/gi);
  
  for (const match of triggerMatches) {
    triggerSchema.push({
      name: match[1].trim().toLowerCase().replace(/\s+/g, '_'),
      type: 'string',
      description: `Trigger parameter: ${match[1].trim()}`,
    });
  }
  
  if (triggerSchema.length === 0) {
    triggerSchema.push({
      name: 'input',
      type: 'string',
      description: 'Input data to trigger the workflow',
    });
  }
  
  return triggerSchema;
}

function extractWorkflowConditions(requirements: string): Array<{
  description: string;
  fromStep: string;
  toStep: string;
  condition: string;
}> {
  const conditions: Array<{
    description: string;
    fromStep: string;
    toStep: string;
    condition: string;
  }> = [];
  
  const conditionMatches = requirements.matchAll(/condition[:\s]+([^\n.,]+)/gi);
  
  let conditionIndex = 1;
  for (const match of conditionMatches) {
    conditions.push({
      description: `Condition ${conditionIndex}: ${match[1].trim()}`,
      fromStep: 'step-1',
      toStep: 'step-2',
      condition: 'context.result === true',
    });
    conditionIndex++;
  }
  
  return conditions;
}

const workflowGeneratorWorkflow = new Workflow({
  name: 'workflow-generator-workflow',
  triggerSchema: z.object({
    requirements: z.string().describe('User requirements for the workflow'),
  }),
})
.step(analyzeRequirements)
.step(generateWorkflowDefinition)
.step(validateWorkflowDefinition);

workflowGeneratorWorkflow.commit();

export { workflowGeneratorWorkflow };
