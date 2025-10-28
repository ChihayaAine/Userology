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
