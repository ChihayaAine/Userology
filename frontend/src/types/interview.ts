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
  local_description?: string;     // 🆕 本地化版本的访谈简介
  response_count: bigint;
  // Outline localization fields
  draft_outline?: Question[];
  localized_outline?: Question[];
  outline_debug_language?: string;
  outline_interview_language?: string;
  draft?: string;                 // 当前使用的版本：'draft' 表示初稿，'localized' 表示本地化版本
  context?: string;               // 上传的文档内容，用于生成大纲时提供参考
  custom_instructions?: string;   // 用户的个性化备注/指令
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
/**
 * Session 深度等级
 * - high: 核心目标、痛点发现、竞品分析、功能验证 (5-6 questions)
 * - medium: 背景构建、行为探索、一般体验 (4-5 questions)
 * - low: 热身、收尾 (4 questions)
 */
export type SessionDepthLevel = 'high' | 'medium' | 'low';

export interface SkeletonSession {
  session_number: number;
  session_title: string;
  session_goal: string;
  background_information: string[];
  must_ask_questions: string[]; // 用户指定的必问问题
  depth_level?: SessionDepthLevel; // AI 判断的深度等级（用户可调整）- 可选字段，默认 'medium'
  ai_suggested_depth_level?: SessionDepthLevel; // AI 最初建议的深度等级（不可变）- 用于显示 "AI suggested"
}

/**
 * 大纲生成状态
 */
export type OutlineGenerationStatus =
  | 'draft'                // 初始状态（用户填写了 objective）
  | 'skeleton_generated'   // 骨架已生成（用户可以 review）
  | 'draft_generated'      // 初稿大纲已生成
  | 'localized';           // 已本地化
