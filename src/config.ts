import fs from "fs";
import path from "path";
import readline from "readline";
import os from "os";
import { fileURLToPath } from "url";

export type GCommitConfig = {
  openai_api_key?: string;
  model?: string;
  language?: string;
  auto_commit?: boolean;
};

const CONFIG_FILENAME = ".gcommitrc";

function getConfigFilePath(): string {
  const cwdPath = path.join(process.cwd(), CONFIG_FILENAME);
  if (fs.existsSync(cwdPath)) return cwdPath;
  // fallback to home directory
  return path.join(os.homedir(), CONFIG_FILENAME);
}

export async function loadConfig(): Promise<GCommitConfig> {
  const cfgPath = getConfigFilePath();
  if (fs.existsSync(cfgPath)) {
    try {
      const raw = await fs.promises.readFile(cfgPath, "utf8");
      return JSON.parse(raw);
    } catch (err) {
      console.warn("Failed to parse config file; ignoring.");
    }
  }
  // fallback to env vars
  return {
    openai_api_key: process.env.OPENAI_API_KEY,
    model: process.env.GCOMMIT_MODEL || "gpt-4o-mini", // sensible default
    language: process.env.GCOMMIT_LANG || "en",
    auto_commit: process.env.GCOMMIT_AUTO_COMMIT === "true",
  } as GCommitConfig;
}

export async function saveConfig(cfg: GCommitConfig): Promise<void> {
  const cfgPath = getConfigFilePath();
  await fs.promises.writeFile(cfgPath, JSON.stringify(cfg, null, 2), {
    encoding: "utf8",
  });
  console.log(`Saved configuration to ${cfgPath}`);
}

export async function promptApiKey(): Promise<void> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question("Enter your OpenAI API key: ", async (answer) => {
    const cfg = await loadConfig();
    cfg.openai_api_key = answer.trim();
    await saveConfig(cfg);
    rl.close();
    console.log("API key saved. You can now run 'gcommit'.");
  });
}
