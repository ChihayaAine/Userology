/**
 * 完整大纲生成 Prompt - Step 2
 *
 * 核心目标：
 * 1. 基于用户审核的骨架生成 4-6 个具体问题
 * 2. 为关键问题生成追问策略
 * 3. 生成 Session 1 Opening（6 个元素）
 * 4. 生成 Session 之间的过渡
 *
 * 输入：
 * - 用户审核后的骨架（Session 主题、目标、背景信息）
 * - 原始的 Study Objective 和 Context
 */

import { OutlineSkeleton } from '@/types/interview';

export const SYSTEM_PROMPT_FULL_OUTLINE_MARKET =
  "You are a world-class market research expert and interview guide designer. Your specialty is creating detailed, executable interview questions for new opportunity exploration and user needs discovery. You excel at designing OPEN-ENDED, NON-LEADING questions that follow the funnel approach (broad → specific) and incorporating smart follow-up strategies for critical questions.";

export const SYSTEM_PROMPT_FULL_OUTLINE_PRODUCT =
  "You are a world-class product research expert and interview guide designer. Your specialty is creating detailed, executable interview questions for existing product optimization research. You excel at designing OPEN-ENDED, NON-LEADING questions that follow the funnel approach (broad → specific) and incorporating smart follow-up strategies for critical questions.";

export const generateFullOutlinePrompt = (body: {
  skeleton: OutlineSkeleton;
  objective: string;
  context: string;
  researchType: 'market' | 'product';
}) => {
  const { skeleton, objective, context, researchType } = body;
  const langConfig = skeleton.metadata.draft_language;

  // 根据研究类型选择不同的 context 标签
  const contextLabel = researchType === 'market' ? 'Additional Market Context' : 'Additional Product Documentation';

  // 语言配置
  const languageInstructions: Record<string, string> = {
    'zh-CN': '**LANGUAGE REQUIREMENT**: Generate ALL content in Simplified Chinese (简体中文)',
    'en-US': '**LANGUAGE REQUIREMENT**: Generate ALL content in English (US)',
    'es-ES': '**LANGUAGE REQUIREMENT**: Generate ALL content in Spanish',
    'fr-FR': '**LANGUAGE REQUIREMENT**: Generate ALL content in French',
    'de-DE': '**LANGUAGE REQUIREMENT**: Generate ALL content in German',
    'ja-JP': '**LANGUAGE REQUIREMENT**: すべてのコンテンツを日本語で生成してください (Generate ALL content in Japanese)',
    'ko-KR': '**LANGUAGE REQUIREMENT**: 모든 콘텐츠를 한국어로 생성하세요 (Generate ALL content in Korean)'
  };

  const langInstruction = languageInstructions[langConfig] || languageInstructions['en-US'];

  // 将骨架转换为易读格式
  const skeletonSummary = skeleton.sessions.map(s => `
**Session ${s.session_number}: ${s.session_title}**
- Goal: ${s.session_goal}
- Background Information:
${s.background_information.map(info => `  • ${info}`).join('\n')}
${s.must_ask_questions && s.must_ask_questions.length > 0 ? `- 🔑 MUST-ASK Questions (User-Specified):
${s.must_ask_questions.map(q => `  • ${q}`).join('\n')}` : ''}
`).join('\n');

  return `
# Task: Generate Complete Interview Outline from Skeleton

${langInstruction}

## Research Information

**Study Objective**: ${objective}
**Research Type**: ${researchType === 'market' ? 'Market Research (New Opportunity Exploration)' : 'Product Research (Existing Product Optimization)'}
**${contextLabel}**: ${context || 'None provided'}
**Total Sessions**: ${skeleton.metadata.total_sessions}
**Estimated Duration**: ${skeleton.metadata.estimated_duration_minutes} minutes

---

## Approved Session Skeleton

The user has reviewed and approved the following session structure. Use this as the foundation for generating detailed questions:

${skeletonSummary}

---

## Your Task

For each session in the skeleton, generate:
1. **Session Opening** (Session 1 only: 6-element opening; Session 2+: brief transition)
2. **4-6 Questions** following the funnel approach (broad → specific)
3. **Follow-up Directions** (ONLY for critical questions tied to core objectives)
4. **Transition to Next Session** (natural summary + confirmation)

🔑 **MUST-ASK Questions Handling**:
- If a session has user-specified MUST-ASK questions, you MUST incorporate them into the interview outline
- Place them in the most natural position within the session flow (usually Q3-Q5)
- Mark them clearly in Interviewer Notes as "[MUST-ASK per User Requirement]"
- Ensure they fit naturally into the funnel approach
- You may refine the wording for clarity, but preserve the core intent

---

## 🔑 CRITICAL: Session 1 Opening Requirements

Session 1's opening MUST include ALL 6 elements:

1. **Warm Greeting**: Start with a friendly hello and thank the participant
2. **Interview Introduction**: Explain what the interview is about and why it matters
3. **Scope Clarification**: Briefly mention the main topics to be covered
4. **Time Setting**: Tell them how long the interview will take
5. **Expectation Setting**: Reassure them there are no right/wrong answers
6. **Readiness Check**: Ask if they're ready to begin

**Example**:
"Hello! It's great to connect with you. Thank you for taking the time to participate in our interview. Today, I'd like to chat with you about [topic]. We'll be focusing on [areas]. This interview will take about ${skeleton.metadata.estimated_duration_minutes} minutes, and I'm really interested in understanding your genuine experiences. There are no standard answers - just share what comes to mind. Are you ready to get started?"

---

## 📊 Question Depth and Quantity Requirements

**Each session MUST have 4-6 questions** using the funnel approach:

- **Q1**: Broad, easy-to-answer question (builds comfort)
- **Q2-3**: Explore behaviors, experiences, context (builds understanding)
- **Q4-5**: Dig into specific areas or critical topics (builds insights)
- **Q6** (if needed): Synthesize or transition

**Funnel Approach**: Start BROAD → gradually NARROW DOWN

${researchType === 'market' ? `
**Example for Session 1 (Market Research - Background Building)**:
1. Self-introduction / current role (broad, comfortable)
2. Current situation / daily context (medium specificity)
3. Relevant behaviors / practices (more specific)
4. Connection to research objective (targeted)

**Example for Session 2 (Market Research - Pain Point Discovery)**:
1. General feelings about the topic (broad)
2. Specific challenges encountered (medium)
3. Impact of those challenges (deeper)
4. Attempted solutions or workarounds (deepest)

**Example for Session 3 (Market Research - Solution Exploration)**:
1. Current tools/methods used (broad)
2. What works well (medium)
3. What doesn't work / frustrations (deeper)
4. Ideal solution characteristics (deepest)
` : `
**Example for Session 1 (Product Research - Background Building)**:
1. Self-introduction / current role (broad, comfortable)
2. Product discovery / how they started using it (medium specificity)
3. Current usage patterns (more specific)
4. Connection to their goals/needs (targeted)

**Example for Session 2 (Product Research - Feature Exploration)**:
1. Overall product experience (broad)
2. Most-used features (medium)
3. Specific feature experiences (deeper)
4. Feature impact on workflow (deepest)

**Example for Session 3 (Product Research - Pain Point Discovery)**:
1. General satisfaction (broad)
2. Specific frustrations or limitations (medium)
3. Impact of those issues (deeper)
4. Workarounds or alternatives tried (deepest)
`}

---

## 🎯 Follow-up Strategy

**ONLY include follow-ups for critical questions** tied to core research objectives.

**Format**:
\`\`\`
**Follow-up Directions:**
[If user mentions X] → Probe for: [dimension 1, dimension 2, dimension 3]
[If user describes Y] → Probe for: [dimension A, dimension B]
**Skip if:** [Conditions when to skip]
\`\`\`

**Example**:
\`\`\`
**Follow-up Directions:**
[If user mentions specific exam] → Probe for: target score, reasons for choosing this exam, timeline
[If user has no exam experience] → Probe for: career goals, English learning motivation
**Skip if:** User has already explained their exam goals in detail
\`\`\`

---

## Output Format

Generate a JSON object with this EXACT structure:

\`\`\`json
{
  "questions": [
    "### **Session 1: [Use session_title from skeleton]**\\n\\n**Session Goal:** [Use session_goal from skeleton]\\n\\n**Section Notes:**\\n- **Interviewer Instructions:** [Session-specific guidance]\\n- **Background Information:**\\n[Use background_information from skeleton - format as bullet points]\\n${skeleton.sessions.some(s => s.must_ask_questions && s.must_ask_questions.length > 0) ? '\\n- **Must-Ask Questions:** [If session has must_ask_questions, incorporate them naturally into Q3-Q5 and mark with [MUST-ASK per User Requirement]]' : ''}\\n\\n**Interview Outline:**\\n\\n**[Opening]**\\n[6-element opening for Session 1]\\n\\nQ1.1 [Interviewer notes: [Purpose/focus]] [Relevant context: [Key background]] \\nQuestion: [OPEN-ENDED question]\\n\\n[ONLY IF CRITICAL:]\\n**Follow-up Directions:**\\n[Directional probes]\\n**Skip if:** [Conditions]\\n\\nQ1.2 [Similar structure]\\n\\n[... 4-6 questions total, incorporating must_ask_questions if present]\\n\\n**[Transition to Next Session]**\\n[Natural transition + confirmation]\\n\\n---",
    "### **Session 2: [Use session_title from skeleton]**\\n\\n[Similar structure]..."
  ],
  "description": "50-word or less second-person description about the research study"
}
\`\`\`

---

## Quality Checklist

Before finalizing, verify:

**Session 1 Opening**:
- ✅ Includes ALL 6 elements (Greeting, Introduction, Scope, Time, Expectations, Readiness)
- ✅ Warm and natural (not abrupt)
- ✅ Sets proper expectations

**Question Depth**:
- ✅ EACH session has 4-6 questions
- ✅ Questions follow funnel approach (broad → specific)
- ✅ Session 1 starts with self-introduction/background

**Question Quality**:
- ✅ ALL questions are open-ended and non-leading
- ✅ Questions focus on behaviors and experiences
- ✅ Follow-ups ONLY for critical questions
- ✅ Follow-ups are directional probes (not scripts)

**Use of Skeleton**:
- ✅ Used session_title from skeleton
- ✅ Used session_goal from skeleton
- ✅ Used background_information from skeleton (formatted as bullets)
- ✅ Incorporated must_ask_questions naturally (if present) and marked with [MUST-ASK per User Requirement]
- ✅ Generated ${skeleton.metadata.total_sessions} sessions

---

## Important Principles

1. **Use the Skeleton**: Directly use session titles, goals, and background information from the approved skeleton
2. **Open-Ended Questions**: NEVER use leading or suggestive questions
3. **Funnel Approach**: Start broad, gradually narrow down
4. **Behavioral Focus**: Ask about what people DO, not what they think
5. **Directional Follow-ups**: Provide dimensions to explore, not word-by-word scripts
6. **Natural Flow**: Each session should feel like a natural conversation

---

NOW, generate the complete interview outline based on the approved skeleton.

**IMPORTANT**: Directly output JSON object, do not include markdown code block markers.
`;
};

