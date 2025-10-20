# FoloUp 总结模块设计方案

## 📋 目录
1. [核心设计理念](#核心设计理念)
2. [Userology vs FoloUp 差异化定位](#userology-vs-foloup-差异化定位)
3. [MVP功能范围](#mvp功能范围)
4. [数据模型设计](#数据模型设计)
5. [AI生成逻辑](#ai生成逻辑)
6. [前端展示设计](#前端展示设计)
7. [实施路线图](#实施路线图)

---

## 🎯 核心设计理念

### Userology的设计哲学（从截图分析）

**三个Tab结构**：
1. **Qualitative（定性）**：
   - AI Overview：10+条跨访谈综合洞察
   - AI Generated Insights：按主题聚类（Challenges/Positives）
   - 每个主题显示引用数量，点击展开显示用户原话

2. **Quantitative（定量）**：
   - 多个数据卡片（如"Participant's current primary status"）
   - 横向条形图显示分布
   - 每个卡片有"AI Insights"按钮

3. **Discussion Summary（讨论摘要）**：
   - 按研究目标的关键维度组织（Learning Goals, Pain Points, Current Tools等）
   - 每个用户一张卡片，横向滚动查看

**关键特点**：
- ✅ 目标驱动：所有内容围绕研究目标展开
- ✅ 结构化+定性：既有量化数据，又有深度洞察
- ✅ 用户原声：大量引用用户原话，增强可信度
- ✅ 主题化组织：按主题聚类，不是平铺直叙

---

## 🔄 Userology vs FoloUp 差异化定位

### Userology的定位
- 通用型用户研究平台
- 适合各种类型的研究（产品、市场、学术等）
- 提供全面的分析框架

### FoloUp的差异化
1. **目标驱动的深度分析**：
   - 不是通用框架，而是根据Study Objective定制化
   - 直接产出研究者需要的deliverables（如"3个action plans"、"付费意愿区间"）

2. **单访谈级别的深度**：
   - Userology主要聚焦Study级别
   - FoloUp在单访谈级别就提供深度分析
   - 单访谈→Study的层级聚合

3. **实验数据整合**：
   - FoloUp有experiment_data表
   - 可以将定性访谈与定量实验数据结合
   - 这是Userology没有的能力

### FoloUp的核心价值主张
- **深度优先**：少而精的洞察，每条都有商业价值
- **目标定制**：根据Study Objective自动调整分析框架
- **可执行性**：不只是insights，还有action plans
- **数据融合**：定性+定量的深度整合

---

## 🎯 MVP功能范围

### 单访谈层面（Interview Summary）

**当前已有**：
- ✅ Overall Score
- ✅ Communication Score
- ✅ Call Summary

**MVP新增**：
- ✅ **Key Insights**（3-5条）：针对Study Objective的核心发现
  - 每条50-100字
  - 直接回答研究目标
  - 带有支持证据（用户原话）

- ✅ **Important Quotes**（5-10条）：重要引用片段
  - 带时间戳（可追溯到transcript）
  - 带简短上下文
  - 优先选择具体、可执行、情感强烈的引用

**暂缓到后续迭代**：
- ⏸️ User Profile（用户画像）
- ⏸️ Experiment Data Summary（实验数据总结）

### Study层面（Study Summary）

**当前已有**：
- ✅ 3条简短insights（≤25字）

**MVP重构为**：
1. ✅ **Executive Summary**（1段话，150-200字）：
   - 概括整个研究的核心发现
   - 直接回答Study Objective

2. ✅ **Objective-Driven Deliverables**（核心产出）：
   - 根据Study Objective类型动态生成
   - 例如：
     - 如果objective包含"action plan" → 生成3个详细的action plans
     - 如果objective包含"pricing"/"付费" → 生成付费意愿分析
     - 如果objective包含"pain point" → 生成pain points排序
     - 默认 → 生成通用insights

3. ✅ **Cross-Interview Insights**（5-8条）：
   - 跨访谈的深度洞察
   - 每条100-200字
   - 带有支持证据（用户引用）

4. ✅ **Evidence Bank**（证据库）：
   - 每条insight的用户引用支持
   - 可追溯到具体访谈和时间戳

**暂缓到后续迭代**：
- ⏸️ Thematic Analysis（主题聚类）
- ⏸️ User Segmentation（用户分层）
- ⏸️ Quantitative Overview（量化数据可视化）

---

## 🗄️ 数据模型设计

### 方案：扩展现有表（使用JSONB）

#### interviews表新增字段

```sql
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS key_insights JSONB;
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS important_quotes JSONB;
```

**key_insights结构**：
```json
[
  {
    "insight": "用户强烈希望有AI辅助修改功能，但担心失去对内容的控制权",
    "supporting_quotes": [
      {
        "quote": "我希望AI能帮我改，但我要能看到它改了什么",
        "interview_id": "abc123",
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
    "timestamp": "00:03:45",
    "importance_score": 9
  }
]
```

#### studies表新增字段

```sql
ALTER TABLE studies ADD COLUMN IF NOT EXISTS executive_summary TEXT;
ALTER TABLE studies ADD COLUMN IF NOT EXISTS objective_deliverables JSONB;
ALTER TABLE studies ADD COLUMN IF NOT EXISTS cross_interview_insights JSONB;
```

**objective_deliverables结构**（根据objective类型动态）：

示例1：Action Plans类型
```json
{
  "type": "action_plans",
  "deliverables": [
    {
      "title": "实现AI辅助修改功能，保留用户控制权",
      "description": "开发一个AI修改建议系统，用户可以逐条接受或拒绝修改...",
      "priority": "high",
      "supporting_evidence": [
        {
          "quote": "...",
          "interview_id": "abc123"
        }
      ]
    }
  ]
}
```

示例2：Pricing类型
```json
{
  "type": "pricing_analysis",
  "deliverables": {
    "price_range": {
      "min": 9.99,
      "max": 29.99,
      "recommended": 19.99
    },
    "user_segments": [
      {
        "segment": "高频考试用户",
        "willingness_to_pay": "high",
        "price_threshold": 29.99,
        "count": 5
      }
    ],
    "pricing_insights": [
      "用户将此产品视为考试投资，愿意支付较高价格..."
    ]
  }
}
```

**cross_interview_insights结构**：
```json
[
  {
    "insight": "所有3位参与者都强调词汇学习的核心挑战是情境化应用，而非简单记忆",
    "supporting_quotes": [
      {
        "quote": "...",
        "interview_id": "abc123",
        "participant_name": "Augustin"
      }
    ],
    "theme": "learning_challenges"
  }
]
```

---

## 🤖 AI生成逻辑

### 单访谈总结生成

**输入**：
- transcript（完整对话记录）
- study_objective（研究目标）
- screening_questions（如果有）
- experiment_data（如果有）

**输出**：
- key_insights: 3-5条针对study_objective的核心发现
- important_quotes: 5-10条重要引用（带时间戳）

**Prompt结构**：
```
You are analyzing a user interview for a research study.

Study Objective: {study_objective}

Interview Transcript: {transcript}

Please provide:

1. Key Insights (3-5 insights directly related to the study objective)
   - Each insight should be 50-100 words
   - Focus on findings that help answer the research question
   - Include specific examples or behaviors mentioned by the user
   
2. Important Quotes (5-10 quotes that support the insights)
   - Include timestamp in format MM:SS
   - Include brief context (1 sentence)
   - Prioritize quotes that are:
     * Specific and concrete (not generic statements)
     * Actionable (suggest clear product/design implications)
     * Emotionally resonant (reveal user frustrations or desires)

Output format: JSON
{
  "key_insights": [...],
  "important_quotes": [...]
}
```

### Study总结生成

**输入**：
- study_objective
- 所有interviews的transcripts
- 所有interviews的key_insights
- 所有interviews的important_quotes
- experiment_data（如果有）

**输出**：
- executive_summary: 1段话（150-200字）
- objective_deliverables: 根据objective类型定制
- cross_interview_insights: 5-8条跨访谈洞察

**Prompt结构**（需要根据objective类型动态调整）：

**步骤1：分析objective类型**
```javascript
function analyzeObjectiveType(objective: string): string {
  if (objective.match(/action plan|行动计划|建议/i)) return 'action_plans';
  if (objective.match(/pricing|付费|定价|价格/i)) return 'pricing';
  if (objective.match(/pain point|痛点|问题/i)) return 'pain_points';
  return 'general';
}
```

**步骤2：根据类型生成不同的prompt**

示例：Action Plans类型
```
You are a product research expert analyzing user interviews.

Study Objective: {study_objective}

Interview Data:
{aggregated_insights_and_quotes}

Based on the study objective, please provide:

1. Executive Summary (150-200 words)
   - Summarize the key findings across all interviews
   - Directly answer the research question

2. Action Plans (3 detailed action plans)
   For each action plan, provide:
   - Title: Clear, actionable title
   - Description: 100-150 words explaining what to do and why
   - Priority: high/medium/low
   - Supporting Evidence: 2-3 user quotes that support this plan

3. Cross-Interview Insights (5-8 insights)
   - Each insight should synthesize findings across multiple interviews
   - 100-200 words per insight
   - Include supporting quotes from different participants

Output format: JSON
```

---

## 🎨 前端展示设计

### 单访谈页面（Interview Detail Page）

**当前结构**：
- Overview Tab
- Transcript Tab
- Experiment Data Tab

**调整为**：

#### 1. Summary Tab（新增，设为默认）
```
┌─────────────────────────────────────────┐
│ 📊 Interview Summary                    │
├─────────────────────────────────────────┤
│ Overall Score: 85  Communication: 8/10  │
├─────────────────────────────────────────┤
│ 📝 Call Summary                         │
│ [现有的call_summary内容]                 │
├─────────────────────────────────────────┤
│ 💡 Key Insights                         │
│ ┌─────────────────────────────────────┐ │
│ │ 1. [Insight 1]                      │ │
│ │    "Supporting quote..."            │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ 2. [Insight 2]                      │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│ 💬 Important Quotes                     │
│ ┌─────────────────────────────────────┐ │
│ │ [00:03:45] "Quote text..."          │ │
│ │ Context: [Brief context]            │ │
│ │ [Jump to Transcript] ───────────────┤ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

#### 2. Transcript Tab（保留）
#### 3. Experiment Data Tab（保留）

### Study页面（Study Detail Page）

**当前结构**：
- 简单的insights列表
- Interviews列表

**重构为多Tab结构**：

#### Tab 1: Summary（总结）
```
┌─────────────────────────────────────────────────┐
│ 📋 Executive Summary                            │
├─────────────────────────────────────────────────┤
│ [150-200字的总结段落]                            │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ 🎯 [Objective-Specific Title]                   │
│    (例如: "Recommended Action Plans")            │
├─────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────┐ │
│ │ 1. [Action Plan Title]          [Priority]  │ │
│ │    [Description...]                         │ │
│ │    📊 Supporting Evidence (3 quotes)        │ │
│ │    [Expand to see quotes] ▼                 │ │
│ └─────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────┐ │
│ │ 2. [Action Plan Title]                      │ │
│ └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

#### Tab 2: Insights（洞察）
```
┌─────────────────────────────────────────────────┐
│ 💡 Cross-Interview Insights                     │
├─────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────┐ │
│ │ 🏷️ Learning Challenges                      │ │
│ │ [Insight text 100-200 words...]             │ │
│ │                                             │ │
│ │ 📊 Evidence from 3 participants:            │ │
│ │ [Expand] ▼                                  │ │
│ │   • Augustin: "Quote..."                    │ │
│ │   • Anthony: "Quote..."                     │ │
│ │   • Sunshine: "Quote..."                    │ │
│ └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

#### Tab 3: Interviews（访谈列表，保留当前）

---

## 🛣️ 实施路线图

### Phase 1: 数据库Schema更新（1天）
- [ ] 创建migration文件
- [ ] 添加interviews表新字段（key_insights, important_quotes）
- [ ] 添加studies表新字段（executive_summary, objective_deliverables, cross_interview_insights）
- [ ] 更新TypeScript类型定义

### Phase 2: 后端AI生成逻辑（3-4天）
- [ ] 创建新的prompt模块：`backend/src/lib/prompts/generate-interview-summary.ts`
- [ ] 创建新的prompt模块：`backend/src/lib/prompts/generate-study-summary.ts`
- [ ] 实现objective类型分析函数
- [ ] 实现单访谈总结生成API
- [ ] 实现Study总结生成API（支持多种objective类型）
- [ ] 添加错误处理和日志

### Phase 3: 前端展示（3-4天）
- [ ] 重构单访谈页面：添加Summary Tab
- [ ] 创建Key Insights组件
- [ ] 创建Important Quotes组件（带时间戳跳转）
- [ ] 重构Study页面：多Tab结构
- [ ] 创建Objective Deliverables组件（动态渲染）
- [ ] 创建Cross-Interview Insights组件
- [ ] 添加Evidence展开/折叠功能

### Phase 4: 测试和优化（2天）
- [ ] 测试不同类型的Study Objective
- [ ] 优化AI生成质量
- [ ] 性能优化
- [ ] UI/UX细节打磨

**总计：约9-11天**

---

## 📝 后续迭代方向

### 迭代2：主题聚类和用户分层
- Thematic Analysis（类似Userology的AI Generated Insights）
- User Segmentation（基于行为、态度、需求等）

### 迭代3：量化数据整合
- Quantitative Overview（结构化数据可视化）
- Experiment Data深度整合

### 迭代4：导出和分享
- 导出Markdown报告
- 导出CSV数据
- 生成可分享的链接

