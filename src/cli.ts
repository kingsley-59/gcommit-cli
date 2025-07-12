import { Command } from "commander";
import { generateCommitMessage } from "./openaiService";
import {
  getGitDiff,
  commitWithMessage,
  listUnstagedFiles,
  stageFiles,
} from "./gitUtils";
import { loadConfig, promptApiKey } from "./config";
import inquirer from "inquirer";

const program = new Command();

export function runCli() {
  program
    .name("gcommit")
    .description("AI-powered conventional commit message generator")
    .version("0.1.0")
    .option("--auto", "Automatically commit with generated message")
    .action(async (options) => {
      try {
        const cfg = await loadConfig();
        if (!cfg.openai_api_key) {
          await promptApiKey();
          return;
        }
        console.log("Checking for unstaged changes...");
        const unstaged = await listUnstagedFiles();
        console.log("Unstaged changes detected:\n");
        unstaged.forEach((f, i) => console.log(`  [${i + 1}] ${f}`));

        const { filesToStage } = await inquirer.prompt<{ filesToStage: string[] }>([
          {
            type: "checkbox",
            name: "filesToStage",
            message: "Select files to stage (space to select all):",
            choices: unstaged,
            // default: unstaged,
          },
        ]);

        if (filesToStage.length) {
          await stageFiles(filesToStage);
        }
        const diff = await getGitDiff();
        if (!diff) {
          console.log("No changes detected.");
          return;
        }
        let finalMsg: string | undefined;
        let loop = true;
        while (loop) {
          const message = await generateCommitMessage(diff, cfg);
          console.log("\nGenerated commit message:\n", message, "\n");

          if (options.auto || cfg.auto_commit) {
            await commitWithMessage(message);
            console.log("\nChanges committed.");
            break;
          }

          const { action } = await inquirer.prompt<{
            action: "commit" | "regenerate" | "abort";
          }>([
            {
              type: "list",
              name: "action",
              message: "What would you like to do?",
              choices: [
                { name: "Commit with this message", value: "commit" },
                { name: "Regenerate message", value: "regenerate" },
                { name: "Abort", value: "abort" },
              ],
            },
          ]);

          if (action === "commit") {
            finalMsg = message;
            await commitWithMessage(finalMsg);
            console.log("\nChanges committed.");
            loop = false;
          } else if (action === "regenerate") {
            // loop again to regenerate
            continue;
          } else {
            console.log("Aborted.");
            return;
          }
        }

        console.log("\nDone.");
      } catch (err) {
        console.error("Error:", (err as Error).message);
      }
    });

  program
    .command("config")
    .description("Set up or update OpenAI API key and preferences")
    .action(async () => {
      await promptApiKey();
    });

  program.parse(process.argv);
}
