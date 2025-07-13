import simpleGit, { SimpleGit } from "simple-git";

/**
 * Create a SimpleGit instance with optional working directory (cwd).
 */
function getGit(cwd?: string): SimpleGit {
  return simpleGit({ baseDir: cwd || process.cwd() });
}

/**
 * Returns the git diff of staged changes. If none, falls back to unstaged.
 */
export async function getGitDiff(cwd?: string): Promise<string> {
  const git = getGit(cwd);
  const stagedDiff = await git.diff(["--cached"]);
  if (stagedDiff.trim()) return stagedDiff;

  const workingDiff = await git.diff();
  return workingDiff.trim();
}

/**
 * Stage all modified and untracked files.
 */
export async function stageAllChanges(cwd?: string): Promise<void> {
  const git = getGit(cwd);
  await git.add(["-A"]);
}

/**
 * Commit with the provided message.
 */
export async function commitWithMessage(message: string, cwd?: string): Promise<void> {
  const git = getGit(cwd);
  const staged = (await git.diff(["--cached"]))?.trim();
  if (!staged) return;
  await git.commit(message);
}

/**
 * Return list of changed (modified, created, deleted, renamed) but **unstaged** file paths.
 */
export async function listUnstagedFiles(cwd?: string): Promise<string[]> {
  const git = getGit(cwd);
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
export async function stageFiles(files: string[], cwd?: string): Promise<void> {
  if (!files.length) return;
  const git = getGit(cwd);
  await git.add(files);
}
