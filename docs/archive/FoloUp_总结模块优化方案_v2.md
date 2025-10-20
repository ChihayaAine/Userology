# FoloUp 总结模块优化方案 v2

> 基于用户反馈更新，聚焦核心价值，删除招聘导向功能

---

## 📋 用户反馈总结

### 1. 功能清理决策

**删除功能**：
- ❌ Overall Engagement Score（0-100分）
- ❌ Communication Score（0-10分）
- ❌ Tab Switching Detection
- ❌ User Sentiment相关（暂时删除，识别不准确）
- ❌ Candidate Sentiment饼图

**保留并优化**：
- ✅ Candidate Status（默认改为Selected，用于过滤捣乱的candidate）
- ✅ Question Summary（需要优化：完整生成每个问题，修复内容缺失）
- ✅ Call Summary（需要更针对Study Objective）
- ✅ 基本信息、Transcript、Average Duration、Completion Rate

### 2. 核心设计原则

1. **不预设Objective类型**：直接从Study Objective中提取用户期待的产出
2. **生成时机**：
   - 单访谈：访谈结束后自动生成
   - Study：用户手动选择访谈后点击"Generate Insights"
3. **可编辑**：用户可以编辑AI生成的内容，覆盖原版本
4. **深度优先**：少而精的洞察，每条都有商业价值

---

## 🗄️ 数据模型设计

### responses表新增字段（单访谈级别）

```sql
ALTER TABLE responses ADD COLUMN IF NOT EXISTS key_insights JSONB;
ALTER TABLE responses ADD COLUMN IF NOT EXISTS important_quotes JSONB;
```

**key_insights结构**：
```json
[
  {
    "insight": "用户强烈希望有AI辅助修改功能，但担心失去对内容的控制权",
    "supporting_quotes": [
      {
        "quote": "我希望AI能帮我改，但我要能看到它改了什么",
        "timestamp": "00:05:23"
      }
    ]
  }
]
```

**important_quotes结构**：
```json
[
  {
    "quote": "表达越难，我就越依赖翻译工具，但这样永远学不会",
    "context": "讨论学习英语的痛点时",
    "timestamp": "00:03:45"
  }
]
```

### interviews表新增字段（Study级别）

```sql
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS executive_summary TEXT;
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS objective_deliverables JSONB;
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS cross_interview_insights JSONB;
```

**objective_deliverables结构**（完全动态）：
```json
{
  "extracted_objectives": ["3个行动计划", "付费意愿分析"],
  "deliverables": [
    {
      "objective": "3个行动计划",
      "content": [...],
      "supporting_evidence": [...]
    },
    {
      "objective": "付费意愿分析",
      "content": {...},
      "supporting_evidence": [...]
    }
  ]
}
```

---

## 🛣️ 实施路线图

### Phase 1: 清理无用功能（1天）
- [ ] 删除Overall Score相关代码
- [ ] 删除Communication Score相关代码
- [ ] 删除Tab Switching Detection
- [ ] 删除User Sentiment相关UI
- [ ] 修改Candidate Status默认值为Selected

### Phase 2: 优化现有功能（2天）
- [ ] 修复Question Summary生成逻辑（确保每个问题都生成）
- [ ] 优化Call Summary使其更针对Study Objective
- [ ] 测试并验证修复效果

### Phase 3: 数据库Schema更新（0.5天）
- [ ] 创建migration文件
- [ ] 添加responses表新字段
- [ ] 添加interviews表新字段
- [ ] 更新TypeScript类型定义

### Phase 4: 实现单访谈深度总结（2-3天）
- [ ] 创建generate-interview-summary.ts prompt
- [ ] 实现Key Insights生成逻辑
- [ ] 实现Important Quotes提取逻辑
- [ ] 集成到访谈结束后的自动生成流程
- [ ] 前端展示Key Insights和Important Quotes

### Phase 5: 实现Study级别总结（3-4天）
- [ ] 创建两阶段AI生成流程：
  - 阶段1：从Study Objective提取期待的deliverables
  - 阶段2：根据提取的deliverables生成对应内容
- [ ] 实现Executive Summary生成
- [ ] 实现Objective-Driven Deliverables生成
- [ ] 实现Cross-Interview Insights生成
- [ ] 添加可编辑功能

### Phase 6: 前端UI重构（2-3天）
- [ ] 重构单访谈页面UI
- [ ] 重构Study页面UI（多Tab结构）
- [ ] 添加编辑功能
- [ ] UI/UX细节打磨

**总计：约11-14天**

---

## 🎯 Phase 1详细任务清单

### 后端清理

1. **analytics.service.ts**
   - 删除overallScore计算逻辑
   - 删除communication.score计算逻辑
   - 保留questionSummaries但需要优化

2. **responses表**
   - 修改candidate_status默认值为'selected'

### 前端清理

1. **callInfo.tsx**
   - 删除Overall Engagement Score卡片（行303-334）
   - 删除Communication卡片（行336-374）
   - 删除Tab Switching Detection显示（行181-185）
   - 删除User Sentiment显示（行375-398）
   - 保留Candidate Status但修改默认值

2. **summaryInfo.tsx**
   - 删除Candidate Sentiment饼图（行221-266）
   - 删除Candidate Status饼图（行267-333）
   - 删除DataTable中的overallScore和communicationScore列
   - 保留Average Duration和Completion Rate

3. **dataTable.tsx**
   - 删除Overall Score列
   - 删除Communication Score列
   - 只保留Name和Call Summary列

---

## 📝 后续迭代方向

### 迭代2：主题聚类
- Thematic Analysis（类似Userology的AI Generated Insights）
- 按主题组织insights

### 迭代3：量化数据整合
- Experiment Data深度整合
- 结构化数据可视化

### 迭代4：导出和分享
- 导出Markdown报告
- 导出CSV数据

