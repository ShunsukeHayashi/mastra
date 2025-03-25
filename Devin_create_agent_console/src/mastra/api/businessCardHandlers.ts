import { Request, Response } from 'express';
import { mastra } from '../index';
import { businessCardProcessWorkflow } from '../workflows/businessCardWorkflow';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

// Store workflow instances in memory for demo purposes
const workflowInstances = new Map();

/**
 * Handler for processing business card images
 */
export async function processBusinessCardHandler(req: Request, res: Response) {
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

    logger.info('Processing business card', { 
      senderName, 
      senderCompany,
      senderEmail 
    });

    // Create a mock workflow instance for demo purposes
    const workflowId = uuidv4();
    const workflowInstance = {
      id: workflowId,
      status: 'running',
      currentStep: { id: 'extract-business-card-info' },
      result: null,
      startedAt: new Date().toISOString(),
      input: {
        imageBase64: imageBase64 ? `${imageBase64.substring(0, 20)}...` : null,
        senderName,
        senderCompany,
        senderPosition,
        senderEmail,
        meetingContext,
        additionalNotes
      }
    };

    // Store the workflow instance
    workflowInstances.set(workflowId, workflowInstance);

    // Simulate workflow progression
    setTimeout(() => {
      const instance = workflowInstances.get(workflowId);
      if (instance) {
        instance.status = 'running';
        instance.currentStep = { id: 'generate-thank-you-email' };
        workflowInstances.set(workflowId, instance);
      }
    }, 5000);

    setTimeout(() => {
      const instance = workflowInstances.get(workflowId);
      if (instance) {
        instance.status = 'running';
        instance.currentStep = { id: 'send-thank-you-email' };
        workflowInstances.set(workflowId, instance);
      }
    }, 10000);

    setTimeout(() => {
      const instance = workflowInstances.get(workflowId);
      if (instance) {
        instance.status = 'completed';
        instance.result = {
          success: true,
          message: 'メールが正常に送信されました',
          timestamp: new Date().toISOString(),
          emailDetails: {
            to: `${senderName}様 <${instance.input.senderEmail}>`,
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
      }
    }, 15000);

    logger.info('Business card workflow started', { workflowId });

    return res.json({
      success: true,
      workflowId,
      message: '名刺処理ワークフローを開始しました ✅',
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '不明なエラー';
    logger.error('Error processing business card', { error: errorMessage });
    
    return res.status(500).json({
      success: false,
      error: `名刺処理中にエラーが発生しました: ${errorMessage} 😓`,
    });
  }
}

/**
 * Handler for getting workflow status
 */
export async function getWorkflowStatusHandler(req: Request, res: Response) {
  try {
    const { workflowId } = req.params;
    
    logger.info('Getting workflow status', { workflowId });
    
    // Get workflow instance from memory
    const workflowInstance = workflowInstances.get(workflowId);
    
    if (!workflowInstance) {
      logger.warn('Workflow not found', { workflowId });
      return res.status(404).json({
        success: false,
        error: '指定されたワークフローが見つかりません 🔍',
      });
    }

    // Format timestamp if available
    if (workflowInstance.result && workflowInstance.result.timestamp) {
      const date = new Date(workflowInstance.result.timestamp);
      workflowInstance.result.formattedTimestamp = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
    }

    logger.info('Workflow status retrieved', { 
      workflowId, 
      status: workflowInstance.status, 
      currentStep: workflowInstance.currentStep?.id 
    });

    return res.json({
      success: true,
      status: workflowInstance.status,
      currentStep: workflowInstance.currentStep?.id || '',
      result: workflowInstance.result,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '不明なエラー';
    logger.error('Error getting workflow status', { error: errorMessage });
    
    return res.status(500).json({
      success: false,
      error: `ワークフローステータスの取得中にエラーが発生しました: ${errorMessage} 😓`,
    });
  }
}
