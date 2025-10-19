import { OpenAI } from 'openai';

export const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_API_BASE || "https://api.tu-zi.com/v1",
  maxRetries: 5,
});
