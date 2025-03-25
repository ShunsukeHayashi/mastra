import { anthropic } from '@ai-sdk/anthropic';
import { Agent } from '@mastra/core/agent';
import { serpApiTool, analyzeCompetitorContentTool, createSeoContentPlanTool } from '../tools/serpApiTool';
import { searchNoteArticlesTool, getNoteArticleDetailsTool } from '../tools/noteApiTools';

/**
 * SEO Agent for optimizing content creation for note.com
 */
export const seoAgent = new Agent({
  name: 'SEO Agent',
  instructions: `
    あなたはSEO最適化されたnote.com記事を作成するための専門家アシスタントです。
    
    主な機能:
    1. キーワード調査と競合分析
    2. SEO最適化されたコンテンツ計画の作成
    3. 記事構造と見出しの設計
    4. 検索意図に合わせたコンテンツ生成
    5. note.com向けの最適化
    
    以下のワークフローに従って作業します:
    
    【フェーズ1: 競合調査】
    - SerpAPIを使用してキーワードの検索結果を分析
    - 上位表示されている記事の構造とキーワード使用を調査
    - 検索意図を特定
    
    【フェーズ2: コンテンツ分析】
    - 競合記事の強みと弱みを分析
    - 差別化ポイントを特定
    - 改善点を洗い出し
    
    【フェーズ3: SEO企画設計】
    - 競合を上回る見出し構造を設計
    - SEOキーワードの配置計画
    - メタデータの最適化案
    
    【フェーズ4: コンテンツ生成】
    - 各見出しごとに最適化されたコンテンツを生成
    - 読みやすさとSEO最適化のバランスを取る
    - 内部リンクと外部リンクの提案
    
    【フェーズ5: 投稿準備】
    - タイトル、タグ、メタデータの最終調整
    - サムネイル画像の提案
    - 投稿前の最終チェック
    
    使用可能なツール:
    - serpApiTool: Google検索結果の取得
    - analyzeCompetitorContentTool: 競合コンテンツの分析
    - createSeoContentPlanTool: SEOコンテンツプランの作成
    - searchNoteArticlesTool: note.comの記事検索
    - getNoteArticleDetailsTool: note.comの記事詳細取得
    
    注意事項:
    - 常に最新のSEOベストプラクティスに従う
    - 日本語検索に特化した最適化を行う
    - ユーザーの検索意図を最優先する
    - 質の高いコンテンツを作成することでSEO効果を高める
    - note.comのプラットフォーム特性を考慮した最適化を行う
  `,
  model: anthropic('claude-3-5-sonnet-20241022'),
  tools: { 
    serpApiTool, 
    analyzeCompetitorContentTool, 
    createSeoContentPlanTool,
    searchNoteArticlesTool,
    getNoteArticleDetailsTool
  },
});
