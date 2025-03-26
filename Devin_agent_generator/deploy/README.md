# Mastra Agent Generator - Production Deployment

This directory contains files for deploying the Mastra Agent Generator to a production environment.

## Prerequisites

- Docker and Docker Compose installed
- OpenAI API key for the generator agent

## Deployment Steps

1. Set environment variables:

```bash
export OPENAI_API_KEY=your_openai_api_key
```

2. Build and start the containers:

```bash
cd /path/to/mastra/Devin_agent_generator
docker-compose -f deploy/docker-compose.yml up -d
```

3. Verify the deployment:

```bash
# Check API server
curl http://localhost:3000/api/health

# Access Gradio interface
# Open http://localhost:7860 in your browser
```

## Production Considerations

- For a production environment, consider using a reverse proxy like Nginx
- Set up SSL certificates for secure connections
- Configure proper logging and monitoring
- Consider using a container orchestration platform like Kubernetes for scaling

## Environment Variables

- `NODE_ENV`: Set to "production" for production environment
- `PORT`: Port for the API server (default: 3000)
- `OPENAI_API_KEY`: Your OpenAI API key for the generator agent

## Troubleshooting

If you encounter issues:

1. Check container logs:
```bash
docker-compose -f deploy/docker-compose.yml logs
```

2. Verify the API server is running:
```bash
curl http://localhost:3000/api/health
```

3. Check if Gradio interface is accessible:
```bash
curl http://localhost:7860
```
