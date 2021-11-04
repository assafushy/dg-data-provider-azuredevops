import DgDataProviderAzureDevOps from "../..";

require("dotenv").config();
jest.setTimeout(100000);

const orgUrl = process.env.ORG_URL;
const token = process.env.PAT;

describe("git module - tests", () => {
  test("should return repo list for teamProject", async () => {
    let dgDataProviderAzureDevOps = new DgDataProviderAzureDevOps(
      orgUrl,
      token
    );
    let gitDataProvider = await dgDataProviderAzureDevOps.getGitDataProvider();
    let json: any = await gitDataProvider.GetTeamProjectGitReposList("tests");
    expect(json).toBeDefined();
  });
  test("should return repo from repoid", async () => {
    let dgDataProviderAzureDevOps = new DgDataProviderAzureDevOps(
      orgUrl,
      token
    );
    let gitDataProvider = await dgDataProviderAzureDevOps.getGitDataProvider();
    let json: any = await gitDataProvider.GetGitRepoFromRepoId(
      "68f2aee7-0864-458e-93ce-320303a080ed"
    );
    expect(json).toBeDefined();
  });
  test("should return repo by pullrequest id", async () => {
    let dgDataProviderAzureDevOps = new DgDataProviderAzureDevOps(
      orgUrl,
      token
    );
    let gitDataProvider = await dgDataProviderAzureDevOps.getGitDataProvider();
    let json: any = await gitDataProvider.GetGitRepoFromPrId(73);
    expect(json.repository).toBeDefined();
  });
  test("should return commits by pullrequest & repo id", async () => {
    let dgDataProviderAzureDevOps = new DgDataProviderAzureDevOps(
      orgUrl,
      token
    );
    let gitDataProvider = await dgDataProviderAzureDevOps.getGitDataProvider();
    let json: any = await gitDataProvider.GetGitRepoFromPrId(73);
    let commitJson: any = await gitDataProvider.GetPullRequestCommits(
      json.repository.id,
      73
    );
    expect(commitJson.value.length).toBeGreaterThan(0);
  });
  test("should return pullrequest threads", async () => {
    let dgDataProviderAzureDevOps = new DgDataProviderAzureDevOps(
      orgUrl,
      token
    );
    let gitDataProvider = await dgDataProviderAzureDevOps.getGitDataProvider();
    let json = await gitDataProvider.GetPullRequestComments(
      "tests",
      "68f2aee7-0864-458e-93ce-320303a080ed",
      73
    );
    expect(json.count).toBeDefined;
  });
  test("should create pullrequest thread", async () => {
    let data = {
      comments: [
        {
          parentCommentId: 0,
          content: "Should we add a comment about what this value means?",
          commentType: 1,
        },
      ],
      status: 1,
      threadContext: {
        filePath: "/assaf.txt",
        leftFileEnd: null,
        leftFileStart: null,
        rightFileEnd: {
          line: 2,
          offset: 1,
        },
        rightFileStart: {
          line: 2,
          offset: 5,
        },
      },
      pullRequestThreadContext: {
        changeTrackingId: 1,
        iterationContext: {
          firstComparingIteration: 1,
          secondComparingIteration: 1,
        },
      },
    };
    let dgDataProviderAzureDevOps = new DgDataProviderAzureDevOps(
      orgUrl,
      token
    );
    let gitDataProvider = await dgDataProviderAzureDevOps.getGitDataProvider();
    let json = await gitDataProvider.CreatePullRequestComment(
      "tests",
      "d3e3c3a9-ed5f-41e3-8885-8c5d8a672d33",
      73,
      data
    );
    expect(json.comment).toBeDefined;
  });
  test("should return commits with linked items in date range", async () => {
    let dgDataProviderAzureDevOps = new DgDataProviderAzureDevOps(
      orgUrl,
      token
    );
    let gitDataProvider = await dgDataProviderAzureDevOps.getGitDataProvider();
    // let commitRange = await gitDataProvider.GetCommitsInCommitRange(
    //   "tests",
    //   "68f2aee7-0864-458e-93ce-320303a080ed",
    //   "4ce7f96f74f10bb60d27d7180a8d1bd44da1ffac",
    //   "e46f8023be49db94b5cf188b41f7ba9db6fd8274"
    // );
    let commitRange = await gitDataProvider.GetCommitsInDateRange(
      "tests",
      "68f2aee7-0864-458e-93ce-320303a080ed",
      "2018-10-21T12:51:51Z",
      "2021-10-24T12:51:51Z",
    );
    let items = await gitDataProvider.GetItemsInCommitRange(
      "tests",
      "68f2aee7-0864-458e-93ce-320303a080ed",
      commitRange
    );
    expect(items[0].workItem).toBeDefined();
  });
  test("should return source trigger commit for pipline", async () => {
    let dgDataProviderAzureDevOps = new DgDataProviderAzureDevOps(
      orgUrl,
      token
    );
    let gitDataProvider = await dgDataProviderAzureDevOps.getGitDataProvider();
    let json = await gitDataProvider.GetCommitForPipeline("DevOps", 18732);
    expect(json).toBe("006faa1556e6788eea691fe922736b653818dba7");
  });
  test("should return commits in commit range", async () => {
    let dgDataProviderAzureDevOps = new DgDataProviderAzureDevOps(
      orgUrl,
      token
    );
    let gitDataProvider = await dgDataProviderAzureDevOps.getGitDataProvider();
    let json = await gitDataProvider.GetCommitsInCommitRange(
      "tests",
      "68f2aee7-0864-458e-93ce-320303a080ed",
      "4ce7f96f74f10bb60d27d7180a8d1bd44da1ffac",
      "e46f8023be49db94b5cf188b41f7ba9db6fd8274"
    );
    expect(json.count).toBeGreaterThan(0);
  });
  test("should return source trigger commit for pipline", async () => {
    let dgDataProviderAzureDevOps = new DgDataProviderAzureDevOps(
      orgUrl,
      token
    );
    let gitDataProvider = await dgDataProviderAzureDevOps.getGitDataProvider();
    let json = await gitDataProvider.GetCommitForPipeline("DevOps", 18732);
    expect(json).toBe("006faa1556e6788eea691fe922736b653818dba7");
  });
  test("should return items linked in build range", async () => {
    let dgDataProviderAzureDevOps = new DgDataProviderAzureDevOps(
      orgUrl,
      token
    );
    let gitDataProvider = await dgDataProviderAzureDevOps.getGitDataProvider();
    let json = await gitDataProvider.GetItemsForPipelinesRange(
      "tests",
      244,
      244
    );
    expect(json.length).toBe(1);
  });
  test("should return commits range between dates ", async () => {
    let dgDataProviderAzureDevOps = new DgDataProviderAzureDevOps(
      orgUrl,
      token
    );
    let gitDataProvider = await dgDataProviderAzureDevOps.getGitDataProvider();
    let json = await gitDataProvider.GetCommitsInDateRange(
      "tests",
      "68f2aee7-0864-458e-93ce-320303a080ed",
      "2018-10-21T12:51:51Z",
      "2021-10-24T12:51:51Z",
    );
    expect(json.count).toBe(14);
  });
}); //describe
