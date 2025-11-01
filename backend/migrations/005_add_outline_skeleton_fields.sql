-- Migration: 添加大纲骨架和生成状态字段
-- Date: 2025-10-28
-- Description: 支持两步大纲生成流程（骨架 → 完整大纲）

-- ============================================
-- Part 1: 添加骨架和状态字段
-- ============================================

-- 添加大纲骨架字段（Session 主题、目标、背景信息）
ALTER TABLE interview
ADD COLUMN IF NOT EXISTS outline_skeleton JSONB;

-- 添加大纲生成状态字段
ALTER TABLE interview
ADD COLUMN IF NOT EXISTS outline_generation_status VARCHAR(50) DEFAULT 'draft';

-- 添加时间戳字段
ALTER TABLE interview
ADD COLUMN IF NOT EXISTS skeleton_generated_at TIMESTAMP;

-- ============================================
-- Part 2: 添加注释
-- ============================================

COMMENT ON COLUMN interview.outline_skeleton IS '大纲骨架（Session 主题、目标、背景信息）- JSON 格式：{ sessions: [...], metadata: {...} }';
COMMENT ON COLUMN interview.outline_generation_status IS '大纲生成状态：draft（初始）, skeleton_generated（骨架已生成）, draft_generated（初稿已生成）, localized（已本地化）';
COMMENT ON COLUMN interview.skeleton_generated_at IS '骨架生成时间';

-- ============================================
-- Part 3: 数据迁移（向后兼容）
-- ============================================

-- 为已有的 draft_outline 设置状态为 'draft_generated'
UPDATE interview
SET outline_generation_status = 'draft_generated'
WHERE draft_outline IS NOT NULL
  AND outline_generation_status IS NULL;

-- 为已有的 localized_outline 设置状态为 'localized'
UPDATE interview
SET outline_generation_status = 'localized'
WHERE localized_outline IS NOT NULL
  AND outline_generation_status IS NULL;

-- ============================================
-- Part 4: 创建索引（可选，提升查询性能）
-- ============================================

-- 为生成状态创建索引
CREATE INDEX IF NOT EXISTS idx_interview_outline_status 
ON interview (outline_generation_status);

-- 为骨架生成时间创建索引
CREATE INDEX IF NOT EXISTS idx_interview_skeleton_generated 
ON interview (skeleton_generated_at) 
WHERE skeleton_generated_at IS NOT NULL;

-- ============================================
-- Rollback Instructions
-- ============================================

-- 如需回滚，执行以下命令：
-- DROP INDEX IF EXISTS idx_interview_outline_status;
-- DROP INDEX IF EXISTS idx_interview_skeleton_generated;
-- ALTER TABLE interview DROP COLUMN IF EXISTS outline_skeleton;
-- ALTER TABLE interview DROP COLUMN IF EXISTS outline_generation_status;
-- ALTER TABLE interview DROP COLUMN IF EXISTS skeleton_generated_at;

