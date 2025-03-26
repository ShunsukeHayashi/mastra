# Mastra Agent Generator

A system for dynamically generating Mastra agents, workflows, and tools based on user requirements.

## Features

- **Agent Generation**: Create Mastra agents with custom capabilities
- **Workflow Generation**: Define workflows with steps, conditions, and triggers
- **Tool Generation**: Create tools with input/output schemas and API integrations
- **Interactive Demo**: Web interface for testing and demonstration

## Demo Interface

The system includes a Gradio web interface for easy testing and demonstration:

```
python src/gradio_app.py
```

This will start a local server and provide a public URL for sharing.

## API Endpoints

### Generate Agent

```
POST /api/generator/generate-agent
```

Request body:
```json
{
  "requirements": "Create an agent for social media content generation"
}
```

### Generate Workflow

```
POST /api/generator/generate-workflow
```

Request body:
```json
{
  "requirements": "Create a workflow for content publishing"
}
```

### Generate Tool

```
POST /api/generator/generate-tool
```

Request body:
```json
{
  "requirements": "Create a tool for API integration with Twitter"
}
```

## Implementation Details

The implementation follows the Mastra framework architecture with:

- **Workflows** for orchestrating the generation process
- **Agents** powered by GPT-4o for intelligent code generation
- **Tools** for specific generation tasks with proper validation
- **API** endpoints with comprehensive error handling
- **OpenAPI** documentation for all endpoints

## Getting Started

1. Install dependencies:
```
npm install
```

2. Start the API server:
```
npm run dev
```

3. Start the Gradio interface:
```
python src/gradio_app.py
```

## Architecture

The system is built on the Mastra framework with the following components:

- `generatorAgent.ts`: Agent for generating code based on requirements
- `generatorTools.ts`: Tools for code generation and validation
- `definitionGenerator.ts`: Templates and utilities for code generation
- `agentGeneratorWorkflow.ts`: Workflow for agent generation
- `workflowGeneratorWorkflow.ts`: Workflow for workflow generation
- `toolGeneratorWorkflow.ts`: Workflow for tool generation

## Error Handling

The system includes comprehensive error handling for:

- Invalid input requirements
- Generation failures
- API errors
- Validation errors

All errors are properly logged and returned with appropriate HTTP status codes.
