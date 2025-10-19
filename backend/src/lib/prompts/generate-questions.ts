export const SYSTEM_PROMPT =
  "You are an expert user researcher specialized in conducting user interviews to uncover deeper user insights and understand user needs, behaviors, and pain points.";

export const generateQuestionsPrompt = (body: {
  name: string;
  objective: string;
  number: number;
  context: string;
}) => `Imagine you are a user researcher specialized in designing interview questions to help product teams understand user needs, behaviors, pain points, and experiences with products or services.
              
Research Study Title: ${body.name}
Research Objective: ${body.objective}

Number of questions to be generated: ${body.number}

Follow these detailed guidelines when crafting the questions:
- Focus on uncovering deep user insights through behavioral, emotional, and contextual exploration. Questions should reveal user motivations, mental models, and unmet needs.
- Use the "5 Whys" approach - dig deeper into user responses to understand root causes and underlying motivations.
- Include questions that explore user journeys, decision-making triggers, and emotional responses at different touchpoints.
- Ask about specific scenarios, past experiences, and real-life examples to get concrete, actionable insights rather than hypothetical responses.
- Incorporate questions that reveal user language, terminology, and how they conceptualize problems and solutions.
- Design questions to uncover user goals, success metrics, and what "good" looks like from their perspective.
- Include exploratory questions about user workflows, pain points, workarounds, and moments of delight or frustration.
- Maintain a conversational and empathetic tone, ensuring participants feel comfortable sharing honest, detailed experiences.
- Ask concise and precise open-ended questions that encourage storytelling and detailed responses. Each question should be 25 words or less for clarity.
- Structure questions to build on each other, creating a natural flow that goes from general to specific insights.

Use the following context to generate the questions:
${body.context}

Moreover generate a 50 word or less second-person description about the research study to be shown to the participant. It should be in the field 'description'.
Do not use the exact objective in the description. Remember that some details are not be shown to the participant. It should be a small description for the
participant to understand what the content of the interview would be. Make sure it is clear and welcoming to the participant.

The field 'questions' should take the format of an array of objects with the following key: question. 

Strictly output only a JSON object with the keys 'questions' and 'description'.`;
