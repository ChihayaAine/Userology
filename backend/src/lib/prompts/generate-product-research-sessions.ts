/**
 * 产品调研访谈大纲生成 - 优化版
 *
 * 核心能力：
 * 1. 开放性问题设计（避免引导性、暗示性问题）
 * 2. Study Objective 必问项识别（确保关键信息收集）
 * 3. 智能追问策略（关键问题硬编码追问 vs 一般问题即兴追问）
 * 4. 渐进式收集策略（避免一次性要求多条信息）
 * 5. 自包含背景信息（AI无需查阅外部文档）
 * 6. 节间过渡设计（总结+预告+用户确认）
 *
 * 注意：本地化功能已拆分到独立的 localize-outline.ts
 */

export const SYSTEM_PROMPT_PRODUCT_RESEARCH =
  "You are a world-class product research expert and AI interview guide designer, specialized in creating high-quality, executable interview guides for existing product optimization research. You excel at designing OPEN-ENDED, NON-LEADING questions that allow participants to share their genuine experiences without bias. You understand when to use structured follow-ups versus relying on AI's impromptu questioning capabilities.";

export const generateProductResearchSessionsPrompt = (body: {
  name: string;
  objective: string;
  number: number;
  context: string;
  language?: string;
  customInstructions?: string;
}) => {
  // 语言配置（仅用于生成调试语言版本，本地化已拆分到独立函数）
  const languageConfig: Record<string, { name: string; instructions: string }> = {
    'zh-CN': {
      name: '中文（简体）',
      instructions: `**LANGUAGE REQUIREMENT**: Generate ALL content in Simplified Chinese (简体中文)`
    },
    'en-US': {
      name: 'English (US)',
      instructions: `**LANGUAGE REQUIREMENT**: Generate ALL content in English (US)`
    },
    'es-ES': {
      name: 'Spanish',
      instructions: `**LANGUAGE REQUIREMENT**: Generate ALL content in Spanish`
    },
    'fr-FR': {
      name: 'French',
      instructions: `**LANGUAGE REQUIREMENT**: Generate ALL content in French`
    },
    'de-DE': {
      name: 'German',
      instructions: `**LANGUAGE REQUIREMENT**: Generate ALL content in German`
    },
    'ja-JP': {
      name: '日本語 (Japanese)',
      instructions: `**LANGUAGE REQUIREMENT**: すべてのコンテンツを日本語で生成してください (Generate ALL content in Japanese)`
    }
  };

  const selectedLanguage = body.language || 'en-US';
  const langConfig = languageConfig[selectedLanguage] || languageConfig['en-US'];

  return `# Product Research Interview Guide Generation Task

${langConfig.instructions}

**Note**: Cultural adaptation and deep localization will be handled in a separate localization step. Focus on generating high-quality, open-ended questions in ${langConfig.name}.

## Input Information

**Research Study Title**: ${body.name}

**Research Objective**:
${body.objective}

${body.context ? `**Additional Product Documentation**:\n${body.context}\n` : ''}

${body.customInstructions ? `**Custom Instructions from Researcher**:\n${body.customInstructions}\n\n⚠️ IMPORTANT: Please carefully follow these custom instructions when generating the interview guide. These are specific requirements from the researcher that should be prioritized.\n` : ''}

**Number of Sessions**: ${Math.min(body.number, 10)} (maximum 10 sessions supported)

⚠️ **STRICT SESSION COUNT REQUIREMENT** ⚠️:
You MUST generate EXACTLY ${Math.min(body.number, 10)} sessions - no more, no less.
- ❌ Do NOT generate ${Math.min(body.number, 10) + 1} sessions (even if you think an extra session would be helpful)
- ❌ Do NOT generate ${Math.min(body.number, 10) - 1} sessions (even if you think content can be merged)
- ✅ Generate EXACTLY ${Math.min(body.number, 10)} complete sessions
- If you generate the wrong number, the system will malfunction and the interview guide will be rejected.

---

## Your Task

Based on the above input, generate a complete, high-quality product research interview guide with OPEN-ENDED, NON-LEADING questions.

## Core Requirements

### 1. Understand Research Needs

**Extract from Research Objective**:
- Research background and context
- Core research questions
- Target user segments
- Expected insights and outputs
- **🔑 CRITICAL: Identify MUST-ASK items** - Any specific questions, topics, or data points that the researcher explicitly requires

**If Additional Product Documentation is provided**:
- Product features and capabilities
- Product positioning and value proposition
- User groups and personas
- Recent changes or new features to validate

**Infer research type**:
- New version/feature validation
- Feature prioritization
- User experience optimization
- Future opportunity exploration

### 2. Interview Structure Design

**Session Flow Principles** (flexibly adjust based on \`Number of Sessions\`):

Each session should follow the **Intro → Open Exploration → Targeted Collection → Closure** pattern:

- **Intro**: Warm, natural transition that sets context and builds rapport
- **Open Exploration**: Start with broad, open-ended questions to let participants share freely
- **Targeted Collection**: Gradually focus on specific dimensions critical to research objectives
- **Closure**: Natural transition to next session

**Typical Session Themes** (adapt to research objectives):
- **Early Sessions**: Context building, product usage patterns, overall experiences
- **Middle Sessions**: Deep exploration of critical features or areas identified in research objectives
- **Later Sessions**: Synthesis, prioritization, forward-looking perspectives (if relevant)

**CRITICAL: Session 1 Opening Requirements**:

Session 1's opening (Intro) is NOT just a brief transition - it's the foundation of the entire interview. It MUST include:

1. **Warm Greeting**: Start with a friendly hello and thank the participant
2. **Interview Introduction**: Explain what the interview is about and why it matters
3. **Scope Clarification**: Briefly mention the main topics to be covered
4. **Time Setting**: Tell them how long the interview will take
5. **Expectation Setting**: Reassure them there are no right/wrong answers, encourage authentic sharing
6. **Readiness Check**: Ask if they're ready to begin

**Example of a GOOD Session 1 Opening**:
\`\`\`
Hello! It's great to connect with you. Thank you for taking the time to participate in our interview. Today, I'd like to chat with you about [main topic related to research objective]. We'll be focusing on [specific areas]. This interview will take about [X] minutes, and I'm really interested in understanding your genuine experiences and thoughts. There are no standard answers - just share what comes to mind. Are you ready to get started?
\`\`\`

**Example of a BAD Session 1 Opening** (too abrupt):
\`\`\`
❌ "Thank you for participating. Let's start by understanding your current situation."
\`\`\`

This opening is too direct and lacks the warmth, context-setting, and rapport-building that makes participants comfortable.

### 3. Question Design Best Practices

#### 📊 QUESTION DEPTH AND QUANTITY (CRITICAL):

**Each session MUST have 4-6 questions** that progressively build depth:

- **Q1**: Broad, easy-to-answer question (builds comfort and rapport)
- **Q2-3**: Explore behaviors, experiences, context (builds understanding)
- **Q4-5**: Dig into specific pain points, needs, or critical areas (builds insights)
- **Q6** (if needed): Synthesize learnings or transition to next theme

**❌ AVOID**: Generating only 2-3 questions per session - this is too shallow and misses opportunities for deep exploration.

**Question Progression Strategy - Use a Funnel Approach**:

Start BROAD → gradually NARROW DOWN to specific insights

**Example for Session 1 (Background Building)**:
1. Self-introduction / current role (broad, comfortable)
2. Product discovery / how they started using it (medium specificity)
3. Current usage patterns (more specific)
4. Connection to their goals/needs (targeted)

**Example for Session 2 (Feature Exploration)**:
1. Overall product experience (broad)
2. Most-used features (medium)
3. Specific feature experiences (deeper)
4. Feature impact on workflow (deepest)

**Example for Session 3 (Pain Point Discovery)**:
1. General satisfaction (broad)
2. Specific frustrations or limitations (medium)
3. Impact of those issues (deeper)
4. Workarounds or alternatives tried (deepest)

#### 🎯 OPEN-ENDED QUESTION PRINCIPLES (CRITICAL):

**❌ AVOID Leading/Suggestive Questions**:
- ❌ "What do you like about [Feature]?" (assumes they like it)
- ❌ "How useful is [Feature]?" (assumes it's useful)
- ❌ "What improvements would you suggest?" (assumes improvements are needed)
- ❌ "How often do you struggle with [Task]?" (assumes struggle exists)

**✅ USE Truly Open-Ended Questions**:
- ✅ "Tell me about your experience using [Product/Feature]."
- ✅ "Walk me through how you typically use [Product] in your workflow."
- ✅ "Can you describe a recent time when you used [Feature]?"
- ✅ "What's your overall experience been like with [Product]?"
- ✅ "How does [Product] fit into your daily routine?"

**Key Principles**:
- Let participants define their own experiences (don't assume positive or negative)
- Ask about WHAT THEY DO, not what they think or want
- Focus on actual usage behaviors and specific examples
- Avoid words that imply judgment: "useful", "helpful", "difficult", "problem" (unless they mention it first)
- Use neutral, exploratory language: "tell me about", "walk me through", "describe", "what's your experience"

#### Must Follow Format Standards:
- **Question ID**: \`Q[Session].[Number]\`, e.g., Q1.1, Q1.2
- **Interviewer Notes**: Include question motivation, focus points, MUST-ASK flag if applicable, follow-up strategy (hard-coded vs impromptu)
- **Relevant Context**: Background information directly related to this question (self-contained, no external file references)

#### 🔑 MUST-ASK Items from Study Objective:
- **Identify Critical Requirements**: If the Research Objective explicitly mentions specific questions, features to validate, or data points that MUST be collected, ensure these are incorporated into the appropriate sessions
- **Strategic Placement**: Place MUST-ASK items in the most natural session context (e.g., specific feature validation in Session 3, competitive comparison in Session 5)
- **Mark Clearly**: In Interviewer Notes, mark these as "[MUST-ASK per Study Objective]" so the interviewer knows these are non-negotiable

#### Progressive Collection Strategy:
- **Single Point Inspiration**: Ask one core question first
- **Natural Extension**: Based on response, naturally ask "Anything else?" or "What else?"
- **Supplementary Guidance**: Gently guide to supplement missing dimensions (only if critical to research objective)

**Example**:
\`\`\`
Q3.1 Main Question: "Tell me about your experience using [Feature]."
Follow-up 1: [If user describes usage] "Can you walk me through a specific recent example?"
Follow-up 2: [If user finishes first answer] "What else happens when you use this feature?"
Follow-up 3: [If user mentions any friction] "Tell me more about that - what happened?"
\`\`\`

### 4. 🎯 Follow-up Strategy for Critical Questions

**When to Include Follow-ups**:
- ONLY for questions directly tied to core research objectives
- ONLY for MUST-ASK items from Study Objective
- ONLY when missing the follow-up would create critical gaps in insights

**Follow-up Format** (Directional Guidance, NOT Word-by-Word Scripts):

Use **directional probes** that give the interviewer flexibility to adapt to context:

\`\`\`
**Follow-up Directions:**
[If user mentions X] → Probe for: [specific dimension to explore, e.g., "discovery process", "usage frequency", "comparison to expectations"]
[If user describes Y] → Probe for: [another dimension, e.g., "impact on workflow", "attempted alternatives"]
**Skip if:** User has already covered these dimensions or context makes it awkward
\`\`\`

**Examples**:

❌ **Too Scripted** (word-by-word):
\`\`\`
[If user mentions feature] "How did you first discover this feature? How often do you use it? What do you think about it?"
\`\`\`

✅ **Directional Guidance** (flexible):
\`\`\`
[If user mentions feature] → Probe for: discovery process, usage patterns, experience quality
\`\`\`

**Note**: The interview system has built-in impromptu questioning capabilities. For non-critical questions, do NOT include follow-ups - let the system handle them naturally.

### 5. Product Research Specific Focus

#### Feature Discovery (NOT Assumption):
- ❌ Don't assume users have discovered or used specific features
- ✅ Ask about their actual usage patterns first
- ✅ If they mention a feature, probe for: discovery process, understanding, usage patterns, experience quality

#### Competitive Comparison Strategy (if applicable):
- ❌ Don't ask "Which competitors have you used?" (too direct)
- ✅ Ask about tools or methods used before/alongside the product
- ✅ If they mention alternatives, probe for: experience differences, preferences, reasons

### 6. Inter-Session Transition Design

Each session should end with:
- Brief acknowledgment of what was shared
- Natural transition to next session theme
- Simple confirmation to continue

---

## Output Format

Strictly output in the following JSON format (do not include markdown code block markers):

\`\`\`json
{
  "questions": [
    "### **Session 1: [Session Title]**\\n\\n**Session Goal:** [What this session aims to achieve]\\n\\n**Section Notes:**\\n- **Interviewer Instructions:** [Session-specific guidance and context]\\n- **Background Information:** [3-5 bullet points of relevant context]\\n\\n**Interview Outline:**\\n\\n**[Opening]**\\n[CRITICAL FOR SESSION 1: Must include ALL 6 elements - Warm Greeting + Interview Introduction + Scope Clarification + Time Setting + Expectation Setting + Readiness Check. Example: 'Hello! It's great to connect with you. Thank you for taking the time to participate in our interview. Today, I'd like to chat with you about [topic]. We'll be focusing on [areas]. This interview will take about [X] minutes, and I'm really interested in understanding your genuine experiences. There are no standard answers - just share what comes to mind. Are you ready to get started?']\\n\\n[For Session 2+: Brief warm transition]\\n\\nQ1.1 [Interviewer notes: [Motivation/focus/MUST-ASK flag if applicable]] [Relevant context: [Key background information]] Question: [OPEN-ENDED, NON-LEADING question]\\n\\n[ONLY IF CRITICAL QUESTION with specific dimensions to explore:]\\n**Follow-up Directions:**\\n[If user mentions X] → Probe for: [dimension 1, dimension 2, dimension 3]\\n[If user describes Y] → Probe for: [dimension A, dimension B]\\n**Skip if:** [Conditions when to skip]\\n\\nQ1.2 [Similar structure]\\n\\nQ1.3 [Similar structure]\\n\\nQ1.4 [Similar structure]\\n\\n[CONTINUE for 4-6 questions per session - use funnel approach: start broad, gradually narrow down]\\n\\n**[Transition to Next Session]**\\n[Natural transition + simple confirmation]\\n\\n---",
    "### **Session 2: [Session Title]**\\n\\n[Similar structure with 4-6 questions]..."
  ],
  "description": "50-word or less second-person description about the research study"
}
\`\`\`

**Note**: The "description" field will be localized in a separate step. Focus on creating a clear, welcoming description in ${langConfig.name}.

---

## Quality Checklist

After generating the guide, self-check:

**Session 1 Opening (CRITICAL)**:
- ✅ Does Session 1 Opening include ALL 6 elements: Warm Greeting + Interview Introduction + Scope Clarification + Time Setting + Expectation Setting + Readiness Check?
- ✅ Is the opening warm, natural, and welcoming (not abrupt or transactional)?
- ✅ Does it set proper expectations (e.g., "no standard answers")?

**Question Depth and Quantity (CRITICAL)**:
- ✅ Does EACH session have 4-6 questions (not just 2-3)?
- ✅ Do questions follow the funnel approach (broad → specific)?
- ✅ Does Session 1 start with self-introduction/background before diving into product usage?

**Question Quality**:
- ✅ Are ALL questions truly open-ended and non-leading?
- ✅ Have you identified and incorporated all MUST-ASK items from Study Objective?
- ✅ Are follow-ups ONLY included for critical questions tied to core objectives?
- ✅ Are follow-ups written as directional probes (not word-by-word scripts)?
- ✅ Do questions focus on actual usage behaviors (not opinions or hypotheticals)?

**Session Structure**:
- ✅ Does each session follow Intro → Open Exploration → Targeted Collection → Closure?
- ✅ Is background information for each question self-contained?
- ✅ Does the guide explore actual experiences before assuming satisfaction or problems?
- ✅ Are all sessions aligned with core research objectives?

---

## Important Principles

1. **Open-Ended Principle**: NEVER use leading, suggestive, or assumptive questions. Let participants define their own experiences.
2. **Objective-Driven Principle**: Ensure all MUST-ASK items from Study Objective are incorporated naturally.
3. **Directional Follow-ups**: Follow-ups should be directional probes (e.g., "Probe for: discovery, usage, experience"), NOT word-by-word scripts. Only include for critical questions.
4. **Session Flow**: Each session follows Intro → Open Exploration → Targeted Collection → Closure pattern.
5. **Self-Contained Principle**: All background information must be directly written in the guide, cannot reference external files.
6. **Behavioral Focus Principle**: Ask about what people DO, not what they think or want.
7. **Natural Conversation Principle**: Avoid mechanical questioning, encourage authentic dialogue.
8. **Discovery Principle**: Let insights emerge naturally - don't assume positive or negative experiences exist.

---

Now, based on the above input information and requirements, generate a complete, high-quality product research interview guide.

**IMPORTANT**: Directly output JSON object, do not include any markdown code block markers (like \`\`\`json).`;
};

