-- 添加大纲本地化相关字段
-- 用于支持两步走大纲创建流程：初版-调试定稿-本地化

-- 添加初稿大纲字段（调试语言版本）
ALTER TABLE interview 
ADD COLUMN IF NOT EXISTS draft_outline JSONB;

-- 添加本地化大纲字段（访谈语言版本）
ALTER TABLE interview 
ADD COLUMN IF NOT EXISTS localized_outline JSONB;

-- 添加大纲调试语言字段
ALTER TABLE interview 
ADD COLUMN IF NOT EXISTS outline_debug_language TEXT;

-- 添加访谈语言字段（用于本地化目标）
ALTER TABLE interview 
ADD COLUMN IF NOT EXISTS outline_interview_language TEXT;

-- 添加注释
COMMENT ON COLUMN interview.draft_outline IS '初稿大纲（使用调试语言生成，用于调试和优化）';
COMMENT ON COLUMN interview.localized_outline IS '本地化大纲（基于初稿本地化到访谈语言）';
COMMENT ON COLUMN interview.outline_debug_language IS '大纲调试语言（如 zh-CN, en-US, ja-JP）';
COMMENT ON COLUMN interview.outline_interview_language IS '访谈语言（本地化目标语言）';

