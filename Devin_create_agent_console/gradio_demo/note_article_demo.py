import gradio as gr
import os
import json
import requests
from anthropic import Anthropic

# Set API keys
anthropic_api_key = os.environ.get("Anthropic_Claude_API_KEY_CLAUDE_API_KEY")
openai_api_key = os.environ.get("OPENAI_API_KEY")

# Initialize Anthropic client
client = Anthropic(api_key=anthropic_api_key)

def generate_article(topic, include_images=True):
    """Generate a note.com article using Claude"""
    
    system_prompt = """
    あなたはnote.comの記事を作成する専門家です。ユーザーの要望に基づいて、感動品質の高い記事を作成します。
    
    あなたは以下のペルソナを持つライターです：
    - 30代、様々な分野での実務経験を持つ
    - 失敗と成功の両方を経験してきた
    - 読者と共感できる日常の悩みや喜びを理解している
    - 専門知識を持ちながらも、親しみやすい語り口を大切にする

    【重要】以下の要素を必ず含めてください：
    
    1. 具体的な時間や場所を含む個人的なエピソードから始める
       例：「先月のある雨の日、私はオフィスの片隅で締め切りに追われていました...」
    
    2. 少なくとも3つ以上の感情表現を含める
       例：「驚き」「不安」「喜び」「後悔」「達成感」「焦り」「安堵」など
    
    3. 具体的な失敗体験を詳細に描写する
       例：「最初の3回の施策はすべて失敗。予算を無駄にし、上司からの信頼も失いかけました」
    
    4. 各セクションに少なくとも1回は「私は〜」「私が〜」という一人称の表現を含める
       例：「私はこの方法が最も効果的だと確信しています」
    
    5. 少なくとも3回は読者に直接語りかける
       例：「あなたも同じような経験はありませんか？」「あなたならどうしますか？」
    
    6. 結論部分では読者との対話を具体的に促す
       例：「あなたの体験をぜひコメント欄で教えてください」「最も役立ったポイントは何でしたか？」
    
    記事作成の際には以下のポイントを守ってください：
    
    1. 感情に訴えかける導入部
      - 具体的な時間、場所、状況から始める（「ある日」ではなく「先月の雨の火曜日」など）
      - 「あなたも〇〇と感じたことはありませんか？」など読者に直接語りかける
      - 問題提起と解決の約束を明確に示す
    
    2. ストーリーテリングの活用
      - 具体的な数字や状況を含む体験談を豊富に含める
      - 失敗から成功へのプロセスを感情の変化とともに描写する
      - 読者が自分事として捉えられる具体的な状況設定を作る
    
    3. 独自の視点と経験
      - 「私は〇〇だと思います」という主観的な意見を含める
      - 一般的な情報ではなく、独自の分析や考察を示す
      - 他の記事では見られない独自の洞察を提供する
    
    4. 視覚的要素の効果的な活用
      - 各セクションに関連する感情的な視覚表現を提案する
      - 単なる装飾ではなく、内容を補完する画像を選ぶ
      - 画像には感情やストーリーを込める
    
    5. 読者参加型の結論
      - 読者への具体的な質問や行動の呼びかけで締めくくる
      - コメント欄での対話を促す仕掛けを入れる
      - 次のステップへの明確な誘導を含める
    
    SEO最適化よりも、読者の心に響く内容を最優先してください。
    記事のトピックはユーザーが指定するか、トレンド分析から提案します。
    
    フォーマット：
    - Markdown形式で出力
    - 適切な箇条書きや引用を使用
    - リンクは[テキスト](URL)の形式で提供
    """
    
    user_prompt = f"以下のトピックについて、note.comの記事を作成してください：{topic}"
    
    if include_images:
        user_prompt += "\n各セクションに関連する画像の説明も含めてください。"
    
    try:
        response = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            system=system_prompt,
            messages=[{"role": "user", "content": user_prompt}],
            max_tokens=4000
        )
        
        return response.content[0].text
    except Exception as e:
        return f"エラーが発生しました: {str(e)}"

def analyze_trends(keyword):
    """Mock function to analyze trends related to a keyword"""
    trends = {
        "AI": ["生成AI活用事例", "ChatGPTプロンプト設計", "AIと著作権問題"],
        "マーケティング": ["コンテンツマーケティング最新手法", "SNSアルゴリズム対策", "顧客体験設計"],
        "プログラミング": ["Rust入門", "TypeScript実践テクニック", "WebAssembly活用法"],
        "投資": ["インデックス投資戦略", "不動産投資リスク管理", "暗号資産最新動向"],
        "健康": ["腸内環境改善法", "睡眠の質向上テクニック", "免疫力強化食品"]
    }
    
    # Return default trends if keyword not found
    return trends.get(keyword, ["トレンド分析中...", "人気コンテンツ調査", "キーワード調査"])

# Create Gradio interface
with gr.Blocks(title="Note記事生成Agent") as demo:
    gr.Markdown("# Note.com 記事生成Agent")
    gr.Markdown("トピックを入力して、SEO最適化されたnote.com記事を生成します。")
    
    with gr.Row():
        with gr.Column():
            topic_input = gr.Textbox(label="記事トピック", placeholder="例：AIマーケティング戦略")
            include_images = gr.Checkbox(label="画像の説明を含める", value=True)
            trend_keyword = gr.Textbox(label="トレンド分析キーワード（オプション）", placeholder="例：AI")
            
            with gr.Row():
                analyze_btn = gr.Button("トレンド分析")
                generate_btn = gr.Button("記事生成", variant="primary")
        
        with gr.Column():
            trend_output = gr.JSON(label="トレンド分析結果")
            article_output = gr.Markdown(label="生成された記事")
    
    analyze_btn.click(
        fn=analyze_trends,
        inputs=trend_keyword,
        outputs=trend_output
    )
    
    generate_btn.click(
        fn=generate_article,
        inputs=[topic_input, include_images],
        outputs=article_output
    )

# Launch the demo with sharing enabled
demo.launch(share=True)
