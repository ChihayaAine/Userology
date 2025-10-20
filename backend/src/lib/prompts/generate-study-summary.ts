/**
 * Two-stage prompt system for generating study-level summary
 * Stage 1: Extract expected deliverables from study objective
 * Stage 2: Generate content based on extracted deliverables
 */

export const STUDY_SUMMARY_SYSTEM_PROMPT = `You are an expert user researcher specializing in synthesizing insights from multiple user interviews. Your goal is to help product teams make data-driven decisions based on comprehensive user research.

Key principles:
- Synthesize patterns across multiple interviews
- Provide actionable, specific recommendations
- Support insights with evidence from multiple users
- Identify both consensus and divergent perspectives
- Focus on what matters most for product decisions`;

/**
 * Stage 1: Extract expected deliverables from study objective
 */
export const getDeliverablesExtractionPrompt = (studyObjective: string) => `Analyze this research objective and identify what specific deliverables the researcher expects.

## Study Objective
${studyObjective}

---

Based on this objective, determine:
1. What type of deliverables are expected? (e.g., action plans, pricing analysis, feature prioritization, user journey, pain points ranking)
2. How many items are expected? (e.g., "3 action plans", "top 5 pain points")
3. What specific format or structure would be most useful?

Return a JSON object with this structure:

\`\`\`json
{
  "deliverable_type": "action_plans | pricing_analysis | pain_points | feature_prioritization | user_journey | general",
  "expected_count": 3,
  "description": "Brief description of what should be delivered",
  "structure_hints": "Any specific structure or format mentioned in the objective"
}
\`\`\`

Examples:

Objective: "Understand user pain points and generate 3 actionable product improvements"
→ deliverable_type: "action_plans", expected_count: 3

Objective: "Determine users' willingness to pay for premium features"
→ deliverable_type: "pricing_analysis", expected_count: 1

Objective: "Identify top 5 user pain points in the onboarding flow"
→ deliverable_type: "pain_points", expected_count: 5

Objective: "Understand how users currently solve this problem"
→ deliverable_type: "general", expected_count: 0 (no specific count mentioned)

Generate the JSON output now:`;

/**
 * Stage 2: Generate study summary based on deliverables type
 */
export const getStudySummaryPrompt = (
  studyObjective: string,
  interviewSummaries: Array<{
    name: string;
    email: string;
    callSummary: string;
    keyInsights: any[];
    importantQuotes: any[];
  }>,
  deliverableType: string,
  expectedCount: number,
) => {
  const interviewData = interviewSummaries
    .map(
      (interview, index) => `
### Interview ${index + 1}: ${interview.name} (${interview.email})

**Call Summary:**
${interview.callSummary}

**Key Insights:**
${interview.keyInsights.map((insight, i) => `${i + 1}. [${insight.category}] ${insight.content}`).join('\n')}

**Important Quotes:**
${interview.importantQuotes.map((quote, i) => `${i + 1}. "${quote.quote}" - ${quote.context}`).join('\n')}
`,
    )
    .join('\n---\n');

  const deliverableInstructions = getDeliverableInstructions(
    deliverableType,
    expectedCount,
  );

  return `Synthesize insights from ${interviewSummaries.length} user interviews and generate a comprehensive study summary.

## Study Objective
${studyObjective}

## Interview Data
${interviewData}

---

Generate the following:

### 1. EXECUTIVE SUMMARY (1 paragraph, 100-150 words)
A concise overview of the key findings and their implications for the product/business.

### 2. OBJECTIVE-DRIVEN DELIVERABLES
${deliverableInstructions}

### 3. CROSS-INTERVIEW INSIGHTS
Synthesize patterns and themes across all interviews. Generate as many insights as are meaningful and well-supported by the data (typically 1-8 depending on interview count and content richness).

Each insight should:
- Be supported by evidence from the interviews (multiple interviews if available)
- Be specific and actionable
- Include the number of users who mentioned this theme
- Have a clear implication for product decisions

**Note**: For studies with only 1-2 interviews, focus on quality over quantity. Even 1-2 strong insights are valuable.

Format:
- **title**: Short, descriptive title (max 10 words)
- **description**: Detailed explanation (50-100 words)
- **category**: One of: "consensus", "divergent", "unexpected", "critical"
- **importance**: "high", "medium", or "low"
- **user_count**: Number of users who mentioned this (e.g., "4 out of 5 users")

### 4. EVIDENCE BANK
For each cross-interview insight, provide supporting quotes from different users.

Format:
- **insight_id**: ID of the related insight
- **quotes**: Array of {user, quote, interview_id}

## Output Format

Return a JSON object with this exact structure:

\`\`\`json
{
  "executive_summary": "One paragraph summary...",
  "objective_deliverables": {
    "type": "${deliverableType}",
    "content": ${getDeliverableExample(deliverableType, expectedCount)}
  },
  "cross_interview_insights": [
    {
      "id": "insight_1",
      "title": "Short title",
      "description": "Detailed description...",
      "category": "consensus",
      "importance": "high",
      "user_count": "4 out of ${interviewSummaries.length} users"
    }
  ],
  "evidence_bank": [
    {
      "insight_id": "insight_1",
      "quotes": [
        {
          "user": "John Doe",
          "quote": "Exact quote from interview",
          "interview_id": "email@example.com"
        }
      ]
    }
  ]
}
\`\`\`

Generate the JSON output now:`;
};

/**
 * Get specific instructions based on deliverable type
 */
const getDeliverableInstructions = (
  type: string,
  count: number,
): string => {
  switch (type) {
    case 'action_plans':
      return `Generate ${count || 3} actionable product recommendations. Each should include:
- **title**: Clear, action-oriented title
- **description**: What to do and why (100-150 words)
- **priority**: "high", "medium", or "low"
- **effort**: "low", "medium", or "high"
- **impact**: "low", "medium", or "high"
- **supporting_evidence**: Key quotes or data points`;

    case 'pricing_analysis':
      return `Analyze users' willingness to pay. Include:
- **price_range**: Suggested price range with justification
- **value_perception**: What users value most
- **price_sensitivity**: How price-sensitive are users
- **competitive_context**: How users compare to alternatives
- **recommendations**: Specific pricing strategy recommendations`;

    case 'pain_points':
      return `Identify and rank the top ${count || 5} user pain points. Each should include:
- **title**: Short description of the pain point
- **description**: Detailed explanation (50-100 words)
- **severity**: "critical", "major", or "minor"
- **frequency**: How often users encounter this
- **user_count**: How many users mentioned this
- **current_workarounds**: How users currently deal with this`;

    case 'feature_prioritization':
      return `Prioritize features based on user feedback. Each feature should include:
- **feature_name**: Name of the feature
- **user_demand**: "high", "medium", or "low"
- **description**: What users want and why
- **use_cases**: Specific scenarios where this would be valuable
- **priority_score**: 1-10 based on demand and impact`;

    case 'user_journey':
      return `Map the user journey with pain points and opportunities. Include:
- **stages**: Key stages in the user journey
- **pain_points**: Issues at each stage
- **opportunities**: Where to improve
- **user_quotes**: Supporting evidence`;

    default:
      return `Generate ${count || 5} key findings that directly address the research objective. Each should be:
- Specific and actionable
- Supported by evidence from multiple users
- Clearly tied to the research objective`;
  }
};

/**
 * Get example structure for deliverable type
 */
const getDeliverableExample = (type: string, count: number): string => {
  switch (type) {
    case 'action_plans':
      return `[
      {
        "title": "Action plan title",
        "description": "What to do and why...",
        "priority": "high",
        "effort": "medium",
        "impact": "high",
        "supporting_evidence": ["Quote 1", "Quote 2"]
      }
    ]`;

    case 'pricing_analysis':
      return `{
      "price_range": "$10-$20/month",
      "value_perception": "Users value X most...",
      "price_sensitivity": "Medium - willing to pay for value",
      "competitive_context": "Compared to alternatives...",
      "recommendations": "Specific pricing strategy..."
    }`;

    case 'pain_points':
      return `[
      {
        "title": "Pain point title",
        "description": "Detailed explanation...",
        "severity": "critical",
        "frequency": "Daily",
        "user_count": "4 out of 5 users",
        "current_workarounds": "How users deal with this..."
      }
    ]`;

    default:
      return `[
      {
        "title": "Finding title",
        "description": "Detailed finding...",
        "supporting_evidence": ["Evidence 1", "Evidence 2"]
      }
    ]`;
  }
};

/**
 * Validation function for study summary
 */
export const validateStudySummary = (summary: any): boolean => {
  if (!summary || typeof summary !== 'object') {
    return false;
  }

  // Validate executive_summary
  if (!summary.executive_summary || typeof summary.executive_summary !== 'string') {
    console.warn('Invalid executive_summary');
    return false;
  }

  // Validate objective_deliverables
  if (!summary.objective_deliverables || !summary.objective_deliverables.type) {
    console.warn('Invalid objective_deliverables');
    return false;
  }

  // Validate cross_interview_insights (structure only, no count limit)
  if (!Array.isArray(summary.cross_interview_insights)) {
    console.warn('Invalid cross_interview_insights: not an array');
    return false;
  }

  // Validate each insight's structure
  for (const insight of summary.cross_interview_insights) {
    if (!insight.id || !insight.title || !insight.description || !insight.category || !insight.importance) {
      console.warn('Invalid insight structure:', insight);
      return false;
    }

    // Validate category
    if (!['consensus', 'divergent', 'unexpected', 'critical'].includes(insight.category)) {
      console.warn('Invalid insight category:', insight.category);
      return false;
    }

    // Validate importance
    if (!['high', 'medium', 'low'].includes(insight.importance)) {
      console.warn('Invalid insight importance:', insight.importance);
      return false;
    }
  }

  // Validate evidence_bank
  if (!Array.isArray(summary.evidence_bank)) {
    console.warn('Invalid evidence_bank');
    return false;
  }

  // Validate each evidence entry
  for (const evidence of summary.evidence_bank) {
    if (!evidence.insight_id || !Array.isArray(evidence.quotes)) {
      console.warn('Invalid evidence structure:', evidence);
      return false;
    }

    // Validate each quote
    for (const quote of evidence.quotes) {
      if (!quote.user || !quote.quote) {
        console.warn('Invalid quote structure:', quote);
        return false;
      }
    }
  }

  return true;
};

