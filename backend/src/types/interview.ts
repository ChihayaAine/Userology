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
