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
    const content = basePromptOutput.message?.content;

    console.log(`Interview sessions (${researchType}) generated successfully`);

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

    res.status(200).json({
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

    res.status(500).json({
      error: "internal server error",
      details: error.message || "Unknown error"
    });
  }
};
