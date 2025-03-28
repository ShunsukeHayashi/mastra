import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';

/**
 * Generate a PDF file from a DX proposal
 * @param {Object} proposal DX proposal object
 * @param {string} outputPath Path to save the PDF file
 * @returns {Promise<string>} Path to the generated PDF file
 */
export async function generateDXProposalPDF(proposal, outputPath) {
  return new Promise((resolve, reject) => {
    try {
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

      if (!outputPath) {
        const timestamp = new Date().getTime();
        const filename = `dx_proposal_${proposal.companyInfo.name.replace(/\s+/g, '_')}_${timestamp}.pdf`;
        outputPath = path.join('/tmp', filename);
      }

      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);

      doc.font('Helvetica');

      doc.fontSize(24)
        .text('デジタルトランスフォーメーション提案書', { align: 'center' })
        .moveDown(0.5);

      doc.fontSize(18)
        .text(`${proposal.companyInfo.name} 様`, { align: 'center' })
        .moveDown(1);

      const today = new Date();
      const dateStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;
      doc.fontSize(12)
        .text(`作成日: ${dateStr}`, { align: 'right' })
        .moveDown(2);

      addSection(doc, '1. エグゼクティブサマリー', proposal.executiveSummary);

      addSection(doc, '2. 企業情報', `
業種: ${proposal.companyInfo.industry}
概要: ${proposal.companyInfo.description}
主要製品/サービス: ${proposal.companyInfo.products?.join(', ') || '情報なし'}
      `);

      addSection(doc, '3. ビジネス課題', formatBusinessChallenges(proposal.businessChallenges));

      addSection(doc, '4. DX機会', formatOpportunities(proposal.opportunities));

      addSection(doc, '5. 実装ロードマップ', formatRoadmap(proposal.implementationRoadmap));

      addSection(doc, '6. 投資概要', formatInvestmentSummary(proposal.investmentSummary));

      addSection(doc, '7. 結論', proposal.conclusion);

      // Add footer to current page only
      const originalY = doc.y;
      
      doc.fontSize(10)
        .text(
          '© Mastra DX提案書ジェネレーター',
          50,
          doc.page.height - 50,
          { align: 'center', width: doc.page.width - 100 }
        );
      
      doc.text(
        `1 / 1`, // Simplified page numbering
        50,
        doc.page.height - 30,
        { align: 'center', width: doc.page.width - 100 }
      );
      
      doc.y = originalY;

      doc.end();

      stream.on('finish', () => {
        resolve(outputPath || '');
      });

      stream.on('error', (err) => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Add a section to the PDF document
 * @param {PDFKit.PDFDocument} doc PDF document
 * @param {string} title Section title
 * @param {string} content Section content
 */
function addSection(doc, title, content) {
  doc.fontSize(16)
    .fillColor('#1E3A8A')
    .text(title, { underline: true })
    .moveDown(0.5);

  doc.fontSize(12)
    .fillColor('black')
    .text(content, { align: 'justify' })
    .moveDown(1);
}

/**
 * Format business challenges for PDF
 * @param {string[]|Object[]} challenges Business challenges
 * @returns {string} Formatted string
 */
function formatBusinessChallenges(challenges) {
  if (!challenges || challenges.length === 0) {
    return '情報なし';
  }

  if (typeof challenges[0] === 'string') {
    return challenges.map(challenge => `• ${challenge}`).join('\n\n');
  }

  return challenges.map(challenge => {
    return `• ${challenge.title || ''}
  ${challenge.description || ''}
  ${challenge.impact ? `影響: ${challenge.impact}` : ''}`;
  }).join('\n\n');
}

/**
 * Format DX opportunities for PDF
 * @param {Object[]} opportunities DX opportunities
 * @returns {string} Formatted string
 */
function formatOpportunities(opportunities) {
  if (!opportunities || opportunities.length === 0) {
    return '情報なし';
  }

  return opportunities.map((opp, index) => {
    let text = `機会 ${index + 1}: ${opp.title || opp.area || ''}\n`;
    
    if (opp.description) {
      text += `  説明: ${opp.description}\n`;
    }
    
    if (opp.currentState) {
      text += `  現状: ${opp.currentState}\n`;
    }
    
    if (opp.targetState) {
      text += `  目標: ${opp.targetState}\n`;
    }
    
    if (opp.benefits && opp.benefits.length > 0) {
      text += `  メリット: ${opp.benefits.join(', ')}\n`;
    }
    
    if (opp.impact) {
      text += `  効果: ${opp.impact}\n`;
    }
    
    if (opp.implementation) {
      text += `  実装: ${opp.implementation}\n`;
    }
    
    if (opp.timeline) {
      text += `  タイムライン: ${opp.timeline}\n`;
    }
    
    if (opp.cost) {
      text += `  コスト: ${opp.cost}\n`;
    }
    
    if (opp.priority) {
      text += `  優先度: ${opp.priority}\n`;
    }
    
    if (opp.difficulty) {
      text += `  難易度: ${opp.difficulty}\n`;
    }
    
    if (opp.technologies && opp.technologies.length > 0) {
      text += `  技術: ${opp.technologies.join(', ')}\n`;
    }
    
    return text;
  }).join('\n\n');
}

/**
 * Format implementation roadmap for PDF
 * @param {Object[]} roadmap Implementation roadmap
 * @returns {string} Formatted string
 */
function formatRoadmap(roadmap) {
  if (!roadmap || roadmap.length === 0) {
    return '情報なし';
  }

  return roadmap.map((phase, index) => {
    let text = `${phase.phase || `フェーズ ${index + 1}`}\n`;
    
    if (phase.description) {
      text += `  説明: ${phase.description}\n`;
    }
    
    if (phase.timeline) {
      text += `  期間: ${phase.timeline}\n`;
    }
    
    if (phase.deliverables && phase.deliverables.length > 0) {
      text += `  成果物:\n`;
      phase.deliverables.forEach((item) => {
        text += `    • ${item}\n`;
      });
    } else if (phase.tasks && phase.tasks.length > 0) {
      text += `  タスク:\n`;
      phase.tasks.forEach((item) => {
        text += `    • ${item}\n`;
      });
    }
    
    if (phase.milestones && phase.milestones.length > 0) {
      text += `  マイルストーン:\n`;
      phase.milestones.forEach((item) => {
        text += `    • ${item}\n`;
      });
    }
    
    if (phase.resources) {
      text += `  リソース: ${phase.resources}\n`;
    }
    
    return text;
  }).join('\n\n');
}

/**
 * Format investment summary for PDF
 * @param {Object} investment Investment summary
 * @returns {string} Formatted string
 */
function formatInvestmentSummary(investment) {
  if (!investment) {
    return '情報なし';
  }

  let text = '';
  
  if (investment.totalCost) {
    text += `総コスト: ${investment.totalCost}\n\n`;
  }
  
  if (investment.breakdown && Object.keys(investment.breakdown).length > 0) {
    text += `内訳:\n`;
    for (const [key, value] of Object.entries(investment.breakdown)) {
      text += `  • ${key}: ${value}\n`;
    }
    text += '\n';
  }
  
  if (investment.roi) {
    text += `ROI: ${investment.roi}\n\n`;
  }
  
  if (investment.paybackPeriod) {
    text += `回収期間: ${investment.paybackPeriod}\n`;
  }
  
  return text;
}
