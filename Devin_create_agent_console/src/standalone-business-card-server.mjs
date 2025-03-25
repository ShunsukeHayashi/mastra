// Standalone server for business card UI
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create Express server
const app = express();
const port = process.env.PORT || 4112;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files
app.use(express.static(path.join(__dirname, '..', 'public')));

// Business Card UI route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'business-card-fixed.html'));
});

// Store workflow instances in memory for demo purposes
const workflowInstances = new Map();

// Mock API routes for testing
app.post('/api/business-card/process', (req, res) => {
  try {
    const {
      imageBase64,
      senderName,
      senderCompany,
      senderPosition,
      senderEmail,
      meetingContext,
      additionalNotes
    } = req.body;

    // Validate required fields
    if (!senderName || !senderCompany || !senderEmail) {
      return res.status(400).json({
        success: false,
        error: '必須項目が入力されていません'
      });
    }

    console.log('Processing business card', { 
      senderName, 
      senderCompany,
      senderEmail 
    });

    // Create a mock workflow instance for demo purposes
    const workflowId = Math.random().toString(36).substring(2, 15);
    
    // Store workflow instance
    workflowInstances.set(workflowId, {
      id: workflowId,
      status: 'running',
      currentStep: 'extract-business-card-info',
      startedAt: new Date().toISOString(),
      input: {
        imageBase64: imageBase64 ? `${imageBase64.substring(0, 20)}...` : 'placeholder-image',
        senderName,
        senderCompany,
        senderPosition,
        senderEmail,
        meetingContext,
        additionalNotes
      }
    });

    console.log('Business card workflow started', { workflowId });

    // Simulate workflow progression
    setTimeout(() => {
      const instance = workflowInstances.get(workflowId);
      if (instance) {
        instance.currentStep = 'generate-thank-you-email';
        workflowInstances.set(workflowId, instance);
        console.log('Workflow step updated', { workflowId, step: 'generate-thank-you-email' });
      }
    }, 3000);

    setTimeout(() => {
      const instance = workflowInstances.get(workflowId);
      if (instance) {
        instance.currentStep = 'send-thank-you-email';
        workflowInstances.set(workflowId, instance);
        console.log('Workflow step updated', { workflowId, step: 'send-thank-you-email' });
      }
    }, 6000);

    setTimeout(() => {
      const instance = workflowInstances.get(workflowId);
      if (instance) {
        instance.status = 'completed';
        instance.result = {
          success: true,
          message: 'メールが正常に送信されました',
          timestamp: new Date().toISOString(),
          emailDetails: {
            to: `${instance.input.senderName}様 <${instance.input.senderEmail}>`,
            from: `${instance.input.senderName} <${instance.input.senderEmail}>`,
            subject: '先日はありがとうございました',
            body: `拝啓

${instance.input.senderCompany}
${instance.input.senderName} 様

${instance.input.meetingContext || '先日は名刺交換いただき'}、誠にありがとうございました。
${instance.input.additionalNotes || '今後ともよろしくお願い申し上げます。'}

敬具

${senderCompany}
${senderName}
${senderPosition || ''}
${senderEmail}`
          }
        };
        workflowInstances.set(workflowId, instance);
        console.log('Workflow completed', { workflowId });
      }
    }, 9000);

    return res.json({
      success: true,
      workflowId,
      message: '名刺処理ワークフローを開始しました ✅',
    });
  } catch (error) {
    console.error('Error processing business card:', error);
    return res.status(500).json({
      success: false,
      error: `名刺処理中にエラーが発生しました: ${error.message || '不明なエラー'}`
    });
  }
});

app.get('/api/business-card/status/:workflowId', (req, res) => {
  try {
    const { workflowId } = req.params;
    
    console.log('Getting workflow status', { workflowId });
    
    // Get workflow instance from memory
    const workflowInstance = workflowInstances.get(workflowId);
    
    if (!workflowInstance) {
      // For demo purposes, create a random status if workflow not found
      const status = Math.random() > 0.5 ? 'completed' : 'running';
      const currentStep = status === 'running' 
        ? ['extract-business-card-info', 'generate-thank-you-email', 'send-thank-you-email'][Math.floor(Math.random() * 3)]
        : null;
      
      const result = status === 'completed' ? {
        success: true,
        message: 'メールが正常に送信されました',
        timestamp: new Date().toISOString(),
        emailDetails: {
          to: 'example@example.com',
          from: 'sender@example.com',
          subject: '先日はありがとうございました',
          body: `拝啓

株式会社サンプル
山田太郎 様

先日は名刺交換いただき、誠にありがとうございました。
今後ともよろしくお願い申し上げます。

敬具

サンプル株式会社
佐藤次郎
営業部長
sample@example.com`
        }
      } : null;

      return res.json({
        success: true,
        status,
        currentStep,
        result,
      });
    }

    // Format timestamp if available
    if (workflowInstance.result && workflowInstance.result.timestamp) {
      const date = new Date(workflowInstance.result.timestamp);
      workflowInstance.result.formattedTimestamp = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
    }

    return res.json({
      success: true,
      status: workflowInstance.status,
      currentStep: workflowInstance.currentStep,
      result: workflowInstance.result,
    });
  } catch (error) {
    console.error('Error getting workflow status:', error);
    return res.status(500).json({
      success: false,
      error: `ワークフローステータスの取得中にエラーが発生しました: ${error.message || '不明なエラー'}`
    });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Business Card UI server running on port ${port}`);
  console.log(`Business Card UI available at http://localhost:${port}`);
});
