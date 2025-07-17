import axios from "axios";
import { GCommitConfig } from "./config.js";

const BASE_URL = "https://api.openai.com/v1/chat/completions";

export async function generateCommitMessage(diff: string, cfg: GCommitConfig): Promise<string> {
  const apiKey = cfg.openai_api_key || process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OpenAI API key missing");

  // Avoid sending extremely large diffs to the API – truncate to ~8k chars.
  const SAFE_DIFF = diff.length > 8000 ? diff.slice(0, 8000) + "\n...[diff truncated]" : diff;

  const systemPrompt = [
    "You are an expert software engineer acting as a Git commit assistant.",
    "Your task is to generate clear, concise commit messages based on code diffs.",
    "Every commit message MUST start with a Conventional Commits prefix:",
    "Valid types include: feat, fix, chore, refactor, test, docs, style, perf, build, ci, revert.",
    "Use imperative, present-tense language (e.g., 'add tests', not 'added tests').",
    "If the changes are small and focused, generate a single-line commit message (≤ 72 characters).",
    "If the diff includes multiple files or major changes, write a brief summary line starting with the Conventional Commits type,",
    "followed by a blank line, then bullet points (prefixed with '-') describing key changes.",
    "Do not output file paths, filenames, or line numbers unless they are critical for understanding.",
    "Ignore formatting-only, whitespace-only, or auto-generated changes.",
    "Do not wrap the commit message in code blocks or Markdown syntax (e.g., no ```).",
    "Keep the tone professional and informative—no filler or casual language.",
  ].join("\n");

  const userPrompt = `Generate an appropriate commit message for the following git diff:\n\n${SAFE_DIFF}`;

  const body = {
    model: cfg.model || "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.7,
    n: 1,
  };

  try {
    const resp = await axios.post(BASE_URL, body, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    const message: string | undefined = resp.data.choices?.[0]?.message?.content?.trim();
    if (!message) throw new Error("Received empty response from OpenAI");
    return message;
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      const detail = err.response?.data?.error?.message || err.message;
      throw new Error(`OpenAI API error: ${detail}`);
    }
    throw err;
  }
}
