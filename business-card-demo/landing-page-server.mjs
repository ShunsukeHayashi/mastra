// Standalone server for landing page
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create Express server
const app = express();
const port = process.env.PORT || 4113;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files
app.use(express.static(path.join(__dirname, 'landing-page')));

// Landing page route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'landing-page', 'index.html'));
});

// Mock API route for form submission
app.post('/api/submit-form', (req, res) => {
  try {
    const { name, email, company, message } = req.body;
    
    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: '必須項目が入力されていません'
      });
    }
    
    console.log('Form submitted:', { name, email, company, message });
    
    // In a real implementation, this would save to a database or send an email
    return res.json({
      success: true,
      message: 'お問い合わせを受け付けました。ありがとうございます。',
    });
  } catch (error) {
    console.error('Error submitting form:', error);
    return res.status(500).json({
      success: false,
      error: `フォーム送信中にエラーが発生しました: ${error.message || '不明なエラー'}`
    });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Landing page server running on port ${port}`);
  console.log(`Landing page available at http://localhost:${port}`);
});
