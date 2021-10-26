import DgDataProviderAzureDevOps from "../..";

require("dotenv").config();

const orgUrl = process.env.ORG_URL;
const token = process.env.PAT;

describe("Common functions module - tests", () => {
  test("should return all collecttion projects", async () => {
    let dgDataProviderAzdo = new DgDataProviderAzureDevOps(orgUrl, token);
    let managmentDataProvider = await dgDataProviderAzdo.getMangementDataProvider();
    let json = await managmentDataProvider.GetProjects();
    expect(json.count).toBeGreaterThan(1);
  });
  test("should return project by name", async () => {
    let dgDataProviderAzdo = new DgDataProviderAzureDevOps(orgUrl, token);
    let managmentDataProvider = await dgDataProviderAzdo.getMangementDataProvider();
    let json = await managmentDataProvider.GetProjectByName("tests");
    expect(json.name).toBe("tests");
  });
  test("should return project by id", async () => {
    let dgDataProviderAzdo = new DgDataProviderAzureDevOps(orgUrl, token);
    let managmentDataProvider = await dgDataProviderAzdo.getMangementDataProvider();
    let json = await managmentDataProvider.GetProjectByID(
      "45a48633-890c-42bb-ace3-148d17806857"
    );
    expect(json.name).toBe("tests");
  });
  test("should return all collecttion link types", async () => {
    let dgDataProviderAzdo = new DgDataProviderAzureDevOps(orgUrl, token);
    let managmentDataProvider = await dgDataProviderAzdo.getMangementDataProvider();
    let json = await managmentDataProvider.GetCllectionLinkTypes();
    expect(json.count).toBeGreaterThan(1);
  });
}); //describe