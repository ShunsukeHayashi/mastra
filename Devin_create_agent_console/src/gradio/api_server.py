
import os
import json
import time
import requests
from typing import Dict, Any, List, Optional
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

workflow_states = {}

def extract_company_info(company_url: str) -> Dict[str, Any]:
    """
    Extract company information from URL using SerpAPI
    """
    try:
        domain = company_url.lower()
        if domain.startswith('http'):
            domain = domain.split('://')[1]
        if '/' in domain:
            domain = domain.split('/')[0]

        params = {
            'engine': 'google',
            'q': f"{domain} 会社概要 OR 企業情報",
            'num': 10,
            'location': 'Japan',
            'google_domain': 'google.co.jp',
            'gl': 'jp',
            'hl': 'ja',
            'filter': '0'
        }
        
        api_key = os.environ.get('SERP_API_KEY')
        if not api_key:
            return {
                "name": "APIキーエラー",
                "industry": "不明",
                "description": "SERP_API_KEYが設定されていません。環境変数を確認してください。",
                "products": ["情報なし"],
                "size": "",
                "founded": "",
                "location": "",
                "competitors": [],
                "technologies": [],
                "challenges": []
            }
        params['api_key'] = api_key

        response = requests.get('https://serpapi.com/search', params=params)
        response.raise_for_status()
        data = response.json()

        company_info = {
            "name": "",
            "industry": "",
            "description": "",
            "products": [],
            "size": "",
            "founded": "",
            "location": "",
            "competitors": [],
            "technologies": [],
            "challenges": []
        }

        if 'knowledge_graph' in data and 'title' in data['knowledge_graph']:
            company_info["name"] = data['knowledge_graph']['title']
        else:
            if 'organic_results' in data and len(data['organic_results']) > 0:
                first_result = data['organic_results'][0]
                if 'title' in first_result:
                    title_parts = first_result['title'].split('|')
                    company_info["name"] = title_parts[0].strip()

        if 'knowledge_graph' in data and 'description' in data['knowledge_graph']:
            company_info["description"] = data['knowledge_graph']['description']
        else:
            if 'organic_results' in data:
                snippets = [r.get('snippet', '') for r in data['organic_results'] if 'snippet' in r][:3]
                company_info["description"] = ' '.join(snippets)

        industry_keywords = ['業界', '業種', 'セクター', 'インダストリー']
        if 'organic_results' in data:
            for result in data['organic_results']:
                if 'snippet' in result:
                    for keyword in industry_keywords:
                        if keyword in result['snippet']:
                            parts = result['snippet'].split(keyword)
                            if len(parts) > 1:
                                industry_part = parts[1].split('。')[0].strip()
                                if industry_part and len(industry_part) < 30:
                                    company_info["industry"] = industry_part
                                    break
                    if company_info["industry"]:
                        break

        if not company_info["industry"]:
            if 'shop' in domain or 'store' in domain:
                company_info["industry"] = '小売業'
            elif 'tech' in domain or 'soft' in domain:
                company_info["industry"] = 'IT・ソフトウェア'
            elif 'bank' in domain or 'finance' in domain:
                company_info["industry"] = '金融・銀行'
            else:
                company_info["industry"] = 'その他'

        product_keywords = ['製品', 'サービス', 'プロダクト']
        product_candidates = []

        if 'organic_results' in data:
            for result in data['organic_results']:
                if 'snippet' in result:
                    for keyword in product_keywords:
                        if keyword in result['snippet']:
                            parts = result['snippet'].split(keyword)
                            if len(parts) > 1:
                                product_part = parts[1].split('。')[0].strip()
                                if product_part and len(product_part) < 50:
                                    product_candidates.append(product_part)

        if len(product_candidates) == 0 and 'organic_results' in data:
            for result in data['organic_results']:
                if 'title' in result and ('製品' in result['title'] or 'サービス' in result['title']):
                    product_candidates.append(result['title'].replace('製品', '').replace('サービス', '').strip())

        company_info["products"] = product_candidates[:5]

        if len(company_info["products"]) == 0:
            company_info["products"] = ['主力製品/サービス情報は見つかりませんでした']

        return company_info
    except Exception as e:
        print(f"Error extracting company info: {str(e)}")
        return {
            "name": "不明",
            "industry": "不明",
            "description": "企業情報の取得に失敗しました。",
            "products": ["情報なし"],
            "size": "",
            "founded": "",
            "location": "",
            "competitors": [],
            "technologies": [],
            "challenges": []
        }

def generate_dx_opportunities(company_info: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Generate DX opportunities based on company info
    """
    opportunities = []

    if '情報' in company_info["industry"] or 'IT' in company_info["industry"] or 'ソフトウェア' in company_info["industry"]:
        opportunities.append({
            "area": "AIを活用した製品開発の効率化",
            "currentState": "従来の開発手法による長いリリースサイクル",
            "targetState": "AIを活用した開発プロセスの自動化と効率化",
            "impact": "開発期間の短縮、品質向上、コスト削減",
            "difficulty": "中",
            "priority": "高",
            "technologies": ["機械学習", "CI/CD自動化", "コード生成AI"]
        })
    elif '小売' in company_info["industry"] or 'EC' in company_info["industry"]:
        opportunities.append({
            "area": "パーソナライズされた顧客体験の構築",
            "currentState": "画一的なWebサイトとマーケティング",
            "targetState": "AIによる個別化されたレコメンデーションと体験",
            "impact": "顧客満足度向上、リピート率向上、客単価増加",
            "difficulty": "中",
            "priority": "高",
            "technologies": ["レコメンデーションエンジン", "顧客セグメンテーションAI", "パーソナライズドマーケティング"]
        })
    elif '製造' in company_info["industry"] or '工場' in company_info["industry"]:
        opportunities.append({
            "area": "スマートファクトリー化による生産効率向上",
            "currentState": "従来型の生産ラインと限定的なデータ活用",
            "targetState": "IoTとAIを活用した予測型生産管理システム",
            "impact": "生産効率向上、不良品率低減、エネルギー消費削減",
            "difficulty": "高",
            "priority": "高",
            "technologies": ["IoTセンサー", "予測保全AI", "デジタルツイン"]
        })
    elif '金融' in company_info["industry"] or '銀行' in company_info["industry"]:
        opportunities.append({
            "area": "AIを活用したリスク分析と不正検知",
            "currentState": "ルールベースの限定的な不正検知システム",
            "targetState": "リアルタイムAI不正検知と予測型リスク分析",
            "impact": "不正検知率向上、リスク低減、コンプライアンス強化",
            "difficulty": "高",
            "priority": "高",
            "technologies": ["機械学習", "リアルタイム分析", "ブロックチェーン"]
        })

    opportunities.append({
        "area": "データ駆動型意思決定基盤の構築",
        "currentState": "分断されたデータソースと限定的な分析",
        "targetState": "統合データプラットフォームとAI分析ダッシュボード",
        "impact": "意思決定の迅速化、データ活用促進、業務効率化",
        "difficulty": "中",
        "priority": "高",
        "technologies": ["データレイク", "ビジネスインテリジェンス", "機械学習"]
    })

    opportunities.append({
        "area": "デジタル顧客エンゲージメントの強化",
        "currentState": "従来型のコミュニケーションチャネル",
        "targetState": "オムニチャネル統合とAIチャットボット活用",
        "impact": "顧客満足度向上、応対コスト削減、24時間対応の実現",
        "difficulty": "中",
        "priority": "中",
        "technologies": ["チャットボットAI", "オムニチャネルCRM", "感情分析"]
    })

    return opportunities

def generate_implementation_roadmap() -> List[Dict[str, Any]]:
    """
    Generate implementation roadmap
    """
    return [
        {
            "phase": "フェーズ1: 基盤構築と組織準備",
            "description": "デジタル基盤の整備と組織体制の構築",
            "timeline": "3-6ヶ月",
            "deliverables": [
                "DX推進チームの編成",
                "データ基盤アーキテクチャの設計",
                "クラウド環境の構築",
                "デジタル人材育成計画の策定"
            ]
        },
        {
            "phase": "フェーズ2: パイロットプロジェクト実施",
            "description": "優先度の高いDX施策の小規模実装と検証",
            "timeline": "6-9ヶ月",
            "deliverables": [
                "パイロットプロジェクトの実施と効果測定",
                "ユーザーフィードバックの収集と分析",
                "本格展開に向けた課題抽出と対策立案"
            ]
        },
        {
            "phase": "フェーズ3: 本格展開と最適化",
            "description": "全社的な展開と継続的な改善",
            "timeline": "9-18ヶ月",
            "deliverables": [
                "DXソリューションの全社展開",
                "KPI達成状況のモニタリングと最適化",
                "社内デジタル人材の育成強化",
                "新たなDX機会の継続的な発掘"
            ]
        }
    ]

def generate_investment_summary() -> Dict[str, str]:
    """
    Generate investment summary
    """
    return {
        "totalCost": "1億円〜1.5億円（3年間）",
        "roi": "投資額の2.5倍（5年間）",
        "paybackPeriod": "3年"
    }

def generate_dx_proposal(company_url: str, focus_areas: Optional[List[str]] = None, budget: str = "", timeline: str = "") -> Dict[str, Any]:
    """
    Generate DX proposal
    """
    try:
        company_info = extract_company_info(company_url)

        opportunities = generate_dx_opportunities(company_info)

        implementation_roadmap = generate_implementation_roadmap()

        investment_summary = generate_investment_summary()

        executive_summary = f"{company_info['name']}のデジタルトランスフォーメーション（DX）は、業界内での競争力強化と顧客体験の向上を実現する重要な戦略です。本提案では、データ活用基盤の構築、AIを活用した業務効率化、そしてデジタル顧客体験の革新を通じて、持続的な成長を支援する包括的なDX戦略を提案します。段階的な実装アプローチにより、リスクを最小化しながら確実な成果を積み上げていくことが可能です。"

        business_challenges = [
            "デジタル技術の急速な進化に対応するための組織変革",
            "データの分断と活用不足による機会損失",
            "デジタル人材の確保と育成",
            "競合他社のDX推進による競争激化"
        ]

        conclusion = f"{company_info['name']}にとってのDXは、単なる技術導入ではなく、ビジネスモデルと組織文化の変革を伴う戦略的取り組みです。本提案で示したデータ活用基盤の構築、AIを活用した業務効率化、そしてデジタル顧客体験の革新を通じて、業界内での競争優位性を確立し、持続的な成長を実現することが可能です。段階的な実装アプローチにより、リスクを最小化しながら確実な成果を積み上げていくことをお勧めします。"

        presentation_points = [
            f"{company_info['industry']}業界におけるDXの重要性と競争優位性への影響",
            "データ活用とAI導入による業務効率化と意思決定の高度化",
            "デジタル顧客体験の革新による顧客満足度と売上の向上",
            "段階的な実装アプローチによるリスク低減と効果測定",
            "DX推進のための組織体制と人材育成の重要性"
        ]

        proposal = {
            "companyInfo": company_info,
            "executiveSummary": executive_summary,
            "businessChallenges": business_challenges,
            "opportunities": opportunities,
            "implementationRoadmap": implementation_roadmap,
            "investmentSummary": investment_summary,
            "conclusion": conclusion
        }

        return {
            "status": "completed",
            "proposal": proposal,
            "presentationPoints": presentation_points
        }
    except Exception as e:
        print(f"Error generating DX proposal: {str(e)}")
        return {
            "status": "failed",
            "error": f"DX提案書の生成に失敗しました: {str(e)}"
        }

@app.route('/api/dx-proposal', methods=['POST'])
def create_dx_proposal():
    try:
        data = request.json
        company_url = data.get('companyUrl')
        focus_areas = data.get('focusAreas', [])
        budget = data.get('budget', '')
        timeline = data.get('timeline', '')

        if not company_url:
            return jsonify({
                'success': False,
                'error': '企業URLが必要です'
            }), 400

        workflow_id = f"dx-proposal-{int(time.time())}"

        workflow_states[workflow_id] = {
            'status': 'pending',
            'createdAt': time.time(),
            'input': {
                'companyUrl': company_url,
                'focusAreas': focus_areas,
                'budget': budget,
                'timeline': timeline
            }
        }

        import threading
        def process_proposal():
            try:
                workflow_states[workflow_id]['status'] = 'in-progress'
                workflow_states[workflow_id]['updatedAt'] = time.time()

                result = generate_dx_proposal(
                    company_url,
                    focus_areas,
                    budget,
                    timeline
                )

                workflow_states[workflow_id]['status'] = 'completed'
                workflow_states[workflow_id]['result'] = result
                workflow_states[workflow_id]['completedAt'] = time.time()
            except Exception as e:
                print(f"Error executing DX proposal workflow: {str(e)}")

                workflow_states[workflow_id]['status'] = 'failed'
                workflow_states[workflow_id]['error'] = str(e)
                workflow_states[workflow_id]['failedAt'] = time.time()

        thread = threading.Thread(target=process_proposal)
        thread.daemon = True
        thread.start()

        return jsonify({
            'success': True,
            'message': 'DX提案書の生成を開始しました',
            'workflowId': workflow_id,
            'estimatedCompletionTime': '2-3分程度'
        }), 202
    except Exception as e:
        print(f"Error handling DX proposal request: {str(e)}")

        return jsonify({
            'success': False,
            'error': 'DX提案書の生成中にエラーが発生しました',
            'message': str(e)
        }), 500

@app.route('/api/dx-proposal/<workflow_id>', methods=['GET'])
def get_dx_proposal(workflow_id):
    try:
        if not workflow_id:
            return jsonify({
                'success': False,
                'error': 'ワークフローIDが必要です'
            }), 400

        if workflow_id not in workflow_states:
            return jsonify({
                'success': False,
                'error': '指定されたワークフローが見つかりません'
            }), 404

        workflow_state = workflow_states[workflow_id]

        if workflow_state['status'] == 'completed':
            return jsonify({
                'success': True,
                'status': 'completed',
                'result': workflow_state['result'],
                'completedAt': workflow_state['completedAt']
            }), 200
        elif workflow_state['status'] == 'failed':
            return jsonify({
                'success': False,
                'status': 'failed',
                'error': workflow_state.get('error', 'ワークフローの実行に失敗しました'),
                'failedAt': workflow_state.get('failedAt')
            }), 500
        else:
            return jsonify({
                'success': True,
                'status': workflow_state['status'],
                'message': 'DX提案書を生成中です',
                'createdAt': workflow_state['createdAt']
            }), 200
    except Exception as e:
        print(f"Error getting DX proposal status: {str(e)}")

        return jsonify({
            'success': False,
            'error': 'ワークフローステータスの取得中にエラーが発生しました',
            'message': str(e)
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=4111)
