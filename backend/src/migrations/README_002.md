# Migration 002: 合并Insights和Quotes

## 目的
将`key_insights`和`important_quotes`合并为`insights_with_evidence`，确保每个insight都有对应的supporting quotes。

## 执行步骤

### 1. 在Supabase Dashboard执行SQL

1. 打开Supabase Dashboard
2. 进入SQL Editor
3. 复制并执行 `002_merge_insights_and_quotes.sql` 的内容

### 2. 验证

执行以下SQL验证字段已添加：

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'response' 
AND column_name = 'insights_with_evidence';
```

应该返回：
```
column_name              | data_type
insights_with_evidence   | jsonb
```

## 数据迁移说明

**重要**：旧的`key_insights`和`important_quotes`字段暂时保留，不会删除。

原因：
- 旧数据中insights和quotes没有关联关系
- 需要重新运行AI生成才能建立正确的关联
- 保留旧字段作为备份

## 后续步骤

1. 部署新代码（使用`insights_with_evidence`）
2. 对于历史访谈，运行regenerate脚本重新生成
3. 验证新数据结构正常工作
4. 一段时间后（如1个月），可以删除旧字段

## Rollback

如果需要回滚：

```sql
ALTER TABLE response DROP COLUMN IF EXISTS insights_with_evidence;
```

旧字段仍然存在，系统会继续使用旧数据。

