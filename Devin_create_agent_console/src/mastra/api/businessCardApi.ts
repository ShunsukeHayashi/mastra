import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { mastra } from '../index';
import { businessCardProcessWorkflow } from '../workflows/businessCardWorkflow';

/**
 * Register business card processing API endpoints
 */
export async function registerBusinessCardApi(fastify: FastifyInstance) {
  // Process business card endpoint
  fastify.post('/api/business-card/process', {
    schema: {
      description: '名刺画像を処理してお礼メールを生成・送信する',
      tags: ['business-card'],
      body: {
        type: 'object',
        required: ['imageBase64', 'senderName', 'senderCompany', 'senderEmail'],
        properties: {
          imageBase64: { type: 'string', description: '名刺画像のBase64エンコードデータ' },
          senderName: { type: 'string', description: '送信者の名前' },
          senderCompany: { type: 'string', description: '送信者の会社名' },
          senderPosition: { type: 'string', description: '送信者の役職' },
          senderEmail: { type: 'string', description: '送信者のメールアドレス' },
          meetingContext: { type: 'string', description: '名刺交換の状況や背景' },
          additionalNotes: { type: 'string', description: 'メールに含める追加情報' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            workflowId: { type: 'string' },
            message: { type: 'string' },
          },
        },
        400: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' },
          },
        },
        500: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' },
          },
        },
      },
    },
    handler: async (request, reply) => {
      try {
        const body = request.body as {
          imageBase64: string;
          senderName: string;
          senderCompany: string;
          senderPosition?: string;
          senderEmail: string;
          meetingContext?: string;
          additionalNotes?: string;
        };

        // Validate input
        const schema = z.object({
          imageBase64: z.string().min(1, '名刺画像が必要です'),
          senderName: z.string().min(1, '送信者の名前が必要です'),
          senderCompany: z.string().min(1, '送信者の会社名が必要です'),
          senderEmail: z.string().email('有効なメールアドレスを入力してください'),
          senderPosition: z.string().optional(),
          meetingContext: z.string().optional(),
          additionalNotes: z.string().optional(),
        });

        const validationResult = schema.safeParse(body);
        if (!validationResult.success) {
          return reply.code(400).send({
            success: false,
            error: validationResult.error.errors.map(e => e.message).join(', '),
          });
        }

        // Start the workflow
        const workflowInstance = await mastra.workflows.businessCardProcessWorkflow.start({
          imageBase64: body.imageBase64,
          senderName: body.senderName,
          senderCompany: body.senderCompany,
          senderPosition: body.senderPosition,
          senderEmail: body.senderEmail,
          meetingContext: body.meetingContext,
          additionalNotes: body.additionalNotes,
        });

        return {
          success: true,
          workflowId: workflowInstance.id,
          message: '名刺処理ワークフローを開始しました',
        };
      } catch (error: any) {
        console.error('Error processing business card:', error);
        return reply.code(500).send({
          success: false,
          error: `名刺処理中にエラーが発生しました: ${error.message}`,
        });
      }
    },
  });

  // Get workflow status endpoint
  fastify.get('/api/business-card/status/:workflowId', {
    schema: {
      description: '名刺処理ワークフローのステータスを取得する',
      tags: ['business-card'],
      params: {
        type: 'object',
        required: ['workflowId'],
        properties: {
          workflowId: { type: 'string', description: 'ワークフローID' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            status: { type: 'string' },
            currentStep: { type: 'string' },
            result: { 
              type: 'object',
              properties: {
                emailDetails: {
                  type: 'object',
                  properties: {
                    subject: { type: 'string' },
                    body: { type: 'string' },
                    to: { type: 'string' },
                    from: { type: 'string' },
                  },
                },
                success: { type: 'boolean' },
                message: { type: 'string' },
                timestamp: { type: 'string' },
              },
            },
          },
        },
        404: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' },
          },
        },
        500: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' },
          },
        },
      },
    },
    handler: async (request, reply) => {
      try {
        const { workflowId } = request.params as { workflowId: string };
        
        // Get workflow instance
        const workflowInstance = await mastra.workflows.businessCardProcessWorkflow.getInstance(workflowId);
        
        if (!workflowInstance) {
          return reply.code(404).send({
            success: false,
            error: '指定されたワークフローが見つかりません',
          });
        }

        // Get workflow status
        const status = workflowInstance.status;
        const currentStep = workflowInstance.currentStep?.id || '';
        const result = workflowInstance.result;

        return {
          success: true,
          status,
          currentStep,
          result,
        };
      } catch (error: any) {
        console.error('Error getting workflow status:', error);
        return reply.code(500).send({
          success: false,
          error: `ワークフローステータスの取得中にエラーが発生しました: ${error.message}`,
        });
      }
    },
  });
}
