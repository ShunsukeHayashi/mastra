import { anthropic } from '@ai-sdk/anthropic';
import { Step, Workflow } from '@mastra/core/workflows';
import { z } from 'zod';
import { 
  themeSelectionAgent, 
  articleStructureAgent, 
  promptDesignAgent, 
  contentGenerationAgent, 
  postOptimizationAgent 
} from '../agents/articleGeneration';
import { 
  searchNoteArticlesTool, 
  getNoteArticleDetailsTool 
} from '../tools/noteApiTools';
import { 
  serpApiTool, 
  analyzeCompetitorContentTool, 
  createSeoContentPlanTool 
} from '../tools/serpApiTool';

/**
 * Step 1: テーマ選定・調査ステップ
 * Theme Selection and Research Step
 */
const themeSelectionStep = new Step({
  id: 'theme-selection',
  description: 'Selects and researches trending themes for note.com articles',
  inputSchema: z.object({
    category: z.string().optional().describe('Optional category to focus on (e.g., self-improvement, book reviews)'),
    excludeKeywords: z.array(z.string()).optional().describe('Keywords to exclude from theme selection'),
  }),
  execute: async ({ context, mastra }) => {
    // Get input from trigger or previous step
    const triggerData = context?.getStepResult<{
      category?: string;
      excludeKeywords?: string[];
    }>('trigger');

    // Prepare the prompt for the theme selection agent
    const prompt = `
      あなたの任務は、note.comで人気を集める記事のテーマを選定・調査することです。
      
      ${triggerData?.category ? `特に「${triggerData.category}」カテゴリに焦点を当ててください。` : '幅広いカテゴリから最適なテーマを選んでください。'}
      ${triggerData?.excludeKeywords && triggerData.excludeKeywords.length > 0 
        ? `以下のキーワードは除外してください: ${triggerData.excludeKeywords.join(', ')}` 
        : ''}
      
      以下のステップに従って作業してください:
      
      1. note.comの最新トレンド記事を調査し、人気のテーマを特定してください
      2. 検索ボリュームの高いキーワードを特定してください
      3. 競合の少ないニッチを発見してください
      4. バズる可能性の高いテーマを3つ選定し、それぞれの理由を説明してください
      5. 最終的に最適なテーマを1つ選び、その理由を詳しく説明してください
      
      結果は以下の形式で返してください:
      
      【調査結果】
      - トレンドキーワード: [キーワードリスト]
      - 人気カテゴリ: [カテゴリリスト]
      
      【候補テーマ】
      1. [テーマ1]: [理由]
      2. [テーマ2]: [理由]
      3. [テーマ3]: [理由]
      
      【選定テーマ】
      テーマ: [最終選定テーマ]
      メインキーワード: [メインキーワード]
      関連キーワード: [関連キーワード]
      選定理由: [理由の詳細]
    `;

    // Call the theme selection agent
    const response = await themeSelectionAgent.stream([
      {
        role: 'user',
        content: prompt,
      },
    ]);

    // Process the response
    let fullResponse = '';
    for await (const chunk of response.textStream) {
      fullResponse += chunk;
    }

    // Extract the selected theme information
    // This is a simple extraction logic and might need to be improved
    const themeMatch = fullResponse.match(/【選定テーマ】[\s\S]*?テーマ: (.*?)[\r\n]/);
    const keywordMatch = fullResponse.match(/メインキーワード: (.*?)[\r\n]/);
    const relatedKeywordsMatch = fullResponse.match(/関連キーワード: (.*?)[\r\n]/);
    
    const selectedTheme = themeMatch ? themeMatch[1].trim() : 'テーマが特定できませんでした';
    const mainKeyword = keywordMatch ? keywordMatch[1].trim() : '';
    const relatedKeywords = relatedKeywordsMatch 
      ? relatedKeywordsMatch[1].split(',').map(k => k.trim()) 
      : [];

    return {
      selectedTheme,
      mainKeyword,
      relatedKeywords,
      fullAnalysis: fullResponse,
    };
  },
});

/**
 * Step 2: 記事構造設計ステップ
 * Article Structure Design Step
 */
const articleStructureStep = new Step({
  id: 'article-structure',
  description: 'Designs the structure of the article based on the selected theme',
  inputSchema: z.object({
    selectedTheme: z.string().describe('The selected theme for the article'),
    mainKeyword: z.string().describe('Main keyword for SEO optimization'),
    relatedKeywords: z.array(z.string()).describe('Related keywords for the article'),
  }),
  execute: async ({ context, mastra }) => {
    // Get input from previous step
    const themeData = context?.getStepResult<{
      selectedTheme: string;
      mainKeyword: string;
      relatedKeywords: string[];
      fullAnalysis: string;
    }>('theme-selection');

    if (!themeData) {
      throw new Error('Theme selection data not found');
    }

    // Prepare the prompt for the article structure agent
    const prompt = `
      あなたの任務は、選定されたテーマに基づいて効果的な記事構造を設計することです。
      
      【テーマ情報】
      テーマ: ${themeData.selectedTheme}
      メインキーワード: ${themeData.mainKeyword}
      関連キーワード: ${themeData.relatedKeywords.join(', ')}
      
      以下のステップに従って作業してください:
      
      1. 選定テーマの競合記事構造を分析してください
      2. 人気記事の見出しパターンを特定してください
      3. 読者の検索意図に合わせた構成要素を特定してください
      4. H1〜H3レベルの見出し階層を設計してください
      5. 各セクションの推奨文字数を設定してください
      
      結果は以下の形式で返してください:
      
      【記事タイトル案】
      [タイトル案1]
      [タイトル案2]
      [タイトル案3]
      
      【記事構造】
      # [H1タイトル]
      
      ## [H2見出し1]
      - 要点:
      - 推奨文字数:
      
      ### [H3小見出し1-1]
      - 要点:
      - 推奨文字数:
      
      ### [H3小見出し1-2]
      - 要点:
      - 推奨文字数:
      
      ## [H2見出し2]
      ...
      
      【SEO最適化ポイント】
      - [ポイント1]
      - [ポイント2]
      ...
    `;

    // Call the article structure agent
    const response = await articleStructureAgent.stream([
      {
        role: 'user',
        content: prompt,
      },
    ]);

    // Process the response
    let fullResponse = '';
    for await (const chunk of response.textStream) {
      fullResponse += chunk;
    }

    // Extract the article structure
    // This is a simple extraction logic and might need to be improved
    const titleMatch = fullResponse.match(/【記事タイトル案】[\s\S]*?(.*?)[\r\n]/);
    const structureMatch = fullResponse.match(/【記事構造】([\s\S]*?)【SEO最適化ポイント】/);
    
    const articleTitle = titleMatch && titleMatch[1].trim() !== '【記事タイトル案】' 
      ? titleMatch[1].trim() 
      : '記事タイトルが特定できませんでした';
    
    const articleStructure = structureMatch ? structureMatch[1].trim() : '';

    // Extract headings from the structure
    const headings = articleStructure.match(/#{1,3}\s+([^\n]+)/g) || [];
    const structuredHeadings = headings.map(heading => {
      const level = (heading.match(/^#+/) || [''])[0].length;
      const text = heading.replace(/^#+\s+/, '');
      return { level, text };
    });

    return {
      articleTitle,
      structuredHeadings,
      fullStructure: fullResponse,
    };
  },
});

/**
 * Step 3: プロンプト設計ステップ
 * Prompt Design Step
 */
const promptDesignStep = new Step({
  id: 'prompt-design',
  description: 'Designs prompts for each section of the article',
  inputSchema: z.object({
    articleTitle: z.string().describe('The title of the article'),
    structuredHeadings: z.array(
      z.object({
        level: z.number(),
        text: z.string(),
      })
    ).describe('Structured headings of the article'),
    mainKeyword: z.string().describe('Main keyword for SEO optimization'),
    relatedKeywords: z.array(z.string()).describe('Related keywords for the article'),
  }),
  execute: async ({ context, mastra }) => {
    // Get input from previous steps
    const themeData = context?.getStepResult<{
      selectedTheme: string;
      mainKeyword: string;
      relatedKeywords: string[];
    }>('theme-selection');

    const structureData = context?.getStepResult<{
      articleTitle: string;
      structuredHeadings: { level: number; text: string }[];
      fullStructure: string;
    }>('article-structure');

    if (!themeData || !structureData) {
      throw new Error('Previous step data not found');
    }

    // Prepare the prompt for the prompt design agent
    const prompt = `
      あなたの任務は、記事の各セクション向けのプロンプトを設計することです。
      
      【記事情報】
      テーマ: ${themeData.selectedTheme}
      タイトル: ${structureData.articleTitle}
      メインキーワード: ${themeData.mainKeyword}
      関連キーワード: ${themeData.relatedKeywords.join(', ')}
      
      【記事構造】
      ${structureData.structuredHeadings.map(h => 
        `${'#'.repeat(h.level)} ${h.text}`
      ).join('\n')}
      
      以下のステップに従って作業してください:
      
      1. 各見出しの目的と必要な情報を特定してください
      2. 各見出しに対応する詳細なプロンプトを作成してください
      3. SEOキーワードの自然な組み込み方を指示してください
      4. 具体例や事例の含め方を指定してください
      
      結果は以下の形式で返してください:
      
      【導入部プロンプト】
      [導入部向けのプロンプト]
      
      【各セクションプロンプト】
      
      # ${structureData.structuredHeadings[0]?.text || 'セクション1'}
      [プロンプト内容]
      
      # ${structureData.structuredHeadings[1]?.text || 'セクション2'}
      [プロンプト内容]
      
      ...
      
      【結論部プロンプト】
      [結論部向けのプロンプト]
    `;

    // Call the prompt design agent
    const response = await promptDesignAgent.stream([
      {
        role: 'user',
        content: prompt,
      },
    ]);

    // Process the response
    let fullResponse = '';
    for await (const chunk of response.textStream) {
      fullResponse += chunk;
    }

    // Extract section prompts
    // This is a simple extraction logic and might need to be improved
    const introMatch = fullResponse.match(/【導入部プロンプト】([\s\S]*?)【各セクションプロンプト】/);
    const conclusionMatch = fullResponse.match(/【結論部プロンプト】([\s\S]*?)$/);
    
    const introPrompt = introMatch ? introMatch[1].trim() : '';
    const conclusionPrompt = conclusionMatch ? conclusionMatch[1].trim() : '';

    // Extract section prompts
    const sectionPrompts = [];
    for (const heading of structureData.structuredHeadings) {
      const headingRegex = new RegExp(`#+ ${heading.text}([\\s\\S]*?)(?=#+ |【結論部プロンプト】|$)`, 'i');
      const match = fullResponse.match(headingRegex);
      if (match) {
        sectionPrompts.push({
          heading: heading.text,
          level: heading.level,
          prompt: match[1].trim(),
        });
      }
    }

    return {
      introPrompt,
      sectionPrompts,
      conclusionPrompt,
      fullPrompts: fullResponse,
    };
  },
});

/**
 * Step 4: 本文生成・評価ステップ
 * Content Generation and Evaluation Step
 */
const contentGenerationStep = new Step({
  id: 'content-generation',
  description: 'Generates and evaluates the content for each section of the article',
  inputSchema: z.object({
    articleTitle: z.string().describe('The title of the article'),
    introPrompt: z.string().describe('Prompt for the introduction section'),
    sectionPrompts: z.array(
      z.object({
        heading: z.string(),
        level: z.number(),
        prompt: z.string(),
      })
    ).describe('Prompts for each section'),
    conclusionPrompt: z.string().describe('Prompt for the conclusion section'),
    mainKeyword: z.string().describe('Main keyword for SEO optimization'),
    relatedKeywords: z.array(z.string()).describe('Related keywords for the article'),
  }),
  execute: async ({ context, mastra }) => {
    // Get input from previous steps
    const themeData = context?.getStepResult<{
      selectedTheme: string;
      mainKeyword: string;
      relatedKeywords: string[];
    }>('theme-selection');

    const structureData = context?.getStepResult<{
      articleTitle: string;
      structuredHeadings: { level: number; text: string }[];
    }>('article-structure');

    const promptData = context?.getStepResult<{
      introPrompt: string;
      sectionPrompts: { heading: string; level: number; prompt: string }[];
      conclusionPrompt: string;
    }>('prompt-design');

    if (!themeData || !structureData || !promptData) {
      throw new Error('Previous step data not found');
    }

    // Generate content for each section
    let articleContent = '';
    let sectionContents = [];

    // Introduction
    const introPrompt = `
      あなたの任務は、以下の記事の導入部を生成することです。
      
      【記事情報】
      タイトル: ${structureData.articleTitle}
      メインキーワード: ${themeData.mainKeyword}
      
      【導入部の指示】
      ${promptData.introPrompt}
      
      以下の評価基準に基づいて高品質な導入部を生成してください:
      - 読者の関心を引く魅力的な書き出し
      - メインキーワードの自然な組み込み
      - 記事の価値提案を明確に伝える
      - 読者の悩みや課題に共感する
      - 記事の全体像を簡潔に紹介する
    `;

    const introResponse = await contentGenerationAgent.stream([
      {
        role: 'user',
        content: introPrompt,
      },
    ]);

    let introContent = '';
    for await (const chunk of introResponse.textStream) {
      introContent += chunk;
    }

    articleContent += `# ${structureData.articleTitle}\n\n${introContent}\n\n`;
    sectionContents.push({
      type: 'introduction',
      heading: structureData.articleTitle,
      content: introContent,
    });

    // Generate content for each section
    for (const section of promptData.sectionPrompts) {
      const sectionPrompt = `
        あなたの任務は、以下の記事セクションの本文を生成することです。
        
        【記事情報】
        タイトル: ${structureData.articleTitle}
        セクション: ${section.heading}
        レベル: ${section.level}
        メインキーワード: ${themeData.mainKeyword}
        関連キーワード: ${themeData.relatedKeywords.join(', ')}
        
        【セクションの指示】
        ${section.prompt}
        
        以下の評価基準に基づいて高品質なセクションを生成してください:
        - 読者にとって価値のある具体的な情報を提供
        - キーワードの自然な組み込み
        - 読みやすく、理解しやすい文章
        - 具体例や事例を含める
        - 読者の関心を維持する魅力的な内容
      `;

      const sectionResponse = await contentGenerationAgent.stream([
        {
          role: 'user',
          content: sectionPrompt,
        },
      ]);

      let sectionContent = '';
      for await (const chunk of sectionResponse.textStream) {
        sectionContent += chunk;
      }

      articleContent += `${'#'.repeat(section.level)} ${section.heading}\n\n${sectionContent}\n\n`;
      sectionContents.push({
        type: 'section',
        heading: section.heading,
        level: section.level,
        content: sectionContent,
      });
    }

    // Conclusion
    const conclusionPrompt = `
      あなたの任務は、以下の記事の結論部を生成することです。
      
      【記事情報】
      タイトル: ${structureData.articleTitle}
      メインキーワード: ${themeData.mainKeyword}
      
      【結論部の指示】
      ${promptData.conclusionPrompt}
      
      以下の評価基準に基づいて高品質な結論部を生成してください:
      - 記事の主要ポイントを簡潔にまとめる
      - 読者に次のアクションを促す
      - メインキーワードを自然に組み込む
      - 読者に価値を提供したことを再確認する
      - 前向きで印象的な締めくくり
    `;

    const conclusionResponse = await contentGenerationAgent.stream([
      {
        role: 'user',
        content: conclusionPrompt,
      },
    ]);

    let conclusionContent = '';
    for await (const chunk of conclusionResponse.textStream) {
      conclusionContent += chunk;
    }

    articleContent += `## まとめ\n\n${conclusionContent}\n`;
    sectionContents.push({
      type: 'conclusion',
      heading: 'まとめ',
      content: conclusionContent,
    });

    // Evaluate the generated content
    const evaluationPrompt = `
      あなたの任務は、生成された記事の品質を評価することです。
      
      【記事情報】
      タイトル: ${structureData.articleTitle}
      メインキーワード: ${themeData.mainKeyword}
      
      【記事全文】
      ${articleContent}
      
      以下の評価基準に基づいて記事を評価してください:
      
      1. 読了率予測 (1-10): 読者が最後まで読む可能性
      2. 読者ニーズ適合性 (1-10): 検索意図との一致度
      3. SEO最適化 (1-10): キーワード配置と密度の適切さ
      4. オリジナリティ (1-10): 競合との差別化ポイント
      5. 実用性 (1-10): 読者が得られる具体的価値
      
      結果は以下の形式で返してください:
      
      【評価結果】
      読了率予測: [スコア]/10 - [理由]
      読者ニーズ適合性: [スコア]/10 - [理由]
      SEO最適化: [スコア]/10 - [理由]
      オリジナリティ: [スコア]/10 - [理由]
      実用性: [スコア]/10 - [理由]
      
      総合評価: [スコア]/10
      
      【改善提案】
      - [提案1]
      - [提案2]
      ...
    `;

    const evaluationResponse = await contentGenerationAgent.stream([
      {
        role: 'user',
        content: evaluationPrompt,
      },
    ]);

    let evaluationResult = '';
    for await (const chunk of evaluationResponse.textStream) {
      evaluationResult += chunk;
    }

    return {
      articleTitle: structureData.articleTitle,
      articleContent,
      sectionContents,
      evaluationResult,
    };
  },
});

/**
 * Step 5: 投稿最適化ステップ
 * Post Optimization Step
 */
const postOptimizationStep = new Step({
  id: 'post-optimization',
  description: 'Optimizes the article for posting on note.com',
  inputSchema: z.object({
    articleTitle: z.string().describe('The title of the article'),
    articleContent: z.string().describe('The full content of the article'),
    sectionContents: z.array(
      z.object({
        type: z.string(),
        heading: z.string(),
        level: z.number().optional(),
        content: z.string(),
      })
    ).describe('Content of each section'),
    evaluationResult: z.string().describe('Evaluation result of the article'),
    mainKeyword: z.string().describe('Main keyword for SEO optimization'),
    relatedKeywords: z.array(z.string()).describe('Related keywords for the article'),
  }),
  execute: async ({ context, mastra }) => {
    // Get input from previous steps
    const themeData = context?.getStepResult<{
      selectedTheme: string;
      mainKeyword: string;
      relatedKeywords: string[];
    }>('theme-selection');

    const contentData = context?.getStepResult<{
      articleTitle: string;
      articleContent: string;
      sectionContents: {
        type: string;
        heading: string;
        level?: number;
        content: string;
      }[];
      evaluationResult: string;
    }>('content-generation');

    if (!themeData || !contentData) {
      throw new Error('Previous step data not found');
    }

    // Prepare the prompt for the post optimization agent
    const prompt = `
      あなたの任務は、note.com向けに記事を最適化することです。
      
      【記事情報】
      タイトル: ${contentData.articleTitle}
      メインキーワード: ${themeData.mainKeyword}
      関連キーワード: ${themeData.relatedKeywords.join(', ')}
      
      【記事全文】
      ${contentData.articleContent}
      
      【評価結果】
      ${contentData.evaluationResult}
      
      以下のステップに従って作業してください:
      
      1. note.comの投稿形式に合わせたフォーマット調整
      2. クリック率を高めるタイトルの最終調整
      3. 検索性を高めるタグの選定
      4. 注目を集めるサムネイル画像の提案
      5. SEO要素の最終確認
      
      結果は以下の形式で返してください:
      
      【最終タイトル】
      [最適化されたタイトル]
      
      【推奨タグ】
      - [タグ1]
      - [タグ2]
      ...
      
      【サムネイル提案】
      [サムネイル画像の説明や提案]
      
      【最終記事】
      [Markdown形式の最終記事]
    `;

    // Call the post optimization agent
    const response = await postOptimizationAgent.stream([
      {
        role: 'user',
        content: prompt,
      },
    ]);

    // Process the response
    let fullResponse = '';
    for await (const chunk of response.textStream) {
      fullResponse += chunk;
    }

    // Extract optimized content
    const titleMatch = fullResponse.match(/【最終タイトル】([\s\S]*?)【推奨タグ】/);
    const tagsMatch = fullResponse.match(/【推奨タグ】([\s\S]*?)【サムネイル提案】/);
    const thumbnailMatch = fullResponse.match(/【サムネイル提案】([\s\S]*?)【最終記事】/);
    const contentMatch = fullResponse.match(/【最終記事】([\s\S]*?)$/);
    
    const optimizedTitle = titleMatch ? titleMatch[1].trim() : contentData.articleTitle;
    
    // Extract tags
    const tagsContent = tagsMatch ? tagsMatch[1].trim() : '';
    const tags = tagsContent
      .split('\n')
      .map(line => line.replace(/^-\s*/, '').trim())
      .filter(tag => tag.length > 0);
    
    const thumbnailSuggestion = thumbnailMatch ? thumbnailMatch[1].trim() : '';
    const optimizedContent = contentMatch ? contentMatch[1].trim() : contentData.articleContent;

    return {
      optimizedTitle,
      tags,
      thumbnailSuggestion,
      optimizedContent,
      originalTitle: contentData.articleTitle,
      originalContent: contentData.articleContent,
    };
  },
});

/**
 * 記事生成ワークフロー
 * Article Generation Workflow
 */
const articleGenerationWorkflow = new Workflow({
  name: 'article-generation-workflow',
  triggerSchema: z.object({
    category: z.string().optional().describe('Optional category to focus on (e.g., self-improvement, book reviews)'),
    excludeKeywords: z.array(z.string()).optional().describe('Keywords to exclude from theme selection'),
  }),
})
  .step(themeSelectionStep)
  .step(articleStructureStep)
  .step(promptDesignStep)
  .step(contentGenerationStep)
  .step(postOptimizationStep);

// Commit the workflow
articleGenerationWorkflow.commit();

export { 
  articleGenerationWorkflow,
  themeSelectionStep,
  articleStructureStep,
  promptDesignStep,
  contentGenerationStep,
  postOptimizationStep
};
