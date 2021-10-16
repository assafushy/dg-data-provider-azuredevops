import AzureRestApi from "../src";
import { writeFileSync } from "fs";

require("dotenv").config();

const orgUrl = process.env.ORG_URL;
const token = process.env.PAT;

const wiql =
  "SELECT [System.Id],[System.WorkItemType],[System.Title],[System.AssignedTo],[System.State],[System.Tags] FROM workitems WHERE [System.TeamProject]=@project";

describe("Release module - tests", () => {
  test("should return Release definition", async () => {
    const orgUrl = "<org-url> //!!chaanged";
    const token = "<pat> //!!chaanged";
    let restApi = new AzureRestApi(orgUrl, token);
    let json: any = await restApi.GetReleaseByReleaseId("Devops", 180);
    writeFileSync("releaseDef.json", JSON.stringify(json));
    expect(json).toBeDefined();
  });
}); //describe
