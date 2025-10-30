/**
 * 大纲骨架生成 Prompt - Step 1
 *
 * 核心目标：
 * 1. 生成 Session 主题和目标
 * 2. 生成具体、可操作的背景信息（带数据、事实、洞察）
 * 3. 识别必问项（内部使用，不显示给用户）
 *
 * 不包含：
 * - 具体问题（在 Step 2 生成）
 * - 追问策略（在 Step 2 生成）
 * - Session Opening 和 Transition（在 Step 2 生成）
 */

export const SYSTEM_PROMPT_SKELETON =
  "You are a world-class research expert and interview structure designer. Your specialty is creating well-structured interview session frameworks with SPECIFIC, ACTIONABLE background information. You excel at identifying key research objectives and organizing them into logical session flows.";

export const generateSkeletonPrompt = (body: {
  objective: string;
  context: string;
  session_count: number;
  duration_minutes: number;
  language: string;
  researchType: 'market' | 'product';
  manualSessions?: Array<{ session_number: number; theme: string }>; // 用户预设的 Session 主题
}) => {
  // 语言配置
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
    },
    'ko-KR': {
      name: '한국어 (Korean)',
      instructions: `**LANGUAGE REQUIREMENT**: 모든 콘텐츠를 한국어로 생성하세요 (Generate ALL content in Korean)`
    }
  };

  const selectedLanguage = languageConfig[body.language] || languageConfig['en-US'];

  return `
# Task: Generate Interview Outline Skeleton

${selectedLanguage.instructions}

## Research Information

**Study Name**: ${body.objective}
**Research Type**: ${body.researchType === 'market' ? 'Market Research (New Opportunity Exploration)' : 'Product Research (Existing Product Optimization)'}
**Session Count**: ${body.session_count}
**Estimated Duration**: ${body.duration_minutes} minutes
**Additional Context**: ${body.context || 'None provided'}

${body.manualSessions && body.manualSessions.length > 0 ? `
**🎯 User-Specified Session Themes** (MUST FOLLOW):
The researcher has pre-defined the following session themes. You MUST use these themes as the foundation for your session structure:

${body.manualSessions.map(s => `- **Session ${s.session_number}**: ${s.theme}`).join('\n')}

⚠️ **CRITICAL REQUIREMENT**:
- Use the user-specified themes EXACTLY or with minimal refinement for clarity
- Build session goals and background information around these themes
- Maintain the session order as specified by the user
- If a theme is vague, you may refine it slightly for clarity, but keep the core intent
` : ''}

---

## Your Task

Generate a structured interview outline skeleton with ${body.session_count} sessions. Each session should have:
1. **Session Title** - Clear, descriptive title${body.manualSessions && body.manualSessions.length > 0 ? ' (use user-specified themes)' : ''}
2. **Session Goal** - What this session aims to achieve
3. **Background Information** - SPECIFIC, ACTIONABLE context (see requirements below)

---

## 🔑 CRITICAL: Background Information Requirements

**Background information MUST be SPECIFIC and ACTIONABLE, NOT abstract descriptions.**

❌ **BAD Examples** (Too abstract):
- "现有通用语言学习App（如Duolingo, Babbel）的主要定位和不足"
- "参与者目前的工具使用习惯"
- "市场上现有解决方案的情况"

✅ **GOOD Examples** (Specific and actionable):
- "法国主要英语考试包括TOEIC（职场认可度最高）、TOEFL/IELTS（留学必备）、Cambridge考试（教育认证）"
- "法国学生英语实际应用能力普遍偏弱，约50%初中毕业生未达A2等级"
- "英语能力存在显著地域差异，巴黎地区42%具备沟通能力，乡村地区仅18%"
- "用户偏好严肃专业的学习工具，对游戏化学习接受度中等"

**Each session should have 3-5 background information items that:**
- Provide concrete facts, data, or insights
- Help the interviewer understand the context
- Are directly relevant to the session's goal
- Can be used by the interviewer during the conversation

---

## Session Structure Guidelines

### For Market Research (New Opportunity Exploration):

**Context Focus**: Market trends, competitive landscape, user behavior patterns, industry-specific considerations

**Typical Session Flow**:
1. **Session 1**: Warm-up & Background Building
   - Goal: Establish rapport and understand participant's current situation
   - Background Examples:
     * Demographics and role context
     * Current behaviors and practices in the problem space
     * Existing tools or methods they use
     * Industry-specific context

2. **Session 2-3**: Deep Exploration
   - Goal: Explore pain points, needs, and current solutions
   - Background Examples:
     * Market landscape overview (key players, trends)
     * Existing solutions and their limitations
     * User behavior patterns and preferences
     * Common pain points in the industry

3. **Session 4-5**: Opportunity Validation
   - Goal: Validate assumptions and explore willingness to pay
   - Background Examples:
     * Pricing benchmarks in the market
     * Competitor analysis and positioning
     * Value perception factors
     * Purchase decision criteria

4. **Final Session**: Synthesis & Closure
   - Goal: Summarize learnings and thank participant
   - Background Examples:
     * Key themes to validate
     * Critical assumptions to test
     * Priority areas for further exploration

### For Product Research (Existing Product Optimization):

**Context Focus**: Product features and capabilities, product positioning, user groups and personas, recent changes or new features

**Typical Session Flow**:
1. **Session 1**: Warm-up & Product Usage Context
   - Goal: Understand how and why they use the product
   - Background Examples:
     * Product features and capabilities overview
     * Product positioning and value proposition
     * User groups and personas
     * Typical usage scenarios

2. **Session 2-3**: Feature Deep Dive
   - Goal: Explore specific features and pain points
   - Background Examples:
     * Detailed feature descriptions
     * Common usage patterns
     * Known issues or limitations
     * Feature interdependencies

3. **Session 4-5**: Improvement Exploration
   - Goal: Gather feedback on potential improvements
   - Background Examples:
     * Planned features or changes
     * Competitor features for comparison
     * User feedback themes
     * Technical constraints or trade-offs

4. **Final Session**: Prioritization & Closure
   - Goal: Understand what matters most
   - Background Examples:
     * Feature priority frameworks
     * User segment differences
     * Impact vs. effort considerations
     * Strategic product direction

---

## Output Format

Generate a JSON object with the following structure:

\`\`\`json
{
  "sessions": [
    {
      "session_number": 1,
      "session_title": "Session title here",
      "session_goal": "What this session aims to achieve (1-2 sentences)",
      "background_information": [
        "Specific fact or insight #1",
        "Specific fact or insight #2",
        "Specific fact or insight #3",
        "Specific fact or insight #4"
      ]
    },
    {
      "session_number": 2,
      "session_title": "Session title here",
      "session_goal": "What this session aims to achieve (1-2 sentences)",
      "background_information": [
        "Specific fact or insight #1",
        "Specific fact or insight #2",
        "Specific fact or insight #3"
      ],
      "must_ask_questions": []
    }
    // ... continue for all ${body.session_count} sessions
  ],
  "metadata": {
    "total_sessions": ${body.session_count},
    "estimated_duration_minutes": ${body.duration_minutes},
    "draft_language": "${body.language}"
  }
}
\`\`\`

---

## Quality Checklist

Before finalizing, verify:
- ✅ Generated EXACTLY ${body.session_count} sessions
- ✅ Each session has a clear, descriptive title
- ✅ Each session goal is specific and actionable (1-2 sentences)
- ✅ Each session has 3-5 background information items
- ✅ Background information is SPECIFIC (contains facts, data, insights)
- ✅ Background information is NOT abstract descriptions
- ✅ Sessions follow a logical progression
- ✅ All content is in ${selectedLanguage.name}
- ✅ Output is valid JSON

---

## Important Principles

1. **Be Specific**: Every background information item should provide concrete, actionable context
2. **Use Data**: Include numbers, percentages, specific examples when possible
3. **Stay Relevant**: Only include background information directly relevant to the session goal
4. **Think Like an Interviewer**: What context would help the interviewer conduct this session effectively?
5. **Avoid Abstractions**: Don't write "existing solutions" - name them and describe them specifically

---

NOW, generate the interview outline skeleton following these requirements.
`;
};

