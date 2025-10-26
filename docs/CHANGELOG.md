# Changelog

所有重要的项目变更都会记录在这个文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)。

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

