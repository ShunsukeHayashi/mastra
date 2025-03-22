import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

// トレンドキーワード取得ツール
export const trendKeywordTool = createTool({
  id: 'get-trend-keywords',
  description: '現在のトレンドキーワードを取得する',
  inputSchema: z.object({
    category: z.string().optional().describe('カテゴリ（テクノロジー、ライフスタイル、ビジネスなど）'),
  }),
  outputSchema: z.object({
    keywords: z.array(z.string()),
    categories: z.array(z.string()),
  }),
  execute: async ({ context }) => {
    // 実際の実装ではAPIを使用してトレンドキーワードを取得する
    // 現在はモックデータを返す
    const mockTrends: Record<string, string[]> = {
      'テクノロジー': ['AI', '機械学習', 'Web3', 'ブロックチェーン', 'メタバース'],
      'ライフスタイル': ['ミニマリズム', 'リモートワーク', 'デジタルデトックス', '持続可能性', 'マインドフルネス'],
      'ビジネス': ['DX', 'リモートワーク', 'サブスクリプション', 'SDGs', 'ESG投資'],
      'デザイン': ['ニューモーフィズム', 'ダークモード', '3Dデザイン', 'モーショングラフィックス', 'マイクロインタラクション'],
      'マーケティング': ['インフルエンサーマーケティング', 'コンテンツマーケティング', 'パーソナライゼーション', 'ビデオマーケティング', 'ボイスサーチ最適化'],
    };
    
    const category = context.category || 'すべて';
    
    if (category === 'すべて') {
      const allKeywords = Object.values(mockTrends).flat();
      return {
        keywords: allKeywords,
        categories: Object.keys(mockTrends),
      };
    }
    
    return {
      keywords: mockTrends[category as keyof typeof mockTrends] || [],
      categories: Object.keys(mockTrends),
    };
  },
});

// 競合記事分析ツール
export const competitorAnalysisTool = createTool({
  id: 'analyze-competitors',
  description: '指定されたキーワードに関する競合記事を分析する',
  inputSchema: z.object({
    keyword: z.string().describe('分析するキーワード'),
  }),
  outputSchema: z.object({
    topArticles: z.array(z.object({
      title: z.string(),
      url: z.string(),
      keyPoints: z.array(z.string()),
    })),
    recommendedStructure: z.array(z.string()),
    keywordDensity: z.number(),
  }),
  execute: async ({ context }) => {
    // 実際の実装ではAPIを使用して競合記事を分析する
    // 現在はモックデータを返す
    type AnalysisData = {
      topArticles: Array<{
        title: string;
        url: string;
        keyPoints: string[];
      }>;
      recommendedStructure: string[];
      keywordDensity: number;
    };
    
    const mockAnalysis: Record<string, AnalysisData> = {
      'AI': {
        topArticles: [
          {
            title: 'AIの基礎から応用まで完全ガイド',
            url: 'https://example.com/ai-guide',
            keyPoints: ['AIの歴史', '機械学習の基礎', 'ディープラーニングの応用例', '将来の展望'],
          },
          {
            title: '2025年に注目すべきAI技術トレンド',
            url: 'https://example.com/ai-trends-2025',
            keyPoints: ['生成AI', '自律型AI', 'エッジAI', 'AIと倫理'],
          },
        ],
        recommendedStructure: [
          'AIの基本概念と最新動向',
          '主要なAI技術の解説',
          '産業別のAI活用事例',
          'AIの倫理的課題と対策',
          '今後の展望とキャリアパス',
        ],
        keywordDensity: 2.5,
      },
      'リモートワーク': {
        topArticles: [
          {
            title: 'リモートワーク成功の秘訣：効率と生産性を高める方法',
            url: 'https://example.com/remote-work-success',
            keyPoints: ['環境構築', 'コミュニケーション戦略', 'タイムマネジメント', 'メンタルヘルス'],
          },
          {
            title: 'ハイブリッドワークモデルの導入ガイド',
            url: 'https://example.com/hybrid-work-guide',
            keyPoints: ['オフィス環境の再設計', 'リモートとオフィスのバランス', 'チームビルディング', '評価システム'],
          },
        ],
        recommendedStructure: [
          'リモートワークの現状と課題',
          '効率的な在宅勤務環境の構築方法',
          'リモートコミュニケーションのベストプラクティス',
          'ワークライフバランスの維持方法',
          'ハイブリッドワークへの移行戦略',
        ],
        keywordDensity: 1.8,
      },
    };
    
    const keyword = context.keyword;
    const defaultAnalysis: AnalysisData = {
      topArticles: [
        {
          title: `${keyword}に関する完全ガイド`,
          url: 'https://example.com/guide',
          keyPoints: ['基本概念', '実践方法', '事例紹介', '将来展望'],
        },
      ],
      recommendedStructure: [
        `${keyword}の基本と重要性`,
        `${keyword}の主要な要素と特徴`,
        `${keyword}の実践方法とテクニック`,
        `${keyword}の活用事例`,
        `${keyword}の今後の展望`,
      ],
      keywordDensity: 2.0,
    };
    
    return mockAnalysis[keyword] || defaultAnalysis;
  },
});

// 画像生成ツール
export const imageGenerationTool = createTool({
  id: 'generate-image',
  description: '記事用の画像を生成する',
  inputSchema: z.object({
    prompt: z.string().describe('画像生成のためのプロンプト'),
    style: z.string().optional().describe('画像のスタイル（写真風、イラスト風など）'),
  }),
  outputSchema: z.object({
    imageUrl: z.string(),
    altText: z.string(),
  }),
  execute: async ({ context }) => {
    // 実際の実装ではDALL-E APIなどを使用して画像を生成する
    // 現在はモックデータを返す
    return {
      imageUrl: 'https://example.com/generated-image.jpg',
      altText: `${context.prompt}の画像`,
    };
  },
});

// note.com下書き保存ツール
export const noteDraftSaveTool = createTool({
  id: 'save-note-draft',
  description: 'note.comに記事を下書き保存する',
  inputSchema: z.object({
    title: z.string().describe('記事のタイトル'),
    content: z.string().describe('記事の本文（Markdown形式）'),
    tags: z.array(z.string()).describe('記事のタグ'),
    imageUrls: z.array(z.string()).optional().describe('記事に含める画像のURL'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    draftUrl: z.string().optional(),
    error: z.string().optional(),
  }),
  execute: async ({ context }) => {
    // 実際の実装ではnote.comのAPIを使用して下書き保存する
    // 現在はモックデータを返す
    return {
      success: true,
      draftUrl: 'https://note.com/drafts/123456',
    };
  },
});
