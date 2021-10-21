import DgDataProviderAzureDevOps from "../..";

require("dotenv").config();
jest.setTimeout(10000);

const orgUrl = process.env.ORG_URL;
const token = process.env.PAT;

describe("git module - tests", () => {
  test("should return repo list for teamProject", async () => {
    let dgDataProviderAzureDevOps = new DgDataProviderAzureDevOps(orgUrl, token);
    let json: any = await dgDataProviderAzureDevOps.getGitDataProvider().GetTeamProjectGitReposList(
      "tests"
    );
    expect(json).toBeDefined();
  });
  test("should return repo from repoid", async () => {
    let dgDataProviderAzureDevOps = new DgDataProviderAzureDevOps(orgUrl, token);
    let json: any = await dgDataProviderAzureDevOps.getGitDataProvider().GetGitRepoFromRepoId(
      "68f2aee7-0864-458e-93ce-320303a080ed"
    );
    expect(json).toBeDefined();
  });
  test("should return repo by pullrequest id", async () => {
    let dgDataProviderAzureDevOps = new DgDataProviderAzureDevOps(orgUrl, token);
    let json: any = await dgDataProviderAzureDevOps.getGitDataProvider().GetGitRepoFromPrId(73);
    expect(json.repository).toBeDefined();
  });
  test("should return commits by pullrequest & repo id", async () => {
    let dgDataProviderAzureDevOps = new DgDataProviderAzureDevOps(orgUrl, token);
    let json: any = await dgDataProviderAzureDevOps.getGitDataProvider().GetGitRepoFromPrId(73);
    let commitJson: any = await dgDataProviderAzureDevOps.getGitDataProvider().GetPullRequestCommits(
      json.repository.id,
      73
    );
    expect(commitJson.value.length).toBeGreaterThan(0);
  });
  test("should return pullrequest threads", async () => {
    let dgDataProviderAzureDevOps = new DgDataProviderAzureDevOps(orgUrl, token);
    let json = await dgDataProviderAzureDevOps.getGitDataProvider().GetPullRequestComments(
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
    let dgDataProviderAzureDevOps = new DgDataProviderAzureDevOps(orgUrl, token);
    let json = await dgDataProviderAzureDevOps.getGitDataProvider().CreatePullRequestComment(
      "tests",
      "d3e3c3a9-ed5f-41e3-8885-8c5d8a672d33",
      73,
      data
    );
    expect(json.comment).toBeDefined;
  });
  test("should return commits with linked items in sha raneg", async () => {
    let dgDataProviderAzureDevOps = new DgDataProviderAzureDevOps(orgUrl, token);
    let json = await dgDataProviderAzureDevOps.getGitDataProvider().GetItemsInCommitRange(
      "tests",
      "68f2aee7-0864-458e-93ce-320303a080ed",
      "e46f8023be49db94b5cf188b41f7ba9db6fd8274",
      "4ce7f96f74f10bb60d27d7180a8d1bd44da1ffac"
    );
    expect(json[0].workItem).toBeDefined();
  });
  test("should return source trigger commit for pipline", async () => {
    let dgDataProviderAzureDevOps = new DgDataProviderAzureDevOps(orgUrl, token);
    let json = await dgDataProviderAzureDevOps.getGitDataProvider().GetCommitForPipeline("DevOps", 18732);
    expect(json).toBe("006faa1556e6788eea691fe922736b653818dba7");
  });
  test.skip("should return items linked in build range", async () => {
    jest.setTimeout(1000000);
    let dgDataProviderAzureDevOps = new DgDataProviderAzureDevOps(orgUrl, token);
    let json = await dgDataProviderAzureDevOps.getGitDataProvider().GetItemsForPipelinesRange("DevOps", 18492, 18885);
    expect(json.length).toBe(3);
  });
  test("should return commits range between dates ", async () => {
    jest.setTimeout(1000000);
    let dgDataProviderAzureDevOps = new DgDataProviderAzureDevOps(orgUrl, token);
    let json = await dgDataProviderAzureDevOps.getGitDataProvider().GetCommitsInDateRange(
      "DevOps",
      "95c0c5dd-fefd-411e-bb6b-850e7ce7732a",
      "2021-01-30T12:51:51Z",
      "2021-06-30T12:51:51Z"
    );
    expect(json.count).toBe(15);
  });
}); //describe