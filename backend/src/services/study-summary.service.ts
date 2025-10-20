import { openaiClient } from '@/config/openai';
import {
  STUDY_SUMMARY_SYSTEM_PROMPT,
  getDeliverablesExtractionPrompt,
  getStudySummaryPrompt,
  validateStudySummary,
} from '@/lib/prompts/generate-study-summary';
import { ResponseService } from './responses.service';
import { InterviewService } from './interviews.service';

interface StudySummaryResult {
  executive_summary: string;
  objective_deliverables: any;
  cross_interview_insights: any[];
  evidence_bank: any[];
}

/**
 * Generate comprehensive study summary from multiple interviews
 * Uses two-stage AI generation:
 * 1. Extract expected deliverables from study objective
 * 2. Generate content based on deliverables type
 */
export const generateStudySummary = async (payload: {
  interviewId: string;
  selectedCallIds?: string[]; // Optional: specific interviews to include
}): Promise<{
  summary: StudySummaryResult | null;
  status: number;
  error?: string;
}> => {
  const { interviewId, selectedCallIds } = payload;

  try {
    console.log('🔍 [Study Summary] Starting generation for interview:', interviewId);

    // Get interview data
    const interview = await InterviewService.getInterviewById(interviewId);
    if (!interview) {
      return { summary: null, status: 404, error: 'Interview not found' };
    }

    // Check if summary already exists
    if (
      interview.executive_summary &&
      interview.objective_deliverables &&
      interview.cross_interview_insights
    ) {
      console.log('✅ [Study Summary] Summary already exists, returning cached version');
      return {
        summary: {
          executive_summary: interview.executive_summary,
          objective_deliverables: interview.objective_deliverables,
          cross_interview_insights: interview.cross_interview_insights,
          evidence_bank: interview.evidence_bank || [],
        },
        status: 200,
      };
    }

    const studyObjective = interview.objective || 'General user research';

    // Get all responses for this interview
    let responses = await ResponseService.getAllResponses(interviewId);

    // Filter by selected call IDs if provided
    if (selectedCallIds && selectedCallIds.length > 0) {
      responses = responses.filter((r: any) =>
        selectedCallIds.includes(r.call_id),
      );
    }

    // Filter out responses without analytics or with NOT_SELECTED status
    responses = responses.filter(
      (r: any) =>
        r.analytics &&
        r.candidate_status !== 'NOT_SELECTED' &&
        r.is_ended === true,
    );

    if (responses.length === 0) {
      return {
        summary: null,
        status: 400,
        error: 'No valid responses found for this interview',
      };
    }

    console.log('📊 [Study Summary] Processing responses:', {
      totalResponses: responses.length,
      hasObjective: !!studyObjective,
    });

    // Prepare interview summaries
    const interviewSummaries = responses.map((response: any) => ({
      name: response.name || 'Anonymous',
      email: response.email || '',
      callSummary: response.analytics?.softSkillSummary || '',
      keyInsights: response.key_insights || [],
      importantQuotes: response.important_quotes || [],
    }));

    // Stage 1: Extract expected deliverables from objective
    console.log('🎯 [Study Summary] Stage 1: Extracting deliverables...');
    const deliverablesPrompt = getDeliverablesExtractionPrompt(studyObjective);

    const deliverablesCompletion = await openaiClient.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: STUDY_SUMMARY_SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: deliverablesPrompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const deliverablesContent = deliverablesCompletion.choices[0]?.message?.content;
    if (!deliverablesContent) {
      return {
        summary: null,
        status: 500,
        error: 'Failed to extract deliverables',
      };
    }

    const deliverables = JSON.parse(deliverablesContent);
    console.log('✅ [Study Summary] Deliverables extracted:', deliverables);

    // Stage 2: Generate study summary based on deliverables
    console.log('📝 [Study Summary] Stage 2: Generating summary...');
    const summaryPrompt = getStudySummaryPrompt(
      studyObjective,
      interviewSummaries,
      deliverables.deliverable_type,
      deliverables.expected_count,
    );

    const summaryCompletion = await openaiClient.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: STUDY_SUMMARY_SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: summaryPrompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const summaryContent = summaryCompletion.choices[0]?.message?.content;
    if (!summaryContent) {
      return { summary: null, status: 500, error: 'Failed to generate summary' };
    }

    const summaryData = JSON.parse(summaryContent);

    // Validate the generated summary
    if (!validateStudySummary(summaryData)) {
      console.error('❌ [Study Summary] Validation failed');
      return { summary: null, status: 500, error: 'Invalid summary structure' };
    }

    console.log('✅ [Study Summary] Generated successfully:', {
      insightsCount: summaryData.cross_interview_insights.length,
      evidenceCount: summaryData.evidence_bank.length,
      deliverableType: summaryData.objective_deliverables.type,
    });

    // Save to database
    await InterviewService.updateInterview(
      {
        executive_summary: summaryData.executive_summary,
        objective_deliverables: summaryData.objective_deliverables,
        cross_interview_insights: summaryData.cross_interview_insights,
        evidence_bank: summaryData.evidence_bank,
      },
      interviewId,
    );

    console.log('💾 [Study Summary] Saved to database');

    return {
      summary: {
        executive_summary: summaryData.executive_summary,
        objective_deliverables: summaryData.objective_deliverables,
        cross_interview_insights: summaryData.cross_interview_insights,
        evidence_bank: summaryData.evidence_bank,
      },
      status: 200,
    };
  } catch (error) {
    console.error('❌ [Study Summary] Error:', error);
    return {
      summary: null,
      status: 500,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Regenerate study summary
 */
export const regenerateStudySummary = async (
  interviewId: string,
  selectedCallIds?: string[],
): Promise<{
  summary: StudySummaryResult | null;
  status: number;
  error?: string;
}> => {
  try {
    // Clear existing summary to force regeneration
    await InterviewService.updateInterview(
      {
        executive_summary: null,
        objective_deliverables: null,
        cross_interview_insights: null,
        evidence_bank: null,
      },
      interviewId,
    );

    // Generate new summary
    return await generateStudySummary({ interviewId, selectedCallIds });
  } catch (error) {
    console.error('❌ [Regenerate Study Summary] Error:', error);
    return {
      summary: null,
      status: 500,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

export const StudySummaryService = {
  generateStudySummary,
  regenerateStudySummary,
};

