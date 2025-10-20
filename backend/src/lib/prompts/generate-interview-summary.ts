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
) => `Analyze this user research interview and extract key insights and important quotes.

## Study Objective
${studyObjective}

## Interview Questions
${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

## Interview Transcript
${transcript}

---

Based on this interview, generate the following:

### 1. KEY INSIGHTS (3-5 insights)

Extract 3-5 key insights that:
- Directly address the study objective
- Are specific and actionable (not generic observations)
- Reveal user needs, behaviors, pain points, or preferences
- Could inform product decisions or strategy
- Are supported by evidence from the transcript

For each insight:
- **content**: The insight itself (1-2 sentences, max 50 words)
- **category**: One of: "need", "pain_point", "behavior", "preference", "mental_model", "unexpected"

### 2. IMPORTANT QUOTES (5-10 quotes)

Extract 5-10 important quotes that:
- Provide direct evidence for the key insights
- Capture the user's voice and perspective
- Are memorable and impactful
- Represent different aspects of the user's experience
- Include both positive and negative feedback

For each quote:
- **quote**: The exact words from the transcript (verbatim)
- **timestamp**: Approximate timestamp in seconds (estimate based on position in transcript)
- **context**: Brief context explaining why this quote is important (1 sentence, max 25 words)
- **speaker**: Either "user" or "agent"

## Output Format

Return a JSON object with this exact structure:

\`\`\`json
{
  "key_insights": [
    {
      "id": "insight_1",
      "content": "Users struggle with X because Y, leading to Z behavior",
      "category": "pain_point"
    },
    {
      "id": "insight_2",
      "content": "Users prefer A over B when doing C",
      "category": "preference"
    }
  ],
  "important_quotes": [
    {
      "id": "quote_1",
      "quote": "Exact words from the user",
      "timestamp": 120,
      "context": "Why this quote matters",
      "speaker": "user"
    },
    {
      "id": "quote_2",
      "quote": "Another exact quote",
      "timestamp": 240,
      "context": "Context for this quote",
      "speaker": "user"
    }
  ]
}
\`\`\`

## Important Guidelines

1. **Be Specific**: Avoid generic insights like "User wants better UX". Instead: "User abandons checkout when shipping cost appears only at final step"

2. **Focus on Objective**: Prioritize insights that directly address: "${studyObjective}"

3. **Evidence-Based**: Every insight should be supported by at least one quote

4. **User Voice**: Quotes should be verbatim from the transcript, preserving the user's language

5. **Actionable**: Insights should suggest clear implications for product/design decisions

6. **Diverse Coverage**: Cover different aspects of the user experience (needs, pain points, behaviors, preferences)

7. **Quality over Quantity**: Better to have 3 strong insights than 5 weak ones

Generate the JSON output now:`;

/**
 * Helper function to validate the generated summary
 */
export const validateInterviewSummary = (summary: any): boolean => {
  if (!summary || typeof summary !== 'object') {
    return false;
  }

  // Validate key_insights
  if (!Array.isArray(summary.key_insights) || summary.key_insights.length < 3 || summary.key_insights.length > 5) {
    console.warn('Invalid key_insights count:', summary.key_insights?.length);
    return false;
  }

  for (const insight of summary.key_insights) {
    if (!insight.id || !insight.content || !insight.category) {
      console.warn('Invalid insight structure:', insight);
      return false;
    }
    if (insight.content.split(' ').length > 50) {
      console.warn('Insight too long:', insight.content);
      return false;
    }
  }

  // Validate important_quotes
  if (!Array.isArray(summary.important_quotes) || summary.important_quotes.length < 5 || summary.important_quotes.length > 10) {
    console.warn('Invalid important_quotes count:', summary.important_quotes?.length);
    return false;
  }

  for (const quote of summary.important_quotes) {
    if (!quote.id || !quote.quote || typeof quote.timestamp !== 'number' || !quote.context || !quote.speaker) {
      console.warn('Invalid quote structure:', quote);
      return false;
    }
    if (quote.context.split(' ').length > 25) {
      console.warn('Quote context too long:', quote.context);
      return false;
    }
    if (!['user', 'agent'].includes(quote.speaker)) {
      console.warn('Invalid speaker:', quote.speaker);
      return false;
    }
  }

  return true;
};

