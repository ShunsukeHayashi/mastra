import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

/**
 * Tool to generate a thank you email based on business card information
 */
export const generateThankYouEmailTool = createTool({
  id: 'generate-thank-you-email',
  description: 'Generate a thank you email based on business card information',
  inputSchema: z.object({
    name: z.string().describe('Full name of the person'),
    company: z.string().describe('Company name'),
    position: z.string().optional().describe('Job title or position'),
    email: z.string().optional().describe('Email address'),
    senderName: z.string().describe('Your name'),
    senderCompany: z.string().describe('Your company name'),
    senderPosition: z.string().optional().describe('Your job title or position'),
    senderEmail: z.string().describe('Your email address'),
    meetingContext: z.string().optional().describe('Context of the meeting or where you exchanged business cards'),
    additionalNotes: z.string().optional().describe('Any additional notes to include in the email'),
  }),
  outputSchema: z.object({
    subject: z.string().describe('Email subject line'),
    body: z.string().describe('Email body content'),
    to: z.string().describe('Recipient email address'),
    from: z.string().describe('Sender email address'),
  }),
  execute: async ({ context }) => {
    try {
      // Extract recipient information
      const recipientName = context.name;
      const recipientCompany = context.company;
      const recipientPosition = context.position || '';
      const recipientEmail = context.email || '';
      
      // Extract sender information
      const senderName = context.senderName;
      const senderCompany = context.senderCompany;
      const senderPosition = context.senderPosition || '';
      const senderEmail = context.senderEmail;
      
      // Extract additional context
      const meetingContext = context.meetingContext || '先日はお会いできて';
      const additionalNotes = context.additionalNotes || '';
      
      // Generate email subject
      const subject = `${meetingContext.includes('お会い') ? '' : 'お会いできて'}ありがとうございました`;
      
      // Generate email body
      let body = `${recipientName} ${recipientPosition ? recipientPosition + ' ' : ''}様

${meetingContext}ありがとうございました。
${senderCompany}の${senderName}でございます。

この度は貴重なお時間をいただき、誠にありがとうございました。
`;

      // Add additional notes if provided
      if (additionalNotes) {
        body += `
${additionalNotes}
`;
      }

      // Add closing
      body += `
今後とも何卒よろしくお願い申し上げます。

--
${senderName}${senderPosition ? ' ' + senderPosition : ''}
${senderCompany}
${senderEmail}
`;

      return {
        subject,
        body,
        to: recipientEmail,
        from: senderEmail,
      };
    } catch (error: any) {
      console.error('Error generating thank you email:', error);
      throw new Error(`Error generating thank you email: ${error.message}`);
    }
  },
});

/**
 * Tool to send an email
 */
export const sendEmailTool = createTool({
  id: 'send-email',
  description: 'Send an email',
  inputSchema: z.object({
    to: z.string().describe('Recipient email address'),
    from: z.string().describe('Sender email address'),
    subject: z.string().describe('Email subject'),
    body: z.string().describe('Email body content'),
    cc: z.string().optional().describe('CC recipients'),
    bcc: z.string().optional().describe('BCC recipients'),
  }),
  outputSchema: z.object({
    success: z.boolean().describe('Whether the email was sent successfully'),
    message: z.string().describe('Status message'),
    timestamp: z.string().describe('Timestamp of when the email was sent'),
  }),
  execute: async ({ context }) => {
    try {
      // In a real implementation, this would use nodemailer or another email service
      // For now, we'll simulate sending an email
      
      console.log('Sending email:');
      console.log(`To: ${context.to}`);
      console.log(`From: ${context.from}`);
      console.log(`Subject: ${context.subject}`);
      console.log(`Body: ${context.body}`);
      
      if (context.cc) {
        console.log(`CC: ${context.cc}`);
      }
      
      if (context.bcc) {
        console.log(`BCC: ${context.bcc}`);
      }
      
      // Simulate a delay for sending the email
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        success: true,
        message: 'Email sent successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      console.error('Error sending email:', error);
      return {
        success: false,
        message: `Error sending email: ${error.message}`,
        timestamp: new Date().toISOString(),
      };
    }
  },
});
