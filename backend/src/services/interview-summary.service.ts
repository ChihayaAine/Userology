import { openaiClient } from '@/config/openai';
import {
  INTERVIEW_SUMMARY_SYSTEM_PROMPT,
  getInterviewSummaryPrompt,
  validateInterviewSummary
} from '@/lib/prompts/generate-interview-summary';
import { ResponseService } from './responses.service';
import { InterviewService } from './interviews.service';
import { InsightWithEvidence } from '@/types/response';
import { Question } from '@/types/interview';

interface InterviewSummaryResult {
  insights_with_evidence: InsightWithEvidence[];
}

/**
 * Generate deep summary for a single interview
 * Extracts key insights and important quotes
 */
export const generateInterviewSummary = async (payload: {
  callId: string;
  interviewId: string;
  transcript: string;
}): Promise<{ summary: InterviewSummaryResult | null; status: number; error?: string }> => {
  const { callId, interviewId, transcript } = payload;

  try {
    console.log('🔍 [Interview Summary] Starting generation for call:', callId);

    // Get response and interview data
    const response = await ResponseService.getResponseByCallId(callId);
    const interview = await InterviewService.getInterviewById(interviewId);

    // Check if summary already exists (new format)
    if (response.insights_with_evidence) {
      console.log('✅ [Interview Summary] Summary already exists (new format), returning cached version');
      return {
        summary: {
          insights_with_evidence: response.insights_with_evidence,
        },
        status: 200,
      };
    }

    // Check if old format exists (for backward compatibility)
    if (response.key_insights && response.important_quotes) {
      console.log('⚠️ [Interview Summary] Old format detected, will regenerate in new format');
      // Continue to generate new format
    }

    // Prepare data
    const interviewTranscript = transcript || response.details?.transcript;
    const studyObjective = interview?.objective || 'General user research';
    const questions = (interview?.questions || []) as Question[];
    const questionTexts = questions.map(q => q.question);
    const language = interview?.language || 'en-US'; // 获取Study设置的语言

    if (!interviewTranscript) {
      console.error('❌ [Interview Summary] No transcript available');
      return { summary: null, status: 400, error: 'No transcript available' };
    }

    console.log('📊 [Interview Summary] Generating with:', {
      transcriptLength: interviewTranscript.length,
      questionCount: questionTexts.length,
      hasObjective: !!studyObjective,
      language: language, // 记录使用的语言
    });

    // Generate summary using GPT-4o
    const prompt = getInterviewSummaryPrompt(
      interviewTranscript,
      studyObjective,
      questionTexts,
      language, // 传递语言参数
    );

    const completion = await openaiClient.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: INTERVIEW_SUMMARY_SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      console.error('❌ [Interview Summary] No content in response');
      return { summary: null, status: 500, error: 'No content generated' };
    }

    const summaryData = JSON.parse(content);

    // Validate the generated summary
    if (!validateInterviewSummary(summaryData)) {
      console.error('❌ [Interview Summary] Validation failed');
      return { summary: null, status: 500, error: 'Invalid summary structure' };
    }

    console.log('✅ [Interview Summary] Generated successfully:', {
      insightsCount: summaryData.insights_with_evidence.length,
      totalQuotesCount: summaryData.insights_with_evidence.reduce((sum: number, insight: any) => sum + insight.supporting_quotes.length, 0),
    });

    // Save to database
    await ResponseService.saveResponse(
      {
        insights_with_evidence: summaryData.insights_with_evidence,
      },
      callId,
    );

    console.log('💾 [Interview Summary] Saved to database');

    return {
      summary: {
        insights_with_evidence: summaryData.insights_with_evidence,
      },
      status: 200,
    };
  } catch (error) {
    console.error('❌ [Interview Summary] Error:', error);
    return {
      summary: null,
      status: 500,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Regenerate summary for an existing interview
 * Useful for testing or when the summary needs to be updated
 */
export const regenerateInterviewSummary = async (callId: string): Promise<{
  summary: InterviewSummaryResult | null;
  status: number;
  error?: string;
}> => {
  try {
    const response = await ResponseService.getResponseByCallId(callId);
    
    if (!response) {
      return { summary: null, status: 404, error: 'Response not found' };
    }

    const transcript = response.details?.transcript;
    const interviewId = response.interview_id;

    if (!transcript || !interviewId) {
      return { summary: null, status: 400, error: 'Missing transcript or interview ID' };
    }

    // Clear existing summary to force regeneration
    await ResponseService.saveResponse(
      {
        insights_with_evidence: null,
        key_insights: null,  // Also clear old format
        important_quotes: null,  // Also clear old format
      },
      callId,
    );

    // Generate new summary
    return await generateInterviewSummary({
      callId,
      interviewId,
      transcript,
    });
  } catch (error) {
    console.error('❌ [Regenerate Summary] Error:', error);
    return {
      summary: null,
      status: 500,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

export const InterviewSummaryService = {
  generateInterviewSummary,
  regenerateInterviewSummary,
};

