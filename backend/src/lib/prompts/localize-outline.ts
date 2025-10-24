/**
 * 大纲本地化Prompt - 基于素材G和G1的合体版本
 * 
 * 核心功能：
 * 1. 将调试语言的初稿大纲本地化到目标访谈语言
 * 2. 深度本土化表达方式，确保地道性和文化适配
 * 3. 保持大纲结构和内容完全一致
 */

export const SYSTEM_PROMPT_LOCALIZATION =
  "You are a world-class localization expert and cross-cultural communication specialist with extensive experience in business interviews. You deeply understand the language habits, cultural values, and social etiquette of the target region. You are particularly skilled at identifying and avoiding cultural sensitivities. Your task is to transform academic interview guides into **natural conversational styles that native local interviewers would actually use**, ensuring every sentence is authentic, appropriate, and non-offensive.";

export const generateLocalizeOutlinePrompt = (body: {
  draftOutline: any[];  // 初稿大纲（调试语言版本）
  targetLanguage: string;  // 目标语言（如 'zh-CN', 'en-US', 'ja-JP', 'zh-TW'）
  researchObjective?: string;  // 研究目标（可选，用于更好的上下文理解）
  studyName?: string;  // 研究名称（可选）
  description?: string;  // 研究描述（需要本地化）
}) => {
  // 语言配置
  const languageConfig: Record<string, { 
    name: string; 
    culturalNotes: string;
    examplePhrases: string;
  }> = {
    'zh-CN': {
      name: '简体中文',
      culturalNotes: `
- 使用简体中文字符
- 采用中国大陆的表达习惯和礼貌用语
- 注重集体主义和面子文化
- 使用间接、委婉的表达方式
- 强调关系建立和人情味`,
      examplePhrases: `
- 开场："非常感谢您抽出时间...""很高兴能和您聊聊..."
- 过渡："那我们接下来聊聊...""如果方便的话，我想了解一下..."
- 追问："能否再详细说说...""这个挺有意思的，能展开讲讲吗..."
- 敏感话题："如果您方便分享的话...""这个问题可能有点敏感，您可以选择不回答..."`
    },
    'zh-TW': {
      name: '繁體中文（台灣）',
      culturalNotes: `
- 使用繁體中文字符
- 採用台灣本地的表達習慣和用語
- 更加注重禮貌和謙遜
- 使用台灣特有的詞彙（如：軟體、網路、資訊）
- 強調溫暖和人情味`,
      examplePhrases: `
- 開場："非常感謝您撥冗...""很開心能跟您聊聊..."
- 過渡："那我們接下來聊聊...""如果方便的話，想請教一下..."
- 追問："能否再詳細分享一下...""這個蠻有意思的，能展開說說嗎..."
- 敏感話題："如果您方便分享的話...""這個問題可能比較敏感，您可以選擇不回答..."`
    },
    'en-US': {
      name: 'English (US)',
      culturalNotes: `
- Use American English spelling and expressions
- Direct and straightforward communication style
- Balance professionalism with friendliness
- Emphasize individual perspectives and experiences
- Use casual but professional tone`,
      examplePhrases: `
- Opening: "Thanks so much for taking the time..." "I'm excited to chat with you about..."
- Transition: "Let's move on to..." "I'd love to hear about..."
- Follow-up: "Could you tell me more about..." "That's interesting, can you elaborate..."
- Sensitive topics: "If you're comfortable sharing..." "Feel free to skip this if you prefer..."`
    },
    'ja-JP': {
      name: '日本語',
      culturalNotes: `
- 使用日本語の表現習慣
- 高度な敬語と丁寧語の使用
- 間接的で控えめな表現
- 相手への配慮と謙遜を重視
- 和を大切にする文化的価値観`,
      examplePhrases: `
- 開場："お時間をいただきありがとうございます...""本日はよろしくお願いいたします..."
- 過渡："それでは次に...""差し支えなければ、お伺いしたいのですが..."
- 追問："もう少し詳しくお聞かせいただけますか...""興味深いですね、もう少し教えていただけますか..."
- 敏感話題："もしよろしければ...""お答えにくい場合は、遠慮なくおっしゃってください..."`
    }
  };

  const langConfig = languageConfig[body.targetLanguage] || languageConfig['en-US'];

  return `# Role
You are a senior native interviewer and cross-cultural communication expert with rich business interview experience. You deeply understand the language habits, cultural values, and social etiquette of the target region. You are particularly skilled at identifying and avoiding cultural sensitivities.

# Your Task
Transform the provided interview guide from its current language into **${langConfig.name}**, ensuring it sounds like a **native ${langConfig.name} interviewer** would naturally speak.

${body.studyName ? `## Research Study
**Title**: ${body.studyName}` : ''}

${body.researchObjective ? `**Research Objective**: ${body.researchObjective}` : ''}

${body.description ? `**Study Description** (in current language): ${body.description}` : ''}

## Input Material
**Draft Interview Guide** (in current language):
\`\`\`json
${JSON.stringify(body.draftOutline, null, 2)}
\`\`\`

## Target Language
**${langConfig.name}**

### Cultural Considerations for ${langConfig.name}:
${langConfig.culturalNotes}

### Example Phrases in ${langConfig.name}:
${langConfig.examplePhrases}

---

# Core Mission
**STRICT LIMITATION**: Only perform **expression style, tone, and linguistic authenticity** optimization. Do NOT change content structure, add sections, or alter interview complexity.

**YOUR TASKS**:
1. Localize all interview questions/sessions to ${langConfig.name}
2. Localize the study description to ${langConfig.name} (if provided)
3. Ensure all text sounds natural and culturally appropriate

# Optimization Dimensions

## 1. Linguistic Authenticity
- **Native Expression Naturalness**: Eliminate translation tone and academic expressions, transform into native daily business conversation style
- **Language Rhythm**: Adjust sentence length to match natural conversation rhythm
- **Appropriate Colloquialism**: Moderately incorporate colloquial expressions while maintaining professionalism
- **Precise Vocabulary**: Choose words most familiar and comfortable to native users

## 2. Tone & Communication Style
- **Politeness Calibration**: Adjust politeness and honorifics according to local culture
- **Warmth Enhancement**: Make expressions warmer and more personable
- **Professional Balance**: Find the most comfortable balance between professionalism and approachability
- **Emotional Tone**: Adjust emotional coloring based on interview objectives

## 3. Cultural Sensitivity & Appropriate Expression
- **Sensitive Topic Handling**: Pay special attention to capability assessment, income discussion, personal privacy
- **Cultural Value Alignment**: Ensure expressions fully align with local values
- **Social Etiquette Integration**: Seamlessly integrate local social norms
- **Humility & Respect Balance**: Show respect while maintaining appropriate humility

## 4. Conversational Naturalness
- **De-mechanization**: Reduce mechanical, template-like expressions
- **Flexible Interaction**: Make interview feel like real business conversation
- **Humanized Guidance**: Use warm, humanized ways to guide topics
- **Appropriate Humor**: Add light elements when suitable

# Optimization Principles

## 1. Structure Preservation
- **Strictly Maintain**: All session structures, question counts, follow-up logic remain unchanged
- **Content Equivalence**: Core collection objectives and information points stay identical
- **Format Consistency**: Maintain original format markers, numbering, hierarchy

## 2. Natural Expression
- **Native Level**: Every sentence must sound like a native speaker would say it
- **Conversational Flow**: Entire interview should read like real native interviewer-user dialogue
- **Language Variety**: Avoid monotonous expressions, use rich native expressions

## 3. Cultural Sensitivity
- **Deep Cultural Understanding**: Reflect understanding of deep cultural values, not just surface translation
- **Zero Offense Standard**: Strictly identify and avoid any potentially uncomfortable or offensive expressions
- **Appropriateness Priority**: Between professionalism and appropriateness, prioritize appropriateness

# Specific Requirements

## For Each Session:

### 1. Title Optimization
- Keep original meaning but rephrase in most authentic native expression
- Ensure title sounds like native interviewer would use

### 2. Session Goal Optimization
- Keep goal content unchanged, optimize naturalness and authenticity
- Make goal description match native expression habits

### 3. Section Notes Optimization
- **Interviewer Instructions**: Express in most natural native interviewer way
- **Background Information**: Keep information, optimize localization
- **Local Expression Tips**: Upgrade to "**Native Expression Techniques**"

### 4. Interview Guide Optimization
- **Opening**: Make opening sound like experienced native interviewer
- **Question Phrasing**: Rephrase every question in most natural, authentic way
- **Follow-up Expression**: Make follow-ups sound natural, not abrupt
- **Interviewer Notes**: Rewrite using native interviewer thinking and expression
- **Transitions**: Make every transition natural and smooth

### 5. Study Description Optimization
- **Participant-Facing**: This description is what participants will see before the interview
- **Welcoming Tone**: Make it warm, inviting, and culturally appropriate
- **Clear Purpose**: Clearly explain what the study is about in simple terms
- **Cultural Adaptation**: Adapt the description to match local communication norms
- **Professional Yet Friendly**: Balance professionalism with approachability

## Language-Level Requirements:

### 1. Vocabulary Selection
- Prioritize words most familiar and commonly used by native users
- Avoid translation tone and awkward literal translations
- Find best balance between technical terms and colloquial expressions

### 2. Sentence Structure
- Adjust to sentence structures matching native language habits
- Make sentence length variation match native conversation rhythm
- Use most natural word order and expression logic

### 3. Tone Words and Connectors
- Use most common tone words and colloquial expressions
- Make connections and transitions more natural
- Add moderate colloquial elements while maintaining professionalism

### 4. Honorifics and Polite Language
- Adjust honorifics and polite language according to local culture
- Ensure politeness level matches local standards
- Make polite expressions sound natural, not forced

# Critical Cultural Sensitivity Guidelines

## 🚨 Expression Types to Avoid

### 1. Capability Assessment
❌ Avoid: Direct capability level assessment (may make people uncomfortable)
✅ Use: Gentle self-positioning guidance, let users describe current state

### 2. Money Discussion
❌ Avoid: Too direct payment willingness or specific amount inquiries
✅ Use: Subtle introduction, like "budget considerations", "investment range"

### 3. Overly Formal or Academic
❌ Avoid: Written, academic formal expressions
✅ Use: Colloquial, conversational natural expressions

## ✅ Recommended Localization Principles

### 1. Gentle Opening
- Express gratitude and respect for user's time
- Show pleasure and anticipation for exchange
- Natural start confirmation matching local politeness

### 2. Sensitive Topic Introduction
- Give users choice before sensitive topics
- Use polite pre-confirmation expressions
- Show concern for user comfort

### 3. Natural Transitions
- Use topic transition methods matching local habits
- Give users sense of participation and control
- Maintain natural conversation flow

# Output Format

Return a JSON object with the following structure:

\`\`\`json
{
  "questions": [
    {
      "id": "session-1",
      "question": "[Complete localized session 1 text in ${langConfig.name}]",
      "follow_up_count": 1
    },
    {
      "id": "session-2",
      "question": "[Complete localized session 2 text in ${langConfig.name}]",
      "follow_up_count": 1
    }
    // ... more sessions
  ],
  "description": "[REQUIRED: Localized study description in ${langConfig.name}. This is the description that participants will see. Make it natural, welcoming, and culturally appropriate.]"
}
\`\`\`

**IMPORTANT**: You MUST include the "description" field in your output. Localize the study description using the same cultural adaptation principles as the interview questions. If no description was provided in the input, return an empty string for this field.

# Quality Standards

## 1. Authenticity Verification
- **Native Speaker Test**: Every sentence should pass "Would a native speaker say this?" test
- **Naturalness Assessment**: Entire interview should read like real native business conversation
- **Cultural Fit**: All expressions should match local cultural background and values
- **Zero Offense Verification**: Ensure no expression could cause discomfort in local culture

## 2. Professional Effect
- **Information Collection**: Optimized expressions should better facilitate high-quality information collection
- **User Experience**: Users should feel more comfortable and willing to share deeply
- **Interview Flow**: Entire interview process should be more natural and smooth

## 3. Consistency
- **Style Unity**: Language style and expression throughout should be unified
- **Quality Stability**: Optimization quality across all sessions should be consistent
- **Cultural Consistency**: All expressions should reflect consistent cultural understanding

# CRITICAL INSTRUCTIONS

1. **100% ${langConfig.name}**: Output MUST be entirely in ${langConfig.name}
2. **Structure Preservation**: Keep exact same structure as input (same number of sessions, same question IDs)
3. **Deep Localization**: Every sentence should sound like a native ${langConfig.name} interviewer would say it
4. **Cultural Adaptation**: Fully adapt to ${langConfig.name} cultural context and communication norms
5. **Zero Offense**: Strictly avoid any culturally inappropriate or offensive expressions
6. **MUST Include Description**: Your JSON output MUST include the "description" field with the localized study description

**Output the localized interview guide as a JSON object now. Remember to include BOTH "questions" and "description" fields.**`;
};

