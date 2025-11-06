export function requireOpenAIKey() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    throw new Error("Missing OpenAI API key in environment variables");
  }
  return key;
}