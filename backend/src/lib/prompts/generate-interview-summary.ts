/**
 * Prompt for generating deep interview summary
 * Generates Key Insights and Important Quotes for a single interview
 */

export const INTERVIEW_SUMMARY_SYSTEM_PROMPT = `You are an expert user researcher specializing in extracting actionable insights from user interviews. Your goal is to help product teams understand user needs, behaviors, pain points, and preferences.

Key principles:
- Focus on specific, actionable insights rather than generic observations
- Extract direct user quotes that provide evidence for insights
- Prioritize insights that directly relate to the research objective
- Identify patterns in user behavior and mental models
- Highlight unexpected findings or contradictions`;

export const getInterviewSummaryPrompt = (
  transcript: string,
  studyObjective: string,
  questions: string[],
  language?: string,
) => {
  // 根据语言设置输出语言
  const languageInstruction = language === 'zh-CN'
    ? '\n\n**CRITICAL: Write ALL insights and context in Chinese (简体中文). Keep quotes in their original language.**'
    : language === 'ja-JP'
    ? '\n\n**CRITICAL: Write ALL insights and context in Japanese (日本語). Keep quotes in their original language.**'
    : '\n\n**CRITICAL: Write ALL insights and context in English. Keep quotes in their original language.**';

  return `Analyze this user research interview and extract key insights and important quotes.

## Study Objective
${studyObjective}

## Interview Questions
${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

## Interview Transcript
${transcript}

---

Based on this interview, generate the following:

### KEY INSIGHTS WITH EVIDENCE (3-5 insights)

Extract 3-5 key insights, each with 2-3 supporting quotes as evidence.

For each insight:
- **content**: The insight itself (1-2 sentences, max 50 words)
  - Must be specific and actionable (not generic observations)
  - Should directly address the study objective
  - Must reveal user needs, behaviors, pain points, or preferences
  - Should inform product decisions or strategy

- **category**: One of: "need", "pain_point", "behavior", "preference", "mental_model", "unexpected"

- **supporting_quotes**: Array of 2-3 quotes that provide evidence for this insight
  - **quote**: The exact words from the transcript (verbatim)
  - **timestamp**: Approximate timestamp in seconds (estimate based on position in transcript)
  - **speaker**: Either "user" or "agent"

**CRITICAL**: Each insight MUST have 1-3 supporting quotes that directly support that specific insight. Prefer 2-3 quotes when possible, but 1 quote is acceptable for short interviews or when there's limited relevant content. The quotes should be the strongest evidence for that particular insight.

## Output Format

Return a JSON object with this exact structure:

\`\`\`json
{
  "insights_with_evidence": [
    {
      "id": "insight_1",
      "content": "Users struggle with X because Y, leading to Z behavior",
      "category": "pain_point",
      "supporting_quotes": [
        {
          "id": "quote_1_1",
          "quote": "Exact quote from user that supports this insight",
          "timestamp": 120,
          "speaker": "user"
        },
        {
          "id": "quote_1_2",
          "quote": "Another quote supporting the same insight",
          "timestamp": 180,
          "speaker": "user"
        }
      ]
    },
    {
      "id": "insight_2",
      "content": "Users prefer A over B when doing C",
      "category": "preference",
      "supporting_quotes": [
        {
          "id": "quote_2_1",
          "quote": "Quote supporting this preference",
          "timestamp": 240,
          "speaker": "user"
        },
        {
          "id": "quote_2_2",
          "quote": "Another quote about this preference",
          "timestamp": 300,
          "speaker": "user"
        }
      ]
    }
  ]
}
\`\`\`

## Important Guidelines

1. **Be Specific**: Avoid generic insights like "User wants better UX". Instead: "User abandons checkout when shipping cost appears only at final step"

2. **Focus on Objective**: Prioritize insights that directly address: "${studyObjective}"

3. **Evidence-Based**: Every insight MUST have 2-3 supporting quotes that directly support that specific insight

4. **User Voice**: Quotes should be verbatim from the transcript, preserving the user's language

5. **Actionable**: Insights should suggest clear implications for product/design decisions

6. **Diverse Coverage**: Cover different aspects of the user experience (needs, pain points, behaviors, preferences)

7. **Quality over Quantity**: Better to have 3 strong insights with solid evidence than 5 weak ones

8. **Quote Relevance**: Each quote must be directly relevant to its parent insight. Don't reuse the same quote for multiple insights.

Generate the JSON output now:${languageInstruction}`;
};

/**
 * Helper function to validate the generated summary
 */
export const validateInterviewSummary = (summary: any): boolean => {
  if (!summary || typeof summary !== 'object') {
    return false;
  }

  // Validate insights_with_evidence (allow 1-5 insights for short interviews)
  if (!Array.isArray(summary.insights_with_evidence) || summary.insights_with_evidence.length < 1 || summary.insights_with_evidence.length > 5) {
    console.warn('Invalid insights_with_evidence count:', summary.insights_with_evidence?.length);
    return false;
  }

  for (const insight of summary.insights_with_evidence) {
    // Validate insight structure
    if (!insight.id || !insight.content || !insight.category) {
      console.warn('Invalid insight structure:', insight);
      return false;
    }

    if (insight.content.split(' ').length > 50) {
      console.warn('Insight too long:', insight.content);
      return false;
    }

    // Validate supporting_quotes (each insight should have 1-3 quotes, prefer 2-3)
    if (!Array.isArray(insight.supporting_quotes) || insight.supporting_quotes.length < 1 || insight.supporting_quotes.length > 3) {
      console.warn('Invalid supporting_quotes count for insight:', insight.id, insight.supporting_quotes?.length);
      return false;
    }

    // Validate each quote
    for (const quote of insight.supporting_quotes) {
      if (!quote.id || !quote.quote || typeof quote.timestamp !== 'number' || !quote.speaker) {
        console.warn('Invalid quote structure:', quote);
        return false;
      }

      if (!['user', 'agent'].includes(quote.speaker)) {
        console.warn('Invalid speaker:', quote.speaker);
        return false;
      }
    }
  }

  return true;
};

