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
  console.log("generate-interview-sessions request received");
  const body = req.body;
  const researchType = body.researchType || 'product';
  const language = body.language || 'en-US'; // 接收访谈语言参数

  let systemPrompt;
  let userPrompt;

  if (researchType === 'market') {
    systemPrompt = SYSTEM_PROMPT_MARKET_RESEARCH;
    userPrompt = generateMarketResearchSessionsPrompt(body);
  } else if (researchType === 'product') {
    systemPrompt = SYSTEM_PROMPT_PRODUCT_RESEARCH;
    userPrompt = generateProductResearchSessionsPrompt(body);
  } else {
    systemPrompt = SYSTEM_PROMPT_SESSIONS;
    userPrompt = generateSessionsPrompt(body);
  }

  console.warn('【生成 Sessions - 配置】：>>>>>>>>>>>> questions.controller.ts', {
    researchType,
    language, // 记录语言参数
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
