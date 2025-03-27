import os
import logging
from slack_bolt import App
from slack_bolt.adapter.socket_mode import SocketModeHandler
import requests
import json
import time
from pathlib import Path

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = App(
    token=os.environ.get("SLACK_BOT_TOKEN"),
    signing_secret=os.environ.get("SLACK_SIGNING_SECRET")
)

API_BASE_URL = os.environ.get("API_BASE_URL", "http://localhost:4111/api")

def is_valid_url(url):
    """Check if the URL is valid and has a Japanese domain (.jp) or is a known company URL."""
    if not url.startswith(("http://", "https://")):
        return False
    
    valid_domains = [".jp", ".co.jp", ".com", ".net", ".org"]
    return any(domain in url for domain in valid_domains)

def generate_dx_proposal(company_url, focus_areas=None):
    """Generate a DX proposal by calling the API."""
    try:
        payload = {
            "companyUrl": company_url,
            "focusAreas": focus_areas or ["業務効率化", "顧客体験向上", "新規事業創出"],
            "budget": "1000万円〜5000万円",
            "timeline": "6ヶ月〜1年"
        }
        
        response = requests.post(f"{API_BASE_URL}/dx-proposal", json=payload)
        
        if response.status_code == 202:
            data = response.json()
            return data.get("workflowId"), data.get("estimatedCompletionTime")
        else:
            logger.error(f"API error: {response.status_code} - {response.text}")
            return None, None
    except Exception as e:
        logger.error(f"Error generating DX proposal: {e}")
        return None, None

def check_proposal_status(workflow_id):
    """Check the status of a DX proposal generation workflow."""
    try:
        response = requests.get(f"{API_BASE_URL}/dx-proposal/{workflow_id}")
        return response.json()
    except Exception as e:
        logger.error(f"Error checking proposal status: {e}")
        return {"success": False, "error": str(e)}

def download_proposal_pdf(workflow_id, company_name):
    """Download the generated PDF proposal."""
    try:
        response = requests.get(
            f"{API_BASE_URL}/dx-proposal/{workflow_id}/pdf",
            stream=True
        )
        
        if response.status_code == 200:
            timestamp = int(time.time())
            filename = f"dx_proposal_{company_name.replace(' ', '_').lower()}_{timestamp}.pdf"
            pdf_path = Path(f"/tmp/{filename}")
            
            with open(pdf_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            
            logger.info(f"PDF downloaded to {pdf_path}")
            return pdf_path
        else:
            logger.error(f"Failed to download PDF: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        logger.error(f"Error downloading PDF: {e}")
        return None

@app.command("/dx")
def handle_dx_command(ack, command, say):
    """Handle the /dx slash command."""
    ack()
    
    command_text = command["text"].strip()
    
    if not command_text:
        say("使用方法: `/dx [企業URL]` - 例: `/dx https://www.toyota.co.jp`")
        return
    
    if not is_valid_url(command_text):
        say("有効なURLを入力してください。例: `https://www.toyota.co.jp`")
        return
    
    say(f"🔍 {command_text} のDX提案書を生成中です... (2-3分程度かかります)")
    
    workflow_id, estimated_time = generate_dx_proposal(command_text)
    
    if not workflow_id:
        say("😓 DX提案書の生成に失敗しました。もう一度お試しください。")
        return
    
    thread_ts = command["ts"]
    
    say({
        "text": f"⏳ DX提案書を生成中です (予想所要時間: {estimated_time})...",
        "thread_ts": thread_ts
    })
    
    max_attempts = 30
    for attempt in range(max_attempts):
        time.sleep(10)  # Check every 10 seconds
        
        status = check_proposal_status(workflow_id)
        
        if status.get("status") == "completed":
            result = status.get("result", {})
            proposal = result.get("proposal", {})
            company_info = proposal.get("companyInfo", {})
            company_name = company_info.get("name", "企業")
            
            blocks = [
                {
                    "type": "header",
                    "text": {
                        "type": "plain_text",
                        "text": f"✅ {company_name} DX提案書が完成しました！",
                        "emoji": True
                    }
                },
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": f"*エグゼクティブサマリー*\n{proposal.get('executiveSummary', '情報なし')}"
                    }
                },
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": "*主要DX機会*"
                    }
                }
            ]
            
            opportunities = proposal.get("opportunities", [])
            for i, opp in enumerate(opportunities[:3]):  # Show top 3 opportunities
                blocks.append({
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": f"*{i+1}. {opp.get('title', '機会')}*\n{opp.get('description', '説明なし')}"
                    }
                })
            
            blocks.append({
                "type": "actions",
                "elements": [
                    {
                        "type": "button",
                        "text": {
                            "type": "plain_text",
                            "text": "📄 完全版を表示",
                            "emoji": True
                        },
                        "value": workflow_id,
                        "action_id": "view_full_proposal"
                    },
                    {
                        "type": "button",
                        "text": {
                            "type": "plain_text",
                            "text": "📥 PDFをダウンロード",
                            "emoji": True
                        },
                        "value": f"{workflow_id}|{company_name}",
                        "action_id": "download_pdf"
                    }
                ]
            })
            
            say({
                "blocks": blocks,
                "text": f"{company_name} のDX提案書が完成しました！",
                "thread_ts": thread_ts
            })
            break
            
        elif status.get("status") == "failed":
            say({
                "text": f"😓 DX提案書の生成に失敗しました: {status.get('error', '不明なエラー')}",
                "thread_ts": thread_ts
            })
            break
            
        if attempt == max_attempts - 1:
            say({
                "text": "⚠️ DX提案書の生成に時間がかかっています。後ほど `/dx status {workflow_id}` で状態を確認してください。",
                "thread_ts": thread_ts
            })
            break

@app.action("view_full_proposal")
def handle_view_full_proposal(ack, body, say):
    """Handle the view full proposal button click."""
    ack()
    
    workflow_id = body["actions"][0]["value"]
    status = check_proposal_status(workflow_id)
    
    if status.get("status") == "completed":
        result = status.get("result", {})
        proposal = result.get("proposal", {})
        
        blocks = format_full_proposal_blocks(proposal)
        
        say({
            "blocks": blocks,
            "text": "DX提案書の詳細",
            "thread_ts": body["message"]["thread_ts"]
        })
    else:
        say({
            "text": "提案書の取得に失敗しました。もう一度お試しください。",
            "thread_ts": body["message"]["thread_ts"]
        })

@app.action("download_pdf")
def handle_download_pdf(ack, body, client, say):
    """Handle the download PDF button click."""
    ack()
    
    value_parts = body["actions"][0]["value"].split("|")
    workflow_id = value_parts[0]
    company_name = value_parts[1] if len(value_parts) > 1 else "企業"
    
    say({
        "text": f"📥 {company_name}のDX提案書PDFをダウンロード中...",
        "thread_ts": body["message"]["thread_ts"]
    })
    
    pdf_path = download_proposal_pdf(workflow_id, company_name)
    
    if pdf_path:
        try:
            channel_id = body["channel"]["id"]
            user_id = body["user"]["id"]
            
            result = client.files_upload_v2(
                channel=channel_id,
                file=str(pdf_path),
                filename=pdf_path.name,
                title=f"{company_name} DX提案書",
                initial_comment=f"<@{user_id}> {company_name}のDX提案書PDFです。"
            )
            
            if not result["ok"]:
                say({
                    "text": f"❌ PDFのアップロードに失敗しました: {result.get('error', '不明なエラー')}",
                    "thread_ts": body["message"]["thread_ts"]
                })
        except Exception as e:
            logger.error(f"Error uploading PDF: {e}")
            say({
                "text": f"❌ PDFのアップロードに失敗しました: {str(e)}",
                "thread_ts": body["message"]["thread_ts"]
            })
    else:
        say({
            "text": "❌ PDFの生成に失敗しました。もう一度お試しください。",
            "thread_ts": body["message"]["thread_ts"]
        })

def format_full_proposal_blocks(proposal):
    """Format the full proposal as Slack blocks."""
    company_info = proposal.get("companyInfo", {})
    company_name = company_info.get("name", "企業")
    
    blocks = [
        {
            "type": "header",
            "text": {
                "type": "plain_text",
                "text": f"{company_name} DX提案書",
                "emoji": True
            }
        },
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": "*企業情報*"
            }
        },
        {
            "type": "section",
            "fields": [
                {
                    "type": "mrkdwn",
                    "text": f"*業種:* {company_info.get('industry', '情報なし')}"
                },
                {
                    "type": "mrkdwn",
                    "text": f"*規模:* {company_info.get('size', '情報なし')}"
                }
            ]
        },
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": f"*概要:* {company_info.get('description', '情報なし')}"
            }
        },
        {
            "type": "divider"
        },
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": "*エグゼクティブサマリー*"
            }
        },
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": proposal.get("executiveSummary", "情報なし")
            }
        },
        {
            "type": "divider"
        }
    ]
    
    blocks.append({
        "type": "section",
        "text": {
            "type": "mrkdwn",
            "text": "*ビジネス課題*"
        }
    })
    
    challenges = proposal.get("businessChallenges", [])
    for challenge in challenges:
        if isinstance(challenge, dict):
            blocks.append({
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": f"*{challenge.get('title', '課題')}*\n{challenge.get('description', '説明なし')}"
                }
            })
        else:
            blocks.append({
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": f"• {challenge}"
                }
            })
    
    blocks.append({"type": "divider"})
    
    blocks.append({
        "type": "section",
        "text": {
            "type": "mrkdwn",
            "text": "*DX機会*"
        }
    })
    
    opportunities = proposal.get("opportunities", [])
    for opp in opportunities:
        text = f"*{opp.get('title', '機会')}*\n{opp.get('description', '説明なし')}\n"
        
        if "benefits" in opp and opp["benefits"]:
            benefits = opp["benefits"]
            if isinstance(benefits, list):
                text += "メリット:\n"
                for benefit in benefits:
                    text += f"• {benefit}\n"
            else:
                text += f"メリット: {benefits}\n"
        
        if "implementation" in opp:
            text += f"実装: {opp['implementation']}\n"
        
        if "timeline" in opp:
            text += f"タイムライン: {opp['timeline']}\n"
        
        if "cost" in opp:
            text += f"コスト: {opp['cost']}"
        
        blocks.append({
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": text
            }
        })
        
        blocks.append({
            "type": "divider"
        })
    
    blocks.append({
        "type": "section",
        "text": {
            "type": "mrkdwn",
            "text": "*実装ロードマップ*"
        }
    })
    
    roadmap = proposal.get("implementationRoadmap", [])
    for phase in roadmap:
        text = f"*{phase.get('phase', 'フェーズ')}*\n"
        
        if "timeline" in phase:
            text += f"期間: {phase['timeline']}\n"
        
        if "tasks" in phase and phase["tasks"]:
            text += "タスク:\n"
            for task in phase["tasks"]:
                text += f"• {task}\n"
        
        if "milestones" in phase and phase["milestones"]:
            text += "マイルストーン:\n"
            for milestone in phase["milestones"]:
                text += f"• {milestone}\n"
        
        blocks.append({
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": text
            }
        })
    
    blocks.append({"type": "divider"})
    
    investment = proposal.get("investmentSummary", {})
    if investment:
        blocks.append({
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": "*投資概要*"
            }
        })
        
        investment_text = ""
        if "totalCost" in investment:
            investment_text += f"総コスト: {investment['totalCost']}\n"
        
        if "roi" in investment:
            investment_text += f"ROI: {investment['roi']}\n"
        
        if "paybackPeriod" in investment:
            investment_text += f"回収期間: {investment['paybackPeriod']}\n"
        
        if "breakdown" in investment and investment["breakdown"]:
            investment_text += "内訳:\n"
            for key, value in investment["breakdown"].items():
                investment_text += f"• {key}: {value}\n"
        
        blocks.append({
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": investment_text
            }
        })
        
        blocks.append({"type": "divider"})
    
    if "conclusion" in proposal:
        blocks.append({
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": "*結論*"
            }
        })
        
        blocks.append({
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": proposal["conclusion"]
            }
        })
    
    return blocks

@app.command("/dx-status")
def handle_dx_status_command(ack, command, say):
    """Handle the /dx-status slash command to check the status of a workflow."""
    ack()
    
    command_text = command["text"].strip()
    
    if not command_text:
        say("使用方法: `/dx-status [ワークフローID]`")
        return
    
    status = check_proposal_status(command_text)
    
    if status.get("success") is False:
        say(f"エラー: {status.get('error', '不明なエラー')}")
        return
    
    status_text = status.get("status", "不明")
    if status_text == "completed":
        say("✅ DX提案書の生成が完了しました。`/dx` コマンドの結果を確認してください。")
    elif status_text == "failed":
        say(f"❌ DX提案書の生成に失敗しました: {status.get('error', '不明なエラー')}")
    else:
        say(f"⏳ DX提案書を生成中です (ステータス: {status_text})...")

@app.event("app_mention")
def handle_app_mention(event, say):
    """Handle mentions of the bot."""
    text = event.get("text", "").lower()
    
    if "help" in text:
        say({
            "text": "DX提案書ジェネレーターの使い方:\n• `/dx [企業URL]` - DX提案書を生成します\n• `/dx-status [ワークフローID]` - 生成状況を確認します",
            "thread_ts": event.get("ts")
        })
    else:
        say({
            "text": "こんにちは！DX提案書を生成するには `/dx [企業URL]` コマンドを使用してください。",
            "thread_ts": event.get("ts")
        })

if __name__ == "__main__":
    required_env_vars = ["SLACK_BOT_TOKEN", "SLACK_APP_TOKEN", "SLACK_SIGNING_SECRET"]
    missing_vars = [var for var in required_env_vars if not os.environ.get(var)]
    
    if missing_vars:
        logger.error(f"Missing required environment variables: {', '.join(missing_vars)}")
        logger.error("Please set these environment variables and try again.")
        exit(1)
    
    handler = SocketModeHandler(app, os.environ["SLACK_APP_TOKEN"])
    logger.info("⚡️ DX提案書 Slack Botを起動中...")
    handler.start()
