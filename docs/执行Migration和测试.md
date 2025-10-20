# 执行Migration和测试新的Insights with Evidence功能

## 步骤1: 执行数据库Migration

### 在Supabase Dashboard执行以下SQL：

```sql
-- 添加新字段
ALTER TABLE response 
ADD COLUMN IF NOT EXISTS insights_with_evidence JSONB;

-- 添加注释
COMMENT ON COLUMN response.insights_with_evidence IS 'Key insights with supporting quotes - each insight contains 2-3 quotes as evidence';
```

### 验证Migration成功：

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

---

## 步骤2: 重新生成访谈总结

### 为历史访谈生成新格式的总结：

```bash
export OPENAI_API_KEY=sk-mhStWDss5vDY1H4B8CHOfS1pINUucaBo7V9j1yLsx0RZ4GtT
export OPENAI_API_BASE=https://api.tu-zi.com/v1
cd backend
npx tsx src/scripts/regenerate-summary.ts call_0cb52861cc051447d5359e052c0
```

### 预期输出：

```
🔄 开始为访谈生成总结...
📞 Call ID: call_0cb52861cc051447d5359e052c0
📊 获取访谈数据...
✅ 访谈数据获取成功
   - 访谈者: rg
   - Interview ID: UFUYWWM52RPh85H0Q4IZB
✅ Transcript存在，长度: 579 字符

🤖 开始生成AI总结...
✅ 总结生成成功！

📊 Insights with Evidence:

   1. [behavior] Users are introduced to the product primarily through personal recommendations...
      Supporting Quotes (2):
        1. "朋友推荐的" - user @ 0:30
        2. "他自己用的挺好的然后我也刚好需要这个产品" - user @ 0:45

   2. [preference] Users find the product experience to be satisfactory...
      Supporting Quotes (2):
        1. "没有感觉大部分都还挺好的但是也没有特别有特色就一般般" - user @ 1:00
        2. "啊没有" - user @ 1:15

✅ 数据已保存到数据库
```

---

## 步骤3: 验证数据库中的数据

### 在Supabase Dashboard执行：

```sql
SELECT 
  call_id,
  insights_with_evidence
FROM response 
WHERE call_id = 'call_0cb52861cc051447d5359e052c0';
```

应该看到类似这样的JSONB数据：

```json
[
  {
    "id": "insight_1",
    "content": "Users are introduced to the product primarily through personal recommendations...",
    "category": "behavior",
    "supporting_quotes": [
      {
        "id": "quote_1_1",
        "quote": "朋友推荐的",
        "timestamp": 30,
        "speaker": "user"
      },
      {
        "id": "quote_1_2",
        "quote": "他自己用的挺好的然后我也刚好需要这个产品",
        "timestamp": 45,
        "speaker": "user"
      }
    ]
  },
  ...
]
```

---

## 步骤4: 测试前端UI

1. **刷新访谈详情页面**：
   ```
   http://localhost:8089/response/call_0cb52861cc051447d5359e052c0
   ```

2. **预期看到的UI**：

   ```
   📊 Key Insights with Evidence
   
   ┌─────────────────────────────────────────────────┐
   │ [Behavior] Insight #1                           │
   │ Users are introduced to the product primarily   │
   │ through personal recommendations...             │
   │                                                 │
   │ 💬 Supporting Evidence                          │
   │   ┌───────────────────────────────────────┐    │
   │   │ 👤 "朋友推荐的"                        │    │
   │   │ User @ 0:30                            │    │
   │   └───────────────────────────────────────┘    │
   │   ┌───────────────────────────────────────┐    │
   │   │ 👤 "他自己用的挺好的然后我也刚好需要   │    │
   │   │     这个产品"                          │    │
   │   │ User @ 0:45                            │    │
   │   └───────────────────────────────────────┘    │
   └─────────────────────────────────────────────────┘
   ```

3. **验证点**：
   - ✅ 每个insight都有2-3条supporting quotes
   - ✅ Quotes显示在对应的insight下方
   - ✅ 显示speaker（User/AI Interviewer）
   - ✅ 显示timestamp
   - ✅ Category badge显示正确的颜色
   - ✅ 不再有单独的"Important Quotes"部分

---

## 步骤5: 测试新访谈

1. **创建一个新的Study**（如果还没有）

2. **进行一次新的访谈**

3. **访谈结束后，查看访谈详情页**

4. **验证**：
   - 新访谈应该自动生成insights_with_evidence
   - UI应该正确显示
   - 每个insight都有supporting quotes

---

## 故障排查

### 问题1: Migration执行失败

**错误**: `column "insights_with_evidence" already exists`

**解决**: 字段已存在，可以跳过这一步

---

### 问题2: 脚本执行失败 - "OPENAI_API_KEY missing"

**解决**: 确保设置了环境变量：
```bash
export OPENAI_API_KEY=sk-mhStWDss5vDY1H4B8CHOfS1pINUucaBo7V9j1yLsx0RZ4GtT
export OPENAI_API_BASE=https://api.tu-zi.com/v1
```

---

### 问题3: 前端显示"No insights available yet"

**可能原因**：
1. 数据库中没有insights_with_evidence数据
2. 前端缓存问题

**解决**：
1. 检查数据库中是否有数据（步骤3）
2. 硬刷新浏览器（Cmd+Shift+R）
3. 重新运行regenerate脚本

---

### 问题4: UI显示旧的Key Insights和Important Quotes

**原因**: 前端代码没有更新

**解决**: 
1. 确认CallInfo.tsx已经修改
2. 重启frontend服务
3. 清除浏览器缓存

---

## 完成检查清单

- [ ] Migration执行成功
- [ ] 验证数据库字段存在
- [ ] 运行regenerate脚本成功
- [ ] 数据库中有insights_with_evidence数据
- [ ] 前端UI正确显示新格式
- [ ] 每个insight都有supporting quotes
- [ ] 新访谈自动生成新格式数据

---

## 下一步

完成测试后，可以：

1. **批量重新生成历史访谈**：
   ```bash
   cd backend
   npx tsx src/scripts/find-and-backfill.ts <interview_id>
   ```

2. **清理旧字段**（可选，建议等待一段时间）：
   ```sql
   -- 一个月后，确认新格式稳定后再执行
   ALTER TABLE response DROP COLUMN IF EXISTS key_insights;
   ALTER TABLE response DROP COLUMN IF EXISTS important_quotes;
   ```

3. **删除旧的UI组件**（可选）：
   - `frontend/src/components/call/KeyInsightsCard.tsx`
   - `frontend/src/components/call/ImportantQuotesCard.tsx`

