-- Migration: Add summary fields for enhanced interview analytics
-- Date: 2025-01-20
-- Description: Add fields for storing key insights, important quotes, and study-level summaries

-- ============================================
-- Part 1: Add fields to response table
-- ============================================

-- Add key_insights field to store 3-5 key insights per interview
ALTER TABLE response 
ADD COLUMN IF NOT EXISTS key_insights JSONB DEFAULT '[]'::jsonb;

-- Add important_quotes field to store 5-10 important quotes with timestamps
ALTER TABLE response 
ADD COLUMN IF NOT EXISTS important_quotes JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN response.key_insights IS 'Array of key insights (3-5 items) extracted from the interview, focused on study objective';
COMMENT ON COLUMN response.important_quotes IS 'Array of important quotes with timestamps: [{quote: string, timestamp: number, context: string}]';

-- ============================================
-- Part 2: Add fields to interview table
-- ============================================

-- Add executive_summary field for study-level summary
ALTER TABLE interview 
ADD COLUMN IF NOT EXISTS executive_summary TEXT;

-- Add objective_deliverables field for dynamic deliverables based on study objective
ALTER TABLE interview 
ADD COLUMN IF NOT EXISTS objective_deliverables JSONB DEFAULT '{}'::jsonb;

-- Add cross_interview_insights field for insights across all interviews
ALTER TABLE interview 
ADD COLUMN IF NOT EXISTS cross_interview_insights JSONB DEFAULT '[]'::jsonb;

-- Add evidence_bank field to link insights to user quotes
ALTER TABLE interview 
ADD COLUMN IF NOT EXISTS evidence_bank JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN interview.executive_summary IS 'One-paragraph executive summary of the entire study';
COMMENT ON COLUMN interview.objective_deliverables IS 'Dynamic deliverables extracted from study objective (e.g., action plans, pricing analysis)';
COMMENT ON COLUMN interview.cross_interview_insights IS 'Array of 5-8 deep insights across all interviews';
COMMENT ON COLUMN interview.evidence_bank IS 'Array linking each insight to supporting user quotes: [{insight_id: string, quotes: [{user: string, quote: string, interview_id: string}]}]';

-- ============================================
-- Part 3: Create indexes for performance
-- ============================================

-- Index for querying interviews with summaries
CREATE INDEX IF NOT EXISTS idx_interview_has_summary 
ON interview ((executive_summary IS NOT NULL));

-- Index for querying responses with insights
CREATE INDEX IF NOT EXISTS idx_response_has_insights 
ON response ((key_insights IS NOT NULL AND jsonb_array_length(key_insights) > 0));

-- ============================================
-- Part 4: Data migration (optional)
-- ============================================

-- Initialize empty arrays for existing records
UPDATE response 
SET key_insights = '[]'::jsonb, 
    important_quotes = '[]'::jsonb
WHERE key_insights IS NULL OR important_quotes IS NULL;

UPDATE interview 
SET objective_deliverables = '{}'::jsonb,
    cross_interview_insights = '[]'::jsonb,
    evidence_bank = '[]'::jsonb
WHERE objective_deliverables IS NULL 
   OR cross_interview_insights IS NULL 
   OR evidence_bank IS NULL;

