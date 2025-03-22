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

    // 記事生成のプロンプト - 感動品質の強化
    const prompt = `
      以下の情報に基づいて、「${analysisData.topic}」に関する感動品質の記事を作成してください。
      
      ## 【最重要】感動品質の要素（すべて必須）
      1. 具体的な時間・場所・状況から始める個人的なエピソード
         例：「2023年8月の猛暑日、私は自宅のエアコンが壊れた部屋で${analysisData.topic}に取り組んでいました...」
      
      2. 感情の起伏を含む具体的な失敗体験
         例：「3回連続で失敗し、上司からの信頼を失い、深夜に一人涙を流しました...」
      
      3. 感情表現を豊富に含める（最低5つ以上）
         - 「焦り」「不安」「絶望」「喜び」「安堵」「後悔」「驚き」「感動」など
         - 単に感情の名前を書くのではなく、その感情を感じた状況と身体的反応も描写
         例：「胸が締め付けられるような不安で、手が震えていました」
      
      4. 各セクションに必ず「私は〜」「私が〜」という一人称表現
         - 単なる事実の説明ではなく、あなた自身の主観的な意見や感想を含める
         例：「私はこの方法が最も効果的だと確信しています」「私が最も重視しているのは...」
      
      5. 読者への直接的な語りかけ（最低5回以上）
         - 「あなたも〇〇と感じたことはありませんか？」
         - 「あなたならどうしますか？」
         - 「あなたの経験を想像してみてください」
         - 「あなたにとって最も重要なのは何ですか？」
      
      6. 具体的なストーリーの起承転結
         - 起：具体的な問題状況（時間・場所・感情を含む）
         - 承：問題への取り組みと失敗（具体的な数字や状況）
         - 転：転機となった気づきや出会い（感情の変化を含む）
         - 結：成功体験と学び（読者への示唆を含む）
      
      7. 読者との対話を促す具体的な結論
         - 「あなたの${analysisData.topic}に関する体験をぜひコメントで教えてください」
         - 「最も役立ったポイントは何でしたか？」
         - 「あなたならどのように応用しますか？」
      
      ## 競合記事の情報
      ${JSON.stringify(analysisData.topArticles, null, 2)}

      ## 推奨される記事構成
      ${analysisData.recommendedStructure.join('\n')}

      ## キーワード密度
      推奨キーワード密度: ${analysisData.keywordDensity}%

      ## 記事の要件
      - Markdown形式で作成
      - タイトルは感情を喚起する魅力的なものに（「〜の秘密」「私が〜で学んだこと」など）
      - リード文はあなた自身の具体的な経験から始まる導入部
      - H2見出しで大きく区切り、必要に応じてH3見出しも使用
      - 各セクションは読者の感情に訴えかける内容を含める
      - 専門知識だけでなく、あなた自身の経験や考えを織り交ぜる
      - 競合記事よりも詳細で価値のある情報を提供
      - 最後に読者との対話を促す結論

      記事全体の構成は以下の形式で作成してください：
      
      # [タイトル：感情を喚起する魅力的なもの]
      
      [リード文：あなた自身の具体的な経験から始まる導入部]
      
      ## [H2見出し1：問題提起や状況設定]
      
      [本文：あなた自身の経験と感情を含む内容]
      
      ### [H3見出し（必要に応じて）]
      
      [本文：具体的な事例や体験談]
      
      ## [H2見出し2：解決への取り組みや気づき]
      
      [本文：失敗と成功の体験、感情の変化を含む]
      
      ...
      
      ## まとめ：あなたの学びと読者への問いかけ
      
      [記事の要点のまとめと読者との対話を促す具体的な質問]
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

    // メイン画像用のプロンプト - より感情に訴えかける表現に
    const mainImagePrompt = `${articleData.title}に関する感情的なストーリーを表現した画像。人間の表情（喜び・悲しみ・驚き・感動など）が明確に見える、${articleData.topic}に関連する感動的な瞬間を捉えた写真。ストックフォトではなく、感情の機微が伝わる自然な表情と状況。`;

    // メイン画像を生成
    const mainImageResult = await executeTool(
      imageGenerationTool,
      {
        context: {
          prompt: mainImagePrompt,
          style: '写真風、感情表現、ストーリーテリング',
        }
      },
      'メイン画像の生成に失敗しました'
    );

    // セクション画像のプロンプトを生成 - より感情的で具体的な表現に
    const sectionImagePrompts = headings.slice(0, 3).map(heading => ({
      heading,
      prompt: `${heading}に関する感情的なストーリーの一場面。${articleData.topic}に関連する具体的な状況で、人物の表情や姿勢から感情（挑戦・困難・成功・喜び）が伝わる画像。背景や小物も含めた物語性のある構図。単なる概念図ではなく、感情移入できる瞬間を捉えた写真。`,
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
