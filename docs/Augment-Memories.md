# Augment Memories - Userology-Foloup 项目

> **版本**: 1.3.5
> **最后更新**: 2025-10-24
> **项目**: AI驱动的用户研究访谈平台

---

## 🎯 核心功能模块

### 访谈准备系统

**大纲生成**:
- 支持标准问题模式（Lisa/Bob）和深度访谈模式（David）
- AI 自动生成访谈问题和 Sessions
- 多语言支持（中文、英文、日文等）
- 基于研究目标、上下文和个性化备注生成
- API: `/api/generate-interview-questions` 和 `/api/generate-interview-sessions`

**大纲本地化**:
- 两步走流程：调试语言 → 访谈语言
- AI 深度本地化（文化适配，非简单翻译）
- 版本分离存储（draft_outline + localized_outline）
- 只读保护本地化版本，防止误编辑
- API: `/api/localize-outline`

---

### 访谈执行系统

**Retell AI 语音交互**:
- 实时语音识别（Speech-to-Text）
- 实时语音合成（Text-to-Speech）
- 智能对话管理（Conversation Flow）

**三种面试官模式**:
1. **Explorer Lisa**: 探索性访谈，友好开放
2. **Empathetic Bob**: 同理心访谈，温和耐心
3. **Deep Dive David**: 深度访谈，多阶段 Session 流程（最多 10 个 Sessions）

**技术实现**:
- 前端: RetellWebClient (浏览器端 SDK)
- 后端: Retell SDK (Node.js)
- AI Agent: Retell LLM (GPT-4o)
- 语音引擎: 11labs

---

### 访谈分析系统

**单访谈分析**:
- **基础分析** (Analytics): 问题总结 + 访谈总结
- **深度总结** (Summary): 关键洞察 + 重要引用
- 两阶段分析架构，自动触发
- 支持多语言输出（根据访谈语言）
- API: `/api/analytics/generate`

**数据结构**:
```typescript
{
  analytics: {
    questionSummaries: [...],
    callSummary: string
  },
  insights_with_evidence: [{
    content: string,
    category: string,
    supporting_quotes: [...]
  }]
}
```

---

### 调研分析系统

**跨访谈洞察生成**:
- 从多个访谈中提取综合洞察
- 识别模式和趋势
- 两阶段 AI 生成架构

**阶段 1**: 分析研究目标，提取预期交付物类型
- action_plans（行动计划）
- pricing_analysis（定价分析）
- pain_points（痛点分析）
- general（通用分析）

**阶段 2**: 根据交付物类型生成定制化内容
- Executive Summary（执行摘要）
- Objective Deliverables（目标交付物）
- Cross-Interview Insights（跨访谈洞察）

**API**: `/api/analytics/study-summary`

---

## 🎯 项目核心信息

### 项目定位
AI驱动的用户研究访谈平台，通过语音AI自动化进行用户访谈并生成深度分析报告。

### 技术栈
- **前端**: Next.js 14 + TypeScript (端口 8089)
- **后端**: Express.js + TypeScript (端口 8090)
- **数据库**: Supabase (PostgreSQL)
- **AI服务**: OpenAI GPT-4o (通过 tu-zi.com 代理)
- **语音**: Retell AI
- **认证**: Clerk

### 项目结构
```
Userology-Foloup/
├── frontend/          # Next.js 前端
├── backend/           # Express 后端
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── lib/prompts/
│   │   └── types/
│   ├── migrations/    # 数据库迁移脚本
│   └── scripts/       # 工具脚本
├── docs/              # 项目文档
└── .env               # 环境变量
```

---

## 🔑 关键决策记录

### 1. 大纲本地化架构设计

**核心理念**:
- 研究员用熟悉的语言调试大纲
- AI 深度本地化到目标语言（文化适配，非简单翻译）

**技术实现**:
1. **分离存储**: `draft_outline` 和 `localized_outline` 字段
2. **优先级**: `questions` 字段优先使用本地化版本
3. **只读保护**: 本地化版本为只读
4. **语言记录**: `outline_debug_language` 和 `language` 字段

### 2. Prompt 工程策略

**Temperature 设置**:
- 分析类任务: 0.0（确定性）
- 生成类任务: 0.7（自然表达）
- 本地化任务: 0.7（文化适配）

**Prompt 设计原则**:
- 明确角色定位（专家身份）
- 结构化输出（JSON 格式）
- 语言特定指令（针对不同语言）
- 强调质量标准（开放性、深度、相关性）

### 3. 前后端分离架构

**当前架构**:
- 前端: Next.js 14 (端口 8089)
- 后端: Express.js (端口 8090)
- API 通信: RESTful
- 数据库: Supabase (PostgreSQL)

**优势**:
- 独立部署和扩展
- 清晰的职责分离
- 更好的性能和可维护性

---

## 🗄️ 数据库设计要点

### 核心表结构

**interview 表**:
- 存储研究基本信息（name, objective, description）
- 问题/Sessions 数据（questions, draft_outline, localized_outline）
- 语言配置（language, outline_debug_language）
- 跨访谈分析结果（executive_summary, objective_deliverables, cross_interview_insights）

**response 表**:
- 存储单个访谈的响应数据
- 基础分析（analytics）
- 深度总结（insights_with_evidence）
- 关联字段（interview_id, call_id）

**interviewer 表**:
- 存储面试官配置（Lisa/Bob/David）
- Retell AI Agent ID
- 语音和响应参数

### 重要字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `questions` | JSONB | 实际访谈使用的问题（优先本地化版本） |
| `draft_outline` | JSONB | 初稿大纲（调试语言版本） |
| `localized_outline` | JSONB | 本地化大纲（访谈语言版本） |
| `outline_debug_language` | TEXT | 调试语言代码（如 zh-CN） |
| `outline_interview_language` | TEXT | 访谈语言代码（如 en-US） |

### 数据流向
```
1. 生成初稿 → draft_outline (调试语言)
2. 调试优化 → 修改 draft_outline
3. 本地化 → localized_outline (访谈语言)
4. 保存 → questions = localized_outline || draft_outline
```

---

## 🔧 核心配置

### 环境变量 (.env)
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://hdyggfbtwuthymhlrznl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # 用于数据库迁移

# OpenAI (通过 tu-zi.com 代理)
OPENAI_API_KEY=sk-mhStWDss5vDY1H4B8CHOfS1pINUucaBo7V9j1yLsx0RZ4GtT
OPENAI_API_BASE=https://api.tu-zi.com/v1

# Retell AI
RETELL_API_KEY=key_08158b97910706a5118c4c404151

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# 端口
FRONTEND_PORT=8089
BACKEND_PORT=8090
FRONTEND_URL=http://47.93.101.73:8089
NEXT_PUBLIC_API_URL=http://localhost:8090/api
```

### 支持的语言
- 🇨🇳 简体中文 (zh-CN)
- 🇹🇼 繁体中文 (zh-TW)
- 🇺🇸 英语 (en-US)
- 🇯🇵 日语 (ja-JP)
- 🇫🇷 法语 (fr-FR)
- 🇩🇪 德语 (de-DE)
- 🇪🇸 西班牙语 (es-ES)

---

## 🚀 启动流程

### 本地开发
```bash
# 后端
cd backend
npm install
npm run dev  # 端口 8090

# 前端
cd frontend
npm install
npm run dev  # 端口 8089
```

### 远程访问
- **本地访问**: http://localhost:8089
- **局域网访问**: http://192.168.8.6:8089
- **公网访问**: http://47.93.101.73:8089

---

## 📚 重要文档

### 核心文档
- `docs/README.md` - 文档导航中心
- `docs/CHANGELOG.md` - 版本变更历史
- `docs/Augment-Memories.md` - AI 助手核心记忆库
- `docs/任务清单.md` - 任务管理和进度跟踪

### 基础文档
- `docs/00-项目概览.md` - 项目整体架构
- `docs/01-技术架构.md` - 技术栈和系统架构
- `docs/02-数据库设计.md` - 数据库表结构

### 功能模块文档（按业务流程）
**访谈准备阶段**:
- `docs/03-大纲生成系统.md` - AI 问题生成（Lisa/Bob/David）
- `docs/04-大纲本地化功能.md` - 两步走大纲创建流程

**访谈执行阶段**:
- `docs/05-访谈执行-Retell AI语音交互.md` - 实时语音对话系统

**访谈分析阶段**:
- `docs/06-访谈分析系统.md` - 单访谈深度分析
- `docs/07-调研分析系统.md` - 跨访谈洞察生成

### 技术文档
- `backend/migrations/` - 数据库迁移脚本
- `backend/src/lib/prompts/` - AI Prompt 模板

---

## ⚠️ 重要注意事项

### 数据库迁移
- Supabase 不支持通过 API 直接执行 DDL
- 需要在 Supabase Dashboard 的 SQL Editor 中手动执行
- 使用 `backend/scripts/run-migration.js` 验证迁移状态

### Service Role Key 安全
- `SUPABASE_SERVICE_ROLE_KEY` 拥有完全数据库权限
- ❌ 不要提交到 Git
- ❌ 不要在前端使用
- ✅ 只在后端服务器环境使用

### 面试官模式
- **Lisa/Bob**: 标准问题模式，使用 `questions` 数组
- **David**: 深度访谈模式，使用 `sessions` 数组（最多 10 个）
- 大纲调试语言功能仅在 Deep Dive 模式下可用

### 访谈链接
- 所有访谈链接统一使用 `https://userology.xin` 前缀
- 无论在什么环境创建，都指向生产环境
- 便于受访者访问和分享

### AI 分析触发
- 访谈结束后自动触发分析
- 先生成基础分析（Analytics）
- 再生成深度总结（Summary）
- 支持手动重新生成

---

---

**维护者**: Userology 开发团队  
**创建日期**: 2025-10-23  
**最后更新**: 2025-10-23

