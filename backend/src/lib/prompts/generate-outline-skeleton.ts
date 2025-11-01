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

**Background information MUST be SPECIFIC, ACTIONABLE, and MULTI-DIMENSIONAL, NOT abstract descriptions.**

### 核心原则（参考素材B和素材C的深度）

**1. 多视角覆盖**
- 必须包含用户视角、专业人士视角（如考官、老师）、机构视角等多个维度
- 提供具体的使用场景、典型问题和真实案例，而非抽象描述

**2. 深度场景化**
- 包含具体的量化数据（如"约50%初中毕业生未达A2等级"）
- 提供真实的用户行为模式和痛点描述
- 包含本地化细节（目标市场的特殊文化、语言、习惯等）

**3. 可操作性**
- 为AI提供具体的追问线索和关注要点
- 包含"当用户说X时，应该追问Y"的具体指导
- 列出需要量化的关键指标

**4. 竞品生态理解**
- 详细的竞品分析，包含定位、优劣势、用户认知
- 用户对竞品的核心印象（爽点和痛点）
- 竞品之间的差异化定位

---

❌ **BAD Examples** (Too abstract):
- "现有通用语言学习App（如Duolingo, Babbel）的主要定位和不足"
- "参与者目前的工具使用习惯"
- "市场上现有解决方案的情况"

✅ **GOOD Examples** (Specific, multi-dimensional, actionable):
- "法国主要英语考试包括TOEIC（职场认可度最高，约60%企业要求）、TOEFL/IELTS（留学必备，年考生约8万）、Cambridge考试（教育认证，学校普遍认可）"
- "法国学生英语实际应用能力普遍偏弱，约50%初中毕业生未达A2等级，主要原因：1) 课堂以语法为主，口语练习不足；2) 缺乏真实语境；3) 教师口语水平参差不齐"
- "英语能力存在显著地域差异，巴黎地区42%具备沟通能力（受国际化环境影响），乡村地区仅18%（缺乏练习机会）"
- "用户偏好严肃专业的学习工具（如Babbel），对游戏化学习接受度中等（Duolingo在法国市场渗透率仅25%，低于欧洲平均35%）"
- "竞品Duolingo的核心印象：优点是免费、游戏化有趣；痛点是内容浅显、缺乏系统性、无法应对考试需求"
- "当用户提到'备考压力大'时，追问：1) 具体哪个环节最困难（听力/阅读/口语/写作）？2) 每天投入多少时间？3) 使用什么工具？4) 最担心什么？"

**Each session should have 5-8 background information items that:**
- Provide concrete facts, data, or insights (with quantification where possible)
- Cover multiple perspectives (user, expert, institution, competitor)
- Include specific scenarios and real-world examples
- Provide actionable follow-up guidance for the interviewer
- Include localization details (cultural, linguistic, market-specific)
- Are directly relevant to the session's goal

---

## Session Structure Guidelines

### For Market Research (New Opportunity Exploration):

**Context Focus**: Market trends, competitive landscape, user behavior patterns, industry-specific considerations, multi-perspective insights

**Typical Session Flow**:
1. **Session 1**: Warm-up & Background Building
   - Goal: Establish rapport and understand participant's current situation
   - Background Examples (5-8 items, multi-dimensional):
     * Demographics and role context (with quantification: "目标用户群体：18-25岁大学生占60%，25-35岁职场新人占40%")
     * Current behaviors and practices in the problem space (with scenarios: "典型使用场景：考前3个月集中备考，每天投入2-3小时")
     * Existing tools or methods they use (with user perception: "主要使用工具：Duolingo（免费但浅显）、线下培训班（贵但系统）、自学教材（便宜但枯燥）")
     * Industry-specific context (with data: "台湾多益年考生约15万人，其中大学生占55%，职场人士占35%")
     * User pain points overview (with specificity: "最大痛点：1) 听力材料与实际考试差距大；2) 缺乏个性化学习路径；3) 无法量化进步")
     * Local market characteristics (with cultural insights: "台湾用户偏好：重视考试成绩（求职必备），愿意为有效工具付费，但价格敏感度高（月付费上限约NT$500）")

2. **Session 2-3**: Deep Exploration (Pain Points & Needs)
   - Goal: Explore pain points, needs, and current solutions
   - Background Examples (5-8 items, multi-dimensional):
     * Market landscape overview (with competitive analysis: "主要竞品：1) 线下培训班（如XXX，月费NT$3000-5000，优点：系统性强，缺点：时间不灵活）；2) 在线课程（如YYY，月费NT$800，优点：便宜，缺点：缺乏互动）")
     * Existing solutions and their limitations (with user quotes: "用户常说：'Duolingo太简单，无法应对多益难度'、'线下班太贵，而且时间固定很不方便'")
     * User behavior patterns (with quantification: "用户学习模式：70%选择碎片化学习（通勤时间），30%选择集中学习（周末）")
     * Common pain points in the industry (with root cause: "核心痛点：1) 听力材料不够真实（原因：版权限制，多数App使用合成语音）；2) 缺乏即时反馈（原因：人工批改成本高）")
     * Expert perspective (with professional insights: "多益考官观察：考生最常失分的是Part 3-4（长对话和短文），原因是缺乏真实语境训练")
     * Follow-up guidance (with specific prompts: "当用户提到'听力困难'时，追问：1) 具体哪个Part最难？2) 是速度问题还是词汇问题？3) 平时如何练习？4) 使用什么材料？")

3. **Session 4-5**: Opportunity Validation (Solution Exploration & Willingness to Pay)
   - Goal: Validate assumptions and explore willingness to pay
   - Background Examples (5-8 items, multi-dimensional):
     * Pricing benchmarks in the market (with segmentation: "市场价格区间：免费工具（Duolingo），低价工具（NT$200-500/月，如XXX），中价工具（NT$800-1500/月，如YYY），高价培训班（NT$3000+/月）")
     * Competitor analysis and positioning (with differentiation: "竞品定位：Duolingo（游戏化免费）、XXX（考试专项训练）、YYY（AI个性化学习）、线下班（系统性强但贵）")
     * Value perception factors (with user priorities: "用户最看重的功能：1) 真实考题模拟（85%认为重要）；2) 个性化学习路径（70%）；3) 即时反馈（65%）；4) 进度可视化（60%）")
     * Purchase decision criteria (with decision tree: "付费决策因素：1) 是否有免费试用（80%要求）；2) 价格是否在预算内（月付NT$500以下）；3) 是否有成功案例（口碑推荐）")
     * Willingness to pay analysis (with quantification: "付费意愿：60%愿意为有效工具付费，平均可接受价格NT$300-500/月，前提是能看到明显进步（如模拟考分数提升）")
     * Feature prioritization (with trade-offs: "功能优先级：核心功能（听力训练、模拟考试）> 辅助功能（词汇记忆、语法讲解）> 社交功能（学习社区、排行榜）")

4. **Final Session**: Synthesis & Closure
   - Goal: Summarize learnings and thank participant
   - Background Examples (3-5 items):
     * Key themes to validate (with hypotheses: "核心假设：1) 用户愿意为真实考题模拟付费；2) 个性化学习路径是差异化优势；3) 月付NT$500是价格上限")
     * Critical assumptions to test (with validation criteria: "必须验证：1) 用户是否真的缺乏有效工具？2) 价格敏感度是否如预期？3) 是否存在未被满足的需求？")
     * Priority areas for further exploration (with next steps: "后续探索方向：1) 不同用户群体的需求差异（学生 vs 职场）；2) 功能组合的最优方案；3) 定价策略的细化")

### For Product Research (Existing Product Optimization):

**Context Focus**: Product features and capabilities, product positioning, user groups and personas, recent changes or new features, competitive context

**Typical Session Flow**:
1. **Session 1**: Warm-up & Product Usage Context
   - Goal: Understand how and why they use the product
   - Background Examples (5-8 items, multi-dimensional):
     * Product features and capabilities overview (with specificity: "核心功能：1) 任务管理（支持子任务、标签、优先级）；2) 团队协作（评论、@提醒、文件共享）；3) 进度跟踪（甘特图、看板视图）；4) 数据分析（完成率、时间统计）")
     * Product positioning and value proposition (with differentiation: "产品定位：面向中小团队的轻量级项目管理工具，核心优势：简单易用（学习成本低）、价格亲民（月付$10/人）、集成丰富（支持Slack、Google Drive等）")
     * User groups and personas (with segmentation: "主要用户群体：1) 创业团队（30%，需求：灵活、便宜）；2) 中小企业（50%，需求：稳定、易用）；3) 自由职业者（20%，需求：个人任务管理）")
     * Typical usage scenarios (with real examples: "典型使用场景：1) 每日站会（查看任务进度）；2) 项目规划（创建任务、分配责任人）；3) 跨部门协作（共享文件、评论讨论）")
     * User behavior patterns (with quantification: "使用频率：70%用户每天登录，平均停留时间15分钟，高峰时段：上午9-10点（晨会）、下午5-6点（总结）")
     * Competitor context (with user perception: "主要竞品：Asana（功能强大但复杂）、Trello（简单但功能有限）、Monday.com（美观但贵）。用户选择我们的原因：平衡了易用性和功能性")

2. **Session 2-3**: Feature Deep Dive (Usage & Pain Points)
   - Goal: Explore specific features and pain points
   - Background Examples (5-8 items, multi-dimensional):
     * Detailed feature descriptions (with usage data: "最常用功能：1) 任务列表（95%用户使用）；2) 评论功能（80%）；3) 文件共享（65%）；4) 甘特图（40%）；5) 数据分析（25%）")
     * Common usage patterns (with user segments: "不同用户群体的使用模式：创业团队偏好看板视图（敏捷开发），中小企业偏好列表视图（传统管理），自由职业者偏好日历视图（时间管理）")
     * Known issues or limitations (with user feedback: "已知问题：1) 移动端体验不佳（用户反馈：'加载慢'、'界面不友好'）；2) 搜索功能弱（无法搜索评论内容）；3) 通知过多（用户抱怨：'被@提醒轰炸'）")
     * Feature interdependencies (with workflow: "功能关联：任务创建 → 分配责任人 → 设置截止日期 → 添加子任务 → 跟踪进度 → 完成任务。断点：如果责任人未设置，任务容易被遗忘")
     * User pain points (with root cause: "核心痛点：1) 任务过载（原因：缺乏优先级自动排序）；2) 信息碎片化（原因：评论、文件、任务分散）；3) 跨项目视图缺失（原因：只能单项目查看）")
     * Follow-up guidance (with specific prompts: "当用户提到'任务管理混乱'时，追问：1) 具体哪个环节最混乱？2) 团队规模多大？3) 使用什么视图？4) 是否使用标签和优先级？")

3. **Session 4-5**: Improvement Exploration (New Features & Optimization)
   - Goal: Gather feedback on potential improvements
   - Background Examples (5-8 items, multi-dimensional):
     * Planned features or changes (with rationale: "计划新功能：1) AI任务优先级排序（解决任务过载）；2) 统一收件箱（整合评论、@提醒、文件）；3) 跨项目仪表板（解决多项目管理）；4) 移动端重构（提升体验）")
     * Competitor features for comparison (with gap analysis: "竞品优势功能：Asana的自动化规则（我们缺失）、Trello的Power-Ups（我们有但不够丰富）、Monday.com的可视化报表（我们的数据分析较弱）")
     * User feedback themes (with prioritization: "用户反馈主题（按频次）：1) 移动端体验差（35%提及）；2) 搜索功能弱（28%）；3) 通知过多（22%）；4) 缺乏自动化（15%）")
     * Technical constraints or trade-offs (with transparency: "技术限制：1) AI功能需要额外成本（可能涨价）；2) 移动端重构需要3个月（短期无法上线）；3) 跨项目视图会影响性能（需要优化）")
     * Feature value hypothesis (with validation criteria: "功能价值假设：1) AI排序能提升30%效率（需验证：用户是否愿意为此付费）；2) 统一收件箱能减少50%信息遗漏（需验证：用户是否真的需要）")
     * Pricing impact (with user sensitivity: "功能与定价：如果新增AI功能，价格可能从$10/人涨到$15/人。需验证：用户是否接受？哪些功能值得涨价？")

4. **Final Session**: Prioritization & Closure
   - Goal: Understand what matters most
   - Background Examples (3-5 items):
     * Feature priority frameworks (with criteria: "优先级评估标准：1) 用户需求强度（高/中/低）；2) 开发成本（高/中/低）；3) 竞争优势（是否差异化）；4) 商业价值（是否提升付费意愿）")
     * User segment differences (with insights: "不同用户群体的优先级差异：创业团队最看重价格和灵活性，中小企业最看重稳定性和易用性，自由职业者最看重个人效率")
     * Impact vs. effort considerations (with trade-offs: "高影响低成本：搜索优化、通知设置；高影响高成本：AI功能、移动端重构；低影响低成本：UI微调、文案优化")
     * Strategic product direction (with roadmap: "产品路线图：Q1-移动端重构（解决最大痛点），Q2-AI功能试点（差异化优势），Q3-跨项目视图（满足高级用户），Q4-自动化规则（对标Asana）")

---

## 🎯 Session Depth Level Assignment

**CRITICAL**: For each session, assign a \`depth_level\` based on its importance to the research objectives.

**Depth Levels**:
- **"high"**: Core objectives, pain point discovery, competitor analysis, feature validation
  - These sessions are CRITICAL to achieving research goals
  - Will receive 5-6 questions in the full outline
  - Examples: "Pain Point Discovery", "Competitor Analysis", "Feature Validation", "Solution Exploration"

- **"medium"**: Context building, behavior exploration, general experiences
  - These sessions provide necessary context but are not the primary focus
  - Will receive 4-5 questions in the full outline
  - Examples: "Background Building", "Usage Patterns", "General Product Experience"

- **"low"**: Warm-up, wrap-up, ice-breaking
  - These sessions are important for flow but don't need extensive depth
  - Will receive 4 questions in the full outline
  - Examples: "Ice-breaking", "Final Thoughts", "Thank You"

**Assignment Guidelines**:
1. Analyze the study objective and identify which sessions directly address core research questions
2. Sessions that explore "why", "pain points", "alternatives", "needs" are usually **high**
3. Sessions that explore "what", "how", "when" are usually **medium**
4. First and last sessions are usually **low** (unless the study specifically focuses on onboarding/offboarding)
5. Typically: 2-3 high, 2-3 medium, 1-2 low (adjust based on total session count)

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
      ],
      "must_ask_questions": [],
      "depth_level": "low"
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
      "must_ask_questions": [],
      "depth_level": "high"
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
- ✅ **Each session has a \`depth_level\` ("high", "medium", or "low")** (NEW)
- ✅ **Depth levels are assigned based on importance to research objectives** (NEW)
- ✅ **Typically: 2-3 high, 2-3 medium, 1-2 low** (NEW)
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

