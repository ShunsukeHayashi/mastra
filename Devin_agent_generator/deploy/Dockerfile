FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Install Python and Gradio for the demo interface
RUN apk add --no-cache python3 py3-pip
RUN pip3 install gradio requests

# Copy Gradio app
COPY src/gradio_app.py ./

# Expose ports for API and Gradio
EXPOSE 3000 7860

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Create startup script
RUN echo '#!/bin/sh\nnpm start & python3 gradio_app.py --server_port=7860 --server_name=0.0.0.0' > start.sh && \
    chmod +x start.sh

# Start both servers
CMD ["./start.sh"]
