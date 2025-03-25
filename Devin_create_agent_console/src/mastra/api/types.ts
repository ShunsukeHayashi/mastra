// Define common types for the API

// SerpAPI related types
export interface SerpApiOrganicResult {
  position?: number;
  title: string;
  link: string;
  snippet?: string;
  source?: string;
}

export interface SerpApiRelatedQuestion {
  question: string;
  title?: string;
  link?: string;
}

export interface SerpApiKnowledgeGraph {
  title?: string;
  type?: string;
  description?: string;
  source?: {
    name?: string;
    link?: string;
  };
  attributes?: Record<string, any>;
}

export interface SerpApiSearchResult {
  organicResults: SerpApiOrganicResult[];
  relatedQuestions?: SerpApiRelatedQuestion[];
  knowledgeGraph?: SerpApiKnowledgeGraph;
  searchMetadata: {
    status: string;
    totalResults?: number;
    searchTime?: number;
    searchQuery: string;
  };
}

// Note.com related types
export interface NoteArticle {
  id: string;
  title: string;
  author: string;
  url: string;
  publishedAt: string;
}

export interface NoteSearchResult {
  articles: NoteArticle[];
  totalCount: number;
}

export interface NoteArticleDetails extends NoteArticle {
  content: string;
  tags?: string[];
}

// Competitor analysis types
export interface CompetitorResult {
  title: string;
  url: string;
  snippet?: string;
  position: number;
}

export interface KeywordInsights {
  searchVolume?: string;
  competitionLevel?: string;
  suggestedKeywords?: string[];
}

export interface CompetitorAnalysisResult {
  topCompetitors: CompetitorResult[];
  keywordInsights: KeywordInsights;
  analysisRecommendations: string[];
}

// SEO content plan types
export interface HeadlineStructure {
  level: number;
  headline: string;
  keyPoints?: string[];
}

export interface SeoContentPlan {
  title: string;
  metaDescription: string;
  headlineStructure: HeadlineStructure[];
  keywordsToInclude: string[];
  contentRecommendations: string[];
  estimatedWordCount: number;
}

// Error response type
export interface ErrorResponse {
  code: number;
  message: string;
  details?: string | Record<string, any>;
}
