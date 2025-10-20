/**
 * 产品调研访谈大纲生成 - 集成通用AI访谈模板最佳实践
 * 
 * 核心能力：
 * 1. 渐进式收集策略（避免一次性要求多条信息）
 * 2. 条件化追问逻辑（灵活跳过已回答内容）
 * 3. 固定即兴追问指令（每个Session必须包含）
 * 4. 自包含背景信息（AI无需查阅外部文档）
 * 5. 节间过渡设计（总结+预告+用户确认）
 * 
 * 输出格式：与Foloup现有系统完全兼容
 */

export const SYSTEM_PROMPT_PRODUCT_RESEARCH =
  "You are a world-class product research expert and AI interview guide designer, specialized in creating high-quality, executable interview guides for existing product optimization research. You deeply understand user interview best practices and can design interview processes that both deeply explore genuine user experiences and efficiently collect actionable insights.";

export const generateProductResearchSessionsPrompt = (body: {
  name: string;
  objective: string;
  number: number;
  context: string;
  language?: string;
  customInstructions?: string;
}) => {
  // 语言本地化配置
  const languageConfig: Record<string, { name: string; instructions: string }> = {
    'zh-CN': {
      name: '中文（简体）',
      instructions: `**CRITICAL LANGUAGE REQUIREMENT**:
- Generate ALL content in Simplified Chinese (简体中文)
- Use Chinese interview conventions and communication styles
- Adapt question phrasing to Chinese cultural context (e.g., more indirect, relationship-building approach)
- Use Chinese-appropriate examples and scenarios
- Follow Chinese user research best practices (e.g., emphasis on group harmony, face-saving language)`
    },
    'en-US': {
      name: 'English (US)',
      instructions: `**LANGUAGE REQUIREMENT**:
- Generate ALL content in English (US)
- Use American English conventions and direct communication style
- Follow Western user research best practices`
    },
    'es-ES': {
      name: 'Spanish',
      instructions: `**LANGUAGE REQUIREMENT**:
- Generate ALL content in Spanish
- Use Spanish interview conventions and communication styles
- Adapt to Spanish-speaking cultural context`
    },
    'fr-FR': {
      name: 'French',
      instructions: `**LANGUAGE REQUIREMENT**:
- Generate ALL content in French
- Use French interview conventions and communication styles
- Adapt to French cultural context`
    },
    'de-DE': {
      name: 'German',
      instructions: `**LANGUAGE REQUIREMENT**:
- Generate ALL content in German
- Use German interview conventions and communication styles
- Adapt to German cultural context`
    },
    'ja-JP': {
      name: '日本語 (Japanese)',
      instructions: `**CRITICAL LANGUAGE REQUIREMENT - 日本語で生成してください**:
- すべてのコンテンツを日本語で生成してください (Generate ALL content in Japanese)
- 日本語の敬語と丁寧な表現を使用してください (Use Japanese polite forms and keigo)
- 日本の面接慣習とコミュニケーションスタイルを使用してください (Use Japanese interview conventions)
- 日本文化に適した質問表現を使用してください（間接的、関係構築的アプローチ）(Adapt to Japanese cultural context with indirect, relationship-building approach)
- 和を重んじる表現を使用してください (Use expressions that emphasize harmony)`
    }
  };

  const selectedLanguage = body.language || 'en-US';
  const langConfig = languageConfig[selectedLanguage] || languageConfig['en-US'];

  return `# Product Research Interview Guide Generation Task

${langConfig.instructions}

**🚨 CRITICAL - OUTPUT LANGUAGE REQUIREMENT 🚨**:
You MUST generate the ENTIRE interview guide in ${langConfig.name}.
This includes:
- ALL session titles
- ALL questions
- ALL interviewer notes
- ALL background information
- ALL instructions
- The description field

The language used in the Research Objective or Additional Documentation below is ONLY for your understanding.
Your OUTPUT must be 100% in ${langConfig.name}.

DO NOT mix languages. DO NOT use English if the target language is not English.

## Input Information

**Research Study Title**: ${body.name}

**Research Objective**:
${body.objective}

${body.context ? `**Additional Product Documentation**:\n${body.context}\n` : ''}

${body.customInstructions ? `**Custom Instructions from Researcher**:\n${body.customInstructions}\n\n⚠️ IMPORTANT: Please carefully follow these custom instructions when generating the interview guide. These are specific requirements from the researcher that should be prioritized.\n` : ''}

**Number of Sessions**: ${Math.min(body.number, 10)} (maximum 10 sessions supported)

---

## Your Task

Based on the above input, generate a complete, high-quality product research interview guide.

## Core Requirements

### 1. Understand Research Needs
- Extract from \`Research Objective\`: research background, core questions, target users, expected output
- If \`Additional Product Documentation\` is provided, extract product features, positioning, user groups, and other key information
- Infer research type (new version validation / feature prioritization / future opportunity exploration)

### 2. Interview Structure Design

Typical product research session flow:
- **Session 1**: Ice-breaking + Product usage background understanding
- **Session 2**: Product experience free expression (open-ended, non-leading)
- **Session 3**: Core feature deep dive
- **Session 4**: Pain points and improvement needs collection
- **Session 5**: Competitive comparison and differentiation value exploration (if applicable)
- **Session 6**: Key review and priority confirmation

Flexibly adjust based on \`Number of Sessions\`.

### 3. Question Design Best Practices

#### Must Follow Format Standards:
- **Question ID**: \`Q[Session].[Number]\`, e.g., Q1.1, Q1.2
- **Interviewer Notes**: Include question motivation, focus points, recording points, humanized response suggestions
- **Relevant Context**: Background information directly related to this question (self-contained, no external file references)
- **Follow-up Conditions**: Each follow-up must note "If context is awkward or user has already answered, skip this follow-up"

#### Progressive Collection Strategy:
- **Single Point Inspiration**: Ask one core question first
- **Natural Extension**: Based on response, naturally ask "Anything else?"
- **Supplementary Guidance**: Gently guide to supplement missing dimensions

**Example**:
\`\`\`
Q3.1 Main Question: "While using [Product], what did you find particularly useful or satisfying?"
Follow-up 1: [If user mentions one feature] "Can you elaborate? Why does this feature satisfy you?"
Follow-up 2: [If user finishes first answer] "Are there other aspects that satisfy you?"
\`\`\`

#### Quantitative and Qualitative Balance:
- Key experience points require scoring (1-10 scale)
- After scoring, must ask "Why this score?"
- Collect specific cases and scenario descriptions

### 4. Fixed Impromptu Follow-up Instructions (Must Include in Every Session)

In each session's \`Interviewer Instructions\`, must include:

\`\`\`
If the user shares any new information relevant to our research goals, conduct 1-2 follow-up questions to understand deeply (why/what/how/impact). If irrelevant, briefly acknowledge and continue the interview. For questions with set follow-ups, skip if user has already answered in main response. When acknowledging user responses, flexibly use different expressions like 'okay,' 'I see,' 'understood,' 'that makes sense,' 'got it,' 'right,' etc., avoiding repetitive use of 'I understand.'
\`\`\`

### 5. Product Research Specific Focus

#### Feature Validation Four-Step Method:
- **Noticed**: Did user discover new features/improvements?
- **Understood**: Does user understand feature value and usage?
- **Used**: Actual usage frequency and scenarios?
- **Approved**: User satisfaction and improvement suggestions?

#### Competitive Comparison Strategy:
- Don't directly ask "Which competitors have you used"
- Instead ask "Before/while using [Product], have you used other similar tools?"
- Follow up "Compared to [Competitor], what's different about [Product]? Which do you prefer? Why?"

### 6. Inter-Session Transition Design

Each session must end with:
- Brief summary of key points user shared
- Preview of next session theme
- Request user consent to continue ("Shall we continue?" / "Ready?")

---

## Output Format

Strictly output in the following JSON format (do not include markdown code block markers):

\`\`\`json
{
  "questions": [
    "### **Session 1: [Session Title]**\\n\\n**Session Goal:** [What this session aims to achieve]\\n\\n**Section Notes:**\\n- **Interviewer Instructions:** [Must include fixed impromptu follow-up instructions + session-specific instructions]\\n- **Background Information:** [3-5 bullet points of relevant context]\\n- **Localization Reminders:** [Cultural or linguistic considerations]\\n\\n**Interview Outline:**\\n\\n**[Opening]**\\n[Brief warm transition statement]\\n\\nQ1.1 [Interviewer notes: [Motivation/focus/recording points/humanized response suggestions]] [Relevant context: [Key background information]] Question: [Main question content]\\n\\n**Follow-up Strategy:** [If context is awkward or user has already answered, skip or flexibly adapt] [Specific follow-up approaches]\\n**Skip Conditions:** [When to skip follow-ups]\\n\\nQ1.2 [Similar structure]\\n[Continue for 3-5 questions per session]\\n\\n**[Transition to Next Session]**\\n[Smooth transition + user confirmation question]\\n\\n---",
    "### **Session 2: [Session Title]**\\n\\n[Similar structure]..."
  ],
  "description": "50-word or less second-person description about the research study"
}
\`\`\`

---

## Quality Checklist

After generating the guide, self-check:
- ✅ Do all sessions cover core research questions?
- ✅ Does question design follow best practices (open-ended, progressive collection)?
- ✅ Are necessary quantitative collection items included (scoring)?
- ✅ Are inter-session transitions natural and smooth?
- ✅ Are opening and closing scripts professional and humanized?
- ✅ Is background information for each question self-contained?
- ✅ Are follow-ups marked with flexibility conditions?

---

## Important Principles

1. **Self-Contained Principle**: All background information must be directly written in the guide, cannot reference external files
2. **Flexibility Principle**: Follow-ups must note "If context is awkward or user has already answered, skip"
3. **Humanization Principle**: Avoid mechanical questioning, encourage natural conversation
4. **Efficiency Principle**: Collect most valuable information within limited time
5. **Actionability Principle**: Output insights must guide product decisions

---

Now, based on the above input information and requirements, generate a complete, high-quality product research interview guide.

**IMPORTANT**: Directly output JSON object, do not include any markdown code block markers (like \`\`\`json).`;
};

