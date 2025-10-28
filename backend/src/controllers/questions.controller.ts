import { Request, Response } from 'express';
import { openaiClient } from '@/config/openai';
import {
  SYSTEM_PROMPT,
  generateQuestionsPrompt,
} from '@/lib/prompts/generate-questions';
import {
  SYSTEM_PROMPT_SESSIONS,
  generateSessionsPrompt,
} from '@/lib/prompts/generate-sessions';
import {
  SYSTEM_PROMPT_PRODUCT_RESEARCH,
  generateProductResearchSessionsPrompt,
} from '@/lib/prompts/generate-product-research-sessions';
import {
  SYSTEM_PROMPT_MARKET_RESEARCH,
  generateMarketResearchSessionsPrompt,
} from '@/lib/prompts/generate-market-research-sessions';
import {
  SYSTEM_PROMPT_LOCALIZATION,
  generateLocalizeOutlinePrompt,
} from '@/lib/prompts/localize-outline';

export const generateInterviewQuestions = async (req: Request, res: Response) => {
  console.log("generate-interview-questions request received");
  const body = req.body;

  console.warn('【OpenAI 配置】：>>>>>>>>>>>> questions.controller.ts:15', {
    apiKey: process.env.OPENAI_API_KEY ? 'exists' : 'missing',
    baseURL: process.env.OPENAI_API_BASE || "https://api.tu-zi.com/v1",
    requestBody: body
  });

  try {
    const baseCompletion = await openaiClient.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: generateQuestionsPrompt(body),
        },
      ],
      response_format: { type: "json_object" },
    });

    const basePromptOutput = baseCompletion.choices[0] || {};
    const content = basePromptOutput.message?.content;

    console.log("Interview questions generated successfully");

    res.status(200).json({
      response: content,
    });
  } catch (error: any) {
    console.error("Error generating interview questions:", error);
    console.error('【OpenAI API 错误】：>>>>>>>>>>>> questions.controller.ts:49', {
      error: error.message,
      stack: error.stack,
      apiKey: process.env.OPENAI_API_KEY ? 'exists' : 'missing',
      requestBody: body
    });

    res.status(500).json({
      error: "internal server error",
      details: error.message || "Unknown error"
    });
  }
};

export const generateInterviewSessions = async (req: Request, res: Response) => {
  console.error("🚀🚀🚀 generate-interview-sessions request received 🚀🚀🚀");
  const body = req.body;
  console.error("📦 Request body:", JSON.stringify(body, null, 2));
  const researchType = body.researchType || 'product';
  // 优先使用 outline_debug_language（大纲调试语言），如果没有则使用 language（访谈语言）
  const debugLanguage = body.outline_debug_language || body.language || 'en-US';
  console.error("🌐 Debug Language:", debugLanguage);
  console.error("🌐 Interview Language:", body.language);

  // 将调试语言传递给prompt生成函数
  const promptBody = {
    ...body,
    language: debugLanguage
  };

  let systemPrompt;
  let userPrompt;

  if (researchType === 'market') {
    systemPrompt = SYSTEM_PROMPT_MARKET_RESEARCH;
    userPrompt = generateMarketResearchSessionsPrompt(promptBody);
  } else if (researchType === 'product') {
    systemPrompt = SYSTEM_PROMPT_PRODUCT_RESEARCH;
    userPrompt = generateProductResearchSessionsPrompt(promptBody);
  } else {
    systemPrompt = SYSTEM_PROMPT_SESSIONS;
    userPrompt = generateSessionsPrompt(promptBody);
  }

  console.warn('【生成 Sessions - 配置】：>>>>>>>>>>>> questions.controller.ts', {
    researchType,
    debugLanguage, // 记录调试语言
    interviewLanguage: body.language || 'N/A', // 记录访谈语言
    customInstructions: body.customInstructions || 'none', // 记录个性化备注
    context: body.context || 'none', // 🆕 记录 context
    contextLength: body.context ? body.context.length : 0, // 🆕 记录 context 长度
    apiKey: process.env.OPENAI_API_KEY ? 'exists' : 'missing',
    baseURL: process.env.OPENAI_API_BASE || "https://api.tu-zi.com/v1",
    requestBody: body
  });

  // 🆕 输出实际发送给 OpenAI 的完整 prompt
  console.log('==================== 📝 PROMPT SENT TO OPENAI 📝 ====================');
  console.log('🤖 SYSTEM PROMPT:');
  console.log(systemPrompt);
  console.log('\n👤 USER PROMPT:');
  console.log(userPrompt);
  console.log('==================== 📝 END OF PROMPT 📝 ====================\n');

  try {
    const baseCompletion = await openaiClient.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    const basePromptOutput = baseCompletion.choices[0] || {};
    let content = basePromptOutput.message?.content;  // 🔧 改为 let，以便补全时更新

    console.log(`Interview sessions (${researchType}) generated successfully`);

    // 🔍 验证 GPT 实际生成的数量
    try {
      let parsedContent = JSON.parse(content || '{}');
      const actualCount = parsedContent.questions?.length || 0;
      const requestedCount = Math.min(body.number, 10);
      
      console.log('📊 Session Count Verification:', {
        requested: requestedCount,
        actualGenerated: actualCount,
        match: actualCount === requestedCount ? '✅' : '❌',
        questions: parsedContent.questions?.map((q: string, i: number) => ({
          index: i + 1,
          preview: q.substring(0, 50) + '...'
        }))
      });
      
      if (actualCount !== requestedCount) {
        console.error(`⚠️⚠️⚠️ COUNT MISMATCH: Requested ${requestedCount} but GPT generated ${actualCount} sessions!`);
        console.error('📝 GPT 原始回复（完整内容）：');
        console.error('==================== START ====================');
        console.error(content);
        console.error('==================== END ====================');
        
        // 🔧 智能补全：如果数量不足，让 GPT 继续补全
        if (actualCount < requestedCount) {
          const missing = requestedCount - actualCount;
          console.log(`🔄 调用 GPT 补全剩余 ${missing} 个 sessions...`);
          
          try {
            const complementPrompt = `You previously generated ${actualCount} sessions for an interview guide, but the user requested ${requestedCount} sessions in total.

Here are the ${actualCount} sessions you already generated:
${JSON.stringify(parsedContent.questions, null, 2)}

**CRITICAL REQUIREMENT**:
You MUST now generate EXACTLY ${missing} MORE sessions (Session ${actualCount + 1} to Session ${requestedCount}) to complete the interview guide.

Requirements:
1. Continue from where you left off (start with Session ${actualCount + 1})
2. Generate EXACTLY ${missing} sessions - no more, no less
3. Maintain the same format and quality as the previous sessions
4. Ensure these new sessions naturally follow the previous ones
5. Each session should follow the established structure

Original research context:
- Research Type: ${researchType}
- Study Name: ${body.name}
- Research Objective: ${body.objective}
${body.context ? `- Additional Context: ${body.context}` : ''}

Output ONLY a JSON object with a "questions" array containing EXACTLY ${missing} new session strings.
Format: {"questions": ["session ${actualCount + 1} text", "session ${actualCount + 2} text", ...]}

DO NOT include the previous ${actualCount} sessions in your response.
ONLY generate the NEW ${missing} sessions.`;

            const complementResponse = await openaiClient.chat.completions.create({
              model: "gpt-4o",
              messages: [
                {
                  role: "system",
                  content: systemPrompt,
                },
                {
                  role: "user",
                  content: complementPrompt,
                },
              ],
              response_format: { type: "json_object" },
              temperature: 0.7,
            });

            const complementContent = complementResponse.choices[0]?.message?.content;
            const complementParsed = JSON.parse(complementContent || '{}');
            
            if (complementParsed.questions && Array.isArray(complementParsed.questions)) {
              console.log(`✅ GPT 补全了 ${complementParsed.questions.length} 个 sessions`);
              // 合并原始和补全的 sessions
              parsedContent.questions = [...parsedContent.questions, ...complementParsed.questions];
              content = JSON.stringify(parsedContent);
              console.log(`✅ 总计 ${parsedContent.questions.length} 个 sessions`);
            } else {
              console.error('❌ GPT 补全响应格式错误');
            }
          } catch (complementError: any) {
            console.error('❌ GPT 补全失败:', complementError.message);
          }
        } else if (actualCount > requestedCount) {
          // 如果生成多了，直接截断
          console.log(`✂️ 截断到 ${requestedCount} 个 sessions`);
          parsedContent.questions = parsedContent.questions.slice(0, requestedCount);
          content = JSON.stringify(parsedContent);
        }
      }
    } catch (e) {
      console.error('❌ Failed to parse GPT response for verification:', e);
      console.error('📝 GPT 原始回复（解析失败，输出原始内容）：');
      console.error('==================== START ====================');
      console.error(content);
      console.error('==================== END ====================');
    }

    res.status(200).json({
      response: content,
    });
  } catch (error: any) {
    console.error("Error generating interview sessions:", error);
    console.error('【生成 Sessions - OpenAI API 错误】：>>>>>>>>>>>> questions.controller.ts', {
      error: error.message,
      stack: error.stack,
      apiKey: process.env.OPENAI_API_KEY ? 'exists' : 'missing',
      requestBody: body
    });

    res.status(500).json({
      error: "internal server error",
      details: error.message || "Unknown error"
    });
  }
};

/**
 * 本地化大纲接口
 * 将调试语言的初稿大纲本地化到目标访谈语言
 */
export const localizeOutline = async (req: Request, res: Response) => {
  console.log("localize-outline request received");
  const body = req.body;

  const {
    draftOutline,
    targetLanguage,
    researchObjective,
    studyName,
    description
  } = body;

  // 验证必需参数
  if (!draftOutline || !targetLanguage) {
    return res.status(400).json({
      error: "Missing required parameters",
      details: "draftOutline and targetLanguage are required"
    });
  }

  console.warn('【本地化大纲 - 配置】：>>>>>>>>>>>> questions.controller.ts', {
    targetLanguage,
    studyName: studyName || 'N/A',
    description: description || 'N/A',  // 添加 description 日志
    descriptionLength: description ? description.length : 0,  // description 长度
    draftOutlineLength: Array.isArray(draftOutline) ? draftOutline.length : 'invalid',
    apiKey: process.env.OPENAI_API_KEY ? 'exists' : 'missing',
    baseURL: process.env.OPENAI_API_BASE || "https://api.tu-zi.com/v1"
  });

  try {
    const completion = await openaiClient.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT_LOCALIZATION,
        },
        {
          role: "user",
          content: generateLocalizeOutlinePrompt({
            draftOutline,
            targetLanguage,
            researchObjective,
            studyName,
            description
          }),
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7, // 稍高的温度以获得更自然的表达
    });

    const output = completion.choices[0] || {};
    const content = output.message?.content;

    console.log(`✅ Outline localized successfully to ${targetLanguage}`);

    // 解析并验证 OpenAI 响应
    try {
      const parsedContent = JSON.parse(content || '{}');
      console.log('📝 OpenAI Response Structure:', {
        hasQuestions: !!parsedContent.questions,
        questionsCount: parsedContent.questions?.length || 0,
        hasDescription: !!parsedContent.description,
        descriptionPreview: parsedContent.description ?
          parsedContent.description.substring(0, 100) + '...' :
          'MISSING'
      });

      if (!parsedContent.description) {
        console.warn('⚠️ WARNING: OpenAI did not return description field!');
      }
    } catch (e) {
      console.error('❌ Failed to parse OpenAI response:', e);
    }

    return res.status(200).json({
      response: content,
    });
  } catch (error: any) {
    console.error("Error localizing outline:", error);
    console.error('【本地化大纲 - OpenAI API 错误】：>>>>>>>>>>>> questions.controller.ts', {
      error: error.message,
      stack: error.stack,
      apiKey: process.env.OPENAI_API_KEY ? 'exists' : 'missing',
      targetLanguage,
      requestBody: body
    });

    return res.status(500).json({
      error: "internal server error",
      details: error.message || "Unknown error"
    });
  }
};
