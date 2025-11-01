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
  const skeletonSummary = skeleton.sessions.map(s => {
    const depthLevel = s.depth_level || 'medium'; // 默认 medium
    const questionCount = depthLevel === 'high' ? '5-6 questions' : depthLevel === 'medium' ? '4-5 questions' : '2-4 questions';
    return `
**Session ${s.session_number}: ${s.session_title}** [Depth: ${depthLevel.toUpperCase()}]
- Goal: ${s.session_goal}
- Depth Level: **${depthLevel}** (${questionCount})
- Background Information:
${s.background_information.map(info => `  • ${info}`).join('\n')}
${s.must_ask_questions && s.must_ask_questions.length > 0 ? `- 🔑 MUST-ASK Questions (User-Specified):
${s.must_ask_questions.map(q => `  • ${q}`).join('\n')}` : ''}
`;
  }).join('\n');

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
2. **4-6 Questions** following the funnel approach (broad → specific) - **IMPORTANT**: Allocate questions based on session importance
3. **Multi-Level Follow-up Directions** (for critical questions tied to core objectives)
4. **Transition to Next Session** (natural summary + confirmation)
5. **Final Session Closing** (Last session only: Thank participant + **REMIND them to click "End Interview" button**)

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

**CRITICAL: STRICTLY follow the \`depth_level\` assigned to each session**

Each session in the skeleton has a \`depth_level\` that determines BOTH the number of questions AND the depth of exploration:

**Depth Level Mapping** (MUST FOLLOW):

### 🔥 depth_level: "high" → 5-6 questions
**Importance**: These sessions are CRITICAL to achieving research goals
**Question Quantity**: 5-6 questions (MUST generate at least 5)
**Question Quality**:
- ✅ **Deeply reference the Study Objective** - Every question should directly serve the core research goal
- ✅ **Leverage all Background Information** - Use the provided context to craft highly targeted questions
- ✅ **Multi-level follow-ups** - Include L1 (clarification) → L2 (examples) → L3 (impact) follow-up strategies
- ✅ **Granular insights** - Ask for specific examples, quantifiable data, concrete scenarios
- ✅ **Root cause exploration** - Don't stop at surface answers, dig into "why" and "how"
**Examples**: Pain point discovery, competitive analysis, feature validation, solution exploration

### 🟡 depth_level: "medium" → 4-5 questions
**Importance**: These sessions provide necessary context but don't require extreme depth
**Question Quantity**: 4-5 questions
**Question Quality**:
- ✅ Reference the Study Objective moderately
- ✅ Use Background Information to guide questions
- ✅ Include basic follow-ups (L1-L2)
- ✅ Balance breadth and depth
**Examples**: Background building, usage patterns, general experiences

### ⚪ depth_level: "low" → 2-4 questions
**Importance**: These sessions are important for flow but don't need extensive questioning
**Question Quantity**: 2-4 questions (minimum 2, maximum 4)
**Question Quality**:
- ✅ Keep questions simple and conversational
- ✅ Focus on building rapport or wrapping up
- ✅ Minimal follow-ups needed
- ✅ Adjust quantity based on session complexity (warm-up: 2-3, wrap-up: 3-4)
**Examples**: Ice-breaking, final thoughts, thank you

---

**IMPORTANT**: The \`depth_level\` has been carefully assigned based on the research objectives. You MUST:
1. **Generate the correct number of questions** for each depth level
2. **Adjust question quality and depth** based on the depth level
3. **For HIGH depth sessions**: Treat them as the CORE of the research - invest maximum effort in crafting insightful, objective-aligned questions

**Question Structure** (using the funnel approach):
- **Q1**: Broad, easy-to-answer question (builds comfort)
- **Q2-3**: Explore behaviors, experiences, context (builds understanding)
- **Q4-5**: Dig into specific areas or critical topics (builds insights)
- **Q6** (if needed for high-priority sessions): Deep dive into most critical aspect

**Funnel Approach**: Start BROAD → gradually NARROW DOWN → End with DEEPEST INSIGHT

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

## 🎯 Multi-Level Follow-up Strategy

**CRITICAL CHANGE**: Design **LAYERED follow-ups** for critical questions to enable deep exploration.

**Why Multi-Level Follow-ups?**
When a user mentions a competitor product scoring 6/10 "because it's inconvenient and can't be used at school," we need to dig deeper:
- ❌ **Old approach**: Move to next question (missed opportunity!)
- ✅ **New approach**: L1 → "What makes it inconvenient?" → L2 → "Can you give a specific example?" → L3 → "How does that impact your workflow?"

**Follow-up Levels**:

**Level 1 (L1) - Surface Exploration**:
- Clarify vague statements
- Get initial details
- Example: "What makes it inconvenient?" / "Why can't it be used at school?"

**Level 2 (L2) - Concrete Examples**:
- Request specific scenarios
- Uncover real behaviors
- Example: "Can you walk me through a specific time when this happened?" / "What exactly did you try to do?"

**Level 3 (L3) - Impact & Root Cause**:
- Understand consequences
- Identify underlying needs
- Example: "How did that affect your study plan?" / "What would an ideal solution look like?"

**Format**:
\`\`\`
**Follow-up Directions (Multi-Level):**

[If user mentions X] →
  L1: Probe for [initial clarification]
  L2: [If L1 reveals Y] → Ask for [specific example or scenario]
  L3: [If L2 reveals Z] → Dig into [impact, root cause, or ideal solution]

[If user describes A] →
  L1: Probe for [dimension 1, dimension 2]
  L2: [If user mentions specific tool/method] → Ask for [concrete usage example]
  L3: [If pain point emerges] → Explore [workarounds, frequency, severity]

**Skip if:** [Conditions when to skip - e.g., user has already provided deep details]
\`\`\`

**Example (Competitor Analysis)**:
\`\`\`
**Follow-up Directions (Multi-Level):**

[If user mentions competitor product with low score] →
  L1: "What specifically makes it score low for you?" (Clarify vague "inconvenient")
  L2: [If user mentions usability issue] → "Can you describe a recent time when you encountered this problem?"
  L3: [If specific scenario emerges] → "How did you work around it? What would make it better?"

[If user mentions "can't use at school"] →
  L1: "What prevents you from using it at school?" (Technical? Policy? Access?)
  L2: [If technical limitation] → "What exactly happens when you try?"
  L3: [If workaround exists] → "How much extra time/effort does that take?"

**Skip if:** User has already explained the root cause and impact in detail
\`\`\`

**Guidelines**:
- ✅ Use multi-level follow-ups for **critical questions** (pain points, competitor analysis, feature validation)
- ✅ Each level should build on the previous response
- ✅ L3 should always aim for **actionable insights** (impact, frequency, ideal solution)
- ❌ Don't use multi-level follow-ups for simple factual questions

---

## Output Format

**CRITICAL**: You MUST generate **EXACTLY ${skeleton.metadata.total_sessions} sessions** (one for each session in the skeleton).

Generate a JSON object with this EXACT structure:

\`\`\`json
{
  "questions": [
    {
      "session_text": "### **Session 1: [Use session_title from skeleton]**\\n\\n**Session Goal:** [Use session_goal from skeleton]\\n\\n**Depth Level:** [depth_level from skeleton - high/medium/low]\\n\\n**Section Notes:**\\n- **Interviewer Instructions:** [Session-specific guidance based on depth_level]\\n- **Background Information:**\\n[Use background_information from skeleton - format as bullet points]\\n${skeleton.sessions.some(s => s.must_ask_questions && s.must_ask_questions.length > 0) ? '\\n- **Must-Ask Questions:** [If session has must_ask_questions, incorporate them naturally into Q3-Q5 and mark with [MUST-ASK per User Requirement]]' : ''}\\n\\n**Interview Outline:**\\n\\n**[Opening]**\\n[6-element opening for Session 1]\\n\\nQ1.1 [Interviewer notes: [Purpose/focus]] [Relevant context: [Key background]] \\nQuestion: [OPEN-ENDED question]\\n\\n[ONLY IF CRITICAL:]\\n**Follow-up Directions (Multi-Level):**\\n[If user mentions X] →\\n  L1: [Initial clarification]\\n  L2: [If L1 reveals Y] → [Specific example]\\n  L3: [If L2 reveals Z] → [Impact/root cause]\\n**Skip if:** [Conditions]\\n\\nQ1.2 [Similar structure]\\n\\n[... MUST generate correct number of questions based on depth_level: high=5-6, medium=4-5, low=2-4]\\n\\n**[Transition to Next Session]**\\n[Natural transition + confirmation]\\n\\n---",
      "depth_level": "high"
    },
    {
      "session_text": "### **Session 2: [Use session_title from skeleton]**\\n\\n[Similar structure to Session 1, but with brief transition instead of 6-element opening]\\n\\n---",
      "depth_level": "medium"
    },
    // ... CONTINUE FOR ALL ${skeleton.metadata.total_sessions} SESSIONS (DO NOT SKIP ANY!)
    {
      "session_text": "### **Session ${skeleton.metadata.total_sessions}: [Last Session Title]**\\n\\n[Similar structure]\\n\\n**[Closing]**\\n[Thank participant warmly]\\n\\n⚠️ **CRITICAL REMINDER**: \\\"Please remember to click the 'End Interview' button to submit your responses. Thank you so much for your time and valuable insights!\\\"\\n\\n---",
      "depth_level": "low"
    }
  ],
  "description": "50-word or less second-person description about the research study"
}
\`\`\`

**REMINDER**: The "questions" array MUST contain **EXACTLY ${skeleton.metadata.total_sessions} objects** - one for each session in the skeleton. Do NOT skip any sessions!

---

## Quality Checklist

Before finalizing, verify:

**Session 1 Opening**:
- ✅ Includes ALL 6 elements (Greeting, Introduction, Scope, Time, Expectations, Readiness)
- ✅ Warm and natural (not abrupt)
- ✅ Sets proper expectations

**Question Allocation** (NEW):
- ✅ High-priority sessions (pain points, competitors, validation) have **5-6 questions**
- ✅ Medium-priority sessions (context, behaviors) have **4-5 questions**
- ✅ Lower-priority sessions (warm-up, wrap-up) have **4 questions**
- ✅ Questions follow funnel approach (broad → specific → deepest)
- ✅ Session 1 starts with self-introduction/background

**Question Quality**:
- ✅ ALL questions are open-ended and non-leading
- ✅ Questions focus on behaviors and experiences
- ✅ Critical questions have **multi-level follow-ups** (L1 → L2 → L3)
- ✅ Follow-ups build on each other progressively
- ✅ L3 follow-ups aim for actionable insights (impact, frequency, ideal solution)

**Final Session Closing** (NEW):
- ✅ Last session includes warm thank you
- ✅ **CRITICAL**: Includes explicit reminder to click "End Interview" button
- ✅ Closing feels natural and appreciative

**Use of Skeleton**:
- ✅ Used session_title from skeleton
- ✅ Used session_goal from skeleton
- ✅ Used background_information from skeleton (formatted as bullets)
- ✅ Incorporated must_ask_questions naturally (if present) and marked with [MUST-ASK per User Requirement]
- ✅ Generated ${skeleton.metadata.total_sessions} sessions

---

## Important Principles

1. **Use the Skeleton**: Directly use session titles, goals, and background information from the approved skeleton
2. **Smart Question Allocation**: Allocate 4-6 questions based on session priority and depth needed
3. **Open-Ended Questions**: NEVER use leading or suggestive questions
4. **Funnel Approach**: Start broad, gradually narrow down to deepest insights
5. **Behavioral Focus**: Ask about what people DO, not what they think
6. **Multi-Level Follow-ups**: Design L1 → L2 → L3 follow-ups for critical questions to enable deep exploration
7. **Natural Flow**: Each session should feel like a natural conversation
8. **End Interview Reminder**: Last session MUST remind participant to click "End Interview" button

---

NOW, generate the complete interview outline based on the approved skeleton.

**IMPORTANT**: Directly output JSON object, do not include markdown code block markers.
`;
};

