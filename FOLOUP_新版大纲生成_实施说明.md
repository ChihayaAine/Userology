# Foloup 新版大纲生成 - 实施说明

> 基于通用AI访谈模板最佳实践，创建产品调研和需求调研专用prompt

---

## 📋 已完成的工作

### 1. 项目深度分析
✅ 完整扫描了Foloup的代码库  
✅ 理解了访谈大纲的完整传递机制（前端 → 后端 → 数据库 → Retell AI）  
✅ 明确了数据字段定义和接口规范  
✅ 创建了产品视角的技术文档：`FOLOUP_访谈大纲传递机制_产品视角.md`

### 2. 删除临时文件
✅ 删除了 `产品调研-大纲生成.ts`（临时文件）  
✅ 删除了 `产品调研-大纲生成prompt.txt`（临时文件）

### 3. 创建新版Prompt文件

#### 文件1: `backend/src/lib/prompts/generate-product-research-sessions.ts`
**用途**: 产品调研访谈大纲生成

**核心能力**:
- ✅ 渐进式收集策略（避免一次性要求多条信息）
- ✅ 条件化追问逻辑（灵活跳过已回答内容）
- ✅ 固定即兴追问指令（每个Session必须包含）
- ✅ 自包含背景信息（AI无需查阅外部文档）
- ✅ 节间过渡设计（总结+预告+用户确认）
- ✅ 产品调研特有的"功能验证四步法"
- ✅ 竞品对比策略

**输入字段**:
```typescript
{
  name: string,        // 研究名称
  objective: string,   // 调研目标
  number: number,      // Session数量
  context: string      // 产品文档（可选）
}
```

**输出格式**:
```json
{
  "questions": [
    "### **Session 1: ...**\n\n[完整Session文本]",
    "### **Session 2: ...**\n\n[完整Session文本]"
  ],
  "description": "50字以内的访谈描述"
}
```

#### 文件2: `backend/src/lib/prompts/generate-market-research-sessions.ts`
**用途**: 需求调研访谈大纲生成

**核心能力**:
- ✅ 所有产品调研的核心能力
- ✅ 需求调研特有的"痛点挖掘三层法"
- ✅ 理想解决方案探索策略
- ✅ AI期待收集方法

**输入/输出**: 与产品调研相同

---

## 🎯 与通用AI访谈模板的对比

| 维度 | 通用模板（12步流程） | Foloup新版Prompt |
|-----|------------------|----------------|
| **工作流程** | 素材0 → E0 → F → F1A → F1B → G → G1 | 单步生成（内部智能化） |
| **输入方式** | 多次交互，逐步细化 | 一次性输入（简化） |
| **输出质量** | 经过多轮优化 | 直接生成高质量大纲 |
| **核心能力** | 渐进式收集、条件化追问、固定即兴指令 | ✅ 全部保留 |
| **问题格式** | Q[X].[Y] + 主持人笔记 + 相关背景 | ✅ 完全一致 |
| **Session结构** | 目标 + 笔记 + 问题 + 过渡 | ✅ 完全一致 |
| **本地化** | 单独步骤（G/G1） | 内置在prompt中 |
| **审计优化** | 单独步骤（F1A/F1B） | 内置质量检查清单 |

**结论**: 新版Prompt保留了通用模板的所有核心能力，但简化了操作流程，更适合Foloup的产品形态。

---

## 🚀 下一步：集成到Foloup

### Step 1: 修改前端创建界面

**文件**: `frontend/src/components/dashboard/interview/create-popup/details.tsx`

**需要修改的部分**:

#### 1.1 添加调研类型选择
```typescript
// 在表单中添加新字段
const [researchType, setResearchType] = useState<'product' | 'market'>('product');

// 在UI中添加选择器
<div className="form-group">
  <label>Research Type</label>
  <select value={researchType} onChange={(e) => setResearchType(e.target.value)}>
    <option value="product">Product Research (产品调研)</option>
    <option value="market">Market Research (需求调研)</option>
  </select>
</div>
```

#### 1.2 优化Research Objective提示
```typescript
<textarea
  placeholder={
    researchType === 'product'
      ? "请描述：\n- 产品背景（功能、版本、用户群）\n- 核心验证问题\n- 期望产出"
      : "请描述：\n- 调研背景和目标\n- 希望解答的核心问题\n- 目标用户群体\n- 期望的产出"
  }
  value={objective}
  onChange={(e) => setObjective(e.target.value)}
/>
```

#### 1.3 修改API调用逻辑
```typescript
// 原有逻辑
if (selectedInterviewer === 3) { // David
  await fetch('/generate-interview-sessions', { ... });
} else { // Lisa/Bob
  await fetch('/generate-interview-questions', { ... });
}

// 新逻辑
if (selectedInterviewer === 3) { // David
  const endpoint = researchType === 'product' 
    ? '/generate-product-research-sessions'
    : '/generate-market-research-sessions';
  await fetch(endpoint, { ... });
} else { // Lisa/Bob
  await fetch('/generate-interview-questions', { ... });
}
```

### Step 2: 创建新的后端API端点

**文件**: `backend/src/controllers/questions.controller.ts`

**需要添加的内容**:

```typescript
import { 
  SYSTEM_PROMPT_PRODUCT_RESEARCH, 
  generateProductResearchSessionsPrompt 
} from "../lib/prompts/generate-product-research-sessions";
import { 
  SYSTEM_PROMPT_MARKET_RESEARCH, 
  generateMarketResearchSessionsPrompt 
} from "../lib/prompts/generate-market-research-sessions";

// 产品调研端点
export const generateProductResearchSessions = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT_PRODUCT_RESEARCH },
        { role: "user", content: generateProductResearchSessionsPrompt(body) },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(completion.choices[0].message.content || "{}");
    
    // 添加ID到每个question
    result.questions = result.questions.map((q: string) => ({
      id: nanoid(),
      question: q,
      follow_up_count: 1,
    }));

    res.json(result);
  } catch (error) {
    console.error("Error generating product research sessions:", error);
    res.status(500).json({ error: "Failed to generate sessions" });
  }
};

// 需求调研端点
export const generateMarketResearchSessions = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT_MARKET_RESEARCH },
        { role: "user", content: generateMarketResearchSessionsPrompt(body) },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(completion.choices[0].message.content || "{}");
    
    // 添加ID到每个question
    result.questions = result.questions.map((q: string) => ({
      id: nanoid(),
      question: q,
      follow_up_count: 1,
    }));

    res.json(result);
  } catch (error) {
    console.error("Error generating market research sessions:", error);
    res.status(500).json({ error: "Failed to generate sessions" });
  }
};
```

### Step 3: 注册新路由

**文件**: `backend/src/routes/questions.routes.ts`

```typescript
import { 
  generateQuestions, 
  generateSessions,
  generateProductResearchSessions,  // 新增
  generateMarketResearchSessions    // 新增
} from "../controllers/questions.controller";

router.post("/generate-interview-questions", generateQuestions);
router.post("/generate-interview-sessions", generateSessions);
router.post("/generate-product-research-sessions", generateProductResearchSessions);  // 新增
router.post("/generate-market-research-sessions", generateMarketResearchSessions);    // 新增
```

### Step 4: 数据库扩展（可选，未来优化）

**文件**: `supabase_schema.sql`

```sql
-- 添加调研类型字段
ALTER TABLE interview ADD COLUMN research_type TEXT CHECK (research_type IN ('product', 'market'));

-- 添加核心目标字段（未来可用于质量分析）
ALTER TABLE interview ADD COLUMN core_objectives JSONB;
```

---

## 🧪 测试计划

### 测试用例1: 产品调研
**输入**:
```
name: "TaskMaster 3.0版本验证"
objective: "新版本上线3个月，增加了AI智能推荐和团队看板功能。希望了解：1) 用户是否感知到改进 2) 新功能使用情况 3) 必做优化点"
number: 5
context: ""
```

**期望输出**:
- 5个Session，每个3-5个问题
- Session 1: 破冰 + 产品使用背景
- Session 2: 整体体验自由表达
- Session 3: AI推荐功能深度探索
- Session 4: 团队看板功能深度探索
- Session 5: 痛点收集 + 优先级确认

### 测试用例2: 需求调研
**输入**:
```
name: "AI闲暇消费助手需求调研"
objective: "探索年轻人在闲暇时间的消费决策痛点，验证AI推荐助手的市场机会"
number: 6
context: ""
```

**期望输出**:
- 6个Session，每个3-5个问题
- Session 1: 破冰 + 闲暇消费行为了解
- Session 2: 决策痛点深挖
- Session 3: 现有解决方案探索
- Session 4: 理想解决方案构想
- Session 5: AI期待与顾虑
- Session 6: 优先级确认

---

## 📊 质量对比基准

使用以下案例作为质量基准：
- ✅ `通用需求调研模版/H1_优化版访谈大纲_AI闲暇消费.txt`
- ✅ `French背单词访谈/I''_素材I'' - 终极本土化访谈大纲_法国英语应试.txt`

**对比维度**:
1. 问题格式是否符合标准（Q[X].[Y] + 笔记 + 背景）
2. 是否包含固定即兴追问指令
3. 是否采用渐进式收集策略
4. 追问是否标注灵活性条件
5. Session过渡是否自然
6. 背景信息是否自包含

---

## ⚠️ 注意事项

1. **向后兼容**: 保留原有的 `generate-interview-sessions` 端点，不影响现有功能
2. **渐进式上线**: 先在David模式测试新prompt，验证质量后再推广
3. **用户教育**: 在UI中提供示例，帮助用户填写高质量的Research Objective
4. **监控质量**: 收集用户反馈，持续优化prompt
5. **成本控制**: 新prompt较长（约3000 tokens），注意API成本

---

## 🎯 成功标准

- ✅ 生成的大纲格式与通用模板案例一致
- ✅ 包含所有核心能力（渐进式收集、条件化追问等）
- ✅ 用户无需多次交互即可获得高质量大纲
- ✅ 与Foloup现有系统完全兼容
- ✅ 用户满意度提升（通过反馈问卷验证）

---

## 📝 下一步行动清单

- [ ] Review新创建的两个prompt文件
- [ ] 修改前端创建界面（添加调研类型选择）
- [ ] 创建新的后端API端点
- [ ] 注册新路由
- [ ] 本地测试两个测试用例
- [ ] 对比生成质量与基准案例
- [ ] 迭代优化prompt
- [ ] 部署到测试环境
- [ ] 收集用户反馈
- [ ] 正式上线

---

**创建时间**: 2025年10月19日  
**创建者**: AI Assistant  
**状态**: 待Review和集成

