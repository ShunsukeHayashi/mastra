import { Step, Workflow } from '@mastra/core/workflows';
import { z } from 'zod';
import { courseCreationAgentWithTools } from '../agents';
import { 
  courseStructureTool, 
  courseContentTool, 
  exerciseGenerationTool, 
  imageGenerationTool, 
  formatConversionTool, 
  quizGenerationTool, 
  videoSearchTool 
} from '../tools/courseTools';

// ツールの実行が未定義の場合のエラーハンドリング用ヘルパー関数
const executeTool = async <T, R>(tool: { execute?: (params: T) => Promise<R> }, params: T, errorMessage: string): Promise<R> => {
  if (!tool.execute) {
    throw new Error(`${errorMessage} - ツールの実行関数が見つかりません`);
  }
  return await tool.execute(params);
};

// コース情報入力ステップ
const defineCourseParameters = new Step({
  id: 'define-course-parameters',
  description: 'コースの基本情報を定義する',
  inputSchema: z.object({
    theme: z.string().optional().describe('コースのテーマ'),
    difficulty: z.string().optional().describe('難易度（初心者、中級者、上級者）'),
    targetAudience: z.string().optional().describe('対象者'),
    courseLength: z.string().optional().describe('コースの長さ'),
    outputFormat: z.string().optional().describe('出力形式（Markdown、HTML、Teachable向け）'),
  }),
  execute: async ({ context }) => {
    // トリガーデータを取得
    const triggerData = context?.getStepResult<{
      theme?: string;
      difficulty?: string;
      targetAudience?: string;
      courseLength?: string;
      outputFormat?: string;
    }>('trigger');
    
    // デフォルト値の設定
    const theme = triggerData?.theme || 'プログラミング入門';
    const difficulty = triggerData?.difficulty || '初心者';
    const targetAudience = triggerData?.targetAudience || '学生・社会人';
    const courseLength = triggerData?.courseLength || '標準型（10時間）';
    const outputFormat = triggerData?.outputFormat || 'Markdown';
    
    return {
      theme,
      difficulty,
      targetAudience,
      courseLength,
      outputFormat,
    };
  },
});

// コース構造生成ステップ
const generateCourseStructure = new Step({
  id: 'generate-course-structure',
  description: 'コースの全体構造を生成する',
  inputSchema: z.object({
    theme: z.string(),
    difficulty: z.string(),
    targetAudience: z.string(),
    courseLength: z.string(),
  }),
  execute: async ({ context }) => {
    const { theme, difficulty, targetAudience, courseLength } = context?.getStepResult('define-course-parameters') || {};
    
    if (!theme || !difficulty || !targetAudience || !courseLength) {
      throw new Error('コースパラメータが不足しています');
    }
    
    const result = await executeTool(
      courseStructureTool,
      { context: { theme, difficulty, targetAudience, courseLength } },
      'コース構造生成に失敗しました'
    );
    
    return result;
  },
});

// セクションコンテンツ生成ステップ
const generateSectionContent = new Step({
  id: 'generate-section-content',
  description: '各セクションの詳細コンテンツを生成する',
  inputSchema: z.object({
    courseStructure: z.object({
      title: z.string(),
      description: z.string(),
      objectives: z.array(z.string()),
      sections: z.array(z.object({
        title: z.string(),
        description: z.string(),
        duration: z.string(),
        subsections: z.array(z.object({
          title: z.string(),
          contentType: z.string(),
          duration: z.string(),
        })),
      })),
      totalDuration: z.string(),
    }),
    difficulty: z.string(),
  }),
  execute: async ({ context }) => {
    const { courseStructure } = context?.getStepResult('generate-course-structure') || {};
    const { difficulty } = context?.getStepResult('define-course-parameters') || {};
    
    if (!courseStructure || !difficulty) {
      throw new Error('コース構造またはパラメータが不足しています');
    }
    
    const sectionContents = [];
    
    // 各セクションのコンテンツを生成
    for (const section of courseStructure.sections) {
      const sectionContent = {
        title: section.title,
        description: section.description,
        content: '',
        subsections: [],
      };
      
      // セクション本文のコンテンツを生成
      const mainContentResult = await executeTool(
        courseContentTool,
        { 
          context: { 
            title: section.title, 
            description: section.description, 
            difficulty, 
            contentType: '講義' 
          } 
        },
        `セクション「${section.title}」のコンテンツ生成に失敗しました`
      );
      
      sectionContent.content = mainContentResult.content;
      
      // サブセクションのコンテンツを生成
      for (const subsection of section.subsections) {
        const subsectionResult = await executeTool(
          courseContentTool,
          { 
            context: { 
              title: subsection.title, 
              description: `${section.title}の${subsection.title}`, 
              difficulty, 
              contentType: subsection.contentType 
            } 
          },
          `サブセクション「${subsection.title}」のコンテンツ生成に失敗しました`
        );
        
        sectionContent.subsections.push({
          title: subsection.title,
          contentType: subsection.contentType,
          content: subsectionResult.content,
          references: subsectionResult.references,
        });
      }
      
      sectionContents.push(sectionContent);
    }
    
    return { sectionContents };
  },
});

// 演習問題生成ステップ
const generateExercises = new Step({
  id: 'generate-exercises',
  description: 'コース用の演習問題を生成する',
  inputSchema: z.object({
    courseStructure: z.object({
      title: z.string(),
      sections: z.array(z.object({
        title: z.string(),
      })),
    }),
    difficulty: z.string(),
  }),
  execute: async ({ context }) => {
    const { courseStructure } = context?.getStepResult('generate-course-structure') || {};
    const { difficulty } = context?.getStepResult('define-course-parameters') || {};
    
    if (!courseStructure || !difficulty) {
      throw new Error('コース構造またはパラメータが不足しています');
    }
    
    const sectionExercises = [];
    
    // 各セクションの演習問題を生成
    for (const section of courseStructure.sections) {
      // コーディング演習
      const codingExercises = await executeTool(
        exerciseGenerationTool,
        { 
          context: { 
            topic: section.title, 
            difficulty, 
            exerciseType: 'コーディング', 
            count: 2 
          } 
        },
        `セクション「${section.title}」のコーディング演習生成に失敗しました`
      );
      
      // 選択式問題
      const multipleChoiceExercises = await executeTool(
        exerciseGenerationTool,
        { 
          context: { 
            topic: section.title, 
            difficulty, 
            exerciseType: '選択式', 
            count: 3 
          } 
        },
        `セクション「${section.title}」の選択式問題生成に失敗しました`
      );
      
      sectionExercises.push({
        sectionTitle: section.title,
        exercises: {
          coding: codingExercises.exercises,
          multipleChoice: multipleChoiceExercises.exercises,
        },
      });
    }
    
    return { sectionExercises };
  },
});

// 画像生成ステップ
const generateImages = new Step({
  id: 'generate-images',
  description: 'コース用の画像を生成する',
  inputSchema: z.object({
    courseStructure: z.object({
      title: z.string(),
      sections: z.array(z.object({
        title: z.string(),
        description: z.string(),
      })),
    }),
  }),
  execute: async ({ context }) => {
    const { courseStructure } = context?.getStepResult('generate-course-structure') || {};
    
    if (!courseStructure) {
      throw new Error('コース構造が不足しています');
    }
    
    const images = [];
    
    // コース全体の表紙画像
    const coverImagePrompt = `${courseStructure.title}のコース表紙画像。教育的で魅力的なデザイン。`;
    const coverImage = await executeTool(
      imageGenerationTool,
      { context: { prompt: coverImagePrompt } },
      'コース表紙画像の生成に失敗しました'
    );
    
    images.push({
      type: 'cover',
      title: courseStructure.title,
      url: coverImage.imageUrl,
      prompt: coverImagePrompt,
    });
    
    // 各セクションの画像
    for (const section of courseStructure.sections) {
      const sectionImagePrompt = `${section.title}を視覚的に表現した教育的な画像。${section.description}`;
      const sectionImage = await executeTool(
        imageGenerationTool,
        { context: { prompt: sectionImagePrompt } },
        `セクション「${section.title}」の画像生成に失敗しました`
      );
      
      images.push({
        type: 'section',
        title: section.title,
        url: sectionImage.imageUrl,
        prompt: sectionImagePrompt,
      });
    }
    
    return { images };
  },
});

// 参考動画検索ステップ
const searchReferenceVideos = new Step({
  id: 'search-reference-videos',
  description: 'コース内容に関連する参考動画を検索する',
  inputSchema: z.object({
    courseStructure: z.object({
      title: z.string(),
      sections: z.array(z.object({
        title: z.string(),
      })),
    }),
  }),
  execute: async ({ context }) => {
    const { courseStructure } = context?.getStepResult('generate-course-structure') || {};
    
    if (!courseStructure) {
      throw new Error('コース構造が不足しています');
    }
    
    const videos = [];
    
    // コース全体の参考動画
    const courseVideos = await executeTool(
      videoSearchTool,
      { context: { topic: courseStructure.title, language: '日本語', maxResults: 2 } },
      'コース全体の参考動画検索に失敗しました'
    );
    
    videos.push({
      type: 'course',
      title: courseStructure.title,
      videos: courseVideos.videos,
    });
    
    // 各セクションの参考動画
    for (const section of courseStructure.sections) {
      const sectionVideos = await executeTool(
        videoSearchTool,
        { context: { topic: section.title, language: '日本語', maxResults: 2 } },
        `セクション「${section.title}」の参考動画検索に失敗しました`
      );
      
      videos.push({
        type: 'section',
        title: section.title,
        videos: sectionVideos.videos,
      });
    }
    
    return { videos };
  },
});

// 理解度確認クイズ生成ステップ
const generateComprehensionQuiz = new Step({
  id: 'generate-comprehension-quiz',
  description: 'コース内容の理解度を確認するクイズを生成する',
  inputSchema: z.object({
    sectionContents: z.array(z.object({
      title: z.string(),
      content: z.string(),
    })),
    difficulty: z.string(),
  }),
  execute: async ({ context }) => {
    const { sectionContents } = context?.getStepResult('generate-section-content') || {};
    const { difficulty } = context?.getStepResult('define-course-parameters') || {};
    
    if (!sectionContents || !difficulty) {
      throw new Error('セクションコンテンツまたはパラメータが不足しています');
    }
    
    const quizzes = [];
    
    // 各セクションの理解度確認クイズ
    for (const section of sectionContents) {
      const sectionQuiz = await executeTool(
        quizGenerationTool,
        { 
          context: { 
            courseContent: section.content, 
            difficulty, 
            questionCount: 5 
          } 
        },
        `セクション「${section.title}」の理解度確認クイズ生成に失敗しました`
      );
      
      quizzes.push({
        sectionTitle: section.title,
        quiz: sectionQuiz,
      });
    }
    
    // コース全体の総合クイズ
    const allContent = sectionContents.map(section => section.content).join('\n\n');
    const comprehensiveQuiz = await executeTool(
      quizGenerationTool,
      { 
        context: { 
          courseContent: allContent, 
          difficulty, 
          questionCount: 10 
        } 
      },
      'コース全体の総合クイズ生成に失敗しました'
    );
    
    quizzes.push({
      sectionTitle: '総合クイズ',
      quiz: comprehensiveQuiz,
    });
    
    return { quizzes };
  },
});

// フォーマット変換ステップ
const convertFormat = new Step({
  id: 'convert-format',
  description: 'コースコンテンツを指定された形式に変換する',
  inputSchema: z.object({
    sectionContents: z.array(z.object({
      title: z.string(),
      content: z.string(),
      subsections: z.array(z.object({
        title: z.string(),
        content: z.string(),
      })),
    })),
    outputFormat: z.string(),
  }),
  execute: async ({ context }) => {
    const { sectionContents } = context?.getStepResult('generate-section-content') || {};
    const { outputFormat } = context?.getStepResult('define-course-parameters') || {};
    
    if (!sectionContents || !outputFormat) {
      throw new Error('セクションコンテンツまたは出力形式が不足しています');
    }
    
    const convertedContents = [];
    
    // 各セクションのコンテンツを変換
    for (const section of sectionContents) {
      const convertedSection = await executeTool(
        formatConversionTool,
        { 
          context: { 
            content: section.content, 
            targetFormat: outputFormat 
          } 
        },
        `セクション「${section.title}」のフォーマット変換に失敗しました`
      );
      
      const convertedSubsections = [];
      
      // サブセクションのコンテンツを変換
      for (const subsection of section.subsections) {
        const convertedSubsection = await executeTool(
          formatConversionTool,
          { 
            context: { 
              content: subsection.content, 
              targetFormat: outputFormat 
            } 
          },
          `サブセクション「${subsection.title}」のフォーマット変換に失敗しました`
        );
        
        convertedSubsections.push({
          title: subsection.title,
          contentType: subsection.contentType,
          content: convertedSubsection.convertedContent,
          metadata: convertedSubsection.metadata,
        });
      }
      
      convertedContents.push({
        title: section.title,
        content: convertedSection.convertedContent,
        metadata: convertedSection.metadata,
        subsections: convertedSubsections,
      });
    }
    
    return { 
      convertedContents,
      format: outputFormat,
    };
  },
});

// コース作成ワークフロー
export const courseCreationWorkflow = new Workflow({
  id: 'course-creation-workflow',
  description: 'オンラインコースを作成するワークフロー',
  steps: {
    defineCourseParameters,
    generateCourseStructure,
    generateSectionContent,
    generateExercises,
    generateImages,
    searchReferenceVideos,
    generateComprehensionQuiz,
    convertFormat,
  },
});
