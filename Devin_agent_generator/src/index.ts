import express from 'express';
import { mastra } from './mastra';
import apiRouter from './mastra/api';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

app.use('/api', apiRouter);

app.get('/', (req, res) => {
  res.json({
    name: 'Mastra Agent Generator',
    version: '1.0.0',
    description: 'API for generating Mastra agents, workflows, and tools',
    documentation: '/api/docs',
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;
