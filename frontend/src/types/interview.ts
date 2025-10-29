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
  // Outline localization fields
  draft_outline?: Question[];
  localized_outline?: Question[];
  outline_debug_language?: string;
  outline_interview_language?: string;
  agent_id?: string;              // 🆕 该 interview 专属的 Retell Agent ID
  language?: string;              // 🆕 语言设置 ('en', 'zh', 'es' 等)
  interviewer_template?: string;  // 🆕 使用的面试官模板 ('bob', 'lisa', 'david')
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
  evidence_bank?: EvidenceItem[];

  // Outline skeleton fields (two-step generation)
  outline_skeleton?: OutlineSkeleton;
  outline_generation_status?: OutlineGenerationStatus;
  skeleton_generated_at?: Date;
}

export interface Interview extends InterviewBase, InterviewDetails {}

// New types for enhanced summary features
export interface ObjectiveDeliverables {
  type: string; // e.g., "action_plans", "pricing_analysis", "pain_points", "general"
  content: any; // Dynamic structure based on type
}

export interface CrossInterviewInsight {
  id: string;
  title: string;
  description: string;
  category?: string;
  importance?: 'high' | 'medium' | 'low';
}

export interface EvidenceItem {
  insight_id: string;
  quotes: Array<{
    user: string;
    quote: string;
    interview_id: string;
    timestamp?: number;
  }>;
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
}

/**
 * 大纲生成状态
 */
export type OutlineGenerationStatus =
  | 'draft'                // 初始状态（用户填写了 objective）
  | 'skeleton_generated'   // 骨架已生成（用户可以 review）
  | 'draft_generated'      // 初稿大纲已生成
  | 'localized';           // 已本地化
