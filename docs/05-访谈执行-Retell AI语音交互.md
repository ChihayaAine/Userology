# Retell AI 语音交互系统

> **版本**: 1.3.5  
> **最后更新**: 2025-10-24

---

## 📖 系统概述

Retell AI 语音交互系统是 Userology 的核心技术之一，负责实现实时语音对话功能。系统通过 Retell AI SDK 提供：

- **实时语音识别** (Speech-to-Text)
- **实时语音合成** (Text-to-Speech)
- **智能对话管理** (Conversation Flow)
- **多语言支持** (Multi-language)

---

## 🏗️ 系统架构

### 整体架构

```
前端 (RetellWebClient)
    ↓ WebSocket
Retell AI 平台
    ↓ API
后端 (Retell SDK)
    ↓
数据库 (Supabase)
```

### 核心组件

1. **前端**: RetellWebClient (浏览器端 SDK)
2. **后端**: Retell SDK (Node.js)
3. **AI Agent**: Retell LLM (GPT-4o)
4. **语音引擎**: 11labs 语音合成

---

## 🎯 三种面试官模式

### 模式 1: Explorer Lisa

**特点**:
- 探索性访谈
- 友好、开放的对话风格
- 适合用户体验研究

**配置**:
```typescript
{
  agent_name: "Lisa",
  voice_id: "11labs-Chloe",
  responsiveness: 0.2,        // 响应速度
  interruption_sensitivity: 0.2 // 打断敏感度
}
```

---

### 模式 2: Empathetic Bob

**特点**:
- 同理心访谈
- 温和、耐心的对话风格
- 适合敏感话题研究

**配置**:
```typescript
{
  agent_name: "Bob",
  voice_id: "11labs-Brian",
  responsiveness: 0.2,
  interruption_sensitivity: 0.2
}
```

---

### 模式 3: Deep Dive David

**特点**:
- 深度访谈
- 多阶段 Session 流程
- 适合需求探索和产品调研

**配置**:
```typescript
{
  agent_name: "David",
  voice_id: "11labs-Brian",
  responsiveness: 0.1,        // 更慢的响应
  interruption_sensitivity: 0.15 // 更低的打断敏感度
}
```

**Multi-Prompt Agent**:
- 支持最多 10 个 Sessions
- 每个 Session 独立的 Prompt
- Session 间自动过渡

---

## 🔧 实现细节

### 后端实现

#### 1. Agent 创建

**文件**: `backend/src/controllers/interviewers.controller.ts`

**创建 Lisa/Bob**:
```typescript
// 1. 创建 LLM Model
const newModel = await retellClient.llm.create({
  model: "gpt-4o",
  start_speaker: 'user',
  general_prompt: RETELL_AGENT_GENERAL_PROMPT,
  general_tools: [{
    type: "end_call",
    name: "end_call_1",
    description: "End the call if user says goodbye"
  }],
  begin_message: null // 等用户先说话
});

// 2. 创建 Agent
const newAgent = await retellClient.agent.create({
  response_engine: { llm_id: newModel.llm_id, type: "retell-llm" },
  voice_id: "11labs-Chloe",
  agent_name: "Lisa",
  responsiveness: 0.2,
  interruption_sensitivity: 0.2
});
```

**创建 David (Multi-Prompt)**:
```typescript
// 1. 创建 Multi-Prompt LLM
const davidModel = await retellClient.llm.create({
  model: "gpt-4o",
  start_speaker: 'user',
  states: [
    {
      name: "session_1",
      state_prompt: "{{session1}}",
      edges: [{ destination_state_name: "session_2", description: "Move to next session" }]
    },
    {
      name: "session_2",
      state_prompt: "{{session2}}",
      edges: [{ destination_state_name: "session_3", description: "Move to next session" }]
    },
    // ... 最多 10 个 sessions
  ],
  starting_state: "session_1",
  general_tools: [{ type: "end_call", name: "end_call_main" }],
  begin_message: null
});

// 2. 创建 Agent
const davidAgent = await retellClient.agent.create({
  response_engine: { llm_id: davidModel.llm_id, type: "retell-llm" },
  voice_id: "11labs-Brian",
  agent_name: "David",
  responsiveness: 0.1,
  interruption_sensitivity: 0.15
});
```

---

#### 2. 通话注册

**文件**: `backend/src/controllers/call.controller.ts`

**API 端点**: `POST /api/call/register`

**流程**:
```typescript
export const registerCall = async (req: Request, res: Response) => {
  const { interviewer_id, dynamic_data } = req.body;
  
  // 1. 获取面试官信息
  const interviewer = await InterviewerService.getInterviewer(interviewer_id);
  
  // 2. 判断是否为深度访谈模式
  const isDeepDiveMode = interviewer.name?.includes('David');
  
  // 3. 准备动态变量
  let dynamicVariables = { ...dynamic_data };
  
  if (isDeepDiveMode) {
    // David: 填充 session_1 到 session_10
    const questionsArray = JSON.parse(dynamic_data.questions_array);
    const sessionCount = questionsArray.length;
    
    for (let i = 0; i < sessionCount; i++) {
      const session = questionsArray[i];
      dynamicVariables[`session${i + 1}`] = formatSessionPrompt(session);
    }
    
    // 填充空 sessions
    for (let i = sessionCount; i < 10; i++) {
      dynamicVariables[`session${i + 1}`] = "This session is not used.";
    }
  }
  
  // 4. 注册通话
  const registerCallResponse = await retellClient.call.createWebCall({
    agent_id: interviewer.agent_id,
    retell_llm_dynamic_variables: dynamicVariables
  });
  
  return res.status(200).json({ registerCallResponse });
};
```

---

#### 3. 通话数据获取

**API 端点**: `GET /api/call/:callId`

```typescript
export const getCall = async (req: Request, res: Response) => {
  const { callId } = req.params;
  
  // 1. 从数据库获取 response
  const response = await ResponseService.getResponseByCallId(callId);
  
  // 2. 从 Retell API 获取通话详情
  const callResponse = await retellClient.call.retrieve(callId);
  
  // 3. 提取 transcript
  const transcript = callResponse.transcript ?? '';
  const duration = Math.round(
    (callResponse.end_timestamp - callResponse.start_timestamp) / 1000
  );
  
  // 4. 触发分析
  await generateInterviewAnalytics({ callId, interviewId, transcript });
  
  return res.status(200).json({ callResponse, analytics });
};
```

---

### 前端实现

#### 1. RetellWebClient 初始化

**文件**: `frontend/src/components/call/index.tsx`

```typescript
import { RetellWebClient } from "retell-client-js-sdk";

const webClient = new RetellWebClient();

// 监听事件
useEffect(() => {
  webClient.on("call_started", () => {
    console.log("Call started");
    setIsCalling(true);
  });
  
  webClient.on("call_ended", () => {
    console.log("Call ended");
    setIsCalling(false);
    setIsEnded(true);
  });
  
  webClient.on("agent_start_talking", () => {
    setActiveTurn("agent");
  });
  
  webClient.on("agent_stop_talking", () => {
    setActiveTurn("user");
  });
  
  webClient.on("update", (update) => {
    if (update.transcript) {
      const transcripts = update.transcript;
      // 更新实时转录...
    }
  });
  
  webClient.on("error", (error) => {
    console.error("An error occurred:", error);
    webClient.stopCall();
  });
  
  return () => {
    webClient.removeAllListeners();
  };
}, []);
```

---

#### 2. 开始通话

```typescript
const onStartCallClick = async () => {
  setLoading(true);
  
  // 1. 准备动态数据
  const data = {
    questions: interview.questions.map(q => q.question).join('\n'),
    questions_array: JSON.stringify(interview.questions), // David 需要
    study_name: interview.name,
    study_objective: interview.objective,
    study_description: interview.description
  };
  
  // 2. 注册通话
  const registerCallResponse = await apiClient.post('/call/register', {
    interviewer_id: interview.interviewer_id,
    dynamic_data: data
  });
  
  // 3. 启动 WebClient
  await webClient.startCall({
    accessToken: registerCallResponse.data.registerCallResponse.access_token
  });
  
  setIsCalling(true);
  setIsStarted(true);
  setCallId(registerCallResponse.data.registerCallResponse.call_id);
  
  // 4. 创建 response 记录
  await createResponse({
    interview_id: interview.id,
    call_id: registerCallResponse.data.registerCallResponse.call_id,
    email, name
  });
  
  setLoading(false);
};
```

---

#### 3. 结束通话

```typescript
const onEndCallClick = async () => {
  if (isStarted) {
    setLoading(true);
    webClient.stopCall();
    setIsEnded(true);
    setLoading(false);
  }
};

// 通话结束后自动保存
useEffect(() => {
  if (isEnded) {
    const updateInterview = async () => {
      await ResponseService.saveResponse(
        { is_ended: true, tab_switch_count: tabSwitchCount },
        callId
      );
    };
    updateInterview();
  }
}, [isEnded]);
```

---

## 🌐 多语言支持

### 语言配置

**文件**: `backend/src/lib/constants.ts`

```typescript
export const SUPPORTED_LANGUAGES = {
  'en-US': {
    code: 'en-US',
    name: 'English',
    voices: {
      lisa: '11labs-Chloe',
      bob: '11labs-Brian',
      david: '11labs-Brian'
    }
  },
  'zh-CN': {
    code: 'zh-CN',
    name: '简体中文',
    voices: {
      lisa: '11labs-Chloe',
      bob: '11labs-Brian',
      david: '11labs-Brian'
    }
  },
  // ... 其他语言
};
```

### 动态语音选择

```typescript
const language = interview.language || 'en-US';
const languageConfig = SUPPORTED_LANGUAGES[language];

let voiceId = languageConfig.voices.bob;
if (interviewer.name?.includes('Lisa')) {
  voiceId = languageConfig.voices.lisa;
} else if (interviewer.name?.includes('David')) {
  voiceId = languageConfig.voices.david;
}
```

---

## 🔄 动态变量系统

### 标准模式 (Lisa/Bob)

```typescript
{
  questions: "1. Question 1\n2. Question 2\n...",
  study_name: "User Research Study",
  study_objective: "Understand user needs",
  study_description: "..."
}
```

### 深度模式 (David)

```typescript
{
  session1: "Session 1 Prompt...",
  session2: "Session 2 Prompt...",
  // ... 最多 session10
  study_name: "...",
  study_objective: "...",
  study_description: "..."
}
```

---

## 📊 实时转录

### Transcript 格式

```typescript
{
  transcript: [
    {
      role: "agent",
      content: "Hello, how are you?"
    },
    {
      role: "user",
      content: "I'm good, thanks!"
    }
  ]
}
```

### 前端显示

```typescript
const [lastInterviewerResponse, setLastInterviewerResponse] = useState("");
const [lastUserResponse, setLastUserResponse] = useState("");

webClient.on("update", (update) => {
  if (update.transcript) {
    const transcripts = update.transcript;
    const roleContents = {};
    
    transcripts.forEach((transcript) => {
      roleContents[transcript.role] = transcript.content;
    });
    
    setLastInterviewerResponse(roleContents["agent"]);
    setLastUserResponse(roleContents["user"]);
  }
});
```

---

## 🚀 性能优化

### 响应速度控制

- **responsiveness**: 0.1-1.0 (越低越慢)
- **interruption_sensitivity**: 0.1-1.0 (越低越不容易被打断)

### 推荐配置

| 面试官 | responsiveness | interruption_sensitivity | 说明 |
|--------|----------------|-------------------------|------|
| Lisa   | 0.2            | 0.2                     | 标准速度 |
| Bob    | 0.2            | 0.2                     | 标准速度 |
| David  | 0.1            | 0.15                    | 更慢，更深思熟虑 |

---

## 🔍 调试和日志

### 关键日志点

```typescript
console.log('🔬 [Deep Dive Mode] Preparing session variables...');
console.log('📋 [Standard Mode] Using original question format');
console.warn('【调用 Retell API】：>>>>>>>>>>>> controller.ts', { agent_id, dynamic_variables });
console.warn('【Retell API 响应】：>>>>>>>>>>>> controller.ts', registerCallResponse);
```

### 常见问题

1. **通话无法开始**
   - 检查 API Key
   - 检查 Agent ID
   - 检查网络连接

2. **语音识别不准确**
   - 检查麦克风权限
   - 检查网络质量
   - 调整语言设置

3. **AI 响应太快/太慢**
   - 调整 responsiveness
   - 调整 interruption_sensitivity

---

## 📚 相关文档

- [访谈问题生成系统](./04-访谈问题生成系统.md)
- [访谈分析系统](./05-访谈分析系统.md)
- [技术架构](./01-技术架构.md)

---

**维护者**: Userology 开发团队  
**最后更新**: 2025-10-24

