import { Request, Response } from 'express';
import { openaiClient } from '@/config/openai';
import { ResponseService } from '@/services/responses.service';
import { InterviewService } from '@/services/interviews.service';
import { generateInterviewAnalytics } from '@/services/analytics.service';
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
    
    const result = await generateInterviewAnalytics({
      callId,
      interviewId,
      transcript
    });
    
    res.status(result.status).json(result);
  } catch (error) {
    console.error("Error generating analytics:", error);
    res.status(500).json({
      error: "Failed to generate analytics"
    });
  }
};
