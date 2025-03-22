import { Step, Workflow } from '@mastra/core/workflows';
import { z } from 'zod';
import { noteArticleAgentWithTools } from '../agents';
import { trendKeywordTool, competitorAnalysisTool, imageGenerationTool, noteDraftSaveTool } from '../tools/noteTools';

// ツールの実行が未定義の場合のエラーハンドリング用ヘルパー関数
const executeTool = async <T, R>(tool: { execute?: (params: T) => Promise<R> }, params: T, errorMessage: string): Promise<R> => {
  if (!tool.execute) {
    throw new Error(`${errorMessage} - ツールの実行関数が見つかりません`);
  }
  return await tool.execute(params);
};

// トピック選定ステップ
const selectTopic = new Step({
  id: 'select-topic',
  description: 'トレンドキーワードを分析し、記事のトピックを選定する',
  inputSchema: z.object({
    category: z.string().optional().describe('カテゴリ（テクノロジー、ライフスタイル、ビジネスなど）'),
    userInput: z.string().optional().describe('ユーザーが指定したキーワードや要望'),
  }),
  execute: async ({ context }) => {
    // トリガーデータを取得
    const triggerData = context?.getStepResult<{
      category?: string;
      userInput?: string;
    }>('trigger');

    // トレンドキーワードを取得
    const trendKeywordResult = await executeTool(
      trendKeywordTool, 
      {
        context: {
          category: triggerData?.category || 'すべて',
        }
      },
      'トレンドキーワード取得に失敗しました'
    );

    // ユーザー入力がある場合は、それを優先
    if (triggerData?.userInput) {
      return {
        selectedTopic: triggerData.userInput,
        suggestedTopics: trendKeywordResult.keywords,
        categories: trendKeywordResult.categories,
      };
    }

    // ユーザー入力がない場合は、トレンドキーワードから選択
    const prompt = `
      以下のトレンドキーワードから、最も記事として価値があり、読者の興味を引くトピックを1つ選んでください。
      選んだトピックについて、なぜそれが良いトピックなのか、簡単な理由も教えてください。

      トレンドキーワード: ${JSON.stringify(trendKeywordResult.keywords)}
    `;

    const response = await noteArticleAgentWithTools.generate([
      {
        role: 'user',
        content: prompt,
      },
    ]);

    // レスポンスからトピックを抽出（実際の実装ではより堅牢な方法が必要）
    const responseText = response.text;
    const topicMatch = responseText.match(/選んだトピック[：:]\s*(.+?)[\n\r]/);
    const selectedTopic = topicMatch ? topicMatch[1].trim() : trendKeywordResult.keywords[0];

    return {
      selectedTopic,
      suggestedTopics: trendKeywordResult.keywords,
      categories: trendKeywordResult.categories,
      agentReasoning: responseText,
    };
  },
});

// 競合分析ステップ
const analyzeCompetitors = new Step({
  id: 'analyze-competitors',
  description: '選択されたトピックに関する競合記事を分析する',
  inputSchema: z.object({
    selectedTopic: z.string(),
  }),
  execute: async ({ context }) => {
    const topicData = context?.getStepResult<{
      selectedTopic: string;
    }>('select-topic');

    if (!topicData) {
      throw new Error('トピックデータが見つかりません');
    }

    // 競合分析を実行
    const analysisResult = await executeTool(
      competitorAnalysisTool,
      {
        context: {
          keyword: topicData.selectedTopic
        }
      },
      '競合分析の実行に失敗しました'
    );

    return {
      ...analysisResult,
      topic: topicData.selectedTopic,
    };
  },
});

// 記事生成ステップ
const generateArticle = new Step({
  id: 'generate-article',
  description: '分析結果に基づいて記事を生成する',
  inputSchema: z.object({
    topic: z.string(),
    topArticles: z.array(z.object({
      title: z.string(),
      url: z.string(),
      keyPoints: z.array(z.string()),
    })),
    recommendedStructure: z.array(z.string()),
    keywordDensity: z.number(),
  }),
  execute: async ({ context }) => {
    const analysisData = context?.getStepResult<{
      topic: string;
      topArticles: Array<{
        title: string;
        url: string;
        keyPoints: string[];
      }>;
      recommendedStructure: string[];
      keywordDensity: number;
    }>('analyze-competitors');

    if (!analysisData) {
      throw new Error('分析データが見つかりません');
    }

    // 記事生成のプロンプト
    const prompt = `
      以下の情報に基づいて、「${analysisData.topic}」に関する記事を作成してください。

      ## 競合記事の情報
      ${JSON.stringify(analysisData.topArticles, null, 2)}

      ## 推奨される記事構成
      ${analysisData.recommendedStructure.join('\n')}

      ## キーワード密度
      推奨キーワード密度: ${analysisData.keywordDensity}%

      ## 記事の要件
      - Markdown形式で作成
      - タイトルは魅力的で検索されやすいものに
      - リード文で記事の要点を簡潔に伝える
      - H2見出しで大きく区切り、必要に応じてH3見出しも使用
      - 各セクションは読みやすく、情報価値の高い内容に
      - 箇条書きや引用を適切に使用
      - 競合記事よりも詳細で価値のある情報を提供
      - SEO最適化を意識（キーワード密度、見出し構造など）
      - 最後にまとめと次のアクションを促す結論

      記事全体の構成は以下の形式で作成してください：
      
      # [タイトル]
      
      [リード文：記事の概要と読者が得られる価値]
      
      ## [H2見出し1]
      
      [本文]
      
      ### [H3見出し（必要に応じて）]
      
      [本文]
      
      ## [H2見出し2]
      
      [本文]
      
      ...
      
      ## まとめ
      
      [記事の要点のまとめと次のアクションの提案]
    `;

    const response = await noteArticleAgentWithTools.generate([
      {
        role: 'user',
        content: prompt,
      },
    ]);

    const articleContent = response.text;

    // タイトルを抽出（実際の実装ではより堅牢な方法が必要）
    const titleMatch = articleContent.match(/# (.+?)[\n\r]/);
    const title = titleMatch ? titleMatch[1].trim() : analysisData.topic;

    // タグを生成
    const tagsPrompt = `
      以下の記事に適したタグを5つ程度提案してください。SEO効果が高く、記事の内容を適切に表すタグを選んでください。
      
      記事タイトル: ${title}
      記事トピック: ${analysisData.topic}
      
      タグはカンマ区切りのリストで返してください。
    `;

    const tagsResponse = await noteArticleAgentWithTools.generate([
      {
        role: 'user',
        content: tagsPrompt,
      },
    ]);

    // タグを抽出（実際の実装ではより堅牢な方法が必要）
    const tagsText = tagsResponse.text;
    const tags = tagsText
      .replace(/タグ[：:]\s*/, '')
      .split(/[,、]/)
      .map((tag: string) => tag.trim())
      .filter((tag: string) => tag.length > 0);

    return {
      title,
      content: articleContent,
      tags,
      topic: analysisData.topic,
    };
  },
});

// 画像生成ステップ
const generateImages = new Step({
  id: 'generate-images',
  description: '記事に使用する画像を生成する',
  inputSchema: z.object({
    title: z.string(),
    content: z.string(),
    topic: z.string(),
  }),
  execute: async ({ context }) => {
    const articleData = context?.getStepResult<{
      title: string;
      content: string;
      topic: string;
    }>('generate-article');

    if (!articleData) {
      throw new Error('記事データが見つかりません');
    }

    // 見出しを抽出（実際の実装ではより堅牢な方法が必要）
    const headings = articleData.content
      .split('\n')
      .filter(line => line.startsWith('## ') || line.startsWith('# '))
      .map(line => line.replace(/^#+ /, '').trim());

    // メイン画像用のプロンプト
    const mainImagePrompt = `${articleData.title}の画像、${articleData.topic}に関連する視覚的な表現`;

    // メイン画像を生成
    const mainImageResult = await executeTool(
      imageGenerationTool,
      {
        context: {
          prompt: mainImagePrompt,
          style: '写真風',
        }
      },
      'メイン画像の生成に失敗しました'
    );

    // セクション画像のプロンプトを生成
    const sectionImagePrompts = headings.slice(0, 3).map(heading => ({
      heading,
      prompt: `${heading}、${articleData.topic}に関連する視覚的な表現`,
    }));

    // セクション画像を生成（実際の実装では並列処理が望ましい）
    const sectionImages = [];
    for (const { heading, prompt } of sectionImagePrompts) {
      const imageResult = await executeTool(
        imageGenerationTool,
        {
          context: {
            prompt,
            style: 'イラスト風',
          }
        },
        'セクション画像の生成に失敗しました'
      );
      
      sectionImages.push({
        heading,
        imageUrl: imageResult.imageUrl,
        altText: imageResult.altText,
      });
    }

    return {
      mainImage: {
        imageUrl: mainImageResult.imageUrl,
        altText: mainImageResult.altText,
      },
      sectionImages,
    };
  },
});

// 下書き保存ステップ
const saveDraft = new Step({
  id: 'save-draft',
  description: '生成した記事をnote.comに下書き保存する',
  inputSchema: z.object({
    title: z.string(),
    content: z.string(),
    tags: z.array(z.string()),
    mainImage: z.object({
      imageUrl: z.string(),
      altText: z.string(),
    }),
    sectionImages: z.array(z.object({
      heading: z.string(),
      imageUrl: z.string(),
      altText: z.string(),
    })),
  }),
  execute: async ({ context }) => {
    const articleData = context?.getStepResult<{
      title: string;
      content: string;
      tags: string[];
    }>('generate-article');

    const imageData = context?.getStepResult<{
      mainImage: {
        imageUrl: string;
        altText: string;
      };
      sectionImages: Array<{
        heading: string;
        imageUrl: string;
        altText: string;
      }>;
    }>('generate-images');

    if (!articleData || !imageData) {
      throw new Error('記事データまたは画像データが見つかりません');
    }

    // 画像を記事に挿入
    let contentWithImages = articleData.content;
    
    // メイン画像を挿入（タイトルの直後）
    contentWithImages = contentWithImages.replace(
      /^# .+?\n\n/,
      match => `${match}![${imageData.mainImage.altText}](${imageData.mainImage.imageUrl})\n\n`
    );

    // セクション画像を挿入
    for (const { heading, imageUrl, altText } of imageData.sectionImages) {
      const headingRegex = new RegExp(`## ${heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\n\\n`);
      contentWithImages = contentWithImages.replace(
        headingRegex,
        match => `${match}![${altText}](${imageUrl})\n\n`
      );
    }

    // 画像URLのリストを作成
    const imageUrls = [
      imageData.mainImage.imageUrl,
      ...imageData.sectionImages.map(img => img.imageUrl),
    ];

    // 下書き保存を実行
    const saveResult = await executeTool(
      noteDraftSaveTool,
      {
        context: {
          title: articleData.title,
          content: contentWithImages,
          tags: articleData.tags,
          imageUrls,
        }
      },
      '記事の下書き保存に失敗しました'
    );

    return {
      ...saveResult,
      title: articleData.title,
      contentPreview: contentWithImages.substring(0, 500) + '...',
    };
  },
});

// ワークフローの定義
export const noteArticleWorkflow = new Workflow({
  name: 'note-article-workflow',
  triggerSchema: z.object({
    category: z.string().optional().describe('カテゴリ（テクノロジー、ライフスタイル、ビジネスなど）'),
    userInput: z.string().optional().describe('ユーザーが指定したキーワードや要望'),
  }),
})
  .step(selectTopic)
  .then(analyzeCompetitors)
  .then(generateArticle)
  .then(generateImages)
  .then(saveDraft);

// ワークフローをコミット
noteArticleWorkflow.commit();
