# FoloUp AI访谈项目使用指南

## 项目概述

FoloUp是一个基于AI的语音访谈平台，原本设计用于招聘面试，但可以改造用于各种访谈场景，包括用户调研、产品需求访谈等。

## 核心工作原理

### 1. 系统架构简图
```
前端界面 → API路由 → AI引擎(OpenAI) → 语音引擎(Retell AI) → 数据库(Supabase)
    ↑                                                                    ↓
用户交互 ←————————————————— 访谈记录和分析结果 ←——————————————————————————————————
```

### 2. 核心组件
- **前端**: Next.js应用，提供用户界面
- **AI引擎**: OpenAI GPT-4，负责生成问题和分析回答
- **语音引擎**: Retell AI，处理语音通话
- **数据库**: Supabase，存储访谈数据
- **身份验证**: Clerk，用户登录管理

## 如何配置System Prompt

### 主要Prompt文件位置
```
src/lib/prompts/
├── generate-questions.ts     # 生成访谈问题的prompt
├── communication-analysis.ts # 分析沟通能力的prompt
└── analytics.ts             # 分析访谈结果的prompt
```

### 核心Prompt配置

#### 1. 主访谈员Prompt (`src/lib/constants.ts`)
```javascript
export const RETELL_AGENT_GENERAL_PROMPT = `你是一个访谈专家，擅长提出追问问题以挖掘更深层的见解。访谈时长控制在{{mins}}分钟内。

被访谈者姓名：{{name}}
访谈目标：{{objective}}

可以询问的问题：
{{questions}}

询问问题后，确保进行追问。

遵循以下指导原则：
- 保持专业友好的语调
- 提出精确的开放式问题
- 问题控制在30个字以内
- 不要重复问题
- 不要谈论与目标和问题无关的内容
- 如果提供了姓名，在对话中使用它`;
```

**如何修改**：
1. 打开 `src/lib/constants.ts`
2. 修改 `RETELL_AGENT_GENERAL_PROMPT` 变量
3. 使用 `{{变量名}}` 格式插入动态内容

#### 2. 问题生成Prompt (`src/lib/prompts/generate-questions.ts`)
```javascript
export const generateQuestionsPrompt = (body) => `
想象你是一个访谈专家，专门设计访谈问题...

访谈标题：${body.name}
访谈目标：${body.objective}
要生成的问题数量：${body.number}

指导原则：
- 重点评估候选人的技术知识和项目经验
- 包含评估解决问题能力的问题
- 保持专业友好的语调
- 问题简洁明确，30字以内

使用以下背景生成问题：
${body.context}

输出格式：仅输出包含'questions'和'description'字段的JSON对象
`;
```

**如何修改**：
1. 打开 `src/lib/prompts/generate-questions.ts`
2. 修改prompt文本，调整指导原则
3. 确保输出格式保持JSON结构

#### 3. 分析Prompt (`src/lib/prompts/analytics.ts`)
这个文件包含了访谈结果分析的prompt，可以根据需要调整分析维度和评分标准。

## 前端与后端交互流程

### 1. 创建访谈流程
```
用户填写访谈信息 → 调用/api/create-interview → 生成问题 → 创建访谈记录
```

### 2. 开始访谈流程
```
用户点击开始 → 调用/api/register-call → Retell AI创建通话 → 开始语音访谈
```

### 3. 访谈进行中
```
用户说话 → Retell AI转录 → OpenAI分析 → 生成追问 → AI语音回复
```

### 4. 访谈结束
```
通话结束 → 调用webhook → 分析访谈内容 → 生成报告 → 存储数据库
```

## 关键API接口

### 1. 创建访谈 (`/api/create-interview`)
- 输入：访谈名称、目标、时长、背景信息
- 输出：访谈ID和生成的问题列表

### 2. 注册通话 (`/api/register-call`)
- 输入：访谈员ID、动态数据
- 输出：通话ID和访问令牌

### 3. 响应Webhook (`/api/response-webhook`)
- 处理Retell AI的回调事件
- 触发访谈分析和数据保存

## 数据库结构

主要表格：
- `interviews`: 访谈基本信息
- `responses`: 访谈回复记录
- `interviewers`: 访谈员配置
- `feedback`: 反馈信息

## 如何上手调试Prompt

### 1. 本地开发环境设置
```bash
# 安装依赖
yarn install

# 配置环境变量
cp .env.example .env
# 填入API密钥：
# - OPENAI_API_KEY
# - RETELL_API_KEY
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - CLERK密钥

# 启动开发服务器
yarn dev
```

### 2. 调试Prompt的步骤
1. **修改Prompt文件**：编辑对应的prompt文件
2. **重启开发服务器**：确保修改生效
3. **创建测试访谈**：在前端创建一个测试访谈
4. **查看生成结果**：检查问题生成是否符合预期
5. **进行测试访谈**：实际测试AI访谈效果
6. **查看分析结果**：检查访谈分析是否准确

### 3. 调试技巧
- **日志查看**：在浏览器开发者工具的Console中查看日志
- **API测试**：使用Postman或类似工具直接测试API接口
- **数据库检查**：在Supabase管理界面查看数据存储情况

## 环境变量配置

必需的环境变量：
```env
# OpenAI配置
OPENAI_API_KEY=你的OpenAI密钥

# Retell AI配置  
RETELL_API_KEY=你的Retell密钥

# Supabase配置
NEXT_PUBLIC_SUPABASE_URL=你的Supabase项目URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的Supabase匿名密钥

# Clerk认证配置
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=你的Clerk公开密钥
CLERK_SECRET_KEY=你的Clerk私密密钥
```

## 快速开始指南

1. **配置环境**：按照上述环境变量配置
2. **创建访谈员**：访问 `/api/create-interviewer` 创建AI访谈员
3. **创建访谈**：在Dashboard中创建新的访谈项目
4. **分享链接**：将访谈链接分享给被访谈者
5. **查看结果**：在Dashboard中查看访谈结果和分析报告

## 注意事项

- Retell AI需要付费使用，有免费额度
- OpenAI API调用会产生费用
- 访谈录音会存储在Retell AI平台
- 确保网络连接稳定，语音访谈对网络要求较高
