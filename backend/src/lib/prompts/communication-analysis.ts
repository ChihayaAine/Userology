export const SYSTEM_PROMPT = `You are an expert in analyzing user research interviews and extracting meaningful insights from user responses. Your task is to:
1. Analyze the user's responses and communication patterns
2. Identify key insights, pain points, and user needs
3. Extract relevant quotes that support the analysis
4. Provide themes and patterns in user behavior`;

export const getCommunicationAnalysisPrompt = (
  transcript: string,
) => `Analyze the user insights and responses from the following research interview transcript with advanced clustering and sentiment analysis:

Transcript: ${transcript}

Please provide your analysis in the following JSON format:
{
  "insightScore": number, // Score from 0-10 based on how insightful and valuable the user's responses were
  "overallSummary": string,   // 2-3 sentence summary of key insights and user needs discovered
  "supportingQuotes": [        // Array of relevant quotes with analysis
    {
      "quote": string,         // The exact quote from the transcript
      "analysis": string,      // Brief analysis of what this quote reveals about user needs or pain points
      "type": string,          // Either "insight", "pain_point", "need", or "behavior"
      "sentiment": string,     // "positive", "negative", "neutral", "frustrated", "excited"
      "theme": string          // Main theme this quote belongs to
    }
  ],
  "keyInsights": [string],       // List of key insights about user needs and behaviors
  "painPoints": [string],        // List of user pain points and frustrations identified
  "userNeeds": [string],         // List of user needs and desires identified
  "themes": [                    // Clustered themes from the conversation
    {
      "theme": string,           // Theme name (e.g., "Navigation Issues", "Feature Requests")
      "description": string,     // Brief description of the theme
      "frequency": number,       // How often this theme appeared (1-5 scale)
      "sentiment": string        // Overall sentiment for this theme
    }
  ],
  "emotionalJourney": [          // User's emotional journey throughout the interview
    {
      "phase": string,           // "beginning", "middle", "end"
      "emotion": string,         // Primary emotion detected
      "trigger": string          // What triggered this emotion
    }
  ],
  "actionableRecommendations": [string] // Specific, actionable recommendations based on the insights
}`;
