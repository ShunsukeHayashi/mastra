import os
import tempfile
import json
from typing import Dict, Any, Optional
import base64
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT

try:
    japanese_fonts = [
        ('/usr/share/fonts/truetype/fonts-japanese-gothic.ttf', 'Japanese'),
        ('/usr/share/fonts/truetype/ipafont-gothic/ipag.ttf', 'IPAGothic'),
        ('/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc', 'NotoSans')
    ]
    
    for font_path, font_name in japanese_fonts:
        if os.path.exists(font_path):
            pdfmetrics.registerFont(TTFont(font_name, font_path))
            break
except Exception as e:
    print(f"Warning: Could not register Japanese font: {e}")

def generate_pdf_from_proposal(proposal: Dict[str, Any], output_path: Optional[str] = None) -> str:
    """
    Generate a PDF file from a DX proposal using ReportLab
    
    Args:
        proposal: DX proposal object
        output_path: Path to save the PDF file
        
    Returns:
        Path to the generated PDF file
    """
    if not output_path:
        fd, output_path = tempfile.mkstemp(suffix='.pdf')
        os.close(fd)
    
    try:
        doc = SimpleDocTemplate(
            output_path,
            pagesize=A4,
            rightMargin=50,
            leftMargin=50,
            topMargin=50,
            bottomMargin=50,
            title=f"{proposal.get('companyInfo', {}).get('name', '企業')} DX提案書",
            author="Mastra DX提案書ジェネレーター",
            subject="デジタルトランスフォーメーション提案書"
        )
        
        styles = getSampleStyleSheet()
        
        styles.add(ParagraphStyle(
            name='DXTitle',
            parent=styles['Title'],
            alignment=TA_CENTER,
            fontSize=24,
            fontName='Helvetica-Bold'
        ))
        
        styles.add(ParagraphStyle(
            name='Subtitle',
            parent=styles['Heading2'],
            alignment=TA_CENTER,
            fontSize=18,
            fontName='Helvetica-Bold'
        ))
        
        styles.add(ParagraphStyle(
            name='SectionTitle',
            parent=styles['Heading2'],
            fontSize=16,
            fontName='Helvetica-Bold',
            textColor=colors.navy
        ))
        
        styles.add(ParagraphStyle(
            name='Normal-JP',
            parent=styles['Normal'],
            fontSize=12,
            fontName='Helvetica',
            alignment=TA_LEFT,
            leading=14
        ))
        
        content = []
        
        content.append(Paragraph("デジタルトランスフォーメーション提案書", styles['DXTitle']))
        content.append(Spacer(1, 12))
        
        company_name = proposal.get('companyInfo', {}).get('name', '企業')
        content.append(Paragraph(f"{company_name} 様", styles['Subtitle']))
        content.append(Spacer(1, 12))
        
        from datetime import datetime
        today = datetime.now()
        date_str = f"作成日: {today.year}年{today.month}月{today.day}日"
        date_style = ParagraphStyle(
            name='Date',
            parent=styles['Normal'],
            alignment=TA_RIGHT,
            fontSize=12
        )
        content.append(Paragraph(date_str, date_style))
        content.append(Spacer(1, 24))
        
        content.append(Paragraph("1. エグゼクティブサマリー", styles['SectionTitle']))
        content.append(Spacer(1, 6))
        content.append(Paragraph(proposal.get('executiveSummary', '情報なし'), styles['Normal-JP']))
        content.append(Spacer(1, 12))
        
        content.append(Paragraph("2. 企業情報", styles['SectionTitle']))
        content.append(Spacer(1, 6))
        
        company_info = proposal.get('companyInfo', {})
        company_info_text = f"""
        業種: {company_info.get('industry', '情報なし')}<br/>
        概要: {company_info.get('description', '情報なし')}<br/>
        主要製品/サービス: {', '.join(company_info.get('products', [])) if company_info.get('products') else '情報なし'}<br/>
        """
        content.append(Paragraph(company_info_text, styles['Normal-JP']))
        content.append(Spacer(1, 12))
        
        content.append(Paragraph("3. ビジネス課題", styles['SectionTitle']))
        content.append(Spacer(1, 6))
        
        challenges = proposal.get('businessChallenges', [])
        if challenges and len(challenges) > 0:
            if isinstance(challenges[0], str):
                challenges_text = '<br/>'.join([f"• {challenge}" for challenge in challenges])
                content.append(Paragraph(challenges_text, styles['Normal-JP']))
            else:
                challenges_list = []
                for challenge in challenges:
                    challenge_text = f"• {challenge.get('title', '')}<br/>"
                    if challenge.get('description'):
                        challenge_text += f"  {challenge.get('description')}<br/>"
                    if challenge.get('impact'):
                        challenge_text += f"  影響: {challenge.get('impact')}<br/>"
                    challenges_list.append(challenge_text)
                
                challenges_text = '<br/>'.join(challenges_list)
                content.append(Paragraph(challenges_text, styles['Normal-JP']))
        else:
            content.append(Paragraph("情報なし", styles['Normal-JP']))
        content.append(Spacer(1, 12))
        
        content.append(Paragraph("4. DX機会", styles['SectionTitle']))
        content.append(Spacer(1, 6))
        
        opportunities = proposal.get('opportunities', [])
        if opportunities and len(opportunities) > 0:
            opportunities_text = ""
            for i, opp in enumerate(opportunities):
                opportunities_text += f"機会 {i+1}: {opp.get('title', opp.get('area', ''))}<br/>"
                
                if opp.get('description'):
                    opportunities_text += f"  説明: {opp.get('description')}<br/>"
                elif opp.get('currentState') and opp.get('targetState'):
                    opportunities_text += f"  現状: {opp.get('currentState')}<br/>"
                    opportunities_text += f"  目標: {opp.get('targetState')}<br/>"
                
                if opp.get('benefits'):
                    opportunities_text += f"  メリット: {', '.join(opp.get('benefits'))}<br/>"
                
                if opp.get('implementation'):
                    opportunities_text += f"  実装: {opp.get('implementation')}<br/>"
                
                if opp.get('timeline'):
                    opportunities_text += f"  タイムライン: {opp.get('timeline')}<br/>"
                
                if opp.get('cost'):
                    opportunities_text += f"  コスト: {opp.get('cost')}<br/>"
                
                if opp.get('priority'):
                    opportunities_text += f"  優先度: {opp.get('priority')}<br/>"
                
                if opp.get('impact'):
                    opportunities_text += f"  効果: {opp.get('impact')}<br/>"
                
                if opp.get('technologies'):
                    opportunities_text += f"  技術: {', '.join(opp.get('technologies'))}<br/>"
                
                opportunities_text += "<br/>"
            
            content.append(Paragraph(opportunities_text, styles['Normal-JP']))
        else:
            content.append(Paragraph("情報なし", styles['Normal-JP']))
        content.append(Spacer(1, 12))
        
        content.append(Paragraph("5. 実装ロードマップ", styles['SectionTitle']))
        content.append(Spacer(1, 6))
        
        roadmap = proposal.get('implementationRoadmap', [])
        if roadmap and len(roadmap) > 0:
            roadmap_text = ""
            for i, phase in enumerate(roadmap):
                roadmap_text += f"{phase.get('phase', f'フェーズ {i+1}')}<br/>"
                
                if phase.get('description'):
                    roadmap_text += f"  説明: {phase.get('description')}<br/>"
                
                if phase.get('timeline'):
                    roadmap_text += f"  期間: {phase.get('timeline')}<br/>"
                
                if phase.get('deliverables') and len(phase.get('deliverables', [])) > 0:
                    roadmap_text += f"  成果物:<br/>"
                    for item in phase.get('deliverables', []):
                        roadmap_text += f"    • {item}<br/>"
                elif phase.get('tasks') and len(phase.get('tasks', [])) > 0:
                    roadmap_text += f"  タスク:<br/>"
                    for item in phase.get('tasks', []):
                        roadmap_text += f"    • {item}<br/>"
                
                if phase.get('milestones') and len(phase.get('milestones', [])) > 0:
                    roadmap_text += f"  マイルストーン:<br/>"
                    for item in phase.get('milestones', []):
                        roadmap_text += f"    • {item}<br/>"
                
                if phase.get('resources'):
                    roadmap_text += f"  リソース: {phase.get('resources')}<br/>"
                
                roadmap_text += "<br/>"
            
            content.append(Paragraph(roadmap_text, styles['Normal-JP']))
        else:
            content.append(Paragraph("情報なし", styles['Normal-JP']))
        content.append(Spacer(1, 12))
        
        content.append(Paragraph("6. 投資概要", styles['SectionTitle']))
        content.append(Spacer(1, 6))
        
        investment = proposal.get('investmentSummary', {})
        if investment:
            investment_text = ""
            
            if investment.get('totalCost'):
                investment_text += f"総コスト: {investment.get('totalCost')}<br/><br/>"
            
            if investment.get('breakdown') and len(investment.get('breakdown', {})) > 0:
                investment_text += f"内訳:<br/>"
                for key, value in investment.get('breakdown', {}).items():
                    investment_text += f"  • {key}: {value}<br/>"
                investment_text += "<br/>"
            
            if investment.get('roi'):
                investment_text += f"ROI: {investment.get('roi')}<br/><br/>"
            
            if investment.get('paybackPeriod'):
                investment_text += f"回収期間: {investment.get('paybackPeriod')}<br/>"
            
            content.append(Paragraph(investment_text, styles['Normal-JP']))
        else:
            content.append(Paragraph("情報なし", styles['Normal-JP']))
        content.append(Spacer(1, 12))
        
        content.append(Paragraph("7. 結論", styles['SectionTitle']))
        content.append(Spacer(1, 6))
        content.append(Paragraph(proposal.get('conclusion', '情報なし'), styles['Normal-JP']))
        
        doc.build(
            content,
            onFirstPage=add_footer,
            onLaterPages=add_footer
        )
        
        return output_path
    except Exception as e:
        print(f"Error generating PDF: {e}")
        if output_path and os.path.exists(output_path):
            os.unlink(output_path)
        raise RuntimeError(f"PDF生成中にエラーが発生しました: {e}")

def add_footer(canvas, doc):
    """Add footer to each page"""
    canvas.saveState()
    
    canvas.setFont('Helvetica', 10)
    canvas.drawCentredString(
        doc.width / 2 + doc.leftMargin,
        doc.bottomMargin - 30,
        '© Mastra DX提案書ジェネレーター'
    )
    
    canvas.drawCentredString(
        doc.width / 2 + doc.leftMargin,
        doc.bottomMargin - 45,
        f"{doc.page} / {doc.pageCount()}"
    )
    
    canvas.restoreState()
