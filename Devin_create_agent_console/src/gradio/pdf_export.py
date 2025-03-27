import os
import tempfile
import subprocess
from typing import Dict, Any, Optional

def generate_pdf_from_proposal(proposal: Dict[str, Any], output_path: Optional[str] = None) -> str:
    """
    Generate a PDF file from a DX proposal using Node.js
    
    Args:
        proposal: DX proposal object
        output_path: Path to save the PDF file
        
    Returns:
        Path to the generated PDF file
    """
    with tempfile.NamedTemporaryFile(suffix='.json', mode='w', delete=False) as temp_json:
        import json
        json.dump(proposal, temp_json)
        temp_json_path = temp_json.name
    
    if not output_path:
        fd, output_path = tempfile.mkstemp(suffix='.pdf')
        os.close(fd)
    
    with tempfile.NamedTemporaryFile(suffix='.js', mode='w', delete=False) as temp_script:
        temp_script.write("""
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

// Read the proposal JSON
const proposalJson = fs.readFileSync(process.argv[2], 'utf8');
const proposal = JSON.parse(proposalJson);
const outputPath = process.argv[3];

// Create a document
const doc = new PDFDocument({
  size: 'A4',
  margin: 50,
  info: {
    Title: `${proposal.companyInfo.name} DX提案書`,
    Author: 'Mastra DX提案書ジェネレーター',
    Subject: 'デジタルトランスフォーメーション提案書',
    Keywords: 'DX, デジタルトランスフォーメーション, 提案書',
  }
});

// Pipe its output to a file
const stream = fs.createWriteStream(outputPath);
doc.pipe(stream);

// Set font for Japanese text
doc.font('Helvetica');

// Add header
doc.fontSize(24)
  .text('デジタルトランスフォーメーション提案書', { align: 'center' })
  .moveDown(0.5);

// Add company name
doc.fontSize(18)
  .text(`${proposal.companyInfo.name} 様`, { align: 'center' })
  .moveDown(1);

// Add date
const today = new Date();
const dateStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;
doc.fontSize(12)
  .text(`作成日: ${dateStr}`, { align: 'right' })
  .moveDown(2);

// Add executive summary
addSection(doc, '1. エグゼクティブサマリー', proposal.executiveSummary);

// Add company info
addSection(doc, '2. 企業情報', `
業種: ${proposal.companyInfo.industry}
概要: ${proposal.companyInfo.description}
主要製品/サービス: ${proposal.companyInfo.products?.join(', ') || '情報なし'}
`);

// Add business challenges
addSection(doc, '3. ビジネス課題', formatBusinessChallenges(proposal.businessChallenges));

// Add DX opportunities
addSection(doc, '4. DX機会', formatOpportunities(proposal.opportunities));

// Add implementation roadmap
addSection(doc, '5. 実装ロードマップ', formatRoadmap(proposal.implementationRoadmap));

// Add investment summary
addSection(doc, '6. 投資概要', formatInvestmentSummary(proposal.investmentSummary));

// Add conclusion
addSection(doc, '7. 結論', proposal.conclusion);

// Add footer
const pageCount = doc.bufferedPageRange().count;
for (let i = 0; i < pageCount; i++) {
  doc.switchToPage(i);
  
  // Save the current position
  const originalY = doc.y;
  
  // Move to the bottom of the page
  doc.fontSize(10)
    .text(
      '© Mastra DX提案書ジェネレーター',
      50,
      doc.page.height - 50,
      { align: 'center', width: doc.page.width - 100 }
    );
  
  // Add page number
  doc.text(
    `${i + 1} / ${pageCount}`,
    50,
    doc.page.height - 30,
    { align: 'center', width: doc.page.width - 100 }
  );
  
  // Restore the position
  doc.y = originalY;
}

// Finalize the PDF and end the stream
doc.end();

/**
 * Add a section to the PDF document
 */
function addSection(doc, title, content) {
  // Add section title
  doc.fontSize(16)
    .fillColor('#1E3A8A')
    .text(title, { underline: true })
    .moveDown(0.5);

  // Add section content
  doc.fontSize(12)
    .fillColor('black')
    .text(content, { align: 'justify' })
    .moveDown(1);
}

/**
 * Format business challenges for PDF
 */
function formatBusinessChallenges(challenges) {
  if (!challenges || challenges.length === 0) {
    return '情報なし';
  }

  if (typeof challenges[0] === 'string') {
    return challenges.map(challenge => `• ${challenge}`).join('\\n\\n');
  }

  return challenges.map(challenge => {
    return `• ${challenge.title || ''}
  ${challenge.description || ''}
  ${challenge.impact ? `影響: ${challenge.impact}` : ''}`;
  }).join('\\n\\n');
}

/**
 * Format DX opportunities for PDF
 */
function formatOpportunities(opportunities) {
  if (!opportunities || opportunities.length === 0) {
    return '情報なし';
  }

  return opportunities.map((opp, index) => {
    let text = `機会 ${index + 1}: ${opp.title || opp.area || ''}\\n`;
    
    if (opp.description) {
      text += `  説明: ${opp.description}\\n`;
    } else if (opp.currentState && opp.targetState) {
      text += `  現状: ${opp.currentState}\\n`;
      text += `  目標: ${opp.targetState}\\n`;
    }
    
    if (opp.benefits && opp.benefits.length > 0) {
      text += `  メリット: ${opp.benefits.join(', ')}\\n`;
    }
    
    if (opp.implementation) {
      text += `  実装: ${opp.implementation}\\n`;
    }
    
    if (opp.timeline) {
      text += `  タイムライン: ${opp.timeline}\\n`;
    }
    
    if (opp.cost) {
      text += `  コスト: ${opp.cost}\\n`;
    }
    
    if (opp.priority) {
      text += `  優先度: ${opp.priority}\\n`;
    }
    
    if (opp.impact) {
      text += `  効果: ${opp.impact}\\n`;
    }
    
    if (opp.technologies && opp.technologies.length > 0) {
      text += `  技術: ${opp.technologies.join(', ')}\\n`;
    }
    
    return text;
  }).join('\\n');
}

/**
 * Format implementation roadmap for PDF
 */
function formatRoadmap(roadmap) {
  if (!roadmap || roadmap.length === 0) {
    return '情報なし';
  }

  return roadmap.map((phase, index) => {
    let text = `${phase.phase || `フェーズ ${index + 1}`}\\n`;
    
    if (phase.description) {
      text += `  説明: ${phase.description}\\n`;
    }
    
    if (phase.timeline) {
      text += `  期間: ${phase.timeline}\\n`;
    }
    
    if (phase.deliverables && phase.deliverables.length > 0) {
      text += `  成果物:\\n`;
      phase.deliverables.forEach((item) => {
        text += `    • ${item}\\n`;
      });
    } else if (phase.tasks && phase.tasks.length > 0) {
      text += `  タスク:\\n`;
      phase.tasks.forEach((item) => {
        text += `    • ${item}\\n`;
      });
    }
    
    if (phase.milestones && phase.milestones.length > 0) {
      text += `  マイルストーン:\\n`;
      phase.milestones.forEach((item) => {
        text += `    • ${item}\\n`;
      });
    }
    
    if (phase.resources) {
      text += `  リソース: ${phase.resources}\\n`;
    }
    
    return text;
  }).join('\\n\\n');
}

/**
 * Format investment summary for PDF
 */
function formatInvestmentSummary(investment) {
  if (!investment) {
    return '情報なし';
  }

  let text = '';
  
  if (investment.totalCost) {
    text += `総コスト: ${investment.totalCost}\\n\\n`;
  }
  
  if (investment.breakdown && Object.keys(investment.breakdown).length > 0) {
    text += `内訳:\\n`;
    for (const [key, value] of Object.entries(investment.breakdown)) {
      text += `  • ${key}: ${value}\\n`;
    }
    text += '\\n';
  }
  
  if (investment.roi) {
    text += `ROI: ${investment.roi}\\n\\n`;
  }
  
  if (investment.paybackPeriod) {
    text += `回収期間: ${investment.paybackPeriod}\\n`;
  }
  
  return text;
}
        """)
        temp_script_path = temp_script.name
    
    try:
        subprocess.run(['node', temp_script_path, temp_json_path, output_path], check=True)
        
        os.unlink(temp_json_path)
        os.unlink(temp_script_path)
        
        return output_path
    except subprocess.CalledProcessError as e:
        print(f"Error generating PDF: {e}")
        os.unlink(temp_json_path)
        os.unlink(temp_script_path)
        if os.path.exists(output_path):
            os.unlink(output_path)
        raise RuntimeError(f"PDF生成中にエラーが発生しました: {e}")
