import simpleGit, { SimpleGit } from "simple-git";

const git: SimpleGit = simpleGit();

/**
 * Returns the git diff of staged changes. If none, falls back to unstaged.
 */
export async function getGitDiff(): Promise<string> {
  // --staged gives diff of staged files. If nothing staged, diff returns empty.
  const stagedDiff = await git.diff(["--cached"]);
  if (stagedDiff.trim()) return stagedDiff;

  // Get unstaged diff
  const workingDiff = await git.diff();
  return workingDiff.trim();
}

/**
 * Stage all modified and untracked files (equivalent to `git add -A`).
 */
export async function stageAllChanges(): Promise<void> {
  await git.add(["-A"]);
}

/**
 * Commit with the provided message. Assumes desired files are staged. If not, will stage all changes first.
 */
export async function commitWithMessage(message: string): Promise<void> {
  // If nothing staged, attempting commit will fail; ensure staging.
  const staged = (await git.diff(["--cached"]))?.trim();
  if (!staged) {
    return;
  }
  await git.commit(message);
}

/**
 * Return list of changed (modified, created, deleted, renamed) but **unstaged** file paths.
 */
export async function listUnstagedFiles(): Promise<string[]> {
  const status = await git.status();
  return [
    ...status.modified,
    ...status.not_added,
    ...status.deleted,
    ...status.renamed.map((r) => r.to),
  ];
}

/**
 * Stage the provided files.
 */
export async function stageFiles(files: string[]): Promise<void> {
  if (!files.length) return;
  await git.add(files);
}
