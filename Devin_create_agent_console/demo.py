import gradio as gr
import requests
import json
import os

# API URL
API_URL = "http://localhost:4111/api"

def translate_requirements(business_requirement, context="", business_context="", technical_context="", format="markdown"):
    """
    Translate business requirements to technical specifications using the requirements translator agent
    """
    # Create a thread for the conversation
    thread_response = requests.post(
        f"{API_URL}/memory/threads",
        json={"metadata": {"title": "Requirements Translation"}}
    )
    thread_data = thread_response.json()
    thread_id = thread_data.get("id")
    
    if not thread_id:
        return "Error: Failed to create conversation thread"
    
    # Generate response using the requirements translator agent
    payload = {
        "messages": [
            {
                "role": "user",
                "content": f"以下のビジネス要件を技術要件に翻訳してください：\n\n{business_requirement}\n\n"
                           f"追加コンテキスト：{context}\n\n"
                           f"ビジネスコンテキスト：{business_context}\n\n"
                           f"技術コンテキスト：{technical_context}"
            }
        ],
        "threadId": thread_id
    }
    
    response = requests.post(
        f"{API_URL}/agents/requirementsTranslatorAgent/generate",
        json=payload
    )
    
    if response.status_code != 200:
        return f"Error: {response.status_code} - {response.text}"
    
    result = response.json()
    return result.get("content", "No content returned")

def trigger_workflow(business_requirement, context="", business_context="", technical_context="", format="markdown"):
    """
    Trigger the requirements translator workflow
    """
    payload = {
        "businessRequirement": business_requirement,
        "context": context,
        "businessContext": business_context,
        "technicalContext": technical_context,
        "format": format
    }
    
    response = requests.post(
        f"{API_URL}/workflows/requirements-translator-workflow/trigger",
        json=payload
    )
    
    if response.status_code != 200:
        return f"Error: {response.status_code} - {response.text}"
    
    result = response.json()
    return json.dumps(result, indent=2, ensure_ascii=False)

# Create Gradio interface
with gr.Blocks(title="ビジネス要件翻訳エージェント") as demo:
    gr.Markdown("# 経営者要件翻訳エージェント")
    gr.Markdown("経営者の要望をシステム開発者向けに翻訳するエージェントです。")
    
    with gr.Tab("エージェント直接利用"):
        with gr.Row():
            with gr.Column():
                business_req = gr.Textbox(label="ビジネス要件", lines=5, placeholder="例: ユーザーの行動履歴を分析して、おすすめの商品を表示する機能が欲しい")
                context = gr.Textbox(label="追加コンテキスト（任意）", lines=2, placeholder="プロジェクトや既存システムに関する追加情報")
                business_context = gr.Textbox(label="ビジネスコンテキスト（任意）", lines=2, placeholder="ビジネス上の優先事項や制約に関する情報")
                technical_context = gr.Textbox(label="技術コンテキスト（任意）", lines=2, placeholder="技術的な制約や既存システムに関する情報")
                
                agent_button = gr.Button("翻訳実行")
            
            with gr.Column():
                output = gr.Textbox(label="翻訳結果", lines=20)
    
    with gr.Tab("ワークフロー利用"):
        with gr.Row():
            with gr.Column():
                wf_business_req = gr.Textbox(label="ビジネス要件", lines=5, placeholder="例: ユーザーの行動履歴を分析して、おすすめの商品を表示する機能が欲しい")
                wf_context = gr.Textbox(label="追加コンテキスト（任意）", lines=2, placeholder="プロジェクトや既存システムに関する追加情報")
                wf_business_context = gr.Textbox(label="ビジネスコンテキスト（任意）", lines=2, placeholder="ビジネス上の優先事項や制約に関する情報")
                wf_technical_context = gr.Textbox(label="技術コンテキスト（任意）", lines=2, placeholder="技術的な制約や既存システムに関する情報")
                
                format_radio = gr.Radio(["markdown", "json"], label="出力フォーマット", value="markdown")
                
                workflow_button = gr.Button("ワークフロー実行")
            
            with gr.Column():
                workflow_output = gr.Textbox(label="ワークフロー結果", lines=20)
    
    agent_button.click(
        translate_requirements,
        inputs=[business_req, context, business_context, technical_context],
        outputs=output
    )
    
    workflow_button.click(
        trigger_workflow,
        inputs=[wf_business_req, wf_context, wf_business_context, wf_technical_context, format_radio],
        outputs=workflow_output
    )

# Launch the app with share=True to create a public URL
demo.launch(share=True)
