import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { CompanyInfo, DXOpportunity } from '../utils/companyResearch';

const SERP_API_KEY = process.env.SERP_API_KEY || '';

/**
 * Tool to extract company information from a URL
 */
export const extractCompanyInfoTool = createTool({
  id: 'extract-company-info',
  description: '企業のURLから会社情報を抽出します',
  inputSchema: z.object({
    companyUrl: z.string().describe('企業のURL'),
  }),
  outputSchema: CompanyInfo,
  execute: async ({ context }) => {
    try {
      const url = new URL(context.companyUrl);
      const domain = url.hostname.replace('www.', '');
      
      const params = new URLSearchParams({
        api_key: SERP_API_KEY,
        engine: 'google',
        q: `${domain} 会社概要 OR 企業情報`,
        location: 'Japan',
        google_domain: 'google.co.jp',
        gl: 'jp',
        hl: 'ja',
        num: '10',
      });
      
      const response = await fetch(`https://serpapi.com/search?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`SerpAPI request failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      const organicResults = data.organic_results || [];
      const knowledgeGraph = data.knowledge_graph || {};
      
      const companyName = knowledgeGraph.title || domain.split('.')[0];
      
      const industry = knowledgeGraph.type || '不明';
      
      const description = knowledgeGraph.description || 
        (organicResults.length > 0 ? organicResults[0].snippet : '情報なし');
      
      const products: string[] = [];
      organicResults.forEach((result: any) => {
        const title = result.title || '';
        const snippet = result.snippet || '';
        
        if (title.includes('製品') || title.includes('サービス') || 
            snippet.includes('製品') || snippet.includes('サービス')) {
          const productMatch = snippet.match(/「([^」]+)」|『([^』]+)』/g);
          if (productMatch) {
            productMatch.forEach((match: string) => {
              const product = match.replace(/[「」『』]/g, '').trim();
              if (product && !products.includes(product)) {
                products.push(product);
              }
            });
          }
        }
      });
      
      if (products.length === 0) {
        products.push('情報なし');
      }
      
      const sizeMatch = description.match(/(\d+人|従業員数[：:]?\s*\d+|\d+名の従業員)/);
      const size = sizeMatch ? sizeMatch[0] : undefined;
      
      const foundedMatch = description.match(/(設立[：:]\s*\d+年|(\d{4})年設立)/);
      const founded = foundedMatch ? foundedMatch[0] : undefined;
      
      const locationMatch = description.match(/(本社[：:]\s*[^、。]+|東京都[^、。]+|大阪府[^、。]+|愛知県[^、。]+|[都道府県][^、。]+)/);
      const location = locationMatch ? locationMatch[0] : undefined;
      
      const technologies: string[] = [];
      const techKeywords = ['AI', '人工知能', 'クラウド', 'IoT', 'ブロックチェーン', 'DX', 'デジタルトランスフォーメーション'];
      
      organicResults.forEach((result: any) => {
        const snippet = result.snippet || '';
        techKeywords.forEach(keyword => {
          if (snippet.includes(keyword) && !technologies.includes(keyword)) {
            technologies.push(keyword);
          }
        });
      });
      
      const challenges: string[] = [];
      const challengeKeywords = ['課題', '問題', 'ニーズ', '改善', '効率化', 'コスト削減'];
      
      organicResults.forEach((result: any) => {
        const snippet = result.snippet || '';
        challengeKeywords.forEach(keyword => {
          if (snippet.includes(keyword)) {
            const sentenceMatch = snippet.match(new RegExp(`[^。]*${keyword}[^。]*。`));
            if (sentenceMatch && !challenges.includes(sentenceMatch[0])) {
              challenges.push(sentenceMatch[0]);
            }
          }
        });
      });
      
      return {
        name: companyName,
        industry: industry,
        description: description,
        products: products,
        size: size,
        founded: founded,
        location: location,
        technologies: technologies.length > 0 ? technologies : undefined,
        challenges: challenges.length > 0 ? challenges : undefined,
        competitors: undefined, // Would require additional search
      };
    } catch (error: any) {
      console.error('Error extracting company info:', error);
      return {
        name: context.companyUrl.split('//')[1].split('/')[0].replace('www.', ''),
        industry: '情報なし',
        description: '情報の抽出に失敗しました。',
        products: ['情報なし'],
      };
    }
  },
});

/**
 * Tool to analyze company information and identify DX opportunities
 */
export const analyzeDXOpportunitiesTool = createTool({
  id: 'analyze-dx-opportunities',
  description: '企業情報を分析してDX機会を特定します',
  inputSchema: z.object({
    companyInfo: CompanyInfo,
  }),
  outputSchema: z.object({
    opportunities: z.array(DXOpportunity),
  }),
  execute: async ({ context }) => {
    try {
      const standardOpportunities = [];
      
      standardOpportunities.push({
        area: '業務プロセス自動化',
        currentState: '手動での業務処理による非効率性と人的ミスのリスク',
        targetState: 'RPAとAIによる業務プロセスの自動化と効率化',
        impact: '業務効率の向上、人的ミスの削減、コスト削減、従業員の高付加価値業務へのシフト',
        difficulty: '中' as const,
        priority: '高' as const,
        technologies: ['RPA', 'ワークフロー自動化', 'AI', 'OCR'],
        estimatedCost: '500万円〜1,000万円',
        estimatedTimeframe: '3〜6ヶ月',
        kpis: ['業務処理時間の削減率', '人的ミスの削減率', 'コスト削減額'],
      });
      
      standardOpportunities.push({
        area: 'データ分析基盤の構築',
        currentState: '分散したデータソースと限定的な分析能力',
        targetState: '統合されたデータ分析基盤による迅速な意思決定支援',
        impact: 'データドリブンな意思決定、市場トレンドの早期把握、競争優位性の確保',
        difficulty: '高' as const,
        priority: '中' as const,
        technologies: ['ビッグデータ', 'データウェアハウス', 'BI', '機械学習'],
        estimatedCost: '1,000万円〜2,000万円',
        estimatedTimeframe: '6〜12ヶ月',
        kpis: ['データ分析サイクルの短縮', '予測精度の向上', '意思決定スピードの向上'],
      });
      
      if (context.companyInfo.industry.includes('製造') || context.companyInfo.products.some(p => p.includes('製造'))) {
        standardOpportunities.push({
          area: 'スマートファクトリー化',
          currentState: '従来型の製造ラインと限定的な生産データ活用',
          targetState: 'IoTとAIを活用したスマートファクトリーの実現',
          impact: '生産効率の向上、品質向上、在庫最適化、予知保全による設備稼働率向上',
          difficulty: '高' as const,
          priority: '高' as const,
          technologies: ['IoT', '産業用センサー', 'エッジコンピューティング', 'デジタルツイン'],
          estimatedCost: '3,000万円〜5,000万円',
          estimatedTimeframe: '12〜18ヶ月',
          kpis: ['生産効率向上率', '不良品率の低減', '設備稼働率の向上'],
        });
      }
      
      if (context.companyInfo.industry.includes('小売') || context.companyInfo.products.some(p => p.includes('販売'))) {
        standardOpportunities.push({
          area: 'オムニチャネル顧客体験の最適化',
          currentState: 'チャネル間で分断された顧客体験と限定的な顧客データ活用',
          targetState: 'シームレスなオムニチャネル体験と顧客データの統合活用',
          impact: '顧客満足度向上、顧客生涯価値の増大、販売機会の最大化',
          difficulty: '中' as const,
          priority: '高' as const,
          technologies: ['CRM', 'カスタマージャーニー分析', 'パーソナライゼーション', 'モバイルアプリ'],
          estimatedCost: '2,000万円〜3,000万円',
          estimatedTimeframe: '6〜12ヶ月',
          kpis: ['顧客満足度', 'リピート率', '顧客単価の向上'],
        });
      }
      
      if (context.companyInfo.industry.includes('金融') || context.companyInfo.products.some(p => p.includes('金融'))) {
        standardOpportunities.push({
          area: 'フィンテック導入とデジタルバンキング',
          currentState: '従来型の金融サービス提供モデルとレガシーシステム',
          targetState: 'APIエコノミーを活用したフィンテックサービスの展開',
          impact: '新規顧客獲得、顧客体験向上、運用コスト削減、新規収益源の創出',
          difficulty: '高' as const,
          priority: '高' as const,
          technologies: ['API', 'ブロックチェーン', 'クラウドネイティブ', 'マイクロサービス'],
          estimatedCost: '5,000万円〜1億円',
          estimatedTimeframe: '12〜24ヶ月',
          kpis: ['デジタルチャネル利用率', '顧客獲得コスト削減', '新規サービス収益'],
        });
      }
      
      if (context.companyInfo.challenges && context.companyInfo.challenges.length > 0) {
        context.companyInfo.challenges.forEach((challenge, index) => {
          if (index < 2) { // Limit to 2 challenge-based opportunities
            if (challenge.includes('効率')) {
              standardOpportunities.push({
                area: 'ワークスタイル変革',
                currentState: '従来型のワークスタイルによる生産性の限界',
                targetState: 'デジタルワークプレイスによる場所や時間に縛られない働き方の実現',
                impact: '従業員生産性の向上、優秀な人材の確保・定着、イノベーション創出',
                difficulty: '中' as const,
                priority: '中' as const,
                technologies: ['クラウドコラボレーション', 'モバイルワーク', 'VR/AR', 'AI支援ツール'],
                estimatedCost: '1,000万円〜2,000万円',
                estimatedTimeframe: '6〜12ヶ月',
                kpis: ['従業員満足度', '生産性向上率', 'イノベーション指標'],
              });
            } else if (challenge.includes('コスト')) {
              standardOpportunities.push({
                area: 'クラウド移行とITインフラ最適化',
                currentState: 'オンプレミスのレガシーシステムによる高コスト構造',
                targetState: 'クラウドネイティブアーキテクチャへの移行とインフラ最適化',
                impact: 'ITコスト削減、スケーラビリティ向上、ビジネスアジリティの実現',
                difficulty: '中' as const,
                priority: '高' as const,
                technologies: ['クラウド', 'コンテナ', 'マイクロサービス', 'DevOps'],
                estimatedCost: '2,000万円〜4,000万円',
                estimatedTimeframe: '9〜15ヶ月',
                kpis: ['ITコスト削減率', 'システム障害時間の削減', 'デプロイ頻度の向上'],
              });
            } else if (challenge.includes('顧客') || challenge.includes('ユーザー')) {
              standardOpportunities.push({
                area: 'カスタマーエクスペリエンス（CX）の革新',
                currentState: '従来型の顧客接点と限定的なパーソナライゼーション',
                targetState: 'データとAIを活用した革新的な顧客体験の提供',
                impact: '顧客満足度向上、顧客維持率向上、競争優位性の確保',
                difficulty: '中' as const,
                priority: '高' as const,
                technologies: ['CX分析', 'AI', 'チャットボット', 'パーソナライゼーション'],
                estimatedCost: '1,500万円〜3,000万円',
                estimatedTimeframe: '6〜12ヶ月',
                kpis: ['顧客満足度', 'NPS', '顧客維持率'],
              });
            }
          }
        });
      }
      
      if (standardOpportunities.length < 3) {
        standardOpportunities.push({
          area: 'デジタルマーケティングの高度化',
          currentState: '従来型のマーケティング手法と限定的なデジタル活用',
          targetState: 'データドリブンなマーケティング戦略とオムニチャネル展開',
          impact: '顧客獲得コスト削減、コンバージョン率向上、マーケティングROI向上',
          difficulty: '中' as const,
          priority: '中' as const,
          technologies: ['マーケティングオートメーション', 'CRM', 'データ分析', 'AI'],
          estimatedCost: '1,000万円〜2,000万円',
          estimatedTimeframe: '3〜9ヶ月',
          kpis: ['顧客獲得コスト', 'コンバージョン率', 'マーケティングROI'],
        });
      }
      
      return {
        opportunities: standardOpportunities,
      };
    } catch (error: any) {
      console.error('Error analyzing DX opportunities:', error);
      return {
        opportunities: [
          {
            area: '業務プロセス自動化',
            currentState: '手動での業務処理による非効率性',
            targetState: 'RPAとAIによる業務プロセスの自動化',
            impact: '業務効率の向上、人的ミスの削減、コスト削減',
            difficulty: '中' as const,
            priority: '高' as const,
            technologies: ['RPA', 'AI', 'ワークフロー自動化'],
          },
          {
            area: 'データ分析基盤の構築',
            currentState: '分散したデータソースと限定的な分析能力',
            targetState: '統合されたデータ分析基盤による意思決定支援',
            impact: 'データドリブンな意思決定、市場トレンドの早期把握',
            difficulty: '高' as const,
            priority: '中' as const,
            technologies: ['ビッグデータ', 'BI', '機械学習'],
          },
          {
            area: 'デジタル顧客体験の向上',
            currentState: '従来型の顧客接点',
            targetState: 'デジタルを活用した革新的な顧客体験',
            impact: '顧客満足度向上、顧客維持率向上',
            difficulty: '中' as const,
            priority: '高' as const,
            technologies: ['CX', 'モバイルアプリ', 'パーソナライゼーション'],
          }
        ]
      };
    }
  },
});
