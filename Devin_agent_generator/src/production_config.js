/**
 * Production configuration for the Mastra Agent Generator
 */

module.exports = {
  api: {
    port: process.env.PORT || 3000,
    cors: {
      origin: '*', // In production, you might want to restrict this
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    },
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // limit each IP to 100 requests per windowMs
    }
  },
  
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4o',
    temperature: 0.7,
    maxTokens: 4000
  },
  
  logging: {
    level: 'info',
    format: 'json',
    errorFile: 'logs/error.log',
    combinedFile: 'logs/combined.log'
  },
  
  security: {
    helmet: {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:'],
          connectSrc: ["'self'", 'https://api.openai.com']
        }
      }
    }
  }
};
