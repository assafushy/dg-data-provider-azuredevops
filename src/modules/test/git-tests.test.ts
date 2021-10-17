import { Workitem } from "../../models/tfs-data";
import logger from "utils/logger";
import { Console } from "winston/lib/winston/transports";
import AzureRestApi from "../..";
import { writeFileSync } from "fs";

require("dotenv").config();

const orgUrl = process.env.ORG_URL;
const token = process.env.PAT;

const wiql =
  "SELECT [System.Id],[System.WorkItemType],[System.Title],[System.AssignedTo],[System.State],[System.Tags] FROM workitems WHERE [System.TeamProject]=@project";

describe("git module - tests", () => {
  test("should return repo from repoid", async () => {
    const orgUrl = "<org-url> //!!chaanged";
    const token = "<pat-url> //!!chaanged";
    let restApi = new AzureRestApi(orgUrl, token);
    let json: any = await restApi.GetGitRepoFromRepoId(
      "95c0c5dd-fefd-411e-bb6b-850e7ce7732a"
    );
    expect(json).toBeDefined();
  });
  test("should return doc-gen-test - repo by pullrequest id", async () => {
    let restApi = new AzureRestApi(orgUrl, token);
    let json: any = await restApi.GetGitRepoFromPrId(71);
    expect(json.repository).toBeDefined();
  });
  test("should return doc-gen-test - commits by pullrequest & repo id", async () => {
    let restApi = new AzureRestApi(orgUrl, token);
    let json: any = await restApi.GetGitRepoFromPrId(71);
    let commitJson: any = await restApi.GetPullRequestCommits(
      json.repository.id,
      71
    );
    expect(commitJson.value.length).toBeGreaterThan(0);
  });
  test("should return pullrequest threads", async () => {
    let restApi = new AzureRestApi(orgUrl, token);
    let json = await restApi.GetPullRequestComments(
      "DevOps",
      "d3e3c3a9-ed5f-41e3-8885-8c5d8a672d33",
      72
    );
    expect(json.count).toBeDefined;
  });
  test("should return pullrequest threads id", async () => {
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
        filePath: "/1.txt",
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
    let restApi = new AzureRestApi(orgUrl, token);
    let json = await restApi.CreatePullRequestComment(
      "DevOps",
      "d3e3c3a9-ed5f-41e3-8885-8c5d8a672d33",
      72,
      data
    );
    expect(json.comment).toBeDefined;
  });
  test("should return commits with linked items in sha raneg", async () => {
    jest.setTimeout(1000000);
    const orgUrl = "<org-url> //!!chaanged";
    const token = "<pat-url> //!!chaanged";
    let restApi = new AzureRestApi(orgUrl, token);
    let json = await restApi.GetItemsInCommitRange(
      "DevOps",
      "95c0c5dd-fefd-411e-bb6b-850e7ce7732a",
      "8c28d91d34674512c20d13e06cd1c5bf8b67d5e5",
      "f298b76660a6567c87cb59ff29a587c872f86e7e"
    );
    expect(json[0].workItem).toBeDefined();
  });
  test("should return source trigger commit for pipline", async () => {
    jest.setTimeout(1000000);
    const orgUrl = "<org-url> //!!chaanged";
    const token = "<pat-url> //!!chaanged";
    let restApi = new AzureRestApi(orgUrl, token);
    let json = await restApi.GetCommitForPipeline("DevOps", 18732);
    expect(json).toBe("006faa1556e6788eea691fe922736b653818dba7");
  });
  test.skip("should return items linked in build range", async () => {
    jest.setTimeout(1000000);
    const orgUrl = "<org-url> //!!chaanged";
    const token = "<pat-url> //!!chaanged";
    let restApi = new AzureRestApi(orgUrl, token);
    let json = await restApi.GetItemsForPipelinesRange("DevOps", 18492, 18885);
    expect(json.length).toBe(3);
  });
  test("should return commits range between dates ", async () => {
    jest.setTimeout(1000000);
    const orgUrl = "<org-url> //!!chaanged";
    const token = "<pat-url> //!!chaanged";
    let restApi = new AzureRestApi(orgUrl, token);
    let json = await restApi.GetCommitsInDateRange(
      "DevOps",
      "95c0c5dd-fefd-411e-bb6b-850e7ce7732a",
      "2021-01-30T12:51:51Z",
      "2021-06-30T12:51:51Z"
    );
    expect(json.count).toBe(15);
  });
}); //describe
