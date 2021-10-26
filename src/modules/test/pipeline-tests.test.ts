import logger from "../../utils/logger";
import DgDataProviderAzureDevOps from "../..";

require("dotenv").config();
jest.setTimeout(10000);

const orgUrl = process.env.ORG_URL;
const token = process.env.PAT;

describe("pipeline related tests", () => {
  test("should return pipeline info", async () => {
    let dgDataProviderAzureDevOps = new DgDataProviderAzureDevOps(orgUrl, token);
    let pipelinesDataProvider = await dgDataProviderAzureDevOps.getPipelinesDataProvider()
    let json = await pipelinesDataProvider.getPipelineFromPipelineId("tests", 244);
    expect(json.id).toBe(244);
  });
  test("should return Release definition", async () => {
    let dgDataProviderAzureDevOps = new DgDataProviderAzureDevOps(orgUrl, token);
    let pipelinesDataProvider = await dgDataProviderAzureDevOps.getPipelinesDataProvider()
    let json: any = await pipelinesDataProvider.GetReleaseByReleaseId("tests",1);
    expect(json).toBeDefined();
  });
});
