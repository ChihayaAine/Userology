export const SYSTEM_PROMPT =
  "You are an expert in analyzing user research interview transcripts. Focus on extracting insights that help understand user needs, behaviors, and pain points.";

export const getInterviewAnalyticsPrompt = (
  interviewTranscript: string,
  mainInterviewQuestions: string,
  studyObjective?: string,
  language?: string,
) => {
  // 根据语言设置输出语言
  const languageInstruction = language === 'zh-CN'
    ? '\n\n**IMPORTANT: Please write ALL summaries in Chinese (简体中文).**'
    : language === 'ja-JP'
    ? '\n\n**IMPORTANT: Please write ALL summaries in Japanese (日本語).**'
    : '\n\n**IMPORTANT: Please write ALL summaries in English.**';

  return `Analyze the following user research interview transcript:

###
Transcript: ${interviewTranscript}

Main Interview Questions:
${mainInterviewQuestions}

${studyObjective ? `Study Objective: ${studyObjective}\n` : ''}

Based on this transcript, generate the following analytics in JSON format:

1. **Call Summary** (100-150 words):
   - Provide a comprehensive summary of the interview
   ${studyObjective ? `- Focus on insights relevant to the study objective: "${studyObjective}"` : ''}
   - Highlight key user behaviors, needs, pain points, and preferences mentioned
   - Include specific examples or quotes when relevant
   - Avoid generic statements; be specific and actionable

2. **Question Summaries**:
   - You MUST provide a summary for EVERY main question listed above
   - Use ONLY the main questions provided (do not add or infer additional questions)
   - For each question, follow these rules:
     * If the question was NOT asked in the transcript: output the question with summary "Not Asked"
     * If the question was asked but NOT answered: output the question with summary "Not Answered"
     * If the question was asked AND answered:
       - Summarize the user's response (50-100 words)
       - Include any follow-up questions and answers related to this main question
       - Focus on specific details, examples, and user quotes
       - Highlight insights relevant to understanding user needs/behaviors
   - The output array MUST have the same number of items as the number of main questions

Ensure the output is in valid JSON format with the following structure:
{
  "questionSummaries": [
    { "question": string, "summary": string }
  ],
  "softSkillSummary": string
}

CRITICAL REQUIREMENTS:
- The "questionSummaries" array MUST contain exactly ${mainInterviewQuestions.split('\n').filter(q => q.trim()).length} items (one for each main question)
- Maintain the exact order of questions as provided
- Do not skip any questions
- Do not add extra questions${languageInstruction}`;
};
