import { anthropic } from '@ai-sdk/anthropic';
import { Step, Workflow } from '@mastra/core/workflows';
import { z } from 'zod';
import { businessCardAgent } from '../agents/businessCardAgent';
import { extractBusinessCardInfoTool } from '../tools/businessCardTools';
import { generateThankYouEmailTool, sendEmailTool } from '../tools/emailTools';

const llm = anthropic('claude-3-5-sonnet-20241022');

/**
 * Step to extract information from a business card image
 */
const extractBusinessCardInfo = new Step({
  id: 'extract-business-card-info',
  description: 'Extract contact information from a business card image',
  inputSchema: z.object({
    imageBase64: z.string().describe('Base64 encoded image of the business card'),
  }),
  execute: async ({ context, mastra }) => {
    const triggerData = context?.getStepResult<{ 
      imageBase64: string;
    }>('trigger');

    if (!triggerData) {
      throw new Error('Trigger data not found');
    }

    // Extract business card information
    const extractedInfo = await extractBusinessCardInfoTool.execute({
      context: {
        imageBase64: triggerData.imageBase64,
      },
      mastra,
    });

    return extractedInfo;
  },
});

/**
 * Step to generate a thank you email based on business card information
 */
const generateThankYouEmail = new Step({
  id: 'generate-thank-you-email',
  description: 'Generate a thank you email based on extracted business card information',
  inputSchema: z.object({
    extractedInfo: z.object({
      name: z.string(),
      company: z.string(),
      position: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      address: z.string().optional(),
      website: z.string().optional(),
      additionalInfo: z.string().optional(),
    }),
    senderName: z.string(),
    senderCompany: z.string(),
    senderPosition: z.string().optional(),
    senderEmail: z.string(),
    meetingContext: z.string().optional(),
    additionalNotes: z.string().optional(),
  }),
  execute: async ({ context, mastra }) => {
    const extractInfoResult = context?.getStepResult<any>('extract-business-card-info');
    const triggerData = context?.getStepResult<{
      senderName: string;
      senderCompany: string;
      senderPosition?: string;
      senderEmail: string;
      meetingContext?: string;
      additionalNotes?: string;
    }>('trigger');

    if (!extractInfoResult || !triggerData) {
      throw new Error('Required data not found');
    }

    // Generate thank you email
    const emailData = await generateThankYouEmailTool.execute({
      context: {
        name: extractInfoResult.name,
        company: extractInfoResult.company,
        position: extractInfoResult.position,
        email: extractInfoResult.email,
        senderName: triggerData.senderName,
        senderCompany: triggerData.senderCompany,
        senderPosition: triggerData.senderPosition,
        senderEmail: triggerData.senderEmail,
        meetingContext: triggerData.meetingContext,
        additionalNotes: triggerData.additionalNotes,
      },
      mastra,
    });

    return emailData;
  },
});

/**
 * Step to send the generated thank you email
 */
const sendThankYouEmail = new Step({
  id: 'send-thank-you-email',
  description: 'Send the generated thank you email',
  inputSchema: z.object({
    to: z.string(),
    from: z.string(),
    subject: z.string(),
    body: z.string(),
    cc: z.string().optional(),
    bcc: z.string().optional(),
  }),
  execute: async ({ context, mastra }) => {
    const emailData = context?.getStepResult<{
      subject: string;
      body: string;
      to: string;
      from: string;
    }>('generate-thank-you-email');

    if (!emailData) {
      throw new Error('Email data not found');
    }

    // Send the email
    const result = await sendEmailTool.execute({
      context: {
        to: emailData.to,
        from: emailData.from,
        subject: emailData.subject,
        body: emailData.body,
      },
      mastra,
    });

    return {
      success: result.success,
      message: result.message,
      timestamp: result.timestamp,
      emailDetails: emailData,
    };
  },
});

/**
 * Workflow for processing business cards and sending thank you emails
 */
export const businessCardProcessWorkflow = new Workflow({
  name: 'business-card-process-workflow',
  triggerSchema: z.object({
    imageBase64: z.string().describe('Base64 encoded image of the business card'),
    senderName: z.string().describe('Your name'),
    senderCompany: z.string().describe('Your company name'),
    senderPosition: z.string().optional().describe('Your job title or position'),
    senderEmail: z.string().describe('Your email address'),
    meetingContext: z.string().optional().describe('Context of the meeting or where you exchanged business cards'),
    additionalNotes: z.string().optional().describe('Any additional notes to include in the email'),
  }),
})
  .step(extractBusinessCardInfo)
  .step(generateThankYouEmail)
  .step(sendThankYouEmail);

businessCardProcessWorkflow.commit();
