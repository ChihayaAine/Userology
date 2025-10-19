# Foloup 访谈大纲传递机制 - 产品视角全解析

> 本文档从产品角度解析Foloup的访谈大纲生成、传递和执行的完整流程

---

## 📊 核心数据流概览

```
用户创建访谈 → 生成大纲 → 存储到数据库 → 传递给Retell AI → 语音访谈执行 → 结果分析
```

---

## 🎯 第一部分：访谈大纲生成流程

### 1.1 用户输入界面（前端）

**文件位置**: `frontend/src/components/dashboard/interview/create-popup/details.tsx`

**用户填写的字段**:
```typescript
{
  name: string,              // 访谈名称
  objective: string,         // 调研目标（自由文本）
  numQuestions: number,      // Session/问题数量
  uploadedDocumentContext: string,  // 上传的PDF文档内容（可选）
  selectedInterviewer: number,      // 选择的面试官ID
  duration: number           // 预计时长（分钟）
}
```

**关键逻辑**:
- 检测选择的面试官是否是 **David**（Deep Dive模式）
- 根据面试官类型调用不同的API：
  - **David** → `/generate-interview-sessions` (生成Sessions)
  - **Lisa/Bob** → `/generate-interview-questions` (生成Questions)

### 1.2 大纲生成API调用

#### 方案A：标准模式（Lisa/Bob）

**API**: `POST /generate-interview-questions`  
**文件**: `backend/src/controllers/questions.controller.ts`

**输入**:
```typescript
{
  name: string,
  objective: string,
  number: number,      // 问题数量
  context: string      // PDF文档内容
}
```

**Prompt**: `backend/src/lib/prompts/generate-questions.ts`
- System Prompt: `SYSTEM_PROMPT`
- User Prompt: `generateQuestionsPrompt(body)`

**输出格式**:
```json
{
  "questions": [
    {
      "question": "具体问题内容",
      "follow_up_count": 1
    }
  ],
  "description": "50字以内的访谈描述"
}
```

#### 方案B：深度访谈模式（David）

**API**: `POST /generate-interview-sessions`  
**文件**: `backend/src/controllers/questions.controller.ts`

**输入**:
```typescript
{
  name: string,
  objective: string,
  number: number,      // Session数量（最多10个）
  context: string
}
```

**Prompt**: `backend/src/lib/prompts/generate-sessions.ts`
- System Prompt: `SYSTEM_PROMPT_SESSIONS`
- User Prompt: `generateSessionsPrompt(body)`

**输出格式**:
```json
{
  "questions": [
    "### **Session 1: [Session Name]**\n\n**Session Goal:** ...\n\n**Section Notes:**\n...",
    "### **Session 2: [Session Name]**\n..."
  ],
  "description": "50字以内的访谈描述"
}
```

**关键差异**:
- Sessions模式：每个元素是完整的Session文本（包含目标、笔记、问题、过渡）
- Questions模式：每个元素是单个问题对象

---

## 🗄️ 第二部分：数据库存储结构

### 2.1 Interview表字段定义

**文件**: `backend/src/types/interview.ts` + `supabase_schema.sql`

**核心字段**:
```typescript
{
  id: string,                    // 访谈ID（nanoid生成）
  name: string,                  // 访谈名称
  objective: string,             // 调研目标
  description: string,           // 访谈描述（AI生成）
  interviewer_id: number,        // 面试官ID
  questions: JSONB,              // 问题/Sessions数组
  question_count: number,        // 问题/Session数量
  time_duration: string,         // 预计时长
  url: string,                   // 访谈链接
  user_id: string,               // 创建者ID
  organization_id: string        // 组织ID
}
```

**Questions字段的两种格式**:

**标准模式（Lisa/Bob）**:
```json
[
  {
    "id": "uuid",
    "question": "问题内容",
    "follow_up_count": 1
  }
]
```

**深度访谈模式（David）**:
```json
[
  {
    "id": "uuid",
    "question": "### **Session 1: 破冰与背景了解**\n\n**Session Goal:** ...\n\n**Section Notes:**\n...",
    "follow_up_count": 1
  }
]
```

### 2.2 存储流程

**文件**: `backend/src/services/interviews.service.ts`

```typescript
const createInterview = async (payload: any) => {
  const { error, data } = await supabase
    .from("interview")
    .insert([payload])
    .select();
  
  return data;
};
```

---

## 🎙️ 第三部分：Retell AI集成与执行

### 3.1 Retell AI Agent配置

**文件**: `backend/src/controllers/interviewers.controller.ts`

Foloup创建了3个不同的Retell AI Agent：

#### Agent 1: Lisa（Explorer）
```typescript
{
  agent_name: "Lisa",
  voice_id: "11labs-Chloe",
  llm_model: "gpt-4o",
  general_prompt: RETELL_AGENT_GENERAL_PROMPT,  // 标准访谈prompt
  responsiveness: 0.2,
  interruption_sensitivity: 0.2
}
```

#### Agent 2: Bob（Empathetic）
```typescript
{
  agent_name: "Bob",
  voice_id: "11labs-Brian",
  llm_model: "gpt-4o",
  general_prompt: RETELL_AGENT_GENERAL_PROMPT,  // 标准访谈prompt
  responsiveness: 0.2,
  interruption_sensitivity: 0.2
}
```

#### Agent 3: David（Deep Dive）
```typescript
{
  agent_name: "David",
  voice_id: "11labs-Brian",
  llm_model: "gpt-4o (Multi-Prompt Agent)",
  general_prompt: "You are conducting a systematic, session-based user research interview...",
  states: [
    { name: "session_1", state_prompt: "{{session1}}" },
    { name: "session_2", state_prompt: "{{session2}}" },
    // ... 最多10个sessions
  ],
  responsiveness: 0.1,  // 更慢，更深思熟虑
  interruption_sensitivity: 0.15
}
```

**关键差异**:
- **Lisa/Bob**: 单一prompt，所有问题在一个prompt中
- **David**: Multi-Prompt Agent，每个Session是一个独立的state

### 3.2 访谈执行时的数据传递

**API**: `POST /call/register`  
**文件**: `backend/src/controllers/call.controller.ts`

**输入**:
```typescript
{
  interviewer_id: number,
  dynamic_data: {
    name: string,        // 受访者姓名
    mins: number,        // 时长
    objective: string,   // 调研目标
    questions: string,   // 标准模式：问题列表
    questions_array: Array  // 深度模式：Sessions数组
  }
}
```

**处理逻辑**:

#### 标准模式（Lisa/Bob）
```typescript
const dynamicVariables = {
  name: "用户姓名",
  mins: "30",
  objective: "调研目标",
  questions: "1. 问题1\n2. 问题2\n3. 问题3"  // 拼接成字符串
};

await retellClient.call.createWebCall({
  agent_id: interviewer.agent_id,
  retell_llm_dynamic_variables: dynamicVariables
});
```

#### 深度访谈模式（David）
```typescript
const questionsArray = body.dynamic_data.questions_array;
const sessionCount = questionsArray.length;

const dynamicVariables = {
  name: "用户姓名",
  mins: "60",
  objective: "调研目标",
  session_count: "5",
  session1: questionsArray[0]?.question || "No content",
  session2: questionsArray[1]?.question || "No content",
  session3: questionsArray[2]?.question || "No content",
  // ... 最多session10
};

await retellClient.call.createWebCall({
  agent_id: interviewer.agent_id,
  retell_llm_dynamic_variables: dynamicVariables
});
```

**关键点**:
- David的每个`session1-10`变量对应一个完整的Session文本
- 未使用的session填充为`"No content"`
- Retell AI的Multi-Prompt Agent会根据state自动切换prompt

---

## 🔄 第四部分：访谈执行Prompt

**文件**: `8.21-9.21双盲_副本/Foloup/系统prompts/访谈执行prompt.txt`

### 标准模式Prompt（Lisa/Bob）

```
You are a skilled user researcher...
The participant's name is {{name}}.
You have to keep the interview no more than {{mins}}.
The research objective is {{objective}}.

Your primary mission is to ask and get a response for every single question from the following list:
{{questions}}.

[访谈指导原则...]
```

**变量替换**:
- `{{name}}` → 受访者姓名
- `{{mins}}` → 时长
- `{{objective}}` → 调研目标
- `{{questions}}` → 问题列表字符串

### 深度访谈模式Prompt（David）

**General Prompt**:
```
You are conducting a systematic, session-based user research interview.
Research Objective: {{objective}}
Participant Name: {{name}}
Time Limit: {{mins}} minutes
Total Sessions: {{session_count}}

Your interview is organized into {{session_count}} distinct sessions...
```

**State Prompts** (每个Session):
```
{{session1}}  // 完整的Session 1文本
{{session2}}  // 完整的Session 2文本
...
```

**执行流程**:
1. 开始时进入`session_1` state
2. 执行`{{session1}}`中的所有内容
3. 完成后自动transition到`session_2`
4. 重复直到所有sessions完成

---

## 📋 第五部分：关键字段映射表

| 用户输入 | 数据库字段 | Retell变量 | 用途 |
|---------|-----------|-----------|------|
| name | interview.name | - | 访谈标识 |
| objective | interview.objective | {{objective}} | 调研目标 |
| numQuestions | interview.question_count | {{session_count}} | 问题/Session数量 |
| duration | interview.time_duration | {{mins}} | 时长限制 |
| questions (生成) | interview.questions | {{questions}} / {{session1-10}} | 访谈内容 |
| description (生成) | interview.description | - | 受访者看到的描述 |
| - | - | {{name}} | 受访者姓名（访谈时输入） |

---

## 🎯 第六部分：两种模式的完整对比

| 维度 | 标准模式（Lisa/Bob） | 深度访谈模式（David） |
|-----|-------------------|-------------------|
| **大纲生成API** | `/generate-interview-questions` | `/generate-interview-sessions` |
| **Prompt文件** | `generate-questions.ts` | `generate-sessions.ts` |
| **输出格式** | 问题对象数组 | Session文本数组 |
| **存储格式** | `questions: [{question, follow_up_count}]` | `questions: [{question: "Session文本", follow_up_count}]` |
| **Retell Agent类型** | 单一Prompt | Multi-Prompt (States) |
| **动态变量** | `{{questions}}` (字符串) | `{{session1-10}}` (10个变量) |
| **执行方式** | 一次性读取所有问题 | 逐个Session切换state |
| **适用场景** | 快速访谈、简单问题 | 深度访谈、复杂主题 |

---

## 🚀 第七部分：优化建议

基于通用AI访谈模板的最佳实践，建议改进：

### 7.1 输入界面增强
```typescript
// 新增字段
{
  researchType: 'product' | 'market',  // 调研类型
  targetUsers: string,                 // 目标用户描述
  expectedOutput: string,              // 期望产出
  mustCollect: string[]                // 必需收集项
}
```

### 7.2 大纲生成质量提升
- 融合通用模板的核心能力（渐进式收集、条件化追问）
- 保留固定即兴追问指令
- 增加Study Objectives概念

### 7.3 数据库字段扩展
```sql
ALTER TABLE interview ADD COLUMN research_type TEXT;
ALTER TABLE interview ADD COLUMN study_objectives JSONB;
ALTER TABLE interview ADD COLUMN core_objectives JSONB;
```

---

## 📝 总结

Foloup的访谈大纲传递机制核心特点：

1. **双模式支持**: 标准问题模式 + 深度Session模式
2. **智能路由**: 根据面试官类型自动选择生成方式
3. **灵活存储**: JSONB格式支持两种数据结构
4. **动态传递**: 通过Retell动态变量实现prompt注入
5. **状态管理**: David使用Multi-Prompt Agent实现Session切换

**下一步行动**:
- 创建产品调研专用prompt（融合通用模板能力）
- 更新数据库schema支持新字段
- 优化前端输入界面
- 测试新prompt的生成质量

