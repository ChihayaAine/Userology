// 产品调研访谈大纲生成 - TypeScript 实现

export const SYSTEM_PROMPT_PRODUCT_RESEARCH = `你是世界顶级的产品调研专家和AI访谈大纲设计师，专门负责为已有产品的优化调研设计高质量、可执行的访谈大纲。你深谙用户访谈的最佳实践，能够设计出既能深入挖掘用户真实体验，又能高效收集可执行洞察的访谈流程。`;

export interface ProductResearchInput {
  studyName: string;           // 调研名称
  researchObjective: string;   // 调研目标（包含：调研背景、核心问题、目标用户、期望产出）
  contextDocuments?: string;   // 可选：上传的产品文档内容
  numberOfSessions: number;    // Session数量（通常3-6个）
  duration: number;            // 预计时长（分钟）
}

export interface InterviewQuestion {
  questionId: string;
  hostNotes: string;
  relevantContext: string;
  mainQuestion: string;
  followUps: Array<{
    condition: string;
    question: string;
  }>;
}

export interface InterviewSession {
  sessionNumber: number;
  title: string;
  researchGoal: string;
  sectionNotes: {
    hostInstructions: string;
    backgroundInfo: string[];
  };
  questions: InterviewQuestion[];
  transition: string;
}

export interface ProductResearchOutput {
  description: string;
  coreObjectives: {
    background: string;
    keyQuestions: string[];
    expectedOutput: string;
  };
  sessions: InterviewSession[];
  openingScript: string;
  closingScript: string;
}

export const generateProductResearchPrompt = (input: ProductResearchInput): string => {
  return `# 产品调研访谈大纲生成任务

## 输入信息

**调研名称**: ${input.studyName}

**调研目标**: 
${input.researchObjective}

${input.contextDocuments ? `**补充产品文档**:\n${input.contextDocuments}\n` : ''}

**Session数量**: ${input.numberOfSessions}
**预计时长**: ${input.duration}分钟

---

## 你的任务

基于以上输入信息，生成一份完整的、高质量的产品调研访谈大纲。

## 核心要求

### 1. 理解调研需求
- 从\`researchObjective\`中提取：调研背景、核心问题、目标用户、期望产出
- 如果提供了\`contextDocuments\`，提取产品功能、定位、用户群体等关键信息
- 推断调研类型（新版本验证/功能排序/未来机会探索）

### 2. 访谈结构设计

产品调研的典型Session流程：
- **Session 1**: 破冰 + 产品使用背景了解
- **Session 2**: 产品体验自由表达（开放式，不引导）
- **Session 3**: 核心功能深度体验挖掘
- **Session 4**: 痛点与改进需求收集
- **Session 5**: 竞品对比与差异化价值探索（如适用）
- **Session 6**: 重点复盘与优先级确认

根据\`numberOfSessions\`和\`duration\`灵活调整。

### 3. 问题设计最佳实践

#### 必须遵循的格式规范：
- **问题ID**: \`Q[Session].[序号]\`，如 Q1.1, Q1.2
- **主持人笔记**: 包含问题动机、关注点、记录要点、人性化回应建议
- **相关背景**: 与此问题直接相关的背景信息（自包含，不引用外部文件）
- **追问条件**: 每个追问都标注"若语境突兀或用户已回答，则跳过追问"

#### 渐进式收集策略：
- **单点启发**: 先问一个核心问题
- **自然延伸**: 基于回答追问"还有吗？"
- **补充引导**: 温和引导补充遗漏维度

**示例**：
\`\`\`
Q3.1 主问题: "在使用[产品]的过程中，有什么让你觉得特别好用或特别满意的地方吗？"
追问1: [若用户提到一个功能] "能具体说说吗？这个功能为什么让你满意？"
追问2: [若用户回答完第一个] "还有其他让你满意的地方吗？"
\`\`\`

#### 量化与定性平衡：
- 关键体验点要求评分（1-10分）
- 评分后追问"为什么是这个分数？"
- 收集具体案例和场景描述

### 4. 固定即兴追问指令（每个Session必须包含）

在每个Session的\`sectionNotes.hostInstructions\`中必须包含：

\`\`\`
如果用户分享了任何与我们的研究目标相关的新信息,请进行1-2次追问来深入了解(为什么/是什么/怎么样/有什么影响)。如果与目标无关,简单致意后继续推进访谈。对于有设置追问的问题,如果用户已经在主问题回答了追问,则跳过追问。在acknowledge用户回答时,请灵活使用不同的表达方式,如'好的'、'嗯嗯'、'了解'、'是这样啊'、'原来如此'、'明白'、'好'、'嗯'、'我懂了'、'对对'、'这样'等,避免重复使用'我明白了'。
\`\`\`

### 5. 产品调研特有关注点

#### 功能验证四步法：
- **注意到**: 用户是否发现了新功能/改进？
- **理解**: 用户是否理解功能的价值和使用方法？
- **使用**: 用户实际使用频率和场景？
- **认可**: 用户对功能的满意度和改进建议？

#### 竞品对比策略：
- 不要直接问"你用过哪些竞品"
- 而是问"你在使用[产品]之前/同时，还用过其他类似的工具吗？"
- 追问"和[竞品]比，[产品]有什么不同？你更喜欢哪个？为什么？"

### 6. 节间过渡设计

每个Session结束时必须包含：
- 简短总结用户分享的关键点
- 预告下一Session的主题
- 征求用户同意继续（"我们继续好吗？"）

---

## 输出格式

严格按照以下JSON格式输出（不要包含markdown代码块标记）：

\`\`\`json
{
  "description": "50字以内的调研简述",
  "coreObjectives": {
    "background": "调研触发背景",
    "keyQuestions": ["核心问题1", "核心问题2", "核心问题3"],
    "expectedOutput": "理想产出描述"
  },
  "sessions": [
    {
      "sessionNumber": 1,
      "title": "Session标题",
      "researchGoal": "本Session的研究目标",
      "sectionNotes": {
        "hostInstructions": "主持人指令（必须包含固定即兴追问指令 + 本Session特殊指令）",
        "backgroundInfo": [
          "背景信息1",
          "背景信息2"
        ]
      },
      "questions": [
        {
          "questionId": "Q1.1",
          "hostNotes": "主持人笔记：[问题动机/关注点/记录要点/人性化回应建议]",
          "relevantContext": "相关背景：[与此问题直接相关的背景信息]",
          "mainQuestion": "主问题内容",
          "followUps": [
            {
              "condition": "若语境突兀或用户已经分享了追问指向的相关信息,跳过该条追问问题或用灵活的方式追问达成相同的目标",
              "question": "追问内容"
            }
          ]
        }
      ],
      "transition": "节间过渡语 + 用户确认问题"
    }
  ],
  "openingScript": "开场白脚本",
  "closingScript": "结束语脚本"
}
\`\`\`

---

## 质量检查清单

生成大纲后，请自我检查：
- ✅ 所有Session是否覆盖了核心调研问题？
- ✅ 问题设计是否符合最佳实践（开放式、渐进式收集）？
- ✅ 是否包含了必需的量化收集项（评分）？
- ✅ 节间过渡是否自然流畅？
- ✅ 开场白和结束语是否专业且人性化？
- ✅ 每个问题的背景信息是否自包含？
- ✅ 追问是否标注了灵活性条件？

---

现在，请基于以上输入信息和要求，生成完整的产品调研访谈大纲。

**重要**: 直接输出JSON对象，不要包含任何markdown代码块标记（如\`\`\`json）。`;
};

