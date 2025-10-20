import { Request, Response } from 'express';
import { openaiClient } from '@/config/openai';
import { ResponseService } from '@/services/responses.service';
import { InterviewService } from '@/services/interviews.service';
import { generateInterviewAnalytics } from '@/services/analytics.service';
import { InterviewSummaryService } from '@/services/interview-summary.service';
import { StudySummaryService } from '@/services/study-summary.service';
import {
  SYSTEM_PROMPT,
  createUserPrompt,
} from '@/lib/prompts/generate-insights';

export const generateInsights = async (req: Request, res: Response) => {
  console.log("generate-insights request received");
  const body = req.body;

  const responses = await ResponseService.getAllResponses(body.interviewId);
  const interview = await InterviewService.getInterviewById(body.interviewId);

  let callSummaries = "";
  if (responses) {
    responses.forEach((response) => {
      callSummaries += response.details?.call_analysis?.call_summary;
    });
  }

  try {
    const prompt = createUserPrompt(
      callSummaries,
      interview.name,
      interview.objective,
      interview.description,
    );

    const baseCompletion = await openaiClient.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    const basePromptOutput = baseCompletion.choices[0] || {};
    const content = basePromptOutput.message?.content || "";
    const insightsResponse = JSON.parse(content);

    await InterviewService.updateInterview(
      { insights: insightsResponse.insights },
      body.interviewId,
    );

    console.log("Insights generated successfully");

    res.status(200).json({
      response: content,
    });
  } catch (error) {
    console.error("Error generating insights:", error);

    res.status(500).json({
      error: "internal server error"
    });
  }
};

export const generateAnalytics = async (req: Request, res: Response) => {
  try {
    const { callId, interviewId, transcript } = req.body;

    console.log('📊 [Generate Analytics] Starting for call:', callId);

    // Generate basic analytics (question summaries, call summary)
    const analyticsResult = await generateInterviewAnalytics({
      callId,
      interviewId,
      transcript
    });

    if (analyticsResult.status !== 200) {
      console.error('❌ [Generate Analytics] Failed:', analyticsResult.error);
      return res.status(analyticsResult.status).json(analyticsResult);
    }

    console.log('✅ [Generate Analytics] Basic analytics generated');

    // Generate deep summary (key insights + important quotes)
    console.log('🔍 [Generate Analytics] Starting deep summary generation...');
    const summaryResult = await InterviewSummaryService.generateInterviewSummary({
      callId,
      interviewId,
      transcript
    });

    if (summaryResult.status !== 200) {
      console.warn('⚠️ [Generate Analytics] Deep summary failed, but continuing:', summaryResult.error);
      // Don't fail the whole request if summary generation fails
    } else {
      console.log('✅ [Generate Analytics] Deep summary generated');
    }

    res.status(200).json({
      analytics: analyticsResult.analytics,
      summary: summaryResult.summary,
      status: 200
    });
  } catch (error) {
    console.error("❌ [Generate Analytics] Error:", error);
    res.status(500).json({
      error: "Failed to generate analytics"
    });
  }
};

/**
 * Generate or regenerate interview summary (key insights + important quotes)
 */
export const generateInterviewSummary = async (req: Request, res: Response) => {
  try {
    const { callId, interviewId, transcript } = req.body;

    if (!callId || !interviewId) {
      return res.status(400).json({
        error: "callId and interviewId are required"
      });
    }

    console.log('🔍 [Generate Interview Summary] Starting for call:', callId);

    const result = await InterviewSummaryService.generateInterviewSummary({
      callId,
      interviewId,
      transcript
    });

    res.status(result.status).json(result);
  } catch (error) {
    console.error("❌ [Generate Interview Summary] Error:", error);
    res.status(500).json({
      error: "Failed to generate interview summary"
    });
  }
};

/**
 * Regenerate interview summary for an existing interview
 */
export const regenerateInterviewSummary = async (req: Request, res: Response) => {
  try {
    const { callId } = req.params;

    if (!callId) {
      return res.status(400).json({
        error: "callId is required"
      });
    }

    console.log('🔄 [Regenerate Interview Summary] Starting for call:', callId);

    const result = await InterviewSummaryService.regenerateInterviewSummary(callId);

    res.status(result.status).json(result);
  } catch (error) {
    console.error("❌ [Regenerate Interview Summary] Error:", error);
    res.status(500).json({
      error: "Failed to regenerate interview summary"
    });
  }
};

/**
 * Generate study-level summary (executive summary + objective deliverables + cross-interview insights)
 */
export const generateStudySummary = async (req: Request, res: Response) => {
  try {
    const { interviewId, selectedCallIds } = req.body;

    if (!interviewId) {
      return res.status(400).json({
        error: "interviewId is required"
      });
    }

    console.log('📊 [Generate Study Summary] Starting for interview:', interviewId);

    const result = await StudySummaryService.generateStudySummary({
      interviewId,
      selectedCallIds
    });

    res.status(result.status).json(result);
  } catch (error) {
    console.error("❌ [Generate Study Summary] Error:", error);
    res.status(500).json({
      error: "Failed to generate study summary"
    });
  }
};

/**
 * Regenerate study summary
 */
export const regenerateStudySummary = async (req: Request, res: Response) => {
  try {
    const { interviewId } = req.params;
    const { selectedCallIds } = req.body;

    if (!interviewId) {
      return res.status(400).json({
        error: "interviewId is required"
      });
    }

    console.log('🔄 [Regenerate Study Summary] Starting for interview:', interviewId);

    const result = await StudySummaryService.regenerateStudySummary(
      interviewId,
      selectedCallIds
    );

    res.status(result.status).json(result);
  } catch (error) {
    console.error("❌ [Regenerate Study Summary] Error:", error);
    res.status(500).json({
      error: "Failed to regenerate study summary"
    });
  }
};
