# 深度访谈模式（Deep Dive David）实现文档

## 📋 实现概述

成功实现了 **Session-based 深度访谈模式**，通过添加新的面试官 "Deep Dive David" 来实现。该模式与现有的 Lisa 和 Bob 并行存在，互不干扰。

---

## 🎯 核心特性

### 1. **新增面试官：Deep Dive David**
- **特点**：系统化、深度探索、session-based 访谈
- **响应速度**：更慢（responsiveness: 0.1），给用户更多思考时间
- **打断敏感度**：更低（0.15），让用户充分表达
- **声音**：11labs-Adam（更成熟稳重）

### 2. **智能数据格式转换**
- **标准模式（Lisa/Bob）**：使用原有的 `section1-10` 格式
- **深度访谈模式（David）**：自动转换为 `session1-6` 格式
- 完全向后兼容，frontend 无需改动

### 3. **专用 Prompt 设计**
- 强调 session 顺序执行
- 每个 session 必须完全探索完才能进入下一个
- 明确的过渡语言和进度跟踪

---

## 📁 修改文件清单

### 1. `/backend/src/lib/constants.ts`
**新增内容**：
- `RETELL_AGENT_DEEP_DIVE_PROMPT`：深度访谈专用 prompt
- `INTERVIEWERS.DAVID`：David 面试官配置

**关键参数**：
```typescript
DAVID: {
  name: "Deep Dive David",
  rapport: 9,
  exploration: 10,
  empathy: 8,
  speed: 3,  // 更慢，更深入
  is_deep_dive: true  // 标识深度访谈模式
}
```

### 2. `/backend/src/controllers/interviewers.controller.ts`
**新增内容**：
- 导入 `RETELL_AGENT_DEEP_DIVE_PROMPT`
- 创建 David 专用的 LLM model（使用深度访谈 prompt）
- 创建 David agent（优化的响应参数）
- 保存到数据库并返回

**关键代码**：
```typescript
// 创建专用 LLM
const davidModel = await retellClient.llm.create({
  model: "gpt-4o",
  general_prompt: RETELL_AGENT_DEEP_DIVE_PROMPT,
  ...
});

// 创建 agent（更慢、更深思熟虑）
const davidAgent = await retellClient.agent.create({
  responsiveness: 0.1,  // 比 Lisa/Bob 的 0.2 更低
  interruption_sensitivity: 0.15,
  ...
});
```

### 3. `/backend/src/controllers/call.controller.ts`
**新增逻辑**：
- 检测面试官类型（是否为深度访谈模式）
- 动态转换数据格式：
  - **标准模式**：保持原有 `dynamic_data` 结构
  - **深度访谈模式**：将 `questions` 数组转换为 `session1-6` 变量

**关键代码**：
```typescript
// 判断是否为深度访谈模式
const isDeepDiveMode = interviewer.name?.includes('David') || 
                      interviewer.name?.includes('Deep Dive') ||
                      (interviewer as any).is_deep_dive === true;

if (isDeepDiveMode) {
  // 转换为 session 格式
  dynamicVariables = {
    mins: body.dynamic_data.mins,
    objective: body.dynamic_data.objective,
    name: body.dynamic_data.name,
    session_count: sessionCount.toString(),
    session1: questions[0] || "",
    session2: questions[1] || "",
    // ... 最多支持 6 个 sessions
  };
}
```

---

## 🧪 测试步骤

### 1. **初始化 David 面试官**

```bash
# 启动后端服务
cd backend
npm run dev

# 调用创建面试官接口（会自动创建 Lisa、Bob、David）
curl -X POST http://localhost:YOUR_PORT/api/interviewers/create
```

**预期结果**：
```json
{
  "newInterviewer": { /* Lisa */ },
  "newSecondInterviewer": { /* Bob */ },
  "davidInterviewer": {
    "id": "...",
    "name": "Deep Dive David",
    "agent_id": "...",
    "is_deep_dive": true
  }
}
```

### 2. **创建使用 David 的访谈**

在 frontend 创建访谈时：
1. 选择 "Deep Dive David" 作为面试官
2. 在每个问题框中输入一整个 session 的内容

**示例 Session 输入**：
```
Question 1:
Session 1: User Background & Context
- Tell me about your role and daily responsibilities
- What does a typical workday look like for you?
- What tools and systems do you use regularly?
- How long have you been in this position?

Question 2:
Session 2: Pain Points Discovery
- What are the biggest challenges you face in your work?
- Can you walk me through a recent frustrating experience?
- How do you currently work around these issues?
- What would make your work significantly easier?
```

### 3. **开始访谈并验证行为**

启动访谈后，David 应该：
1. ✅ **顺序执行**：完整完成 Session 1 的所有问题后才进入 Session 2
2. ✅ **深度探索**：对每个回答进行深入追问
3. ✅ **明确过渡**：说出类似 "We've completed Session 1, let's move to the next section"
4. ✅ **不混淆 sessions**：不会在 Session 1 中提及 Session 2 的内容
5. ✅ **更慢节奏**：给用户更多思考和回答时间

### 4. **验证数据传递**

检查后端日志，应该看到：
```
🔬 [Deep Dive Mode] Transforming questions to sessions...
🔬 [Deep Dive Mode] Session variables: {
  session_count: 3,
  session1_preview: "Session 1: User Background & Context\n- Tell me...",
  session2_preview: "Session 2: Pain Points Discovery\n- What are..."
}
```

### 5. **向后兼容性验证**

1. 创建使用 Lisa 或 Bob 的访谈
2. 验证仍然使用原有格式（section1-10）
3. 确认访谈正常进行

---

## 🔧 技术细节

### Prompt 设计关键点

1. **明确的 Session 结构**：
   ```
   SESSION STRUCTURE:
   {{session1}}
   {{session2}}
   ...
   ```

2. **严格的执行协议**：
   - SEQUENTIAL COMPLETION（顺序完成）
   - EXHAUSTIVE EXPLORATION（详尽探索）
   - EXPLICIT TRANSITIONS（明确过渡）
   - NO SESSION MIXING（不混淆 session）

3. **进度跟踪机制**：
   - 要求 AI 自我检查当前 session 的完成度
   - 在进入下一个 session 前明确宣布

### 数据流

```
Frontend (创建访谈)
  ↓
  questions: [
    "Session 1: ...",
    "Session 2: ...",
    ...
  ]
  ↓
Backend (call.controller.ts)
  ↓
检测面试官类型
  ↓
[David] → 转换为 session1-6 格式
[Lisa/Bob] → 保持原有 section1-10 格式
  ↓
Retell API
```

---

## 📊 性能参数对比

| 参数 | Lisa | Bob | David |
|------|------|-----|-------|
| Rapport | 7 | 7 | 9 |
| Exploration | 10 | 7 | 10 |
| Empathy | 7 | 10 | 8 |
| Speed | 5 | 5 | 3 |
| Responsiveness | 0.2 | 0.2 | 0.1 |
| Interruption Sensitivity | 0.2 | 0.2 | 0.15 |
| Max Sessions | - | - | 6 |

---

## ⚠️ 注意事项

1. **Session 数量限制**：当前支持最多 6 个 sessions（可根据需要扩展）
2. **Prompt 变量**：David 使用 `session1-6`，Lisa/Bob 使用 `section1-10`
3. **向后兼容**：所有现有功能保持不变，只是新增了 David 选项
4. **面试官检测**：通过名称匹配或 `is_deep_dive` 标志识别深度访谈模式

---

## 🚀 未来扩展建议

### 短期（可选）
1. **Frontend UI 优化**：
   - 检测到 David 时，将 "Question" 标签改为 "Session"
   - 添加提示："每个输入框代表一个完整的探索 session"

2. **Session 数量扩展**：
   - 如需超过 6 个 sessions，可扩展 `session7-10`

### 长期（高级功能）
1. **Multi-Agent Prompt Tree**：
   - 使用 Retell 的 Custom LLM states 功能
   - 每个 session 一个独立的 prompt node
   - 更精确的流程控制和状态管理

2. **动态 Session 生成**：
   - 根据用户回答自动调整后续 sessions
   - 智能深挖有价值的方向

---

## ✅ 实现完成清单

- [x] 添加 `RETELL_AGENT_DEEP_DIVE_PROMPT`
- [x] 添加 `INTERVIEWERS.DAVID` 配置
- [x] 在 `interviewers.controller.ts` 中创建 David
- [x] 在 `call.controller.ts` 中实现数据格式转换
- [x] 修复所有 Linter 错误
- [x] 确保向后兼容
- [x] 创建测试文档

---

## 📞 使用示例

### 创建深度访谈

```typescript
// Frontend: 选择 David 面试官
const interview = {
  interviewer_id: davidId,  // David 的 ID
  objective: "深入了解产品经理的工作流程和痛点",
  time_duration: "30",
  questions: [
    {
      question: `Session 1: 角色背景\n- 介绍你的职位和主要职责\n- 描述典型的一天\n- 你使用哪些工具？`
    },
    {
      question: `Session 2: 痛点发现\n- 工作中最大的挑战是什么？\n- 最近遇到的困难案例\n- 目前如何解决？`
    },
    {
      question: `Session 3: 期望与需求\n- 理想的工作状态是什么样的？\n- 如果有魔法棒，你会改变什么？\n- 对新工具的期待`
    }
  ]
};
```

---

## 🎉 总结

成功实现了**最小改动**的深度访谈模式：
- **3 个文件修改**，共约 **120 行代码**
- **完全向后兼容**，不影响现有功能
- **智能识别**面试官类型，自动切换模式
- **即插即用**，无需额外配置

David 面试官现在可以进行系统化、结构化的深度访谈，非常适合需要详尽探索的用户研究场景！

