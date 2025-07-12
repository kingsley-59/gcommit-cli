import { generateCommitMessage } from "../src/openaiService";
import axios from "axios";

type OpenAICall = [
  url: string,
  body: {
    messages: Array<{
      role: string;
      content: string;
    }>;
    model: string;
    temperature: number;
    n: number;
  }
];

declare const global: any;

jest.mock("axios");

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("openaiService", () => {
  const FAKE_API_KEY = "sk-test";
  const CFG = { openai_api_key: FAKE_API_KEY } as any;

  it("returns commit message", async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        choices: [
          { message: { content: "feat: add awesome feature" } },
        ],
      },
    });

    const diff = "diff --git a/file.txt b/file.txt\n+hello";
    const msg = await generateCommitMessage(diff, CFG);
    expect(msg).toBe("feat: add awesome feature");
    expect(mockedAxios.post).toHaveBeenCalled();
  });

  it("truncates large diff", async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: { choices: [{ message: { content: "chore: big diff" } }] },
    });
    const bigDiff = "a".repeat(9000);
    await generateCommitMessage(bigDiff, CFG);
    const sentPrompt = (mockedAxios.post.mock.calls[0] as unknown as OpenAICall)[1].messages[1].content;
    expect(sentPrompt.length).toBeLessThanOrEqual(8200);
  });
});
