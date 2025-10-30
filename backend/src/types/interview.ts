export interface Question {
  id: string;
  question: string;
  follow_up_count: number;
}

export interface Quote {
  quote: string;
  call_id: string;
}

export interface InterviewBase {
  user_id: string;
  organization_id: string;
  name: string;
  interviewer_id: bigint;
  objective: string;
  question_count: number;
  time_duration: string;
  is_anonymous: boolean;
  questions: Question[];
  description: string;
  response_count: bigint;
}

export interface InterviewDetails {
  id: string;
  created_at: Date;
  url: string | null;
  insights: string[];
  quotes: Quote[];
  details: any;
  is_active: boolean;
  theme_color: string;
  logo_url: string;
  respondents: string[];
  readable_slug: string;
  executive_summary?: string;
  objective_deliverables?: ObjectiveDeliverables;
  cross_interview_insights?: CrossInterviewInsight[];
  // evidence_bank is deprecated - quotes are now embedded in cross_interview_insights

  // Outline localization fields
  draft_outline?: Question[];  // 初稿大纲（调试语言版本）
  localized_outline?: Question[];  // 本地化大纲（访谈语言版本）
  outline_debug_language?: string;  // 大纲调试语言（如 'zh-CN', 'en-US', 'ja-JP'）
  outline_interview_language?: string;  // 访谈语言（用于本地化目标）

  // Outline skeleton fields (two-step generation)
  outline_skeleton?: OutlineSkeleton;  // 大纲骨架（Session 主题、目标、背景信息）
  outline_generation_status?: OutlineGenerationStatus;  // 大纲生成状态
  skeleton_generated_at?: Date;  // 骨架生成时间
}

export interface Interview extends InterviewBase, InterviewDetails {}

// New types for enhanced summary features
export interface ObjectiveDeliverables {
  type: string; // e.g., "action_plans", "pricing_analysis", "pain_points", "general"
  content: any; // Dynamic structure based on type
}

export interface SupportingQuote {
  user: string;
  quote: string;
  interview_id: string;
  timestamp?: number;
}

export interface CrossInterviewInsight {
  id: string;
  title: string;
  description: string;
  category: 'consensus' | 'divergent' | 'unexpected' | 'critical';
  importance: 'high' | 'medium' | 'low';
  user_count?: string; // e.g., "4 out of 5 users"
  supporting_quotes: SupportingQuote[]; // 2-4 quotes that support this insight
}

// Deprecated: EvidenceItem is no longer used - quotes are embedded in CrossInterviewInsight
export interface EvidenceItem {
  insight_id: string;
  quotes: SupportingQuote[];
}

// ============================================
// Outline Skeleton Types (Two-Step Generation)
// ============================================

/**
 * 大纲骨架 - 包含 Session 主题、目标、背景信息
 */
export interface OutlineSkeleton {
  sessions: SkeletonSession[];
  metadata: {
    total_sessions: number;
    estimated_duration_minutes: number;
    draft_language: string;
  };
}

/**
 * 单个 Session 的骨架信息
 */
export interface SkeletonSession {
  session_number: number;
  session_title: string;
  session_goal: string;
  background_information: string[];
  must_ask_questions: string[]; // 用户指定的必问问题
}

/**
 * 大纲生成状态
 */
export type OutlineGenerationStatus =
  | 'draft'                // 初始状态（用户填写了 objective）
  | 'skeleton_generated'   // 骨架已生成（用户可以 review）
  | 'draft_generated'      // 初稿大纲已生成
  | 'localized';           // 已本地化
