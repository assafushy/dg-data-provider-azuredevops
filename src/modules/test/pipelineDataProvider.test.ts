import DgDataProviderAzureDevOps from "../..";

require("dotenv").config();
jest.setTimeout(25000);

const orgUrl = process.env.ORG_URL;
const token = process.env.PAT;

describe("pipeline module - tests", () => {
  test("should return pipeline info", async () => {
    let dgDataProviderAzureDevOps = new DgDataProviderAzureDevOps(
      orgUrl,
      token
    );
    let pipelinesDataProvider = await dgDataProviderAzureDevOps.getPipelinesDataProvider()
    let json = await pipelinesDataProvider.getPipelineFromPipelineId(
      "tests",
      244
    );
    expect(json.id).toBe(244);
  });
  test("should return Release definition", async () => {
    let dgDataProviderAzureDevOps = new DgDataProviderAzureDevOps(
      orgUrl,
      token
    );
    let pipelinesDataProvider = await dgDataProviderAzureDevOps.getPipelinesDataProvider()
    let json = await pipelinesDataProvider.GetReleaseByReleaseId(
      "tests",
      1
    );
    expect(json.id).toBe(1);
  });
  test("should return OK(200) as response ", async () => {
    let dgDataProviderAzureDevOps = new DgDataProviderAzureDevOps(
      orgUrl,
      token
    );
    let PipelineDataProvider = await dgDataProviderAzureDevOps.getPipelinesDataProvider();
    let result = await PipelineDataProvider.TriggerBuildById(
      "tests",
      "14" ,
      '{"test":"param1","age":"26","name":"denis" }'
    );
    expect(result.status).toBe(200);
  });
  test("should the path to zip file as response ", async () => {
    let dgDataProviderAzureDevOps = new DgDataProviderAzureDevOps(
      orgUrl,
      token
    );
    let PipelineDataProvider = await dgDataProviderAzureDevOps.getPipelinesDataProvider();
    let result = await PipelineDataProvider.GetArtifactByBuildId(
      "tests",
      "245", //buildId
      "_tests" //artifactName
    );
    expect(result).toBeDefined();
  });
});

