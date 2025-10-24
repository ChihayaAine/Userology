# Augment Memories - Userology-Foloup 项目

> **版本**: 1.1.0  
> **最后更新**: 2025-10-23  
> **项目**: AI驱动的用户研究访谈平台

---

## 📋 当前任务进度 (v1.1.0)

### ✅ 最近完成 (2025-10-23)

1. **大纲创建功能模块重塑** (v1.1.0) ✨ NEW
   - 实现两步走流程：初版-调试定稿-本地化
   - 支持调试语言选择（Deep Dive 模式）
   - 一键本地化功能
   - 版本切换和分离存储
   - **核心价值**: 让研究员用熟悉的语言调试大纲，最后本地化到目标语言

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

### 1. 大纲本地化架构设计 (2025-10-23)

**背景**: 
- 研究员需要用熟悉的语言调试大纲
- 访谈需要用目标市场的语言进行
- 简单翻译无法满足文化适配需求

**决策**:
1. **分离存储**: 初稿和本地化版本分别存储在 `draft_outline` 和 `localized_outline` 字段
2. **优先级**: `questions` 字段优先使用本地化版本（如果存在）
3. **只读保护**: 本地化版本为只读，防止误编辑破坏本地化质量
4. **语言记录**: 记录调试语言和访谈语言，便于追溯

**理由**:
- 保留初稿便于审查本地化质量
- 支持回溯和对比
- 清晰的数据流向

### 2. Prompt 工程策略

**本地化 Prompt 设计**:
- 结合素材G（基础本地化）和素材G1（专业优化）
- 针对不同语言的文化特性配置
- 强调"本土化"而非"翻译"

**Temperature 设置**:
- 分析类任务: 0.0（确定性）
- 本地化任务: 0.7（自然表达）

### 3. 前后端分离架构

**原因**: 
- 原项目编译 2000+ 组件，性能问题严重
- 前后端独立部署和扩展

**实现**:
- 前端: Next.js (8089)
- 后端: Express (8090)
- API 通信: RESTful

---

## 🗄️ 数据库设计要点

### interview 表核心字段

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
- `docs/PROJECT_OVERVIEW.md` - 项目全面概览
- `docs/CHANGELOG.md` - 版本变更历史
- `docs/TESTING_OUTLINE_LOCALIZATION.md` - 本地化功能测试计划

### 技术文档
- `backend/migrations/` - 数据库迁移脚本
- `backend/src/lib/prompts/` - AI Prompt 模板

---

## ⚠️ 重要注意事项

### 1. 数据库迁移
- Supabase 不支持通过 API 直接执行 DDL
- 需要在 Supabase Dashboard 的 SQL Editor 中手动执行
- 使用 `backend/scripts/run-migration.js` 验证迁移状态

### 2. Service Role Key 安全
- `SUPABASE_SERVICE_ROLE_KEY` 拥有完全数据库权限
- ❌ 不要提交到 Git
- ❌ 不要在前端使用
- ✅ 只在后端服务器环境使用

### 3. 面试官类型
- **Lisa/Bob**: 标准模式，使用 questions
- **David**: Deep Dive 模式，使用 sessions
- 大纲调试语言功能仅在 Deep Dive 模式下可用

### 4. 本地化质量
- 使用 GPT-4o 进行深度本地化
- Temperature 0.7 保证自然表达
- 强调文化适配而非简单翻译
- 保留初稿便于质量审查

---

## 🔄 下一步计划

（待添加新功能时更新）

---

**维护者**: Userology 开发团队  
**创建日期**: 2025-10-23  
**最后更新**: 2025-10-23

