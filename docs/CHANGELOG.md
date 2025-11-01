# Changelog

所有重要的项目变更都会记录在这个文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)。

---

## [1.4.5] - 2025-10-30

### 🐛 Bug 修复 (v5 - 最终版本)

**修复两个核心问题（温和、稳妥的方式）**

1. **修复 AI 只生成首尾 session 的问题** ✅
   - 在 Prompt 中添加明确的警告和 Session 2 示例
   - 要求 AI 生成 EXACTLY N sessions
   - 修正 low depth level 问题数量（2-4）

2. **修复重新生成初稿时语言不更新的问题** ✅
   - 后端：确保 skeleton.metadata.draft_language 存在（如果 AI 没生成，手动添加）
   - 前端：当 interviewId 已存在时，先更新 skeleton 再生成完整大纲
   - 使用 `OutlineService.updateSkeleton` API（已有的、稳定的 API）

3. **简化页面验证逻辑** ✅
   - `outline/page.tsx` 只检查 `name`（不检查 `interviewer_id`）
   - 避免 BigInt(0) 导致的误判

### 🔄 回退修改 (v4)

**回退不必要的修改，恢复稳定性**
- ✅ 回退了 v3 中过于激进的修改
- ✅ 保留有用的调试日志和 Prompt 修复

### 🐛 Bug 修复 (v1-v3)

**初稿生成问题修复**
- ✅ 修复 AI 只生成 Session 1 和最后一个 Session 的问题
- ✅ 在 Prompt 中明确要求生成所有 sessions（不跳过任何 session）
- ✅ 添加详细的调试日志，便于排查问题

**Depth Level 问题数量修正**
- ✅ Low depth level 问题数量从固定 4 个调整为 2-4 个（更灵活）
- ✅ 更新 Prompt 中的说明：low (2-4), medium (4-5), high (5-6)

**重新生成初稿时语言更新问题修复**
- ✅ 修复用户重新生成骨架（改变初稿语言）后，生成的初稿依然使用旧语言的问题
- ✅ 在生成完整大纲前，先更新后端的 skeleton 和 outline_debug_language
- ✅ 添加详细日志，便于排查语言设置问题

### 🔧 技术细节

**修改文件**:
1. `backend/src/lib/prompts/generate-full-outline-from-skeleton.ts`
   - 在输出格式说明中添加 "MUST generate EXACTLY N sessions" 警告
   - 添加 Session 2 示例，避免 AI 误以为只需要生成首尾两个 session
   - 修正 low depth level 的问题数量显示（2-4）

2. `backend/src/controllers/questions.controller.ts`
   - 添加详细的调试日志（OpenAI 响应、解析结果、保存数据、语言设置）
   - 确保 skeleton.metadata.draft_language 存在（如果 AI 没生成，手动添加）
   - 移除 `updated_at` 字段（Supabase 自动管理）

3. `frontend/src/components/dashboard/interview/create-popup/questions.tsx`
   - 当 interviewId 已存在时，先调用 `updateSkeleton` 再生成完整大纲
   - 添加语言设置日志

4. `frontend/src/app/dashboard/create-interview/outline/page.tsx`
   - 简化验证逻辑（只检查 name）

---

## [1.4.5] - 2025-10-30

### 🎨 UI/UX 优化

**Depth Level 信息提示**
- ✅ 在骨架 review 界面的 Depth Level 选择器旁添加信息按钮（ℹ️）
- ✅ 点击后展开详细说明，解释 Depth Level 不仅关乎问题数量，更影响：
  - 追问深度（High: L1→L2→L3，Low: 基础追问）
  - 时间分配（AI 在 High 优先级 Session 上分配更多时间）
  - 重视程度（High 优先级会更深入探索用户痛点）

**访谈执行界面字幕滚动优化**
- ✅ 修复 AI 主持人字幕超出框的问题
- ✅ 固定访谈框高度（250px）
- ✅ 添加垂直滚动功能（`overflow-y-auto`）
- ✅ 实现自动滚动到最新内容（字幕向上顶）
- ✅ 用户可以上下滚动查看历史字幕

**访谈分发界面 Study Objective 显示优化**
- ✅ 设置 Study Objective 显示框最大高度（120px）
- ✅ 超出部分可在框内滚动查看
- ✅ 避免超长文本撑开页面布局

### 🔧 技术细节

**修改文件**:
1. `frontend/src/components/dashboard/interview/create-popup/SessionCard.tsx`
   - 添加 `Info` 图标导入
   - 添加 `showDepthLevelInfo` 状态
   - 添加信息按钮和可展开的描述框
2. `frontend/src/components/call/index.tsx`
   - 添加 `lastInterviewerResponseRef` ref
   - 修改 AI 主持人字幕容器：`min-h-[250px]` → `h-[250px]`，添加 `overflow-y-auto`
   - 添加自动滚动逻辑（useEffect）
3. `frontend/src/components/dashboard/interview/create-popup/distribute.tsx`
   - 添加 `max-h-[120px] overflow-y-auto` 到 Study Objective 显示框

---

## [1.4.4] - 2025-10-30

### 🚀 新功能

**骨架生成 Context 深度强化**
- ✅ **多视角覆盖**：Background Information 现在包含用户视角、专业人士视角、机构视角等多个维度
- ✅ **深度场景化**：提供具体的量化数据、真实用户行为模式和痛点描述
- ✅ **可操作性增强**：为 AI 提供具体的追问线索（"当用户说X时，应该追问Y"）
- ✅ **竞品生态理解**：详细的竞品分析，包含定位、优劣势、用户认知
- ✅ **Background Information 数量提升**：从 3-5 项提升到 5-8 项，覆盖更全面

**参考素材B和素材C的结构**：
- 需求调研：包含市场趋势、竞品分析、用户行为模式、本地化细节
- 产品调研：包含产品功能、用户群体、使用场景、竞品对比

**AI Suggested Depth Level 固定显示**
- ✅ 新增 `ai_suggested_depth_level` 字段，保存 AI 最初建议的 depth_level
- ✅ UI 中的 "AI suggested" 标签不再随用户调整而改变
- ✅ 用户可以清楚看到 AI 的原始建议和自己的调整

### 🎨 优化

**Low Depth Level 问题数量调整**
- ✅ 从固定 4 个问题调整为 2-4 个问题（更灵活）
- ✅ 根据 session 复杂度调整（warm-up: 2-3，wrap-up: 3-4）

### 🔧 技术细节

**修改文件**:
1. `backend/src/lib/prompts/generate-outline-skeleton.ts`
   - 增强 Background Information Requirements（多视角、深度场景化、可操作性、竞品生态）
   - 更新 Session Structure Guidelines（需求调研和产品调研的详细示例）
   - Background Information 数量从 3-5 项提升到 5-8 项
2. `backend/src/lib/prompts/generate-full-outline-from-skeleton.ts`
   - Low depth level 问题数量从 4 调整为 2-4
3. `frontend/src/components/dashboard/interview/create-popup/SessionCard.tsx`
   - 更新 UI 显示（Low: 2-4 Qs）
   - 修复 "AI suggested" 显示逻辑（使用 `ai_suggested_depth_level`）
4. `backend/src/types/interview.ts` & `frontend/src/types/interview.ts`
   - 添加 `ai_suggested_depth_level` 字段到 `SkeletonSession` 接口
5. `backend/src/controllers/questions.controller.ts`
   - 骨架生成时保存 `ai_suggested_depth_level`

---

## [1.4.3] - 2025-10-30

### 🚀 新功能

**Session Depth Level 系统优化**
- ✅ **Depth Level 语义增强**：在初稿生成 Prompt 中，根据 depth_level 给出不同的质量要求
  - high: 深度参考 Study Objective、充分利用 Background Information、多层次追问（L1→L2→L3）
  - medium: 适度参考、基础追问
  - low: 简单对话、最小追问
- ✅ **Depth Level 传递到 Retell AI**：在访谈执行时，Retell AI 可以根据 depth_level 调整时间分配和追问策略
  - high session: 分配更多时间（8-10分钟）、深度追问
  - medium session: 标准时间、基础追问
  - low session: 简洁高效（4-5分钟）
- ✅ **数据结构优化**：`draft_outline` 从字符串数组改为对象数组 `{session_text, depth_level}`

### 🐛 Bug 修复

- 修复用户修改 depth_level 后生成的问题数量不对应的问题
- 修复 Prompt 中反引号未转义导致的编译错误

### 🔧 技术细节

**修改文件**:
1. `backend/src/lib/prompts/generate-full-outline-from-skeleton.ts`
   - 增强 depth_level 的语义说明（问题数量 + 问题质量）
   - 修改输出格式为对象数组（包含 depth_level）
2. `backend/src/controllers/questions.controller.ts`
   - 兼容新旧数据格式
   - 保存 depth_level 到 draft_outline
3. `frontend/src/components/dashboard/interview/create-popup/questions.tsx`
   - 解析新格式的 draft_outline
4. `backend/src/controllers/call.controller.ts`
   - 传递 `depth_level_1` 到 `depth_level_10` 变量到 Retell AI
5. `backend/src/lib/constants.ts`
   - 更新 `RETELL_AGENT_DEEP_DIVE_PROMPT`，添加 depth_level 使用说明

---

## [1.4.2] - 2025-10-30

### 🚀 新功能

#### Session Depth Level 系统 ✨

**核心功能**:
- **骨架生成阶段**：AI 自动判断每个 Session 的深度等级（`depth_level`）
- **用户 Review 阶段**：显示 AI 建议的 depth level，用户可调整
- **完整大纲生成**：严格遵循 depth level 分配问题数量
- **（未来）Retell AI 执行**：可传递 depth level 到系统提示词

**Depth Level 定义**:
- **high**: 核心目标、痛点发现、竞品分析、功能验证 (5-6 questions)
- **medium**: 背景构建、行为探索、一般体验 (4-5 questions)
- **low**: 热身、收尾 (4 questions)

**AI 判断逻辑**:
- 分析研究目标，识别哪些 Session 直接解决核心研究问题
- 探索"why"、"pain points"、"alternatives"的 Session → high
- 探索"what"、"how"、"when"的 Session → medium
- 第一个和最后一个 Session 通常 → low（除非研究专注于 onboarding/offboarding）
- 典型分配：2-3 high, 2-3 medium, 1-2 low

**UI 设计**:
- 在 SessionCard 中显示 Depth Level 选择器
- 三个按钮：Low (4 Qs) / Medium (4-5 Qs) / High (5-6 Qs)
- 颜色编码：灰色（Low）/ 蓝色（Medium）/ 紫色（High）
- 显示 AI 建议："(AI suggested: high)"

**数据结构**:
```typescript
export type SessionDepthLevel = 'high' | 'medium' | 'low';

export interface SkeletonSession {
  session_number: number;
  session_title: string;
  session_goal: string;
  background_information: string[];
  must_ask_questions: string[];
  depth_level: SessionDepthLevel; // 新增
}
```

**Prompt 更新**:
- 骨架生成 Prompt：添加 "Session Depth Level Assignment" 部分
- 完整大纲生成 Prompt：更新为"STRICTLY follow the `depth_level`"

### 🔧 技术细节

**修改文件**:
- `backend/src/types/interview.ts` - 添加 `SessionDepthLevel` 类型和 `depth_level` 字段
- `frontend/src/types/interview.ts` - 同步类型定义
- `backend/src/lib/prompts/generate-outline-skeleton.ts`
  - 添加 "Session Depth Level Assignment" 部分
  - 更新 Output Format（添加 `depth_level` 字段）
  - 更新 Quality Checklist
- `backend/src/lib/prompts/generate-full-outline-from-skeleton.ts`
  - 更新 skeleton summary 显示 depth level
  - 更新 "Question Depth and Quantity Requirements"（严格遵循 depth_level）
- `frontend/src/components/dashboard/interview/create-popup/SessionCard.tsx`
  - 添加 Depth Level 选择器 UI
  - 支持用户调整 depth level

---

## [1.4.1] - 2025-10-30

### 🎨 优化

#### 大纲生成 Prompt 优化 - 用户体验提升 ✨

**1. 结束访谈提示**:
- 在最后一个 Session 的 Closing 中添加明确提示
- 提醒参与者点击"结束访谈"按钮提交回答
- 示例：⚠️ **CRITICAL REMINDER**: "Please remember to click the 'End Interview' button to submit your responses. Thank you so much for your time and valuable insights!"

**2. 多层次追问策略** 🔥:
- **问题背景**：当前所有追问都是一层，无法深挖关键信息
  - 例如：用户提到竞品"得分 6 分，因为使用不便"，追问后得到"无法在学校使用"，但没有继续追问"为什么无法在学校使用"
- **解决方案**：设计分层追问机制（L1 → L2 → L3）
  - **L1 (Surface Exploration)**: 澄清模糊陈述，获取初步细节
    - 例如："What makes it inconvenient?" / "Why can't it be used at school?"
  - **L2 (Concrete Examples)**: 请求具体场景，揭示真实行为
    - 例如："Can you walk me through a specific time when this happened?"
  - **L3 (Impact & Root Cause)**: 理解后果，识别潜在需求
    - 例如："How did that affect your study plan?" / "What would an ideal solution look like?"
- **应用场景**：痛点分析、竞品分析、功能验证等关键问题
- **效果**：从表面回答深挖到可执行洞察

**3. 智能问题数量分配** 🎯:
- **问题背景**：当前所有 Session 都是 4 个问题，没有根据重要性调整
- **解决方案**：根据 Session 目标和重要性动态分配 4-6 个问题
  - **高优先级 Session** (核心目标、痛点发现、解决方案探索): **5-6 个问题**
    - 需要更深入的探索和更细粒度的洞察
    - 例如：痛点发现、竞品分析、功能验证
  - **中优先级 Session** (背景构建、行为探索): **4-5 个问题**
    - 提供必要背景但不需要极端深度
    - 例如：背景构建、使用模式、一般体验
  - **低优先级 Session** (热身、收尾): **4 个问题**
    - 对流程重要但不需要大量提问
    - 例如：破冰、最终想法、感谢
- **效果**：AI 会真正思考哪些 Session 需要更多问题深入挖掘

### 🐛 Bug 修复

- 修复创建 interview 时 `researchType` 字段导致的 500 错误
  - 问题：前端传递了数据库不存在的 `researchType` 字段
  - 解决：在后端 controller 中过滤掉该字段

### 🔧 技术细节

**修改文件**:
- `backend/src/lib/prompts/generate-full-outline-from-skeleton.ts`
  - 更新 "Your Task" 部分，添加多层次追问和结束提示
  - 更新 "Question Depth and Quantity Requirements"，添加智能分配策略
  - 重写 "Follow-up Strategy" 为 "Multi-Level Follow-up Strategy"
  - 更新 Output Format，添加 L1/L2/L3 示例和结束提示
  - 更新 Quality Checklist，添加新的验证项
  - 更新 Important Principles，添加新原则
- `backend/src/controllers/interviews.controller.ts`
  - 过滤 `researchType` 字段，保留骨架相关字段

---

## [1.4.0] - 2025-10-30

### 🚀 新功能

#### 两步大纲生成系统完整实现 ✨

**核心功能**:
1. **Step 1: 生成骨架** - 生成 Session 主题、目标、背景信息
2. **Step 2: 用户 Review** - 用户可编辑骨架的所有字段
3. **Step 3: 生成完整大纲** - 基于审核后的骨架生成 4-6 个具体问题

**数据库变更**:
- 新增字段：`outline_skeleton` (JSONB)
- 新增字段：`outline_generation_status` (VARCHAR)
- 新增字段：`skeleton_generated_at` (TIMESTAMP)
- 执行迁移：`backend/migrations/005_add_outline_skeleton_fields.sql`

**Session 配置传导优化**:
- 用户在 Session 配置中输入的主题会被传递到骨架生成 Prompt
- AI 会严格遵循用户指定的 Session 主题
- Prompt 中添加 "🎯 User-Specified Session Themes (MUST FOLLOW)" 部分

**必问问题功能**:
- 在骨架 Review 中，每个 Session 可添加"必问问题"
- UI 位置：Background Information 下方，样式一致
- 支持添加、编辑、删除必问问题
- 生成完整大纲时，必问问题会被自然融入访谈流程（Q3-Q5）
- 在 Interviewer Notes 中标记为 "[MUST-ASK per User Requirement]"

**类型定义**:
```typescript
interface SkeletonSession {
  session_number: number;
  session_title: string;
  session_goal: string;
  background_information: string[];
  must_ask_questions: string[]; // 新增
}
```

**API 端点**:
- `POST /api/outlines/skeleton` - 生成骨架（不需要 interview_id）
- `PATCH /api/outlines/:id/skeleton` - 更新骨架（用户编辑）
- `POST /api/outlines/:id/full-outline` - 生成完整大纲

**前端组件**:
- `SessionCard.tsx` - 显示和编辑单个 Session（包括必问问题）
- `SkeletonReview.tsx` - 骨架预览和编辑
- `questions.tsx` - 两步生成流程的主要逻辑

**状态管理**:
- Zustand Store 中添加 `outlineSkeleton` 状态
- 支持跨页面保存骨架状态

**Prompt 优化**:
- 骨架生成 Prompt：接收 `manualSessions`，严格遵循用户输入
- 完整大纲生成 Prompt：处理 `must_ask_questions`，自然融入访谈流程

---

### 🔧 技术细节

**修改的文件**:
- `backend/src/types/interview.ts` - 添加 `must_ask_questions` 字段
- `backend/src/lib/prompts/generate-outline-skeleton.ts` - 接收 `manualSessions`
- `backend/src/lib/prompts/generate-full-outline-from-skeleton.ts` - 处理 `must_ask_questions`
- `backend/src/controllers/questions.controller.ts` - 三个新 API 端点
- `backend/src/routes/questions.routes.ts` - 路由配置
- `frontend/src/types/interview.ts` - 类型定义同步
- `frontend/src/services/outline.service.ts` - API 调用封装
- `frontend/src/store/interview-store.ts` - 状态管理
- `frontend/src/components/dashboard/interview/create-popup/questions.tsx` - 主要逻辑
- `frontend/src/components/dashboard/interview/create-popup/SessionCard.tsx` - Session 编辑
- `frontend/src/components/dashboard/interview/create-popup/SkeletonReview.tsx` - 骨架预览

**数据库迁移**:
- `backend/migrations/005_add_outline_skeleton_fields.sql` ✅ 已执行

---

## [1.3.11] - 2025-10-26

### 🐛 Bug 修复

#### 修复大纲生成 Prompt 的 Output Format 不一致问题 🔧

**问题**:
- 用户测试发现即使添加了 Session 1 Opening 要求和问题深度要求，生成的大纲仍然不符合要求
- 根本原因：**Output Format 中的示例与新要求不一致**
  - Opening 部分仍然是 `[Brief warm transition]`（太简略）
  - 问题数量仍然是 `[Continue for 3-5 questions per session]`（应该 4-6 个）
  - 没有明确展示 Session 1 Opening 的 6 个关键元素

**解决方案**:

**1. 更新 Output Format 中的 Opening 示例** 📋:

**旧版本**（太简略）:
```
**[Opening]**
[Brief warm transition]
```

**新版本**（明确要求）:
```
**[Opening]**
[CRITICAL FOR SESSION 1: Must include ALL 6 elements - Warm Greeting + Interview Introduction + Scope Clarification + Time Setting + Expectation Setting + Readiness Check. Example: 'Hello! It's great to connect with you. Thank you for taking the time to participate in our interview. Today, I'd like to chat with you about [topic]. We'll be focusing on [areas]. This interview will take about [X] minutes, and I'm really interested in understanding your genuine experiences. There are no standard answers - just share what comes to mind. Are you ready to get started?']

[For Session 2+: Brief warm transition]
```

---

**2. 更新 Output Format 中的问题数量示例** 📊:

**旧版本**:
```
Q1.2 [Similar structure]
[Continue for 3-5 questions per session]
```

**新版本**:
```
Q1.2 [Similar structure]

Q1.3 [Similar structure]

Q1.4 [Similar structure]

[CONTINUE for 4-6 questions per session - use funnel approach: start broad, gradually narrow down]
```

---

**3. 强化 Quality Checklist** ✅:

在 Quality Checklist 中新增专门的检查项：

**Session 1 Opening (CRITICAL)**:
- ✅ Does Session 1 Opening include ALL 6 elements?
- ✅ Is the opening warm, natural, and welcoming?
- ✅ Does it set proper expectations?

**Question Depth and Quantity (CRITICAL)**:
- ✅ Does EACH session have 4-6 questions (not just 2-3)?
- ✅ Do questions follow the funnel approach (broad → specific)?
- ✅ Does Session 1 start with self-introduction/background?

---

**预期效果**:

**Output Format 一致性**:
- ✅ AI 在生成时会看到明确的示例
- ✅ 示例与要求完全一致
- ✅ 减少 AI 自由发挥的空间

**质量检查强化**:
- ✅ AI 在生成后会自我检查关键要求
- ✅ 明确的检查清单确保不遗漏
- ✅ 提高生成质量的一致性

**影响的文件**:
- `backend/src/lib/prompts/generate-market-research-sessions.ts` (337 lines → 350 lines)
- `backend/src/lib/prompts/generate-product-research-sessions.ts` (337 lines → 350 lines)

---

## [1.3.10] - 2025-10-26

### 🎨 优化

#### 大纲生成 Prompt 优化 - Intro 铺垫和问题深度 📋

**背景**:
- 用户测试发现生成的大纲存在两个问题：
  1. Session 1 的 Intro 过于直接，缺乏铺垫和引导
  2. 每个 Session 的问题数量太少（2-3个），缺乏深度挖掘

**核心变更**:

**1. Session 1 Opening 要求优化** 🎯:

**问题**:
- 旧版本生成的 Intro 过于直接：
  ```
  ❌ "谢谢您参与我们的面试。为了更好地理解您的需求，我们想先了解您当前的备考经历。"
  ```
- 缺少打招呼、访谈介绍、时长说明、期望设定

**解决方案**:

新增 **"CRITICAL: Session 1 Opening Requirements"** 章节，明确要求 Session 1 的 Intro 必须包含：

1. **Warm Greeting**: 友好的问候和感谢
2. **Interview Introduction**: 解释访谈主题和目的
3. **Scope Clarification**: 简要说明将要讨论的主要话题
4. **Time Setting**: 告知访谈时长
5. **Expectation Setting**: 强调没有标准答案，鼓励真实分享
6. **Readiness Check**: 确认参与者准备好开始

**优秀示例**:
```
Hello! It's great to connect with you. Thank you for taking the time to participate in our interview. Today, I'd like to chat with you about [main topic related to research objective]. We'll be focusing on [specific areas]. This interview will take about [X] minutes, and I'm really interested in understanding your genuine experiences and thoughts. There are no standard answers - just share what comes to mind. Are you ready to get started?
```

**糟糕示例**（过于直接）:
```
❌ "Thank you for participating. Let's start by understanding your current situation."
```

**效果**:
- ✅ 建立温暖、友好的访谈氛围
- ✅ 让参与者了解访谈目的和流程
- ✅ 设定正确的期望（无标准答案）
- ✅ 减少参与者的紧张感

---

**2. 问题深度和数量要求** 📊:

**问题**:
- 旧版本生成的 Session 只有 2-3 个问题
- 缺乏深度挖掘，无法充分探索主题

**解决方案**:

新增 **"QUESTION DEPTH AND QUANTITY (CRITICAL)"** 章节，明确要求：

**每个 Session 必须有 4-6 个问题**，逐步建立深度：

- **Q1**: 广泛、易于回答的问题（建立舒适感和信任）
- **Q2-3**: 探索行为、经验、背景（建立理解）
- **Q4-5**: 深入挖掘具体痛点、需求或关键领域（建立洞察）
- **Q6**（如需要）: 综合学习或过渡到下一主题

**问题递进策略 - 使用漏斗方法**:

从 **广泛** → 逐渐 **聚焦** 到具体洞察

**Session 1 示例（背景建立）**:
1. 自我介绍 / 当前角色（广泛、舒适）
2. 当前情况 / 日常背景（中等具体性）
3. 相关行为 / 实践（更具体）
4. 与研究目标的联系（有针对性）

**Session 2 示例（痛点发现）**:
1. 对主题的总体感受（广泛）
2. 遇到的具体挑战（中等）
3. 这些挑战的影响（更深）
4. 尝试的解决方案或变通方法（最深）

**Session 3 示例（解决方案探索）**:
1. 当前使用的工具/方法（广泛）
2. 哪些有效（中等）
3. 哪些无效 / 挫折（更深）
4. 理想解决方案的特征（最深）

**效果**:
- ✅ 每个 Session 有足够的问题深度
- ✅ 从浅到深逐步建立信任和洞察
- ✅ 避免过于直接或突兀的提问
- ✅ 充分探索每个主题

---

**3. 同步更新两个 Prompt** 📁:

**A. Market Research Sessions**:
- 添加 Session 1 Opening 要求
- 添加问题深度和数量要求
- 提供具体的问题递进示例

**B. Product Research Sessions**:
- 同步添加 Session 1 Opening 要求
- 同步添加问题深度和数量要求
- 提供产品研究场景的问题递进示例

---

**预期效果**:

**访谈开场**:
- ✅ 更自然、更温暖的开场
- ✅ 参与者更清楚访谈目的和流程
- ✅ 减少紧张感，提高参与意愿

**问题深度**:
- ✅ 每个 Session 有 4-6 个问题（而非 2-3 个）
- ✅ 从浅到深逐步建立洞察
- ✅ 充分探索每个主题
- ✅ 避免遗漏关键信息

**整体质量**:
- ✅ 生成的大纲更接近专业访谈标准
- ✅ 更好的信息收集效果
- ✅ 更高的参与者满意度

**影响的文件**:
- `backend/src/lib/prompts/generate-market-research-sessions.ts` (272 lines → 337 lines)
- `backend/src/lib/prompts/generate-product-research-sessions.ts` (272 lines → 337 lines)

---

## [1.3.9] - 2025-10-26

### 🔄 同步更新

#### Retell AI 深度访谈 System Prompt 同步 🎙️

**背景**:
- 在 Retell AI 平台上优化了深度访谈模式（David）的 system prompt
- 需要将优化后的 prompt 同步到代码库，确保代码和平台配置一致

**核心变更**:

**1. 优化的 Prompt 结构** 📋:

新的 prompt 分为四个清晰的模块：

**A. SETUP（设置信息）**:
```
- Objective: {{objective}}
- Participant: {{name}}
- Time: {{mins}} minutes
- Structure: {{session_count}} sequential sessions
```

**B. COMMUNICATION（沟通策略）**:
- 多样化的确认语（避免重复）
- 同理心表达
- 建立连接（引用之前的回答）

**C. PROBING STRATEGY（追问策略）**:
- 🎯 **HIGH-VALUE signals**（立即深挖）：
  - 意外行为或变通方法
  - 强烈情绪反应
  - 与之前陈述的矛盾
  - 与研究目标相关的具体痛点
  - "啊哈"时刻或惊喜洞察

- 💡 **MEDIUM-VALUE signals**（快速追问一次）：
  - 需要澄清的模糊陈述
  - 值得探索的有趣细节
  - 不完整的流程描述

- ⏭️ **SKIP additional probing**（跳过追问）：
  - 答案清晰完整
  - 话题与研究目标无关
  - 已经充分探索
  - 时间紧迫

**D. HANDLING ISSUES（问题处理）**:
- 沉默/无回应：换个角度重新表述
- 简短/不清晰的回答：澄清、提示、反馈确认、添加上下文
- **关键原则**：永远不要重复完全相同的问题，总是换个角度重新表述

**E. SESSION FLOW（Session 流程）**:
- 完全完成当前 session 后再过渡到下一个
- 在 session 内提问并探索追问
- 仅在当前 session 充分探索后使用过渡工具
- 不要混合或跳跃 sessions
- 如果 session 内容为空或显示 "No content"，结束访谈

**2. 关键优化点** ✨:

**A. 更清晰的追问分级**:
- 旧版本：笼统的 "use follow-up questions"
- 新版本：明确的 HIGH/MEDIUM/SKIP 三级分类，帮助 Agent 判断何时深挖、何时跳过

**B. 更自然的沟通**:
- 旧版本：没有具体的确认语指导
- 新版本：提供多样化的确认语示例，避免机械重复

**C. 更好的问题处理**:
- 旧版本：没有处理沉默或不清晰回答的指导
- 新版本：明确的处理策略（重新表述、澄清、反馈确认）

**D. 强调对话性**:
- 新增：`Keep {{name}} engaged. Make it conversational, not interrogational.`
- 强调访谈应该是对话，而非审问

**3. 同步的文件** 📁:

**A. `backend/src/lib/constants.ts`**:
- 更新 `RETELL_AGENT_DEEP_DIVE_PROMPT`
- 虽然这个常量目前未被直接使用，但保留作为参考和备份

**B. `backend/src/controllers/interviewers.controller.ts`**:
- 更新 David agent 创建时的 `general_prompt`
- 这是实际使用的 prompt
- 移除未使用的 `RETELL_AGENT_DEEP_DIVE_PROMPT` 导入

**预期效果**:
- ✅ 代码库与 Retell AI 平台配置保持一致
- ✅ Agent 有更清晰的追问判断标准
- ✅ 访谈更自然、更像对话
- ✅ 更好地处理沉默和不清晰的回答
- ✅ 避免机械重复的确认语

---

## [1.3.8] - 2025-10-26

### 🎨 优化

#### 追问生成逻辑优化 - 更灵活、更自然 🎯

**优化目标**:
- 移除即兴追问相关内容（系统自动处理，无需在大纲中体现）
- 追问改为方向性指示而非固定句子（给访谈执行 Agent 更多灵活性）
- Session 案例改为更抽象的描述（避免过度具象化导致生成偏向）
- 删除过拟合的特定规则（如 AI/Technology Expectations）

**核心变更**:

**1. 移除即兴追问指导** 🧹:
- ❌ 删除 "Standard Impromptu Instructions" 章节
- ❌ 删除 "Impromptu Follow-up Guidance" 内容
- ✅ 原因：访谈执行系统（Retell AI）已内置即兴追问能力，无需在大纲中重复指导

**2. 追问改为方向性指示** 🎯:

**旧格式**（固定句子，过于僵硬）:
```
**Follow-up Strategy:**
[If user mentions friction] "Can you tell me more about that? What exactly happened?"
[If user describes usage] "How often do you use it? In what situations?"
```

**新格式**（方向性指示，灵活自然）:
```
**Follow-up Directions:**
[If user mentions friction] → Probe for: specific examples, impact, attempted solutions
[If user describes usage] → Probe for: frequency, triggers, context
```

**优势**:
- 给访谈执行 Agent 更多灵活性，可根据实际对话语境调整措辞
- 避免机械式提问，访谈更自然
- 保留关键探索方向，确保不遗漏重要维度

**3. Session 案例抽象化** 📋:

**旧格式**（过于具象）:
```
Typical market research session flow:
- Session 1: Ice-breaking + Current behavior and context understanding
- Session 2: Pain points and frustration deep dive
- Session 3: Current solution exploration (workarounds, existing tools)
- Session 4: Ideal solution imagination (unconstrained vision)
- Session 5: AI/Technology expectations and concerns (if relevant)
- Session 6: Priority confirmation and willingness to pay (if relevant)
```

**新格式**（抽象原则）:
```
Session Flow Principles:
Each session follows: Intro → Open Exploration → Targeted Collection → Closure

Typical Session Themes (adapt to research objectives):
- Early Sessions: Context building, current behaviors, existing experiences
- Middle Sessions: Deep exploration of critical areas identified in objectives
- Later Sessions: Synthesis, prioritization, forward-looking perspectives
```

**优势**:
- 避免生成时过度模仿具体案例
- 更灵活适配不同研究目标
- 强调流程原则而非固定模板

**4. 删除过拟合规则** 🧹:

**删除的内容**:
- ❌ "AI/Technology Expectations (if relevant to study)" 章节
  - 这是逆向工程时过拟合的特定案例
  - 如果研究目标需要探索 AI 相关内容，应该自然融入，而非作为固定章节

**删除的具体指导**:
```
❌ 删除:
#### AI/Technology Expectations (if relevant to study):
- Explore user's current understanding and experience with AI
- Identify concerns and trust barriers naturally (don't assume they exist)
- Understand acceptable AI intervention boundaries
```

**保留的通用原则**:
```
✅ 保留:
- Pain Point Discovery (NOT Assumption)
- Ideal Solution Exploration
- Feature Discovery (NOT Assumption)
```

**5. 更新 Output Format** 📝:

**旧格式**:
```
- **Interviewer Instructions:** [Must include standard impromptu follow-up guidance + ...]
[ONLY IF CRITICAL QUESTION:]
**Follow-up Strategy:** [Conditional follow-ups with specific triggers]
[IF GENERAL QUESTION:]
[Rely on impromptu follow-ups - no hard-coded follow-ups needed]
```

**新格式**:
```
- **Interviewer Instructions:** [Session-specific guidance and context]
[ONLY IF CRITICAL QUESTION with specific dimensions to explore:]
**Follow-up Directions:**
[If user mentions X] → Probe for: [dimension 1, dimension 2, dimension 3]
**Skip if:** [Conditions when to skip]
```

**6. 更新质量检查清单** ✅:

**新增检查项**:
- ✅ Are follow-ups written as directional probes (not word-by-word scripts)?
- ✅ Does each session follow Intro → Open Exploration → Targeted Collection → Closure?

**更新原则**:
- **Directional Follow-ups**: Follow-ups should be directional probes (e.g., "Probe for: impact, frequency, workarounds"), NOT word-by-word scripts
- **Session Flow**: Each session follows Intro → Open Exploration → Targeted Collection → Closure pattern

**影响的文件**:
- `backend/src/lib/prompts/generate-market-research-sessions.ts` (279 lines → 272 lines)
- `backend/src/lib/prompts/generate-product-research-sessions.ts` (279 lines → 272 lines)

**预期效果**:
- ✅ 访谈执行更灵活、更自然（追问不再僵硬）
- ✅ 生成的大纲更适配具体研究目标（不被具体案例束缚）
- ✅ 减少冗余指导（即兴追问由系统自动处理）
- ✅ 保持关键探索方向（方向性指示确保不遗漏重要维度）

---

## [1.3.7] - 2025-10-26

### 🎨 优化

#### 深度访谈大纲生成 Prompt 全面优化 ✨

**优化目标**:
- 强化开放性问题设计原则（避免引导性、暗示性问题）
- 添加 Study Objective 必问项识别逻辑
- 优化追问设计策略（关键问题硬编码追问 vs 一般问题即兴追问）
- 清理本地化相关内容（已拆分到独立的 `localize-outline.ts`）

**优化内容**:

**1. 开放性问题设计原则** 🎯:
- ❌ 避免引导性问题：如 "How difficult is it to..." (假设存在困难)
- ❌ 避免暗示性问题：如 "What features would you like?" (假设需要功能)
- ✅ 使用真正开放的问题：如 "Tell me about your experience with..."
- ✅ 聚焦行为和具体案例，而非假设和意见

**示例对比**:
```
❌ 引导性: "How often do you struggle with task management?"
✅ 开放性: "Tell me about how you currently manage your tasks."

❌ 暗示性: "What improvements would you suggest for [Feature]?"
✅ 开放性: "What's your experience been like using [Feature]?"
```

**2. Study Objective 必问项识别** 🔑:
- 自动识别研究目标中明确要求的必问问题或数据收集项
- 在合适的 Session 中自然融入这些必问项
- 在 Interviewer Notes 中标记 `[MUST-ASK per Study Objective]`
- 确保关键研究目标不会被遗漏

**3. 智能追问策略** 🎯:

**A. 硬编码追问（仅用于关键问题）**:
- 仅当问题直接关联核心研究目标时使用
- 仅当缺失追问会导致关键洞察缺失时使用
- 包含条件化追问逻辑和跳过条件

**B. 即兴追问（用于一般问题）**:
- 对于非关键问题，不预设硬编码追问
- 依赖 Retell AI 的即兴追问能力
- 在 Interviewer Notes 中标记 `[Rely on impromptu follow-ups]`
- 避免过度脚本化导致访谈僵硬

**C. 标准即兴追问指令**:
- 每个 Session 都包含标准的即兴追问指导
- 指导面试官何时深挖、何时跳过、如何自然回应

**4. 本地化内容清理** 🧹:
- 移除详细的文化适配指令（已在 `localize-outline.ts` 中处理）
- 简化语言配置（仅保留基本语言要求）
- 添加说明：文化适配和深度本地化在独立步骤中处理

**5. 市场调研特定优化**:
- 痛点发现（而非假设）：先问当前流程，让用户自然揭示痛点
- 理想解决方案探索：使用 "magic wand" 问法，避免直接问功能需求
- AI/技术期望收集：探索理解和体验，不假设顾虑存在

**6. 产品调研特定优化**:
- 功能发现（而非假设）：先问实际使用模式，不假设用户已发现功能
- 竞品对比策略：问之前使用的工具，而非直接问竞品
- 体验探索：聚焦实际体验，不假设满意或不满

**影响的文件**:
- `backend/src/lib/prompts/generate-market-research-sessions.ts` (248 lines → 279 lines)
- `backend/src/lib/prompts/generate-product-research-sessions.ts` (241 lines → 274 lines)

**质量检查清单更新**:
```
✅ 所有问题是否真正开放且无引导性？
✅ 是否识别并融入了 Study Objective 的必问项？
✅ 硬编码追问是否仅用于关键问题？
✅ 一般问题是否依赖即兴追问？
✅ 问题是否聚焦行为和体验（而非意见或假设）？
✅ 是否在探索当前行为后再假设痛点？
```

**设计理念**:
1. **开放性优先**：让参与者定义自己的体验，不预设立场
2. **目标驱动**：确保核心研究目标的关键信息不遗漏
3. **智能追问**：关键问题深挖，一般问题灵活
4. **行为聚焦**：问人们做什么，而非想什么
5. **自然发现**：让洞察自然涌现，不强加假设

**预期效果**:
- 生成的访谈大纲更加开放、无偏见
- 关键研究目标的必问项不会遗漏
- 访谈流程更自然、更像真实对话
- 减少引导性问题导致的偏见数据
- 提高洞察质量和研究有效性

---

## [1.3.6] - 2025-10-26

### 🐛 Bug 修复

#### Session 数量智能补全机制 ✅

**问题描述**:
- 在深度访谈模式（David）中，GPT 有时会生成错误数量的 Sessions
- 用户请求 10 个 Sessions，GPT 可能只生成 8 个或 11 个
- 导致访谈大纲不完整或超出预期

**解决方案**:

**1. Prompt 强化（预防）**:
- 在所有 Session 生成 Prompt 中添加严格的数量要求警告
- 明确告知 GPT 生成错误数量会导致系统故障
- 文件：
  - `backend/src/lib/prompts/generate-sessions.ts`
  - `backend/src/lib/prompts/generate-market-research-sessions.ts`
  - `backend/src/lib/prompts/generate-product-research-sessions.ts`

**2. 智能补全（修复）**:
- 自动检测生成的 Session 数量
- 如果数量不足，调用 GPT 补全缺失的 Sessions
- 如果数量过多，自动截断多余的 Sessions
- 文件：`backend/src/controllers/questions.controller.ts`

**3. 详细日志（调试）**:
- 记录请求数量 vs 实际生成数量
- 输出完整的 GPT 响应内容
- 便于追踪和调试问题

**技术细节**:
```typescript
// 验证数量
const actualCount = parsedContent.questions?.length || 0;
const requestedCount = Math.min(body.number, 10);

// 智能补全
if (actualCount < requestedCount) {
  const missing = requestedCount - actualCount;
  // 调用 GPT 补全剩余 Sessions
  const complementResponse = await openaiClient.chat.completions.create({...});
  parsedContent.questions = [...original, ...complement];
}

// 智能截断
if (actualCount > requestedCount) {
  parsedContent.questions = parsedContent.questions.slice(0, requestedCount);
}
```

**效果**:
- ✅ 100% 保证生成正确数量的 Sessions
- ✅ 补全的 Sessions 质量与原始 Sessions 一致
- ✅ 自然衔接，无缝集成

**相关文档**:
- 更新 `docs/03-大纲生成系统.md`（添加智能补全机制章节）

---

### 🎨 优化

#### 前端数量验证逻辑移除 ✅

**变更说明**:
- 移除前端的 Session 数量验证和补全逻辑
- 将数量保障完全交给后端智能补全机制
- 简化前端代码，提高可维护性

**修改文件**:
- `frontend/src/components/dashboard/interview/create-popup/details.tsx`

**变更内容**:
```typescript
// ❌ 移除前端的数量验证逻辑
// if (updatedQuestions.length > requestedCount) { ... }
// if (updatedQuestions.length < requestedCount) { ... }

// ✅ 使用实际生成的数量
question_count: updatedQuestions.length
```

**理由**:
- 后端已经保证数量正确，前端无需重复验证
- 避免前端和后端逻辑冲突
- 提高代码可维护性

---

## [1.3.5] - 2025-10-24

### 📚 文档完善

#### 初始化项目状态文档系统 ✅

**新增文档**:
- `docs/任务清单.md` - 任务管理和进度跟踪
- `docs/03-大纲生成系统.md` - 访谈问题生成系统（标准模式 + 深度模式）
- `docs/04-大纲本地化功能.md` - 两步走大纲创建流程（已存在，重新编号）
- `docs/05-访谈执行-Retell AI语音交互.md` - 实时语音对话系统
- `docs/06-访谈分析系统.md` - 单访谈深度分析
- `docs/07-调研分析系统.md` - 跨访谈洞察生成

**文档重组**:
- 按业务流程重新编号：准备阶段（03-04）→ 执行阶段（05）→ 分析阶段（06-07）
- 更新 `docs/README.md` 导航结构
- 完善文档间的交叉引用

**覆盖的核心功能**:
1. **访谈准备**: 问题生成（Lisa/Bob/David）+ 大纲本地化
2. **访谈执行**: Retell AI 语音交互（三种面试官模式）
3. **访谈分析**: 单访谈分析（Analytics + Summary）+ 跨访谈洞察（Study Summary）

**技术细节**:
- 详细的 API 端点说明
- Prompt 工程设计
- 数据流和架构图
- 多语言支持机制
- 性能优化策略

---

### 🐛 Bug 修复

#### 修复访谈链接前缀问题 ✅

**问题描述**:
- 在本地开发时创建的访谈，链接前缀是 `http://47.93.101.73:8089/call/` 或 `http://localhost:8089/call/`
- 期望：所有访谈链接都应该使用 `https://userology.xin/call/` 前缀
- 原因：访谈链接是给受访者使用的，应该指向生产环境

**根本原因**:
- 后端使用 `process.env.FRONTEND_URL` 生成访谈链接
- 在本地开发时，`FRONTEND_URL` 是 `http://localhost:8089` 或 `http://47.93.101.73:8089`
- 生成的 URL 存储到数据库后，无法自动适配环境变化

**解决方案**:
1. **后端**：硬编码访谈链接前缀为 `https://userology.xin`
   - 无论在什么环境，创建的访谈 URL 都是 `https://userology.xin/call/xxx`
   - 即使在本地开发，创建的访谈也能在生产环境访问
2. **前端**：直接使用数据库中的 `interview.url`，不重新构建
   - 移除 Preview 和 Share 界面中的 URL 重新构建逻辑
   - 删除未使用的 `base_url` 变量

**修改文件**:
- `backend/src/controllers/interviews.controller.ts` (Line 1-10)
- `frontend/src/app/interviews/[interviewId]/page.tsx` (Line 47-81, 580-586)

**技术细节**:
```typescript
// 后端
const INTERVIEW_BASE_URL = 'https://userology.xin';
const url = `${INTERVIEW_BASE_URL}/call/${url_id}`;

// 前端
const url = interview.url.startsWith("http")
  ? interview.url
  : `https://${interview.url}`;
```

---

#### 修复大纲生成语言不正确问题 ✅

**问题描述**:
- 用户选择 "Outline Debug Language: 中文" 和 "Interview Language: 英文"
- 期望：生成中文初稿大纲
- 实际：生成英文大纲

**根本原因**:
- 前端配置 `NEXT_PUBLIC_API_URL=http://47.93.101.73:8090/api`（指向服务器 IP）
- 但后端实际运行在 `localhost:8090`（本地）
- 前端请求发送到了服务器 IP 上的**旧版本后端**，而不是本地的新版本后端
- 旧版本后端没有 `outline_debug_language` 参数支持，所以生成的是英文大纲

**诊断过程**:
1. ✅ 前端成功发送请求，包含正确的参数 `outline_debug_language: 'zh-CN'`
2. ✅ 请求返回 200 OK
3. ❌ 但后端终端没有打印调试日志（说明请求没有到达本地后端）
4. ❌ 生成的大纲是英文（说明调用了旧版本后端）
5. 🔍 使用 `curl` 直接测试本地后端，发现可以生成中文大纲
6. 🎯 确认问题：前端配置的 API URL 与实际运行的后端不匹配

**解决方案**:
- 修改 `.env` 文件：`NEXT_PUBLIC_API_URL=http://localhost:8090/api`
- 重启前端服务器
- 前端现在正确调用本地后端，大纲生成语言正确

**修改文件**:
- `.env` (Line 27)

**技术细节**:
- 环境变量 `NEXT_PUBLIC_API_URL` 在构建时被硬编码到前端代码中
- 修改 `.env` 后必须重启前端才能生效
- 前端的 `api.ts` 使用 `process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8090/api'`
- 如果环境变量未设置，会使用默认值 `http://localhost:8090/api`

**调试日志**:
- 添加了更详细的后端日志：
  - `🚀🚀🚀 generate-interview-sessions request received 🚀🚀🚀`
  - `📦 Request body: ...`
  - `🌐 Debug Language: ...`
  - `🌐 Interview Language: ...`

**修改文件**:
- `backend/src/controllers/questions.controller.ts` (Line 74-82)

---

### 📚 文档

#### 新增环境配置说明文档

**新增文件**:
- `docs/环境配置说明.md` - 详细说明不同环境的配置方法
- `.env.example` - 环境变量配置模板

**文档内容**:
- 本地开发环境配置
- 服务器开发环境配置
- 生产环境配置
- 环境变量说明
- 部署流程
- 常见问题和解决方案
- 调试技巧

**核心原则**:
- **前端的 `NEXT_PUBLIC_API_URL` 必须指向实际运行的后端地址**
- 环境变量在构建时被硬编码，修改后必须重启
- 不同环境需要手动配置不同的值
- **没有自动适配**

---

## [1.1.7] - 2025-10-24

### 🐛 Bug 修复

#### 修复本地化 API 404 错误 ✅
- **问题**: 点击"一键本地化"按钮后返回 `POST /api/localize-outline 404 (Not Found)`
- **原因**: 路由配置错误
  - `questions.routes.ts` 中定义：`router.post('/questions/localize-outline', localizeOutline)`
  - `index.ts` 中挂载：`app.use('/api', questionsRoutes)`
  - 实际路径变成：`/api/questions/localize-outline` ❌（路径重复）
- **解决方案**:
  - 将 `questions.routes.ts` 中的路由改为 `/localize-outline`
  - 将前端调用路径改为 `/localize-outline`
  - 最终路径：`/api/localize-outline` ✅
- **修改文件**:
  - `backend/src/routes/questions.routes.ts` (Line 13)
  - `frontend/src/components/dashboard/interview/create-popup/questions.tsx` (Line 105)

### 🔄 回退

#### 回退访谈链接前缀修改
- **原因**: 之前的修改导致其他功能出现问题
- **回退内容**:
  - 恢复使用环境变量 `process.env.FRONTEND_URL` 生成访谈链接
  - 恢复 Share 界面和 Preview 界面的原始逻辑
  - 恢复 `interviewCard.tsx` 中的 `base_url` 变量
- **修改文件**:
  - `backend/src/controllers/interviews.controller.ts` (Line 5)
  - `frontend/src/app/interviews/[interviewId]/page.tsx` (Line 50, 70-82, 586-591)
  - `frontend/src/components/dashboard/interview/interviewCard.tsx` (Line 21, 87)

### 📝 说明

**访谈链接格式**:
- 数据库存储: `https://userology.xin/call/{url_id}`
- 复制链接: `https://userology.xin/call/{readable_slug}` 或完整 URL
- Share 界面: 直接使用数据库中的完整 URL
- Preview 界面: 直接使用数据库中的完整 URL

**为什么这样设计**:
- 旧的研究在数据库中已经存储了完整的 `https://userology.xin/call/...` URL
- 新的研究也会在创建时生成完整的 URL 并存储到数据库
- 前端只需要直接使用数据库中的 URL,无需拼接

---

## [1.1.6] - 2025-10-24

### 🐛 Bug 修复

#### 修复 Description 本地化保存问题 ✅
- **问题**: Interview Description 在点击"本地化"后没有被保存到数据库
- **现象**:
  - 控制台显示 `✅ Updating description: This study aims to...`
  - 但数据库中的 description 仍然是中文原始值
  - 编辑界面显示的也是中文
- **根本原因**:
  - `onLocalize` 函数更新了 `interviewData.description`
  - 但没有同步更新 `description` 状态变量
  - `onSave` 函数使用的是 `description` 状态变量,导致保存的是旧值
- **解决方案**:
  - 在 `onLocalize` 函数中同时更新两个变量:
    - `setDescription(localizedData.description)` - 更新状态变量(用于保存)
    - `interviewData.description = localizedData.description` - 更新 interviewData(用于显示)
- **文件**: `frontend/src/components/dashboard/interview/create-popup/questions.tsx` (Line 141)

#### 修复访谈链接失效问题 ✅
- **问题**: 访谈链接无法访问,显示 CORS 错误和 Clerk 认证错误
- **错误信息**:
  ```
  Clerk: Production Keys are only allowed for domain "userology.xin"
  Access to XMLHttpRequest at 'https://userology.xin/api/...' from origin 'http://47.93.101.73:8089' has been blocked by CORS policy
  ```
- **根本原因**: 环境变量配置错误
  - `.env` 中 `NEXT_PUBLIC_LIVE_URL=http://localhost:8089`
  - 但实际访问地址是 `http://47.93.101.73:8089`
  - 导致 Clerk 认证域名不匹配
  - 前端 API 请求使用错误的 URL
- **解决方案**:
  - 更新 `NEXT_PUBLIC_LIVE_URL=http://47.93.101.73:8089`
  - 更新 `NEXT_PUBLIC_API_URL=http://47.93.101.73:8090/api`
  - 重启前后端服务器应用新配置
- **文件**: `.env` (Line 4, 27)

### 🔧 技术细节

#### React 状态管理
- **问题**: 状态变量和对象属性不同步
- **教训**: 在 React 中,如果同时使用状态变量和对象属性,必须确保两者同步更新
- **最佳实践**:
  - 使用 `useState` 管理需要触发重新渲染的数据
  - 如果有多个地方需要访问同一数据,确保所有更新点都同步

#### 环境变量配置
- **问题**: 开发环境和生产环境 URL 不一致
- **教训**: 环境变量必须与实际部署环境匹配
- **最佳实践**:
  - 使用环境变量文件管理不同环境的配置
  - 部署前检查所有 URL 配置
  - 使用相对路径或环境变量,避免硬编码 URL

---

## [1.1.5] - 2025-10-23

### 📚 文档

#### 初始化项目文档结构
- 创建 `docs/README.md` - 文档导航和使用指南
- 创建 `docs/00-项目概览.md` - 项目整体架构和功能概述
- 创建 `docs/01-技术架构.md` - 技术栈、系统架构和部署架构
- 创建 `docs/02-数据库设计.md` - 数据库表结构和关系设计
- 创建 `docs/任务清单.md` - 任务管理和跟踪
- 重命名 `docs/15-大纲本地化功能.md` → `docs/03-大纲本地化功能.md`

#### 更新项目规则文档
- 更新 `.augment/rules/rule.md` - 将任务管理从 Task Tools 改为维护任务清单文件
- 更新 `.augment/rules/项目状态维护规则.md` - 同步任务管理流程变更

### 🐛 Bug 修复

#### 修复访谈链接 CORS 错误 ✅
- **问题**: 访谈链接显示 "Invalid URL"，控制台报 CORS 错误
- **错误信息**: `Access to XMLHttpRequest at 'https://userology.xin/api/...' from origin 'http://47.93.101.73:8089' has been blocked by CORS policy`
- **根本原因**: 后端 CORS 配置中没有包含生产环境前端地址 `http://47.93.101.73:8089`
- **解决方案**:
  - 在 CORS 白名单中添加 `http://47.93.101.73:8089`
  - 同时添加不带端口的版本 `http://47.93.101.73`
  - 重启后端服务器应用新配置
- **文件**: `backend/src/index.ts`

#### 修复 Description 本地化功能 ✅
- **问题**: OpenAI 在本地化时没有返回 description 字段
- **根本原因**: Prompt 中虽然提到了 description，但没有明确要求必须返回
- **解决方案**:
  - 在输出格式中明确标注 description 为 REQUIRED
  - 在核心任务中列出本地化 description 的任务
  - 添加专门的 "Study Description Optimization" 章节
  - 在 CRITICAL INSTRUCTIONS 中强调必须包含 description 字段
- **修改内容**:
  - 输出格式说明更详细，强调 description 是必需的
  - 添加 description 本地化的具体指导原则
  - 在多处重复强调以确保 AI 不会遗漏
- **文件**: `backend/src/lib/prompts/localize-outline.ts`

#### 修复访谈链接失效问题 ✅
- **问题**: 前端调用 `POST /api/get-call` 但后端只有 `GET /api/call/:callId`
- **根本原因**: 前后端 API 调用方式不一致
- **解决方案**: 修改前端使用 RESTful 规范的 GET 请求
- **修改内容**:
  - 前端: `axios.post("/api/get-call", {id})` → `axios.get("/api/call/${callId}")`
  - 后端: 删除临时添加的冗余路由
- **优点**: 符合 RESTful 规范，代码更清晰，无路由冗余
- **文件**:
  - `frontend/src/components/dashboard/interview/interviewCard.tsx`
  - `backend/src/index.ts`

### 🎨 优化

#### UI 文案优化
- 将编辑界面的 "No. of Questions" 改为 "Number of Sessions/Questions"
- 更准确地反映 Deep Dive David 模式使用 sessions 的特性
- **文件**: `frontend/src/components/dashboard/interview/editInterview.tsx`

### 🔍 调试

#### Description 本地化调试
- 添加调试日志以排查 description 本地化问题
- 记录 OpenAI 返回的完整数据和 description 字段
- **文件**: `frontend/src/components/dashboard/interview/editInterview.tsx`

---

## [1.1.4] - 2025-10-23

### 🚀 新功能

#### 访谈大纲版本选择
- **功能**: 在编辑界面可以选择使用初稿或本地化版本作为访谈大纲
- **UI**: 添加了"访谈使用版本"选择器，显示当前选择的语言
- **逻辑**: 保存时根据选择的版本更新 `questions` 字段
- **文件**: `frontend/src/components/dashboard/interview/editInterview.tsx`

### 🎨 优化

#### UI 文案优化
- 将编辑界面的 "Questions" 标题改为 "Interview Guide"
- 更符合 Deep Dive 模式的语义

### 🐛 Bug 修复

#### 修复 Description 本地化
- **问题**: Interview Description 字段未被本地化
- **修复**:
  - 后端：添加 `description` 参数到本地化 prompt
  - 前端：在调用本地化 API 时传递 `description`
  - 前端：解析并保存本地化的 `description`
- **文件**:
  - `backend/src/lib/prompts/localize-outline.ts`
  - `backend/src/controllers/questions.controller.ts`
  - `frontend/src/components/dashboard/interview/create-popup/questions.tsx`
  - `frontend/src/components/dashboard/interview/editInterview.tsx`

#### 访谈链接失效问题
- **问题**: 访谈链接显示 "Invalid URL"
- **原因**: 访谈记录在数据库中不存在（可能已被删除或数据库重置）
- **解决方案**:
  - 后端 API 正常工作，返回 404 是正确的行为
  - 需要重新创建访谈或使用现有的有效访谈链接
- **验证**: 测试了 `/api/interviews/:id` 端点，工作正常

---

## [1.1.3] - 2025-10-23

### 🐛 Bug 修复

#### 修复本地化功能的三个关键问题

**问题 1: Interview Description 未同步本地化**
- **现象**: 本地化大纲时，Interview Description 字段未被本地化
- **修复**:
  - 前端解析本地化响应时，提取并保存 `description` 字段
  - 创建过程：更新 `interviewData.description`
  - 编辑过程：更新数据库和本地状态
- **文件**:
  - `frontend/src/components/dashboard/interview/create-popup/questions.tsx`
  - `frontend/src/components/dashboard/interview/editInterview.tsx`

**问题 2: 版本切换显示错误**
- **现象**: 在创建过程中使用本地化后，编辑界面切换回初稿时显示的仍是本地化版本
- **原因**: `questions` 状态初始化为 `interview?.questions`，但该字段可能已被本地化版本覆盖
- **修复**: 优先使用 `interview?.draft_outline` 初始化 `questions` 状态
- **文件**: `frontend/src/components/dashboard/interview/editInterview.tsx` (Line 52-54)

**问题 3: 编辑界面本地化失败**
- **现象**: 在编辑界面点击本地化按钮后，页面没有变化
- **原因**:
  1. 响应解析错误：检查 `response.data.localizedQuestions` 而非 `response.data.response`
  2. 条件判断错误：检查 `interview?.draft_outline` 而非当前的 `questions`
- **修复**:
  1. 正确解析 OpenAI 返回的 JSON 字符串：`JSON.parse(response.data.response)`
  2. 使用当前的 `questions` 作为本地化源
  3. 简化本地化按钮显示条件：只检查 `outline_interview_language` 和 `questions.length`
- **文件**: `frontend/src/components/dashboard/interview/editInterview.tsx`

### 🔧 技术细节

#### 响应数据结构
```typescript
// 后端返回
{
  response: string // JSON 字符串
}

// 解析后的数据
{
  questions: Array<{
    id: string,
    question: string,
    follow_up_count: number
  }>,
  description: string // 本地化的研究描述
}
```

#### 本地化按钮显示逻辑
```typescript
// 旧逻辑（有问题）
interview?.outline_debug_language &&
interview?.outline_interview_language &&
interview?.draft_outline &&
localizedQuestions.length === 0

// 新逻辑（修复后）
interview?.outline_interview_language &&
questions.length > 0 &&
localizedQuestions.length === 0
```

---

## [1.1.2] - 2025-10-23

### 🐛 Bug 修复

#### 修复路由配置导致的 API 冲突
- **问题**: 修复本地化 404 后，generate-sessions 又出现 404
- **原因**: 路由配置不当，需要同时支持 `/api/generate-interview-sessions` 和 `/api/questions/localize-outline`
- **修复**:
  - 修改 `backend/src/routes/questions.routes.ts`，将 `localize-outline` 路由改为 `/questions/localize-outline`
  - 保持 `questionsRoutes` 挂载在 `/api` 下
  - 最终路径：
    - `/api/generate-interview-sessions` ✅
    - `/api/generate-interview-questions` ✅
    - `/api/questions/localize-outline` ✅

---

## [1.1.1] - 2025-10-23

### 🚀 新功能

#### 编辑界面添加本地化功能
在研究创建成功后的编辑界面中添加了大纲本地化功能

**核心功能**:
1. **一键本地化按钮**: 在编辑界面的 Questions 区域添加本地化按钮
2. **版本切换**: 支持在初稿和本地化版本之间切换查看和编辑
3. **只读保护**: 本地化版本为只读，防止误修改
4. **自动保存**: 本地化完成后自动保存到数据库

**使用场景**:
- 创建研究后发现需要本地化
- 对已有研究进行本地化处理
- 查看和对比初稿与本地化版本

### 🐛 Bug 修复

#### 修复本地化 API 404 错误（已被 v1.1.2 修正）
- **问题**: 前端调用 `/api/questions/localize-outline` 返回 404
- **原因**: 后端路由挂载路径错误（`/api` 而非 `/api/questions`）
- **修复**: 修改 `backend/src/index.ts` 第 57 行，将 `app.use('/api', questionsRoutes)` 改为 `app.use('/api/questions', questionsRoutes)`
- **注意**: 此修复导致 generate-sessions 404，已在 v1.1.2 中修正

### 🔧 技术实现

#### 前端组件更新
- **编辑界面** (`frontend/src/components/dashboard/interview/editInterview.tsx`):
  - 添加本地化状态管理（`isLocalizing`, `localizedQuestions`, `showLocalized`）
  - 实现 `onLocalize` 函数调用本地化 API
  - 添加版本切换 UI（初稿/本地化按钮组）
  - 添加一键本地化按钮（仅在有初稿且无本地化版本时显示）
  - 修改保存逻辑，根据当前版本保存到对应字段

- **QuestionCard 组件** (`frontend/src/components/dashboard/interview/create-popup/questionCard.tsx`):
  - 添加 `readOnly` 属性支持
  - 只读模式下禁用所有编辑功能（Depth Level 按钮、文本框、删除按钮）
  - 只读模式下添加视觉提示（灰色背景）

#### 类型定义更新
- **Interview 类型** (`frontend/src/types/interview.ts`):
  - 添加 `draft_outline?: Question[]`
  - 添加 `localized_outline?: Question[]`
  - 添加 `outline_debug_language?: string`
  - 添加 `outline_interview_language?: string`

---

## [1.1.0] - 2025-10-23

### 🚀 新功能

#### 大纲创建功能模块重塑 (P1)
实现了两步走大纲创建流程：初版-调试定稿-本地化

**核心功能**:
1. **调试语言选择**: 在创建 Deep Dive 研究时，可以选择用于生成和调试大纲的语言
2. **初稿生成**: 使用调试语言生成初版大纲，便于研究员理解和优化
3. **一键本地化**: 调试完成后，一键将大纲本地化到访谈语言
4. **版本切换**: 支持在初稿和本地化版本之间切换查看
5. **分离存储**: 初稿和本地化版本分别存储，便于对比和回溯

**使用场景**:
- 中国研究员创建英文访谈：用中文调试大纲，最后本地化为英文
- 跨国研究团队：用团队通用语言调试，本地化到目标市场语言
- 质量保证：保留初稿便于审查本地化质量

### 🔧 技术实现

#### 数据库变更
- 添加 `draft_outline` 字段（JSONB）：存储初稿大纲
- 添加 `localized_outline` 字段（JSONB）：存储本地化大纲
- 添加 `outline_debug_language` 字段（TEXT）：存储调试语言代码
- 添加 `outline_interview_language` 字段（TEXT）：存储访谈语言代码

**迁移文件**: `backend/migrations/004_add_outline_localization_fields.sql`

#### 后端 API
- **新增接口**: `POST /api/questions/localize-outline`
  - 接收初稿大纲和目标语言
  - 调用 OpenAI GPT-4o 进行深度本地化
  - 返回本地化后的大纲

**相关文件**:
- `backend/src/controllers/questions.controller.ts` - 添加 `localizeOutline` 函数
- `backend/src/routes/questions.routes.ts` - 添加本地化路由
- `backend/src/lib/prompts/localize-outline.ts` - 本地化 prompt（基于素材G和G1）

#### 前端 UI
- **创建页面** (`frontend/src/components/dashboard/interview/create-popup/details.tsx`):
  - 添加 "Outline Debug Language" 选择器（仅 Deep Dive 模式）
  - 支持选择任何主流语言（中文、英文、日文、法文等）

- **编辑页面** (`frontend/src/components/dashboard/interview/create-popup/questions.tsx`):
  - 添加 "一键本地化" 按钮
  - 添加版本切换按钮（初稿 / 本地化版本）
  - 本地化版本为只读，防止误编辑
  - 保存时同时存储两个版本

- **状态管理** (`frontend/src/components/dashboard/interview/createInterviewModal.tsx`):
  - 在父组件中管理语言状态
  - 在 Details 和 Questions 组件间传递语言参数

#### Prompt 工程
创建了综合性的本地化 prompt，结合了：
- **素材G**: 基础本地化要求（语言转换、语气调整）
- **素材G1**: 专业本土化优化（文化敏感性、地道表达）

**特性**:
- 支持多语言配置（zh-CN, zh-TW, en-US, ja-JP 等）
- 深度文化适配（不仅是翻译，而是本土化）
- 保持原有结构和逻辑
- 针对不同语言的特殊处理（礼貌程度、敏感话题等）

**相关文件**:
- `backend/src/lib/prompts/localize-outline.ts`

### 📝 文档更新

- 创建 `docs/TESTING_OUTLINE_LOCALIZATION.md` - 详细的测试计划
- 创建 `backend/scripts/run-migration.js` - 数据库迁移验证脚本
- 创建 `docs/CHANGELOG.md` - 项目变更日志

### 🔄 修改的文件

**后端**:
- `backend/src/types/interview.ts` - 添加新字段类型定义
- `backend/src/controllers/questions.controller.ts` - 添加本地化逻辑和修改生成逻辑
- `backend/src/routes/questions.routes.ts` - 添加新路由
- `backend/migrations/004_add_outline_localization_fields.sql` - 数据库迁移脚本

**前端**:
- `frontend/src/components/dashboard/interview/create-popup/details.tsx` - 添加调试语言选择器
- `frontend/src/components/dashboard/interview/create-popup/questions.tsx` - 添加本地化功能
- `frontend/src/components/dashboard/interview/createInterviewModal.tsx` - 语言状态管理

**配置**:
- `.env` - 添加 `SUPABASE_SERVICE_ROLE_KEY`

### ⚙️ 依赖更新

- 添加 `module-alias` 到 backend（修复启动问题）

---

## [1.0.0] - 2025-10-21

### 初始版本
- 基础的 AI 访谈平台功能
- 支持 Lisa、Bob、David 三种面试官
- 标准问题模式和深度访谈模式
- 多语言支持
- Clerk 认证集成
- Supabase 数据库
- OpenAI GPT-4o 集成
- Retell AI 语音访谈

---

**维护者**: Userology 开发团队
**最后更新**: 2025-10-23

