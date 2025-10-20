-- Migration: 合并key_insights和important_quotes为insights_with_evidence
-- Date: 2025-01-20
-- Description: 重构总结数据结构，让每个insight都包含supporting quotes

-- 1. 添加新字段
ALTER TABLE response 
ADD COLUMN IF NOT EXISTS insights_with_evidence JSONB;

-- 2. 迁移现有数据（如果有的话）
-- 注意：这个迁移会丢失quotes和insights之间的关联，因为旧结构没有这个关联
-- 建议：对于已有数据，重新运行AI生成

-- 3. 删除旧字段（可选，建议先保留一段时间作为备份）
-- ALTER TABLE response DROP COLUMN IF EXISTS key_insights;
-- ALTER TABLE response DROP COLUMN IF EXISTS important_quotes;

-- 4. 添加注释
COMMENT ON COLUMN response.insights_with_evidence IS 'Key insights with supporting quotes - each insight contains 2-3 quotes as evidence';

-- Rollback instructions:
-- ALTER TABLE response DROP COLUMN IF EXISTS insights_with_evidence;
-- (如果删除了旧字段，需要从备份恢复)

