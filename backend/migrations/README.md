# 数据库Migration指南

## 🚨 重要：需要执行Migration

当前系统需要执行数据库migration来添加新的字段。

## 📋 执行步骤

### 方法1：通过Supabase Dashboard（推荐）

1. **打开Supabase Dashboard**
   - 访问：https://supabase.com/dashboard
   - 选择你的项目

2. **打开SQL Editor**
   - 左侧菜单 → SQL Editor
   - 点击 "New query"

3. **复制并执行Migration**
   - 打开文件：`backend/migrations/001_add_summary_fields.sql`
   - 复制全部内容
   - 粘贴到SQL Editor
   - 点击 "Run" 按钮

4. **验证执行结果**
   - 应该看到 "Success. No rows returned"
   - 检查是否有错误信息

### 方法2：通过命令行（需要Supabase CLI）

```bash
# 如果已安装Supabase CLI
supabase db push

# 或者直接执行SQL文件
psql $DATABASE_URL -f backend/migrations/001_add_summary_fields.sql
```

## ✅ 验证Migration是否成功

执行以下SQL查询来验证字段是否添加成功：

```sql
-- 检查response表的新字段
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'response' 
  AND column_name IN ('key_insights', 'important_quotes');

-- 检查interview表的新字段
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'interview' 
  AND column_name IN ('executive_summary', 'objective_deliverables', 'cross_interview_insights', 'evidence_bank');
```

应该返回所有6个字段。

## 🔄 执行完Migration后

1. **重新运行生成脚本**
   ```bash
   cd backend
   npx tsx src/scripts/find-and-backfill.ts
   ```

2. **刷新浏览器页面**
   - 查看单访谈页面的Key Insights和Important Quotes
   - 查看Study页面的Study Insights Tab

## 📝 Migration内容说明

这个migration添加了以下字段：

### response表
- `key_insights` (JSONB): 存储3-5条关键洞察
- `important_quotes` (JSONB): 存储5-10条重要引用

### interview表
- `executive_summary` (TEXT): 研究的执行摘要
- `objective_deliverables` (JSONB): 基于研究目标的可交付成果
- `cross_interview_insights` (JSONB): 跨访谈的深度洞察
- `evidence_bank` (JSONB): 洞察与用户引用的关联

## ❓ 常见问题

**Q: 如果migration已经执行过了怎么办？**
A: 没关系，SQL中使用了`IF NOT EXISTS`，重复执行不会有问题。

**Q: 如果执行失败怎么办？**
A: 检查错误信息，可能是权限问题或数据库连接问题。联系数据库管理员。

