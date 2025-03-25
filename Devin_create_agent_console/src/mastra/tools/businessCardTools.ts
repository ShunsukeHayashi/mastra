import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { anthropic } from '@ai-sdk/anthropic';

// Tool to extract information from business card images
export const extractBusinessCardInfoTool = createTool({
  id: 'extract-business-card-info',
  description: 'Extract contact information from a business card image',
  inputSchema: z.object({
    imageBase64: z.string().describe('Base64 encoded image of the business card'),
  }),
  outputSchema: z.object({
    name: z.string().describe('Full name of the person'),
    company: z.string().describe('Company name'),
    position: z.string().optional().describe('Job title or position'),
    email: z.string().optional().describe('Email address'),
    phone: z.string().optional().describe('Phone number'),
    address: z.string().optional().describe('Physical address'),
    website: z.string().optional().describe('Website URL'),
    additionalInfo: z.string().optional().describe('Any additional information'),
  }),
  execute: async ({ context }) => {
    try {
      // Create a Claude vision model instance
      const model = anthropic('claude-3-5-sonnet-20241022');
      
      // Prepare the prompt for Claude
      const prompt = `Please analyze this business card image and extract the following information:
      - Full name
      - Company name
      - Position/job title
      - Email address
      - Phone number
      - Physical address
      - Website
      - Any additional relevant information
      
      Return the information in a structured format.`;
      
      // Call the Claude API directly
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY || '',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1000,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'image',
                  source: {
                    type: 'base64',
                    media_type: 'image/jpeg',
                    data: context.imageBase64
                  }
                },
                {
                  type: 'text',
                  text: prompt
                }
              ]
            }
          ]
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to extract business card info: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      const content = data.content?.[0]?.text || '';
      
      // Parse the extracted information into structured data
      // Call Claude again to parse the information into JSON
      const parseResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY || '',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1000,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `Here is the extracted information from a business card:
                  
                  ${content}
                  
                  Please convert this information into a valid JSON object with the following structure:
                  {
                    "name": "Full name",
                    "company": "Company name",
                    "position": "Job title or position (if available)",
                    "email": "Email address (if available)",
                    "phone": "Phone number (if available)",
                    "address": "Physical address (if available)",
                    "website": "Website URL (if available)",
                    "additionalInfo": "Any additional information (if available)"
                  }
                  
                  If any field is not found in the information, set it to null or an empty string. Return only the JSON object, nothing else.`
                }
              ]
            }
          ]
        })
      });
      
      if (!parseResponse.ok) {
        const errorText = await parseResponse.text();
        throw new Error(`Failed to parse business card data: ${parseResponse.status} ${parseResponse.statusText} - ${errorText}`);
      }
      
      const parseData = await parseResponse.json();
      const parseContent = parseData.content?.[0]?.text || '';
      
      // Extract the JSON object from the response
      const jsonMatch = parseContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to parse structured data from the response');
      }
      
      const jsonStr = jsonMatch[0];
      const parsedData = JSON.parse(jsonStr);
      
      // Return the structured data
      return {
        name: parsedData.name || '',
        company: parsedData.company || '',
        position: parsedData.position || undefined,
        email: parsedData.email || undefined,
        phone: parsedData.phone || undefined,
        address: parsedData.address || undefined,
        website: parsedData.website || undefined,
        additionalInfo: parsedData.additionalInfo || undefined,
      };
    } catch (error: any) {
      console.error('Error extracting business card information:', error);
      throw new Error(`Error extracting business card information: ${error.message}`);
    }
  },
});
