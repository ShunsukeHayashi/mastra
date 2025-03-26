import os
import sys
import shutil
import gradio as gr
from huggingface_hub import HfApi, create_repo, upload_folder

def deploy_to_huggingface():
    """Deploy the Gradio app to Hugging Face Spaces"""
    
    hf_token = os.environ.get("HF_TOKEN")
    if not hf_token:
        print("Error: HF_TOKEN environment variable not set")
        print("Please set your Hugging Face token with: export HF_TOKEN=your_token")
        sys.exit(1)
    
    space_name = "mastra-agent-generator"
    username = "shunsukeai"  # Replace with actual username if needed
    
    api = HfApi(token=hf_token)
    
    try:
        create_repo(
            repo_id=f"{username}/{space_name}",
            repo_type="space",
            space_sdk="gradio",
            token=hf_token,
            private=False
        )
        print(f"Created new Hugging Face Space: {username}/{space_name}")
    except Exception as e:
        if "already exists" in str(e):
            print(f"Space {username}/{space_name} already exists, continuing with deployment")
        else:
            print(f"Error creating Space: {e}")
            sys.exit(1)
    
    deploy_dir = "hf_space"
    os.makedirs(deploy_dir, exist_ok=True)
    
    with open(f"{deploy_dir}/requirements.txt", "w") as f:
        f.write("gradio>=5.0.0\n")
        f.write("requests>=2.0.0\n")
        f.write("jinja-js>=0.1.8\n")
    
    with open(f"{deploy_dir}/app.py", "w") as f:
        with open("gradio_app.py", "r") as src:
            content = src.read()
            content = content.replace(
                'API_BASE_URL = "http://localhost:3000/api"', 
                'API_BASE_URL = "https://mastra-agent-generator.onrender.com/api"'
            )
            content = content.replace(
                'gr.Markdown("# Mastra Generator")',
                'gr.Markdown("# Mastra エージェントジェネレーター")'
            )
            content = content.replace(
                'gr.Markdown("Generate Mastra agents, workflows, and tools based on your requirements.")',
                'gr.Markdown("ユーザー要件に基づいてMastraエージェント、ワークフロー、ツールを生成します。")'
            )
            content = content.replace(
                'def generate_agent(requirements: str) -> Dict[str, str]:',
                '''def generate_agent(requirements: str) -> Dict[str, str]:
    """Generate a Mastra agent based on requirements"""
    try:
        health_check = requests.get(f"{API_BASE_URL.replace('/api', '')}/api/health", timeout=5)
        if health_check.status_code != 200:
            return {
                "code": "エラー: APIサーバーに接続できません。しばらく経ってからもう一度お試しください。",
                "explanation": "API接続エラーが発生しました。"
            }'''
            )
            f.write(content)
    
    with open(f"{deploy_dir}/README.md", "w") as f:
        f.write("# Mastra エージェントジェネレーター\n\n")
        f.write("ユーザー要件に基づいてMastraエージェント、ワークフロー、ツールを動的に生成するシステム。\n\n")
        f.write("## 機能\n\n")
        f.write("- **エージェント生成**: カスタム機能を持つMastraエージェントを作成\n")
        f.write("- **ワークフロー生成**: ステップ、条件、トリガーを含むワークフローを定義\n")
        f.write("- **ツール生成**: 入出力スキーマとAPI連携を持つツールを作成\n\n")
        f.write("## 使い方\n\n")
        f.write("1. テキストエリアに要件を入力\n")
        f.write("2. 生成ボタンをクリック\n")
        f.write("3. 生成されたコードと説明を確認\n\n")
        f.write("## API連携\n\n")
        f.write("このデモは、コード生成のためのバックエンドAPIに接続しています。APIは以下でホストされています：\n")
        f.write("https://mastra-agent-generator.onrender.com/\n\n")
    
    with open(f"{deploy_dir}/.gitignore", "w") as f:
        f.write("__pycache__/\n")
        f.write("*.py[cod]\n")
        f.write("*$py.class\n")
        f.write(".env\n")
        f.write(".DS_Store\n")
    
    try:
        api.upload_folder(
            folder_path=deploy_dir,
            repo_id=f"{username}/{space_name}",
            repo_type="space",
            commit_message="Mastraエージェントジェネレーターの更新"
        )
        space_url = f"https://huggingface.co/spaces/{username}/{space_name}"
        print(f"Successfully deployed to {space_url}")
        
        if os.path.exists(deploy_dir):
            shutil.rmtree(deploy_dir)
            
        return space_url
    except Exception as e:
        print(f"Error deploying to Hugging Face: {e}")
        sys.exit(1)

if __name__ == "__main__":
    deploy_to_huggingface()
