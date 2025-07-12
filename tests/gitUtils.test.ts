import { getGitDiff, stageAllChanges, commitWithMessage } from "../src/gitUtils";
import simpleGit from "simple-git";

jest.mock("simple-git");

const mockDiff = jest.fn();
const mockAdd = jest.fn();
const mockCommit = jest.fn();
(simpleGit as unknown as jest.Mock).mockReturnValue({
  diff: mockDiff,
  add: mockAdd,
  commit: mockCommit,
});

describe("gitUtils", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("getGitDiff returns staged diff when available", async () => {
    mockDiff.mockResolvedValueOnce("staged"); // first call --cached
    const diff = await getGitDiff();
    expect(diff).toBe("staged");
    expect(mockDiff).toHaveBeenCalledWith(["--cached"]);
  });

  it("getGitDiff falls back to working diff", async () => {
    mockDiff
      .mockResolvedValueOnce("") // staged
      .mockResolvedValueOnce("working"); // unstaged
    const diff = await getGitDiff();
    expect(diff).toBe("working");
  });

  it("stageAllChanges calls git add -A", async () => {
    await stageAllChanges();
    expect(mockAdd).toHaveBeenCalledWith(["-A"]);
  });

  it("commitWithMessage stages when none and commits", async () => {
    mockDiff.mockResolvedValueOnce(""); // no staged diff
    await commitWithMessage("msg");
    expect(mockAdd).toHaveBeenCalled();
    expect(mockCommit).toHaveBeenCalledWith("msg");
  });
});
