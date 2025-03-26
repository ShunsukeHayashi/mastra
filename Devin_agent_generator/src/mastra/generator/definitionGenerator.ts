import { logger } from '../utils/logger';

const AGENT_TEMPLATE = `
import { Agent } from '@mastra/core/agent';
import { {{ provider }} } from '@ai-sdk/{{ provider }}';
{% if tools and tools.length > 0 %}
import { {{ tools|join(', ') }} } from '../tools/{{ toolsFile }}';
{% endif %}

export const {{ name|camelCase }} = new Agent({
  name: '{{ name }}',
  instructions: \`
    {{ description }}
    
    {% if capabilities and capabilities.length > 0 %}
    Your capabilities include:
    {% for capability in capabilities %}
    - {{ capability }}
    {% endfor %}
    {% endif %}
    
    {% if tools and tools.length > 0 %}
    You have the following tools available:
    {% for tool in tools %}
    - {{ tool }}: {{ toolDescriptions[tool] }}
    {% endfor %}
    {% endif %}
  \`,
  model: {{ provider }}('{{ model }}'),
  {% if tools and tools.length > 0 %}
  tools: { {{ tools|join(', ') }} },
  {% endif %}
  {% if memory %}
  memory: true,
  {% endif %}
});
`;

const WORKFLOW_TEMPLATE = `
import { Step, Workflow } from '@mastra/core/workflows';
import { z } from 'zod';

{% for step in steps %}
const {{ step.id|camelCase }} = new Step({
  id: '{{ step.id }}',
  description: '{{ step.description }}',
  inputSchema: z.object({
    {% for input in step.inputs %}
    {{ input.name }}: z.{{ input.type }}().describe('{{ input.description }}'),
    {% endfor %}
  }),
  execute: async ({ context, mastra }) => {
    
    return {
      {% for output in step.outputs %}
      {{ output.name }}: null, // Replace with actual output value
      {% endfor %}
    };
  },
});
{% endfor %}

const {{ name|camelCase }} = new Workflow({
  name: '{{ name }}',
  triggerSchema: z.object({
    {% for param in triggerSchema %}
    {{ param.name }}: z.{{ param.type }}().describe('{{ param.description }}'),
    {% endfor %}
  }),
})
{% for step in steps %}
.step({{ step.id|camelCase }})
{% endfor %}
{% if conditions and conditions.length > 0 %}
{% for condition in conditions %}
.if(
  '{{ condition.description }}',
  ({ context }) => {
    return {{ condition.condition }};
  },
  (workflow) => workflow.step({{ condition.toStep|camelCase }}),
)
{% endfor %}
{% endif %}
;

{{ name|camelCase }}.commit();

export { {{ name|camelCase }} };
`;

const TOOL_TEMPLATE = `
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
{% if externalApi %}
import axios from 'axios';
{% endif %}

export const {{ id|camelCase }} = createTool({
  id: '{{ id }}',
  description: '{{ description }}',
  inputSchema: z.object({
    {% for input in inputs %}
    {{ input.name }}: z.{{ input.type }}(){% if input.required === false %}.optional(){% endif %}.describe('{{ input.description }}'),
    {% endfor %}
  }),
  outputSchema: z.object({
    {% for output in outputs %}
    {{ output.name }}: z.{{ output.type }}().describe('{{ output.description }}'),
    {% endfor %}
  }),
  execute: async ({ context }) => {
    try {
      {% if externalApi %}
      const response = await axios({
        method: '{{ externalApi.method|default('GET') }}',
        url: '{{ externalApi.url }}',
        {% if externalApi.headers %}
        headers: {
          {% for key, value in externalApi.headers %}
          '{{ key }}': '{{ value }}',
          {% endfor %}
        },
        {% endif %}
        data: context,
      });
      
      return {
        {% for output in outputs %}
        {{ output.name }}: response.data.{{ output.name }},
        {% endfor %}
      };
      {% else %}
      
      return {
        {% for output in outputs %}
        {{ output.name }}: null, // Replace with actual output value
        {% endfor %}
      };
      {% endif %}
    } catch (error) {
      throw new Error(\`Failed to execute {{ name }}: \${error instanceof Error ? error.message : 'Unknown error'}\`);
    }
  },
});
`;

const filters = {
  camelCase: (str: string) => {
    return str
      .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
      .replace(/^(.)/, (c) => c.toLowerCase());
  },
};

export async function generateAgentDefinition(params: {
  name: string;
  description: string;
  capabilities: string[];
  tools: string[];
  model: string;
  provider: string;
  memory: boolean;
}) {
  try {
    logger.info('Generating agent definition', { name: params.name });
    
    const toolDescriptions: Record<string, string> = {};
    params.tools.forEach(tool => {
      toolDescriptions[tool] = `Tool for ${tool.replace(/Tool$/, '').replace(/([A-Z])/g, ' $1').toLowerCase().trim()}`;
    });
    
    const templateContext = {
      ...params,
      toolDescriptions,
      toolsFile: 'tools',
    };
    
    let code = AGENT_TEMPLATE;
    
    code = code.replace(/\{\{\s*provider\s*\}\}/g, params.provider);
    code = code.replace(/\{\{\s*model\s*\}\}/g, params.model);
    code = code.replace(/\{\{\s*name\s*\}\}/g, params.name);
    code = code.replace(/\{\{\s*description\s*\}\}/g, params.description);
    
    return {
      code,
      explanation: `
This agent definition creates a Mastra agent named "${params.name}" with the following characteristics:
- Uses the ${params.provider} ${params.model} model
- ${params.tools.length > 0 ? `Utilizes ${params.tools.length} tools: ${params.tools.join(', ')}` : 'Does not use any tools'}
- ${params.memory ? 'Has memory capabilities enabled' : 'Does not use memory capabilities'}
- Has ${params.capabilities.length} defined capabilities

The agent's instructions include its description, capabilities, and available tools.
      `.trim(),
    };
  } catch (error) {
    logger.error('Error in generateAgentDefinition', { error: error instanceof Error ? error.message : 'Unknown error' });
    throw new Error(`Failed to generate agent definition: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function generateWorkflowDefinition(params: {
  name: string;
  description: string;
  steps: Array<{
    id: string;
    description: string;
    inputs?: Array<{ name: string; type: string; description: string }>;
    outputs?: Array<{ name: string; type: string; description: string }>;
  }>;
  triggerSchema: Array<{ name: string; type: string; description: string }>;
  conditions?: Array<{
    description: string;
    fromStep: string;
    toStep: string;
    condition: string;
  }>;
}) {
  try {
    logger.info('Generating workflow definition', { name: params.name });
    
    const steps = params.steps.map(step => ({
      ...step,
      inputs: step.inputs || [],
      outputs: step.outputs || [],
    }));
    
    let code = WORKFLOW_TEMPLATE;
    
    code = code.replace(/\{\{\s*name\s*\}\}/g, params.name);
    
    return {
      code,
      explanation: `
This workflow definition creates a Mastra workflow named "${params.name}" with the following characteristics:
- Has ${steps.length} defined steps: ${steps.map(s => s.id).join(', ')}
- Trigger schema with ${params.triggerSchema.length} parameters: ${params.triggerSchema.map(p => p.name).join(', ')}
${params.conditions && params.conditions.length > 0 ? `- Includes ${params.conditions.length} conditional branches` : '- No conditional branches'}

The workflow is defined using the Mastra Workflow class and includes Step definitions for each step in the workflow.
      `.trim(),
    };
  } catch (error) {
    logger.error('Error in generateWorkflowDefinition', { error: error instanceof Error ? error.message : 'Unknown error' });
    throw new Error(`Failed to generate workflow definition: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function generateToolDefinition(params: {
  id: string;
  name: string;
  description: string;
  inputs: Array<{
    name: string;
    type: string;
    description: string;
    required?: boolean;
  }>;
  outputs: Array<{
    name: string;
    type: string;
    description: string;
  }>;
  externalApi?: {
    url?: string;
    method?: string;
    headers?: Record<string, string>;
  };
}) {
  try {
    logger.info('Generating tool definition', { id: params.id });
    
    let code = TOOL_TEMPLATE;
    
    code = code.replace(/\{\{\s*id\s*\}\}/g, params.id);
    code = code.replace(/\{\{\s*name\s*\}\}/g, params.name);
    code = code.replace(/\{\{\s*description\s*\}\}/g, params.description);
    
    return {
      code,
      explanation: `
This tool definition creates a Mastra tool named "${params.name}" with ID "${params.id}" with the following characteristics:
- Has ${params.inputs.length} input parameters: ${params.inputs.map(p => p.name).join(', ')}
- Has ${params.outputs.length} output parameters: ${params.outputs.map(p => p.name).join(', ')}
${params.externalApi ? `- Integrates with an external API at ${params.externalApi.url || '[URL not specified]'} using ${params.externalApi.method || 'GET'}` : '- Does not integrate with an external API'}

The tool is defined using the Mastra createTool function with input and output schemas defined using Zod.
      `.trim(),
    };
  } catch (error) {
    logger.error('Error in generateToolDefinition', { error: error instanceof Error ? error.message : 'Unknown error' });
    throw new Error(`Failed to generate tool definition: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function validateAgentDefinition(agentDefinition: string) {
  try {
    logger.info('Validating agent definition');
    
    
    const errors: string[] = [];
    const suggestions: string[] = [];
    
    if (!agentDefinition.includes('new Agent(')) {
      errors.push('Missing Agent constructor');
    }
    
    if (!agentDefinition.includes('name:')) {
      errors.push('Missing agent name');
    }
    
    if (!agentDefinition.includes('instructions:')) {
      errors.push('Missing agent instructions');
    }
    
    if (!agentDefinition.includes('model:')) {
      errors.push('Missing agent model');
    }
    
    if (!agentDefinition.includes('tools:') && !agentDefinition.includes('tools: {')) {
      suggestions.push('Consider adding tools to enhance agent capabilities');
    }
    
    if (!agentDefinition.includes('memory:')) {
      suggestions.push('Consider adding memory capabilities if the agent needs to remember conversation context');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      suggestions,
    };
  } catch (error) {
    logger.error('Error in validateAgentDefinition', { error: error instanceof Error ? error.message : 'Unknown error' });
    throw new Error(`Failed to validate agent definition: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function validateWorkflowDefinition(workflowDefinition: string) {
  try {
    logger.info('Validating workflow definition');
    
    
    const errors: string[] = [];
    const suggestions: string[] = [];
    
    if (!workflowDefinition.includes('new Workflow(')) {
      errors.push('Missing Workflow constructor');
    }
    
    if (!workflowDefinition.includes('name:')) {
      errors.push('Missing workflow name');
    }
    
    if (!workflowDefinition.includes('triggerSchema:')) {
      errors.push('Missing trigger schema');
    }
    
    if (!workflowDefinition.includes('new Step(')) {
      errors.push('Missing Step definitions');
    }
    
    if (!workflowDefinition.includes('.step(')) {
      errors.push('Missing step registrations in workflow');
    }
    
    if (!workflowDefinition.includes('.commit()')) {
      errors.push('Missing workflow commit');
    }
    
    if (!workflowDefinition.includes('.if(')) {
      suggestions.push('Consider adding conditional branches for more complex workflows');
    }
    
    if (!workflowDefinition.includes('execute: async')) {
      suggestions.push('Ensure all steps have async execute functions');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      suggestions,
    };
  } catch (error) {
    logger.error('Error in validateWorkflowDefinition', { error: error instanceof Error ? error.message : 'Unknown error' });
    throw new Error(`Failed to validate workflow definition: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function validateToolDefinition(toolDefinition: string) {
  try {
    logger.info('Validating tool definition');
    
    
    const errors: string[] = [];
    const suggestions: string[] = [];
    
    if (!toolDefinition.includes('createTool(')) {
      errors.push('Missing createTool function call');
    }
    
    if (!toolDefinition.includes('id:')) {
      errors.push('Missing tool ID');
    }
    
    if (!toolDefinition.includes('description:')) {
      errors.push('Missing tool description');
    }
    
    if (!toolDefinition.includes('inputSchema:')) {
      errors.push('Missing input schema');
    }
    
    if (!toolDefinition.includes('outputSchema:')) {
      errors.push('Missing output schema');
    }
    
    if (!toolDefinition.includes('execute:')) {
      errors.push('Missing execute function');
    }
    
    if (!toolDefinition.includes('try {') || !toolDefinition.includes('catch (error)')) {
      suggestions.push('Consider adding error handling to the execute function');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      suggestions,
    };
  } catch (error) {
    logger.error('Error in validateToolDefinition', { error: error instanceof Error ? error.message : 'Unknown error' });
    throw new Error(`Failed to validate tool definition: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
