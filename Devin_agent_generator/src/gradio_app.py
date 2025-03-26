import gradio as gr
import requests
import json
import os
from typing import Dict, Any, List, Optional

API_BASE_URL = "http://localhost:3000/api"
AGENT_ENDPOINT = f"{API_BASE_URL}/gradio/gradio-agent"
WORKFLOW_ENDPOINT = f"{API_BASE_URL}/gradio/gradio-workflow"
TOOL_ENDPOINT = f"{API_BASE_URL}/gradio/gradio-tool"

def generate_agent(requirements: str) -> Dict[str, str]:
    """Generate a Mastra agent based on requirements"""
    try:
        response = requests.post(
            AGENT_ENDPOINT,
            json={"requirements": requirements},
            headers={"Content-Type": "application/json"}
        )
        response.raise_for_status()
        result = response.json()
        return {
            "code": result.get("agent_code", "Error: No agent code generated"),
            "explanation": result.get("explanation", "")
        }
    except Exception as e:
        return {
            "code": f"Error generating agent: {str(e)}",
            "explanation": "An error occurred during agent generation."
        }

def generate_workflow(requirements: str) -> Dict[str, str]:
    """Generate a Mastra workflow based on requirements"""
    try:
        response = requests.post(
            WORKFLOW_ENDPOINT,
            json={"requirements": requirements},
            headers={"Content-Type": "application/json"}
        )
        response.raise_for_status()
        result = response.json()
        return {
            "code": result.get("workflow_code", "Error: No workflow code generated"),
            "explanation": result.get("explanation", "")
        }
    except Exception as e:
        return {
            "code": f"Error generating workflow: {str(e)}",
            "explanation": "An error occurred during workflow generation."
        }

def generate_tool(requirements: str) -> Dict[str, str]:
    """Generate a Mastra tool based on requirements"""
    try:
        response = requests.post(
            TOOL_ENDPOINT,
            json={"requirements": requirements},
            headers={"Content-Type": "application/json"}
        )
        response.raise_for_status()
        result = response.json()
        return {
            "code": result.get("tool_code", "Error: No tool code generated"),
            "explanation": result.get("explanation", "")
        }
    except Exception as e:
        return {
            "code": f"Error generating tool: {str(e)}",
            "explanation": "An error occurred during tool generation."
        }

AGENT_TEMPLATE = """
Agent name: ContentCreationAgent
Description: An agent that creates engaging content for social media platforms
Capabilities: 
- Generate creative content ideas
- Write engaging posts
- Optimize content for different platforms
- Schedule posts for optimal engagement
Tools: contentGenerationTool, schedulingTool
Model: gpt-4o
Provider: openai
Memory: true
"""

WORKFLOW_TEMPLATE = """
Workflow name: ContentPublishingWorkflow
Description: A workflow for creating and publishing content across platforms
Steps:
- Generate content ideas
- Create draft content
- Review and optimize
- Schedule for publication
- Publish to platforms
- Analyze performance
Trigger parameters: topic, platform, deadline
Conditions: Skip review step if deadline is urgent
"""

TOOL_TEMPLATE = """
Tool ID: socialMediaPublisher
Tool name: Social Media Publisher
Description: A tool for publishing content to various social media platforms
Input parameters:
- content: The content to publish
- platform: The platform to publish to (Twitter, LinkedIn, Facebook)
- schedule_time: When to publish the content
Output parameters:
- post_id: The ID of the published post
- status: The status of the publication
- url: The URL of the published post
External API:
- URL: https://api.socialmedia.com/publish
- Method: POST
"""

with gr.Blocks(title="Mastra Generator") as demo:
    gr.Markdown("# Mastra Generator")
    gr.Markdown("Generate Mastra agents, workflows, and tools based on your requirements.")
    
    with gr.Tab("Agent Generator"):
        with gr.Row():
            with gr.Column():
                agent_requirements = gr.Textbox(
                    label="Agent Requirements",
                    placeholder="Describe the agent you want to create...",
                    lines=10,
                    value=AGENT_TEMPLATE
                )
                agent_generate_btn = gr.Button("Generate Agent")
            
            with gr.Column():
                agent_code = gr.Code(
                    label="Generated Agent Code",
                    language="typescript",
                    lines=20
                )
                agent_explanation = gr.Textbox(
                    label="Explanation",
                    lines=5
                )
        
        agent_generate_btn.click(
            fn=generate_agent,
            inputs=[agent_requirements],
            outputs=[agent_code, agent_explanation]
        )
    
    with gr.Tab("Workflow Generator"):
        with gr.Row():
            with gr.Column():
                workflow_requirements = gr.Textbox(
                    label="Workflow Requirements",
                    placeholder="Describe the workflow you want to create...",
                    lines=10,
                    value=WORKFLOW_TEMPLATE
                )
                workflow_generate_btn = gr.Button("Generate Workflow")
            
            with gr.Column():
                workflow_code = gr.Code(
                    label="Generated Workflow Code",
                    language="typescript",
                    lines=20
                )
                workflow_explanation = gr.Textbox(
                    label="Explanation",
                    lines=5
                )
        
        workflow_generate_btn.click(
            fn=generate_workflow,
            inputs=[workflow_requirements],
            outputs=[workflow_code, workflow_explanation]
        )
    
    with gr.Tab("Tool Generator"):
        with gr.Row():
            with gr.Column():
                tool_requirements = gr.Textbox(
                    label="Tool Requirements",
                    placeholder="Describe the tool you want to create...",
                    lines=10,
                    value=TOOL_TEMPLATE
                )
                tool_generate_btn = gr.Button("Generate Tool")
            
            with gr.Column():
                tool_code = gr.Code(
                    label="Generated Tool Code",
                    language="typescript",
                    lines=20
                )
                tool_explanation = gr.Textbox(
                    label="Explanation",
                    lines=5
                )
        
        tool_generate_btn.click(
            fn=generate_tool,
            inputs=[tool_requirements],
            outputs=[tool_code, tool_explanation]
        )

if __name__ == "__main__":
    demo.launch(share=True, server_port=7860)
