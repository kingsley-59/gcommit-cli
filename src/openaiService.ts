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
    "Follow the Conventional Commits specification (e.g., feat:, fix:, chore:, refactor:).",
    "Use imperative, present-tense language (e.g., \"add tests\" not \"added tests\").",
    "If the diff represents small, focused changes, output a single-line commit message (≤ 72 chars).",
    "If the diff spans multiple files or large sections, output a short summary line,",
    "then a blank line, then bullet points (prefix with '-') describing the major changes.",
    "Ignore whitespace-only or boilerplate changes.",
  ].join(" \n");

  const userPrompt = `Generate an appropriate commit message for the following git diff:\n\n${SAFE_DIFF}`;

  const body = {
    model: cfg.model || "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.2,
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
