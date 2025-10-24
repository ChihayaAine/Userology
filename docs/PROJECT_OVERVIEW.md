# Userology-Foloup 项目全面概览

## 📋 项目简介

**Userology-Foloup** 是一个基于AI的用户研究访谈平台，通过语音AI进行自动化用户访谈，并生成深度分析报告。项目采用前后端分离架构，解决了原有项目编译2000+组件的性能问题。

### 核心价值
- **AI驱动的用户访谈**：使用Retell AI进行实时语音对话
- **智能问题生成**：基于研究目标自动生成访谈问题
- **深度分析报告**：自动生成访谈总结、洞察和证据引用
- **多访谈综合分析**：跨访谈的洞察提取和模式识别

---

## 🏗️ 技术架构

### 前端技术栈
- **框架**: Next.js 14 (App Router) + TypeScript
- **UI库**: Radix UI, Shadcn/ui, Tailwind CSS, NextUI
- **状态管理**: React Context + TanStack Query
- **认证**: Clerk
- **HTTP客户端**: Axios
- **端口**: 8089

### 后端技术栈
- **框架**: Express.js + TypeScript
- **数据库**: Supabase (PostgreSQL)
- **认证**: Clerk (服务端验证)
- **AI服务**: 
  - OpenAI GPT-4o (问题生成、分析、总结)
  - Retell SDK (语音对话)
- **端口**: 8090

### 核心依赖
```json
{
  "openai": "^4.6.0",           // AI分析和生成
  "retell-sdk": "^4.50.0",      // 语音对话
  "@supabase/supabase-js": "^2.48.1",  // 数据库
  "@clerk/nextjs": "5.1.5",     // 用户认证
  "axios": "^1.6.7",            // HTTP请求
  "nanoid": "^5.0.4"            // ID生成
}
```

---

## 📊 数据库结构

### 核心表结构

#### 1. **organization** (组织表)
```sql
- id: TEXT (主键)
- name: TEXT
- plan: ENUM ('free', 'pro', 'free_trial_over')
- allowed_responses_count: INTEGER
- image_url: TEXT
- created_at: TIMESTAMP
```

#### 2. **user** (用户表)
```sql
- id: TEXT (主键)
- email: TEXT
- organization_id: TEXT (外键 → organization)
- created_at: TIMESTAMP
```

#### 3. **interviewer** (面试官表)
```sql
- id: SERIAL (主键)
- name: TEXT (面试官名称，如 Lisa, Bob, David)
- agent_id: TEXT (Retell AI agent ID)
- description: TEXT
- image: TEXT
- audio: TEXT
- empathy: INTEGER (1-10)
- exploration: INTEGER (1-10)
- rapport: INTEGER (1-10)
- speed: INTEGER (1-10)
- created_at: TIMESTAMP
```

**预设面试官**:
- **Lisa**: 标准模式，平衡型 (responsiveness: 0.2)
- **Bob**: 标准模式，快速型 (responsiveness: 0.2)
- **David**: 深度访谈模式 (responsiveness: 0.1, multi-prompt agent)

#### 4. **interview** (访谈/研究表)
```sql
- id: TEXT (主键, nanoid生成)
- name: TEXT (研究名称)
- objective: TEXT (研究目标)
- description: TEXT (参与者看到的描述)
- user_id: TEXT (外键 → user, 可为NULL)
- organization_id: TEXT (外键 → organization, 可为NULL)
- interviewer_id: INTEGER (外键 → interviewer)
- questions: JSONB (问题列表)
- question_count: INTEGER
- time_duration: TEXT
- is_active: BOOLEAN
- is_anonymous: BOOLEAN
- is_archived: BOOLEAN
- url: TEXT (访谈链接)
- readable_slug: TEXT (可读URL)
- theme_color: TEXT
- logo_url: TEXT
- respondents: TEXT[] (受访者列表)
- response_count: INTEGER
- insights: TEXT[] (旧字段)
- quotes: JSONB[] (旧字段)
- executive_summary: TEXT (研究级总结)
- objective_deliverables: JSONB (目标交付物)
- cross_interview_insights: JSONB (跨访谈洞察)
- evidence_bank: JSONB (已废弃，quotes现在嵌入insights中)
- created_at: TIMESTAMP
```

**questions字段结构**:
```typescript
{
  id: string;
  question: string;
  follow_up_count: number;
}[]
```

#### 5. **response** (访谈回应表)
```sql
- id: SERIAL (主键)
- interview_id: TEXT (外键 → interview)
- name: TEXT (受访者姓名)
- email: TEXT (受访者邮箱)
- call_id: TEXT (Retell通话ID)
- duration: INTEGER (通话时长，秒)
- details: JSONB (通话详情，包含transcript)
- analytics: JSONB (访谈分析结果)
- is_analysed: BOOLEAN
- is_ended: BOOLEAN
- is_viewed: BOOLEAN
- candidate_status: TEXT ('SELECTED', 'NOT_SELECTED')
- tab_switch_count: INTEGER
- key_insights: JSONB (旧字段，向后兼容)
- important_quotes: JSONB (旧字段，向后兼容)
- insights_with_evidence: JSONB (新字段，每个洞察包含支持引用)
- created_at: TIMESTAMP
```

**analytics字段结构**:
```typescript
{
  softSkillSummary: string;  // 100-150字的访谈总结
  questionSummaries: Array<{
    question: string;
    summary: string;  // 每个问题的回答总结
  }>;
}
```

**insights_with_evidence字段结构** (新格式):
```typescript
{
  id: string;
  content: string;
  category: 'need' | 'pain_point' | 'behavior' | 'preference' | 'mental_model' | 'unexpected';
  supporting_quotes: Array<{
    id: string;
    quote: string;
    timestamp: number;
    speaker: 'user' | 'agent';
  }>;
}[]
```

#### 6. **feedback** (反馈表)
```sql
- id: SERIAL (主键)
- interview_id: TEXT (外键 → interview)
- email: TEXT
- satisfaction: INTEGER (1-5)
- feedback: TEXT
- created_at: TIMESTAMP
```

---

## 🔄 核心业务流程

### 1. 创建研究 (Create Study)

**流程**:
```
用户填写研究信息 → 调用AI生成问题 → 创建interview记录 → 生成访谈链接
```

**API调用**:
```typescript
POST /api/interviews
{
  interviewData: {
    name: "产品改进研究",
    objective: "了解用户痛点并生成3个可行的产品改进建议",
    question_count: 5,
    time_duration: "15",
    interviewer_id: 1,
    user_id: "user_xxx",
    organization_id: "org_xxx",
    is_anonymous: false
  },
  organizationName: "MyCompany"
}
```

**问题生成**:
- 使用 `generate-questions.ts` prompt
- GPT-4o 根据研究目标生成问题
- 返回 `questions` 数组和 `description`

### 2. 进行访谈 (Conduct Interview)

**流程**:
```
用户访问链接 → 注册通话 → Retell AI开始对话 → 实时转录 → 通话结束
```

**注册通话**:
```typescript
POST /api/call/register
{
  interviewer_id: 1,
  dynamic_data: {
    name: "张三",
    objective: "了解用户痛点...",
    mins: "15",
    questions_array: [...],  // 标准模式
    // 或
    session1: "...",  // 深度访谈模式 (David)
    session2: "...",
    session_count: "3"
  }
}
```

**深度访谈模式 (David)**:
- 使用 multi-prompt agent
- 最多支持10个sessions
- 每个session完全探索后才进入下一个
- 更慢的响应速度 (responsiveness: 0.1)

### 3. 生成分析 (Generate Analytics)

**流程**:
```
通话结束 → 获取transcript → 生成analytics → 生成interview summary → 保存到数据库
```

**Analytics生成** (单次访谈分析):
```typescript
POST /api/analytics/generate
{
  callId: "call_xxx",
  interviewId: "interview_xxx",
  transcript: "..."
}
```

生成内容:
- `softSkillSummary`: 100-150字的访谈总结
- `questionSummaries`: 每个问题的回答总结

**Interview Summary生成** (单次访谈深度总结):
```typescript
POST /api/analytics/generate-interview-summary
{
  callId: "call_xxx",
  interviewId: "interview_xxx",
  transcript: "..."
}
```

生成内容:
- `insights_with_evidence`: 3-8个洞察，每个包含2-3个支持引用

### 4. 生成研究总结 (Generate Study Summary)

**流程**:
```
选择访谈 → 提取deliverables → 生成跨访谈洞察 → 保存到interview表
```

**Study Summary生成** (跨访谈综合分析):
```typescript
POST /api/analytics/generate-study-summary
{
  interviewId: "interview_xxx",
  selectedCallIds: ["call_1", "call_2", "call_3"],  // 可选
  regenerate: false  // 可选
}
```

**两阶段生成**:
1. **Stage 1**: 从研究目标提取期望的deliverables
   - deliverable_type: 'action_plans' | 'pricing_analysis' | 'pain_points' | 'feature_prioritization' | 'user_journey' | 'general'
   - expected_count: 期望的数量

2. **Stage 2**: 基于deliverables类型生成内容
   - `executive_summary`: 1段话总结 (100-150字)
   - `objective_deliverables`: 根据类型生成的交付物
   - `cross_interview_insights`: 跨访谈洞察 (1-8个)

**cross_interview_insights结构**:
```typescript
{
  id: string;
  title: string;
  description: string;
  category: 'consensus' | 'divergent' | 'unexpected' | 'critical';
  importance: 'high' | 'medium' | 'low';
  user_count: string;  // "4 out of 5 users"
  supporting_quotes: Array<{
    user: string;
    quote: string;
    interview_id: string;
  }>;
}[]
```

---

## 🎯 关键特性

### 1. 智能问题生成
- 基于研究目标自动生成访谈问题
- 支持产品研究、市场研究等不同类型
- 生成参与者友好的研究描述

### 2. 多模式访谈
- **标准模式** (Lisa/Bob): 快速访谈，适合常规研究
- **深度访谈模式** (David): Session-based深度探索

### 3. 多层次分析
- **访谈级分析** (Analytics): 问题回答总结
- **访谈级深度总结** (Interview Summary): 洞察+证据
- **研究级总结** (Study Summary): 跨访谈模式识别

### 4. 证据驱动的洞察
- 每个洞察都包含2-4个支持引用
- 引用包含用户名、原文、访谈ID
- 可追溯到原始访谈

### 5. 灵活的研究目标
- 自动识别deliverable类型
- 支持行动计划、定价分析、痛点排序等
- 根据目标定制输出格式

---

## 📁 项目结构

```
Userology-Foloup/
├── backend/                    # Express.js后端
│   ├── src/
│   │   ├── config/            # 配置文件 (database, openai, retell)
│   │   ├── controllers/       # 控制器层
│   │   ├── services/          # 业务逻辑层
│   │   ├── routes/            # 路由定义
│   │   ├── middleware/        # 中间件
│   │   ├── lib/
│   │   │   ├── prompts/       # AI prompts
│   │   │   ├── constants.ts   # 常量定义
│   │   │   └── logger.ts      # 日志工具
│   │   └── types/             # TypeScript类型定义
│   ├── migrations/            # 数据库迁移脚本
│   └── package.json
├── frontend/                   # Next.js前端
│   ├── src/
│   │   ├── app/               # Next.js App Router
│   │   │   ├── dashboard/     # 仪表板页面
│   │   │   ├── interviews/    # 访谈详情页面
│   │   │   └── call/          # 通话页面
│   │   ├── components/        # React组件
│   │   │   ├── dashboard/     # 仪表板组件
│   │   │   └── ui/            # UI组件库
│   │   ├── services/          # API服务层
│   │   ├── contexts/          # React Context
│   │   ├── types/             # TypeScript类型定义
│   │   └── lib/               # 工具库
│   └── package.json
├── scripts/                    # 项目管理脚本
├── docker-compose.yml         # Docker编排
└── README.md
```

---

## 🔌 API端点

### Interviews
- `GET /api/interviews` - 获取所有访谈
- `GET /api/interviews/:id` - 获取单个访谈
- `POST /api/interviews` - 创建访谈
- `PUT /api/interviews/:id` - 更新访谈
- `DELETE /api/interviews/:id` - 删除访谈

### Interviewers
- `GET /api/interviewers` - 获取所有面试官
- `POST /api/interviewers/sync` - 同步面试官到数据库

### Call
- `POST /api/call/register` - 注册通话
- `POST /api/call/end` - 结束通话

### Responses
- `GET /api/responses` - 获取所有回应
- `GET /api/responses/:callId` - 获取单个回应
- `POST /api/responses/webhook` - Retell webhook

### Analytics
- `POST /api/analytics/generate` - 生成访谈分析
- `POST /api/analytics/generate-interview-summary` - 生成访谈深度总结
- `POST /api/analytics/generate-study-summary` - 生成研究总结
- `POST /api/analytics/regenerate-study-summary` - 重新生成研究总结

### Questions
- `POST /api/questions/generate` - 生成问题
- `POST /api/questions/generate-sessions` - 生成深度访谈sessions

---

## 🚀 快速启动

### 使用Yarn (推荐)
```bash
# 安装依赖
yarn install:all

# 启动开发环境
yarn dev
```

### 使用脚本
```bash
# 一键启动
./scripts/dev.sh
```

### 访问地址
- 前端: http://localhost:8089
- 后端: http://localhost:8090
- 健康检查: http://localhost:8090/health

---

## 🔑 环境变量

### Backend (.env)
```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
OPENAI_API_KEY=
RETELL_API_KEY=
PORT=8090
FRONTEND_URL=http://localhost:8089
```

### Frontend (.env)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8090/api
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
PORT=8089
```

---

## 📝 重要文档

- `README.md` - 项目总览和快速开始
- `QUICK_START.md` - 快速启动指南
- `DEEP_DIVE_IMPLEMENTATION.md` - 深度访谈模式实现文档
- `backend/migrations/` - 数据库迁移记录

---

## 🎨 设计理念

1. **前后端分离**: 解决编译性能问题，提升开发体验
2. **AI驱动**: 充分利用GPT-4o的能力进行智能分析
3. **证据驱动**: 所有洞察都有原文引用支持
4. **灵活可扩展**: 支持多种研究类型和分析模式
5. **用户友好**: 简化研究流程，自动化繁琐工作

---

**最后更新**: 2025-01-22

