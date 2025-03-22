import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

// ストーリーテンプレート生成ツール
export const storyTemplateTool = createTool({
  id: 'generate-story-template',
  description: '記事用のストーリーテンプレートを生成する',
  inputSchema: z.object({
    topic: z.string().describe('記事のトピック'),
    audience: z.string().optional().describe('対象読者層'),
  }),
  outputSchema: z.object({
    template: z.object({
      personalHook: z.string().describe('個人的な導入エピソード'),
      challenge: z.string().describe('直面した課題や問題'),
      attempt: z.string().describe('解決への試み'),
      resolution: z.string().describe('学びや成功体験'),
      readerPrompt: z.string().describe('読者への問いかけ'),
    }),
  }),
  execute: async ({ context }) => {
    // トピックに関連する個人的なストーリーテンプレートを生成
    // 実際の実装ではAIを活用してカスタマイズされたテンプレートを生成
    
    const topic = context.topic;
    const audience = context.audience || '一般読者';
    
    // 基本テンプレート（実際の実装ではより高度なロジックを使用）
    return {
      template: {
        personalHook: `私は${topic}に興味を持ったとき、最初は全く理解できませんでした。多くの人と同じように、私も${topic}の重要性を見過ごしていたのです。`,
        challenge: `しかし、実際に${topic}に取り組む中で、いくつかの大きな課題に直面しました。特に難しかったのは...`,
        attempt: `そこで私は、いくつかの方法を試してみました。最初は${topic}の基本を学び直し、次に実践的なアプローチとして...`,
        resolution: `この経験から、私は${topic}について重要な教訓を学びました。それは単に知識を得ただけでなく、実際の行動と継続的な改善が大切だということです。`,
        readerPrompt: `あなたも${topic}で同じような課題に直面していますか？もしよろしければ、コメント欄でぜひあなたの経験を共有してください。`,
      }
    };
  },
});
