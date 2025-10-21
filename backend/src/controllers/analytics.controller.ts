import { Request, Response } from 'express';
import { ResponseService } from '@/services/responses.service';
import { InterviewService } from '@/services/interviews.service';
import { generateInterviewAnalytics } from '@/services/analytics.service';
import { InterviewSummaryService } from '@/services/interview-summary.service';
import { StudySummaryService } from '@/services/study-summary.service';

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

    return res.status(200).json({
      analytics: analyticsResult.analytics,
      summary: summaryResult.summary,
      status: 200
    });
  } catch (error) {
    console.error("❌ [Generate Analytics] Error:", error);
    return res.status(500).json({
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

    return res.status(result.status).json(result);
  } catch (error) {
    console.error("❌ [Generate Interview Summary] Error:", error);
    return res.status(500).json({
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

    return res.status(result.status).json(result);
  } catch (error) {
    console.error("❌ [Regenerate Interview Summary] Error:", error);
    return res.status(500).json({
      error: "Failed to regenerate interview summary"
    });
  }
};

/**
 * Generate study-level summary (executive summary + objective deliverables + cross-interview insights)
 */
export const generateStudySummary = async (req: Request, res: Response) => {
  try {
    const { interviewId, selectedCallIds, regenerate } = req.body;

    if (!interviewId) {
      return res.status(400).json({
        error: "interviewId is required"
      });
    }

    console.log('📊 [Generate Study Summary] Starting for interview:', interviewId);

    const result = await StudySummaryService.generateStudySummary({
      interviewId,
      selectedCallIds,
      regenerate
    });

    return res.status(result.status).json(result);
  } catch (error) {
    console.error("❌ [Generate Study Summary] Error:", error);
    return res.status(500).json({
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

    return res.status(result.status).json(result);
  } catch (error) {
    console.error("❌ [Regenerate Study Summary] Error:", error);
    return res.status(500).json({
      error: "Failed to regenerate study summary"
    });
  }
};
