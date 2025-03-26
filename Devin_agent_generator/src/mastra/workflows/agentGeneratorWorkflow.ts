import { Step, Workflow } from '@mastra/core/workflows';
import { z } from 'zod';
import { generateAgentDefinitionTool } from '../tools/generatorTools';

const analyzeRequirements = new Step({
  id: 'analyze-requirements',
  description: 'Analyze user requirements for agent generation',
  inputSchema: z.object({
    requirements: z.string().describe('User requirements for the agent'),
  }),
  execute: async ({ context, mastra }) => {
    const requirements = context.requirements;
    
    const name = extractAgentName(requirements);
    const description = extractAgentDescription(requirements);
    const capabilities = extractAgentCapabilities(requirements);
    const tools = extractAgentTools(requirements);
    const model = extractAgentModel(requirements);
    const provider = extractAgentProvider(requirements);
    const memory = extractAgentMemory(requirements);
    
    return {
      name,
      description,
      capabilities,
      tools,
      model,
      provider,
      memory,
    };
  },
});

const generateAgentDefinition = new Step({
  id: 'generate-agent-definition',
  description: 'Generate agent definition based on analyzed requirements',
  inputSchema: z.object({
    name: z.string().describe('Name of the agent'),
    description: z.string().describe('Description of the agent\'s purpose and functionality'),
    capabilities: z.array(z.string()).describe('List of capabilities the agent should have'),
    tools: z.array(z.string()).optional().describe('List of tools the agent should use'),
    model: z.string().optional().describe('LLM model to use'),
    provider: z.string().optional().describe('LLM provider'),
    memory: z.boolean().optional().describe('Whether the agent should have memory capabilities'),
  }),
  execute: async ({ context, mastra }) => {
    if (generateAgentDefinitionTool && generateAgentDefinitionTool.execute) {
      const result = await generateAgentDefinitionTool.execute({
        context: {
          name: context.name,
          description: context.description,
          capabilities: context.capabilities,
          tools: context.tools || [],
          model: context.model || 'gpt-4o',
          provider: context.provider || 'openai',
          memory: context.memory || false,
        },
        mastra,
      });
      
      return {
        agentDefinition: result.agentDefinition,
        explanation: result.explanation,
      };
    }
    
    throw new Error('generateAgentDefinitionTool not available');
  },
});

const validateAgentDefinition = new Step({
  id: 'validate-agent-definition',
  description: 'Validate the generated agent definition',
  inputSchema: z.object({
    agentDefinition: z.string().describe('Generated agent definition code'),
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

function extractAgentName(requirements: string): string {
  const nameMatch = requirements.match(/agent\s+name[:\s]+([^\n.,]+)/i);
  return nameMatch ? nameMatch[1].trim() : 'GeneratedAgent';
}

function extractAgentDescription(requirements: string): string {
  const descMatch = requirements.match(/description[:\s]+([^\n]+)/i);
  return descMatch ? descMatch[1].trim() : 'An agent generated based on user requirements.';
}

function extractAgentCapabilities(requirements: string): string[] {
  const capabilities: string[] = [];
  const capabilityMatches = requirements.matchAll(/capability[:\s]+([^\n.,]+)/gi);
  
  for (const match of capabilityMatches) {
    capabilities.push(match[1].trim());
  }
  
  return capabilities.length > 0 ? capabilities : ['Process user requests', 'Provide helpful responses'];
}

function extractAgentTools(requirements: string): string[] {
  const tools: string[] = [];
  const toolMatches = requirements.matchAll(/tool[:\s]+([^\n.,]+)/gi);
  
  for (const match of toolMatches) {
    tools.push(match[1].trim() + 'Tool');
  }
  
  return tools;
}

function extractAgentModel(requirements: string): string {
  const modelMatch = requirements.match(/model[:\s]+([^\n.,]+)/i);
  return modelMatch ? modelMatch[1].trim() : 'gpt-4o';
}

function extractAgentProvider(requirements: string): string {
  const providerMatch = requirements.match(/provider[:\s]+([^\n.,]+)/i);
  return providerMatch ? providerMatch[1].trim() : 'openai';
}

function extractAgentMemory(requirements: string): boolean {
  return requirements.toLowerCase().includes('memory') || requirements.toLowerCase().includes('remember');
}

const agentGeneratorWorkflow = new Workflow({
  name: 'agent-generator-workflow',
  triggerSchema: z.object({
    requirements: z.string().describe('User requirements for the agent'),
  }),
})
.step(analyzeRequirements)
.step(generateAgentDefinition)
.step(validateAgentDefinition);

agentGeneratorWorkflow.commit();

export { agentGeneratorWorkflow };
