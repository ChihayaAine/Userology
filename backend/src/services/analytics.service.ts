import { openaiClient } from '@/config/openai';
import { ResponseService } from '@/services/responses.service';
import { InterviewService } from '@/services/interviews.service';
import { Question } from '@/types/interview';
import { Analytics } from '@/types/response';
import {
  getInterviewAnalyticsPrompt,
  SYSTEM_PROMPT,
} from '@/lib/prompts/analytics';

export const generateInterviewAnalytics = async (payload: {
  callId: string;
  interviewId: string;
  transcript: string;
}) => {
  const { callId, interviewId, transcript } = payload;

  try {
    const response = await ResponseService.getResponseByCallId(callId);
    const interview = await InterviewService.getInterviewById(interviewId);

    if (response.analytics) {
      return { analytics: response.analytics as Analytics, status: 200 };
    }

    const interviewTranscript = transcript || response.details?.transcript;
    const questions = interview?.questions || [];
    const studyObjective = interview?.objective || '';

    const mainInterviewQuestions = questions
      .map((q: Question, index: number) => `${index + 1}. ${q.question}`)
      .join("\n");

    const prompt = getInterviewAnalyticsPrompt(
      interviewTranscript,
      mainInterviewQuestions,
      studyObjective,
    );

    console.log('🔍 [Analytics] Generating analytics with:', {
      questionCount: questions.length,
      hasObjective: !!studyObjective,
      objective: studyObjective,
    });

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
    const analyticsResponse = JSON.parse(content);

    console.log('✅ [Analytics] Generated analytics:', {
      questionSummariesCount: analyticsResponse.questionSummaries?.length || 0,
      expectedCount: questions.length,
    });

    // Verify we got summaries for all questions
    if (analyticsResponse.questionSummaries?.length !== questions.length) {
      console.warn('⚠️ [Analytics] Question count mismatch!', {
        expected: questions.length,
        received: analyticsResponse.questionSummaries?.length || 0,
      });
    }

    analyticsResponse.mainInterviewQuestions = questions.map(
      (q: Question) => q.question,
    );

    return { analytics: analyticsResponse, status: 200 };
  } catch (error) {
    console.error("Error in OpenAI request:", error);

    return { error: "internal server error", status: 500 };
  }
};
