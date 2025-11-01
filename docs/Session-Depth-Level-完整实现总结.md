# Session Depth Level 系统 - 完整实现总结

> **版本**: 1.4.3  
> **最后更新**: 2025-10-30

---

## 📋 你的三个问题的答案

### 问题 1: depth_level 是否能在 Retell AI 中作为变量使用？

✅ **可以！**

**实现方式**:
- Retell AI 支持 `{{variable}}` 语法
- 我们在 `call.controller.ts` 中传递了 `depth_level_1` 到 `depth_level_10` 变量
- 在 `RETELL_AGENT_DEEP_DIVE_PROMPT` 中可以使用这些变量

**使用示例**:
```typescript
// backend/src/controllers/call.controller.ts
dynamicVariables = {
  session1: "Session 1 content...",
  depth_level_1: "high",  // 🆕 新增
  session2: "Session 2 content...",
  depth_level_2: "medium", // 🆕 新增
  // ...
};
```

**Retell AI Prompt 中使用**:
```
=== SESSION DEPTH LEVELS ===
Each session has a depth_level that indicates its importance:
- **HIGH** ({{depth_level_1}}, {{depth_level_2}}, etc.): CRITICAL sessions
- **MEDIUM**: Important context
- **LOW**: Flow/rapport building

When you see a session marked as "high" depth, you MUST:
1. Allocate more time (8-10 minutes)
2. Ask ALL questions
3. Use multi-level follow-ups (L1 → L2 → L3)
```

---

### 问题 2: depth_level 如何传递给初稿生成 Prompt？是否只是关于问题数量？

✅ **已优化！现在不仅是问题数量，更是问题质量的指导**

**传递方式**:
1. **骨架生成时**：AI 根据研究目标判断每个 session 的 depth_level
2. **用户 Review**：用户可以在 UI 中调整 depth_level
3. **初稿生成时**：从数据库读取 `interview.outline_skeleton`，其中包含用户调整后的 depth_level

**Prompt 中的语义**:

#### 🔥 High Depth (5-6 questions)
```markdown
**Question Quantity**: 5-6 questions (MUST generate at least 5)
**Question Quality**:
- ✅ **Deeply reference the Study Objective** - Every question should directly serve the core research goal
- ✅ **Leverage all Background Information** - Use the provided context to craft highly targeted questions
- ✅ **Multi-level follow-ups** - Include L1 (clarification) → L2 (examples) → L3 (impact) follow-up strategies
- ✅ **Granular insights** - Ask for specific examples, quantifiable data, concrete scenarios
- ✅ **Root cause exploration** - Don't stop at surface answers, dig into "why" and "how"
```

#### 🟡 Medium Depth (4-5 questions)
```markdown
**Question Quantity**: 4-5 questions
**Question Quality**:
- ✅ Reference the Study Objective moderately
- ✅ Use Background Information to guide questions
- ✅ Include basic follow-ups (L1-L2)
- ✅ Balance breadth and depth
```

#### ⚪ Low Depth (4 questions)
```markdown
**Question Quantity**: 4 questions (exactly 4)
**Question Quality**:
- ✅ Keep questions simple and conversational
- ✅ Focus on building rapport or wrapping up
- ✅ Minimal follow-ups needed
```

**核心原则**:
> **For HIGH depth sessions**: Treat them as the CORE of the research - invest maximum effort in crafting insightful, objective-aligned questions

---

### 问题 3: 用户修改 depth_level 后，生成的问题数量为何不对应？

✅ **已修复！**

**问题原因**:
1. ✅ 前端保存正确：`onUpdateSkeleton` 会更新 skeleton 并保存到后端
2. ✅ 后端读取正确：`generateFullOutlineFromSkeleton` 从数据库读取 `interview.outline_skeleton`
3. ❌ **Prompt 问题**：虽然 prompt 中提到了 depth_level，但没有强调其重要性

**修复方案**:
1. **增强 Prompt 语义**：明确说明 depth_level 的重要性和质量要求
2. **修改输出格式**：从字符串数组改为对象数组 `{session_text, depth_level}`
3. **数据传递优化**：确保 depth_level 从骨架 → 初稿 → Retell AI 的完整传递

**数据流**:
```
用户调整 depth_level
  ↓
保存到 outline_skeleton (Supabase)
  ↓
生成初稿时读取 outline_skeleton
  ↓
AI 根据 depth_level 生成对应数量和质量的问题
  ↓
保存到 draft_outline (包含 depth_level)
  ↓
访谈执行时传递 depth_level 到 Retell AI
```

---

## 🔧 技术实现细节

### 1. 数据结构变更

#### 旧格式 (v1.4.2)
```typescript
draft_outline: [
  "### Session 1: ...\n\nQ1.1 ...",
  "### Session 2: ...\n\nQ2.1 ..."
]
```

#### 新格式 (v1.4.3)
```typescript
draft_outline: [
  {
    session_text: "### Session 1: ...\n\nQ1.1 ...",
    depth_level: "high"
  },
  {
    session_text: "### Session 2: ...\n\nQ2.1 ...",
    depth_level: "medium"
  }
]
```

### 2. 兼容性处理

**后端** (`questions.controller.ts`):
```typescript
// 检查是否为新格式
if (typeof fullOutline.questions[0] === 'object' && fullOutline.questions[0].session_text) {
  // 新格式：保存完整对象
  questionsToSave = fullOutline.questions;
} else {
  // 旧格式：转换为新格式（默认 medium）
  questionsToSave = fullOutline.questions.map((sessionText: string) => ({
    session_text: sessionText,
    depth_level: 'medium'
  }));
}
```

**前端** (`questions.tsx`):
```typescript
const generatedQuestions = result.draft_outline.map((item: any) => {
  // 新格式
  if (typeof item === 'object' && item.session_text) {
    return {
      id: uuidv4(),
      question: item.session_text,
      depth_level: item.depth_level || 'medium'
    };
  }
  // 旧格式
  return {
    id: uuidv4(),
    question: item,
    depth_level: 'medium'
  };
});
```

### 3. Retell AI 集成

**传递变量** (`call.controller.ts`):
```typescript
dynamicVariables = {
  session1: questionsArray[0]?.question || "No content",
  depth_level_1: questionsArray[0]?.depth_level || "medium",
  session2: questionsArray[1]?.question || "No content",
  depth_level_2: questionsArray[1]?.depth_level || "medium",
  // ... 最多 10 个 sessions
};
```

**使用变量** (`constants.ts`):
```typescript
export const RETELL_AGENT_DEEP_DIVE_PROMPT = `
=== SESSION DEPTH LEVELS ===
Each session has a depth_level:
- **HIGH**: CRITICAL sessions - allocate 8-10 minutes, probe deeply
- **MEDIUM**: Important context - standard time, basic follow-ups
- **LOW**: Flow building - keep concise (4-5 minutes)

When you see a session marked as "high" depth, you MUST:
1. Allocate proportionally more time
2. Ask ALL questions in that session
3. Use multi-level follow-ups (L1 → L2 → L3)
...
`;
```

---

## 📊 完整数据流

```
┌─────────────────────────────────────────────────────────────┐
│ 1. 骨架生成 (Skeleton Generation)                           │
│    - AI 判断 depth_level (high/medium/low)                  │
│    - 保存到 outline_skeleton                                │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. 用户 Review (User Review)                                │
│    - 用户在 SessionCard UI 中调整 depth_level               │
│    - 保存到 outline_skeleton (Supabase)                     │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. 初稿生成 (Draft Generation)                              │
│    - 读取 outline_skeleton (包含用户调整后的 depth_level)   │
│    - AI 根据 depth_level 生成对应数量和质量的问题           │
│    - 保存到 draft_outline: [{session_text, depth_level}]    │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. 访谈执行 (Interview Execution)                           │
│    - 读取 draft_outline                                     │
│    - 传递 depth_level_1 到 depth_level_10 到 Retell AI     │
│    - Retell AI 根据 depth_level 调整时间和追问策略          │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ 测试建议

### 测试 1: depth_level 传递到初稿生成
1. 生成骨架
2. 在 SessionCard 中调整某个 session 的 depth_level 为 high
3. 生成完整大纲
4. 检查该 session 是否有 5-6 个问题

### 测试 2: depth_level 传递到 Retell AI
1. 创建一个访谈，设置不同的 depth_level
2. 开始访谈
3. 检查后端日志，确认 `depth_level_1` 等变量已传递
4. 观察 Retell AI 是否在 high session 中分配更多时间

### 测试 3: 向后兼容性
1. 使用旧版本创建的访谈（draft_outline 是字符串数组）
2. 编辑并保存
3. 确认系统正常工作（自动转换为新格式）

---

**维护者**: Userology 开发团队  
**最后更新**: 2025-10-30

