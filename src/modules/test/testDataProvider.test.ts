import DgDataProviderAzureDevOps from "../..";

require("dotenv").config();
jest.setTimeout(60000);

const orgUrl = process.env.ORG_URL;
const token = process.env.PAT;

describe("Test module - tests", () => {
  test("should return doc-gen-test - test plans", async () => {
    let dgDataProviderAzureDevOps = new DgDataProviderAzureDevOps(
        orgUrl,
        token
        );
    let TestDataProvider = await dgDataProviderAzureDevOps.getTestDataProvider();
    let json: any = await TestDataProvider.GetTestPlans("tests");
    expect(json.count).toBeGreaterThanOrEqual(1);
  });
  test("should return doc-gen-test - test suites by plan", async () => {
    let dgDataProviderAzureDevOps = new DgDataProviderAzureDevOps(
      orgUrl,
      token
      );
    let TestDataProvider = await dgDataProviderAzureDevOps.getTestDataProvider();
    let json: any = await TestDataProvider.GetTestPlans("tests");
    let testSuites = await TestDataProvider.GetTestSuitesByPlan(
      "tests",
      "",//planId
      true
    );
    expect(testSuites[4].name).toBe("suite3");//change test
  });
  test("should return list of test cases", async () => {
    let dgDataProviderAzureDevOps = new DgDataProviderAzureDevOps(
      orgUrl,
      token
      );
    let TestDataProvider = await dgDataProviderAzureDevOps.getTestDataProvider();
    let attachList: any = await TestDataProvider.GetTestCasesBySuites(
      "tests",
      "", //plan id
      "", //suite id
      true
    );
    expect(attachList.length > 0).toBeDefined();
  });
  test("should use Helper.findSuitesRecursive twice after restarting static value of Helper.first=True ", async () => {
    let dgDataProviderAzureDevOps = new DgDataProviderAzureDevOps(
      orgUrl,
      token
      );
    let TestDataProvider = await dgDataProviderAzureDevOps.getTestDataProvider();
    let attachList: any = await TestDataProvider.GetTestCasesBySuites(
      "tests",
      "", //plan id
      "", //suite id
      true
    );
    let suitesByPlan = await TestDataProvider.GetTestSuitesByPlan(
      "tests",
      "", //planId
      true
    );
    expect(suitesByPlan.length > 0).toBeDefined();
  });
  test("should return list of test cases - stress test - big testplan 1400 cases", async () => {
    jest.setTimeout(1000000);

    let dgDataProviderAzureDevOps = new DgDataProviderAzureDevOps(
      orgUrl,
      token
      );
    let TestDataProvider = await dgDataProviderAzureDevOps.getTestDataProvider();
    let attachList: any = await TestDataProvider.GetTestCasesBySuites(
      "tests",
      "", //plan id
      "", //suite id
      true
    );
    expect(attachList.length > 1000).toBeDefined(); //change test
  });
  test("should return doc-gen-test - test cases by suite", async () => {
    let dgDataProviderAzureDevOps = new DgDataProviderAzureDevOps(
      orgUrl,
      token
      );
    let TestDataProvider = await dgDataProviderAzureDevOps.getTestDataProvider();
    let json = await TestDataProvider.GetTestCases(
      "tests",
      "", //planId
      "" //suiteId
      );
    expect(json.count).toBeGreaterThan(0);
  });
  test("should return doc-gen-test - test points by testcase", async () => {
    let dgDataProviderAzureDevOps = new DgDataProviderAzureDevOps(
      orgUrl,
      token
      );
    let TestDataProvider = await dgDataProviderAzureDevOps.getTestDataProvider();
    let json = await TestDataProvider.GetTestPoint(
      "tests",
      "", //planId
      "", //suiteId
      "" //testCaseId
      );
    expect(json.count).toBeGreaterThan(0);
  });
  test("should return devops - test runs by testcaseid", async () => {
    let dgDataProviderAzureDevOps = new DgDataProviderAzureDevOps(
      orgUrl,
      token
      );
    let TestDataProvider = await dgDataProviderAzureDevOps.getTestDataProvider();
    let json = await TestDataProvider.GetTestRunById(
      "tests",
      "" //run id
      );
    expect(json.id).toBe(51);
  });
}); //describe
describe("create run test  according test pointId", () => {
    test("should return OK(200) as response ", async () => {
      let dgDataProviderAzureDevOps = new DgDataProviderAzureDevOps(
        orgUrl,
        token
        );
      let TestDataProvider = await dgDataProviderAzureDevOps.getTestDataProvider();
        let result: any = await TestDataProvider.CreateTestRun(
        "tests",
        "", //testRunName
        "", //testPlanId
        "" //testPointId
      );
      expect(result.status).toBe(200);
    });
  });
  
  describe("Update runId state", () => {
    test.skip("should return OK(200) as response ", async () => {
      let dgDataProviderAzureDevOps = new DgDataProviderAzureDevOps(
        orgUrl,
        token
        );
      let TestDataProvider = await dgDataProviderAzureDevOps.getTestDataProvider();
      let result: any = await TestDataProvider.UpdateTestRun(
        "tests",
        "", //runId
        "Completed" //Unspecified ,NotStarted, InProgress, Completed, Waiting, Aborted, NeedsInvestigation (State)
      );
      expect(result.status).toBe(200);
    });
  });
  
  describe("Update test case state", () => {
    test("should return OK(200) as response ", async () => {
      let dgDataProviderAzureDevOps = new DgDataProviderAzureDevOps(
        orgUrl,
        token
        );
      let TestDataProvider = await dgDataProviderAzureDevOps.getTestDataProvider();
      let result: any = await TestDataProvider.UpdateTestCase(
        "tests",
        "", //runId
        1 //0-reset , 1-complite , 2-passed , 3-failed (State)
      );
      expect(result.status).toBe(200);
    });
  });
  
  describe("Upload attachment for test run", () => {
    test("should return OK(200) as response ", async () => {
      let dgDataProviderAzureDevOps = new DgDataProviderAzureDevOps(
        orgUrl,
        token
        );
      let TestDataProvider = await dgDataProviderAzureDevOps.getTestDataProvider();
      let data = "This is test line of data";
      let buff = new Buffer(data);
      let base64data = buff.toString("base64");
      let result: any = await TestDataProvider.UploadTestAttachment(
        "", //runID
        "tests",
        base64data, //stream
        "testAttachment2.json", //fileName
        "Test attachment upload", //comment
        "GeneralAttachment" //attachmentType
      );
      expect(result.status).toBe(200);
    });
  });
  
  describe("Get all test case data", () => {
    test("should return OK(200) as response ", async () => {
      let dgDataProviderAzureDevOps = new DgDataProviderAzureDevOps(
        orgUrl,
        token
        );
      let TestDataProvider = await dgDataProviderAzureDevOps.getTestDataProvider();
      let result: any = await TestDataProvider.GetTestSuiteByTestCase(
        "" //testCaseId
      );
      expect(result).toBeDefined;
    });
  });
  
  //GetTestPointByTestCaseId
  describe("Get test points by test case id", () => {
    test("should return OK(200) as response ", async () => {
      let dgDataProviderAzureDevOps = new DgDataProviderAzureDevOps(
        orgUrl,
        token
        );
      let TestDataProvider = await dgDataProviderAzureDevOps.getTestDataProvider();
      let result: any = await TestDataProvider.GetTestPointByTestCaseId(
        "tests",
        "" //testCaseId
        );
      expect(result).toBeDefined;
    });
  });
  
  