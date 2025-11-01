import { Request, Response } from 'express';
import { openaiClient } from '@/config/openai';
import {
  SYSTEM_PROMPT,
  generateQuestionsPrompt,
} from '@/lib/prompts/generate-questions';
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
import {
  SYSTEM_PROMPT_SKELETON,
  generateSkeletonPrompt,
} from '@/lib/prompts/generate-outline-skeleton';
import {
  SYSTEM_PROMPT_FULL_OUTLINE_MARKET,
  SYSTEM_PROMPT_FULL_OUTLINE_PRODUCT,
  generateFullOutlinePrompt,
} from '@/lib/prompts/generate-full-outline-from-skeleton';
import { InterviewService } from '@/services/interviews.service';

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

  // 根据研究类型选择对应的 Prompt
  // 注意：researchType 只能是 'market' 或 'product'（前端类型限制 + 后端默认值）
  if (researchType === 'market') {
    systemPrompt = SYSTEM_PROMPT_MARKET_RESEARCH;
    userPrompt = generateMarketResearchSessionsPrompt(promptBody);
  } else {
    // 默认使用 Product Research Prompt
    systemPrompt = SYSTEM_PROMPT_PRODUCT_RESEARCH;
    userPrompt = generateProductResearchSessionsPrompt(promptBody);
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

// ============================================
// Two-Step Outline Generation APIs
// ============================================

/**
 * Step 1: Generate Outline Skeleton
 * POST /api/outlines/skeleton
 * 注意：这个 API 不需要 interview_id，只需要基本信息即可生成骨架
 */
export const generateOutlineSkeleton = async (req: Request, res: Response) => {
  console.log("🎯 generate-outline-skeleton request received");
  const { name, objective, context = '', session_count, duration_minutes, draft_language, researchType = 'product', manualSessions } = req.body;

  console.log("📋 Generating skeleton:", {
    name,
    objective: objective?.substring(0, 100) + '...',
    session_count,
    duration_minutes,
    draft_language,
    researchType,
    manualSessions: manualSessions?.length || 0
  });

  try {
    // 调用 Step 1 Prompt 生成骨架（不需要 interview_id）
    const completion = await openaiClient.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT_SKELETON,
        },
        {
          role: "user",
          content: generateSkeletonPrompt({
            objective: objective || '',
            context: context || '',
            session_count,
            duration_minutes,
            language: draft_language,
            researchType: researchType || 'product',
            manualSessions: manualSessions || []
          }),
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content returned from OpenAI");
    }

    const skeleton = JSON.parse(content);

    // 🆕 为每个 session 添加 ai_suggested_depth_level（保存 AI 最初建议的 depth_level）
    if (skeleton.sessions && Array.isArray(skeleton.sessions)) {
      skeleton.sessions = skeleton.sessions.map((session: any) => ({
        ...session,
        ai_suggested_depth_level: session.depth_level || 'medium' // 保存 AI 建议的 depth_level
      }));
    }

    // 🆕 确保 metadata.draft_language 存在（如果 AI 没有生成，手动添加）
    if (!skeleton.metadata) {
      skeleton.metadata = {};
    }
    if (!skeleton.metadata.draft_language) {
      skeleton.metadata.draft_language = draft_language;
      console.log('⚠️ AI did not include draft_language in metadata, manually added:', draft_language);
    }

    console.log("✅ Skeleton generated successfully:", {
      total_sessions: skeleton.metadata?.total_sessions,
      draft_language: skeleton.metadata?.draft_language
    });

    res.status(200).json({
      skeleton,
      status: 'skeleton_generated'
    });

  } catch (error: any) {
    console.error("❌ Error generating skeleton:", error);
    res.status(500).json({
      error: "internal server error",
      details: error.message || "Unknown error"
    });
  }
};

/**
 * Step 2: Update Skeleton (User edits)
 * PATCH /api/outlines/:id/skeleton
 */
export const updateOutlineSkeleton = async (req: Request, res: Response) => {
  console.log("📝 update-outline-skeleton request received");
  const { id } = req.params;
  const { skeleton } = req.body;

  try {
    await InterviewService.updateInterview({
      outline_skeleton: skeleton
    }, id);

    console.log("✅ Skeleton updated successfully");

    res.status(200).json({
      skeleton,
      status: 'skeleton_generated'
    });

  } catch (error: any) {
    console.error("❌ Error updating skeleton:", error);
    res.status(500).json({
      error: "internal server error",
      details: error.message || "Unknown error"
    });
  }
};

/**
 * Step 3: Generate Full Outline from Skeleton
 * POST /api/outlines/:id/full-outline
 */
export const generateFullOutlineFromSkeleton = async (req: Request, res: Response) => {
  console.log("🚀 generate-full-outline-from-skeleton request received");
  const { id } = req.params;

  try {
    // 1. 获取骨架和 interview 信息
    const interview = await InterviewService.getInterviewById(id);

    if (!interview) {
      return res.status(404).json({ error: "Interview not found" });
    }

    if (!interview.outline_skeleton) {
      return res.status(400).json({ error: "Skeleton not found. Please generate skeleton first." });
    }

    console.log("📋 Generating full outline from skeleton:", {
      interview_id: id,
      skeleton_sessions: interview.outline_skeleton.sessions.length,
      draft_language: interview.outline_skeleton.metadata?.draft_language,
      outline_debug_language: (interview as any).outline_debug_language
    });

    // 2. 调用 Step 2 Prompt 生成完整大纲
    const researchType = (interview as any).researchType || 'product';
    const systemPrompt = researchType === 'market'
      ? SYSTEM_PROMPT_FULL_OUTLINE_MARKET
      : SYSTEM_PROMPT_FULL_OUTLINE_PRODUCT;

    const completion = await openaiClient.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: generateFullOutlinePrompt({
            skeleton: interview.outline_skeleton,
            objective: interview.objective || '',
            context: (interview as any).context || '',
            researchType: researchType
          }),
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content returned from OpenAI");
    }

    console.log("📄 Raw OpenAI response:", content.substring(0, 500) + '...');

    const fullOutline = JSON.parse(content);

    console.log("📊 Parsed fullOutline:", {
      questionsCount: fullOutline.questions?.length || 0,
      descriptionLength: fullOutline.description?.length || 0,
      firstQuestion: fullOutline.questions?.[0],
      lastQuestion: fullOutline.questions?.[fullOutline.questions?.length - 1]
    });

    // 3. 处理新的数据结构（兼容旧格式）
    let questionsToSave;
    if (Array.isArray(fullOutline.questions) && fullOutline.questions.length > 0) {
      // 检查是否为新格式（对象数组）
      if (typeof fullOutline.questions[0] === 'object' && fullOutline.questions[0].session_text) {
        // 新格式：保存完整对象（包含 depth_level）
        questionsToSave = fullOutline.questions;
        console.log('✅ Using new format with depth_level:', fullOutline.questions.map((q: any) => q.depth_level));
      } else {
        // 旧格式：字符串数组，转换为新格式（默认 medium）
        questionsToSave = fullOutline.questions.map((sessionText: string) => ({
          session_text: sessionText,
          depth_level: 'medium'
        }));
        console.log('⚠️ Converting old format to new format (default depth_level: medium)');
      }
    } else {
      questionsToSave = [];
    }

    console.log("💾 Questions to save:", {
      count: questionsToSave.length,
      sessions: questionsToSave.map((q: any, idx: number) => ({
        index: idx,
        session_text_preview: q.session_text?.substring(0, 50) + '...',
        depth_level: q.depth_level
      }))
    });

    // 4. 保存完整大纲
    await InterviewService.updateInterview({
      draft_outline: questionsToSave,
      description: fullOutline.description,
      outline_generation_status: 'draft_generated'
    }, id);

    console.log("✅ Full outline generated successfully");

    res.status(200).json({
      draft_outline: questionsToSave,
      description: fullOutline.description,
      status: 'draft_generated'
    });

  } catch (error: any) {
    console.error("❌ Error generating full outline:", error);
    res.status(500).json({
      error: "internal server error",
      details: error.message || "Unknown error"
    });
  }
};
