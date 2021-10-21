// import AzureRestApi from "../..";

// require("dotenv").config();

// const orgUrl = process.env.ORG_URL;
// const token = process.env.PAT;

// const wiql =
//   "SELECT [System.Id],[System.WorkItemType],[System.Title],[System.AssignedTo],[System.State],[System.Tags] FROM workitems WHERE [System.TeamProject]=@project";

// describe("ticket data module - tests", () => {
  
//    //describe
// describe("Work items manipulations - tests", () => {
//   test("should create a new work item", async () => {
//     let restApi = new AzureRestApi.(orgUrl, token);
//     let body = [
//       {
//         op: "add",
//         path: "/fields/System.IterationPath",
//         value: "doc-gen-test",
//       },
//       { op: "add", path: "/fields/System.State", value: "Proposed" },
//       { op: "add", path: "/fields/System.AreaPath", value: "doc-gen-test" },
//       { op: "add", path: "/fields/System.Title", value: "test" },
//       {
//         op: "add",
//         path: "/fields/System.Tags",
//         value: "tag-test",
//       },
//       {
//         op: "add",
//         path: "/fields/System.AssignedTo",
//         value: "ELBIT_NT\\\\test",
//       },
//       {
//         op: "add",
//         path: "/fields/Microsoft.VSTS.Scheduling.TargetDate",
//         value: "2020-07-09",
//       },
//     ];
//     let res = await restApi.get  CreateNewWorkItem(
//       "doc-gen-test",
//       body,
//       "Epic",
//       true
//     );
//     expect(typeof res.id).toBe("number");
//     body[3].value = "edited";
//     res = await restApi.UpdateWorkItem("doc-gen-test", body, res.id, true);
//     expect(res.fields["System.Title"]).toBe("edited");
//   });
// }); //describe
// describe("Queries module - tests", () => {
//   test("should return doc-gen-test shared queires", async () => {
//     let restApi = new AzureRestApi(orgUrl, token);
//     let json = await restApi.GetSharedQueries("doc-gen-test", "");
//     expect(json.length).toBeGreaterThan(1);
//   });

//   test("should return doc-gen-test query results", async () => {
//     let restApi = new AzureRestApi(orgUrl, token);
//     let json = await restApi.GetSharedQueries("doc-gen-test", "");
//     let query = json.find((o: { wiql: undefined }) => o.wiql != undefined);
//     let result = await restApi.GetQueryResultsByWiqlHref(
//       query.wiql.href,
//       "doc-gen-test"
//     );
//     expect(result.length).toBeGreaterThanOrEqual(1);
//   });
//   test("should return doc-gen-test query results by query id", async () => {
//     let restApi = new AzureRestApi(orgUrl, token);
//     let result = await restApi.GetQueryResultById(
//       "88402386-34fb-4074-bb9f-a75a0ac24c6f",
//       "doc-gen-test"
//     );
//     expect(result.length).toBeGreaterThanOrEqual(1);
//   });
//   test("should return wi base on wiql string", async () => {
//     let restApi = new AzureRestApi(orgUrl, token);
//     let result = await restApi.GetQueryResultsByWiqlString(
//       wiql,
//       "doc-gen-test"
//     );
//     expect(result.workItems.length).toBeGreaterThanOrEqual(1);
//   });
//   test("should return populated work items array", async () => {
//     let restApi = new AzureRestApi(orgUrl, token);
//     let result = await restApi.GetQueryResultsByWiqlString(
//       wiql,
//       "doc-gen-test"
//     );
//     let wiarray = result.workItems.map((o: any) => o.id);
//     let res = await restApi.PopulateWorkItemsByIds(wiarray, "doc-gen-test");
//     expect(res.length).toBeGreaterThanOrEqual(1);
//   });
// }); //describe
// describe("Test module - tests", () => {
//   test("should return doc-gen-test - test plans", async () => {
//     let restApi = new AzureRestApi(orgUrl, token);
//     let json: any = await restApi.GetTestPlans("doc-gen-test");
//     expect(json.count).toBeGreaterThanOrEqual(1);
//   });
//   test("should return doc-gen-test - test suites by plan", async () => {
//     let restApi = new AzureRestApi(orgUrl, token);
//     let json: any = await restApi.GetTestPlans("doc-gen-test");
//     let testSuites = await restApi.GetTestSuitesByPlan(
//       "doc-gen-test",
//       "2258",
//       true
//     );
//     expect(testSuites[4].name).toBe("suite3");
//   });
//   test("should return list of test cases", async () => {
//     let restApi = new AzureRestApi(orgUrl, token);
//     let attachList: any = await restApi.GetTestCasesBySuites(
//       "doc-gen-test",
//       "148",
//       "153",
//       true
//     );
//     expect(attachList.length > 0).toBeDefined();
//   });
//   test("should use Helper.findSuitesRecursive twice after restarting static value of Helper.first=True ", async () => {
//     let restApi = new AzureRestApi(orgUrl, token);
//     let attachList: any = await restApi.GetTestCasesBySuites(
//       "doc-gen-test",
//       "148",
//       "153",
//       true
//     );
//     let suitesByPlan = await restApi.GetTestSuitesByPlan(
//       "devops",
//       "1828",
//       true
//     );
//     expect(suitesByPlan.length > 0).toBeDefined();
//   });
//   test("should return list of test cases - stress test - big testplan 1400 cases", async () => {
//     jest.setTimeout(1000000);

//     let restApi = new AzureRestApi(orgUrl, token);
//     let attachList: any = await restApi.GetTestCasesBySuites(
//       "Tactical-C4I",
//       "52909",
//       "52910",
//       true
//     );
//     expect(attachList.length > 1000).toBeDefined();
//   });
//   test("should return doc-gen-test - test cases by suite", async () => {
//     let restApi = new AzureRestApi(orgUrl, token);
//     let json = await restApi.GetTestCases("doc-gen-test", "148", "153");
//     expect(json.count).toBeGreaterThan(0);
//   });
//   test("should return doc-gen-test - test points by testcase", async () => {
//     let restApi = new AzureRestApi(orgUrl, token);
//     let json = await restApi.GetTestPoint("devops", "1828", "2170", "2235");
//     expect(json.count).toBeGreaterThan(0);
//   });
//   test("should return devops - test runs by testcaseid", async () => {
//     let restApi = new AzureRestApi(orgUrl, token);
//     let json = await restApi.GetTestRunById("devops", "51");
//     expect(json.id).toBe(51);
//   });
// }); //describe

// describe("get attachments from work item - tests", () => {
//   test("should return list of attachments", async () => {
//     let restApi = new AzureRestApi(orgUrl, token);
//     let attachList: any = await restApi.GetWorkitemAttachments(
//       "DevOps",
//       "2171"
//     );
//     expect(attachList.length > 0).toBeDefined();
//   });
// }); //describe

// describe("get attachment JSON data from work item - test", () => {
//   test("should return Json data of the attachment", async () => {
//     let restApi = new AzureRestApi(orgUrl, token);
//     let attachedData: any = await restApi.GetWorkitemAttachmentsJSONData(
//       "DevOps",
//       "b1e3d064-6d92-4231-bd6b-3baa1a4aa2b3"
//     );
//     expect(JSON.stringify(attachedData).length > 0).toBeDefined();
//   });
// }); //describe

// describe("get links from workitems ", () => {
//   test("should return list of id & link object", async () => {
//     let restApi = new AzureRestApi(orgUrl, token);
//     let attachList: any = await restApi.GetLinksByIds("DevOps", [2016, 2017]);
//     expect(attachList.length).toBeGreaterThan(0);
//   });
// }); //describe

// describe("Send Post Request for running classic build with passing parameter ", () => {
//   test("should return OK(200) as response ", async () => {
//     let restApi = new AzureRestApi(orgUrl, token);
//     let result: any = await restApi.TriggerBuildById(
//       "DevOps",
//       "32",
//       '{"Test":"567","age":"40","name":"daniel","occupation":"bla bla bla" }'
//     );
//     expect(result.status).toBe(200);
//   });
// });

// describe("Send Get Request for Artifact ", () => {
//   test("should the path to zip file as response ", async () => {
//     let restApi = new AzureRestApi(orgUrl, token);
//     let result: string = await restApi.GetArtifactByBuildId(
//       "DevOps",
//       "1507",
//       "drop"
//     );
//     expect(result).toBeDefined();
//   });
// });

// describe("create run test  according test pointId", () => {
//   test("should return OK(200) as response ", async () => {
//     let restApi = new AzureRestApi(orgUrl, token);
//     let result: any = await restApi.CreateTestRun(
//       "Devops",
//       "Run of new test",
//       "1828",
//       "626"
//     );
//     expect(result.status).toBe(200);
//   });
// });

// describe("Update runId state", () => {
//   test.skip("should return OK(200) as response ", async () => {
//     let restApi = new AzureRestApi(orgUrl, token);
//     let result: any = await restApi.UpdateTestRun(
//       "Devops",
//       "73",
//       "Completed" //Unspecified ,NotStarted, InProgress, Completed, Waiting, Aborted, NeedsInvestigation
//     );
//     expect(result.status).toBe(200);
//   });
// });

// describe("Update test case state", () => {
//   test("should return OK(200) as response ", async () => {
//     let restApi = new AzureRestApi(orgUrl, token);
//     let result: any = await restApi.UpdateTestCase(
//       "Devops",
//       "119",
//       1 //0-reset , 1-complite , 2-passed , 3-failed
//     );
//     expect(result.status).toBe(200);
//   });
// });

// describe("Upload attachment for test run", () => {
//   test("should return OK(200) as response ", async () => {
//     let restApi = new AzureRestApi(orgUrl, token);
//     let data = "This is test line of data";
//     let buff = new Buffer(data);
//     let base64data = buff.toString("base64");
//     let result: any = await restApi.UploadTestAttachment(
//       "166",
//       "Devops",
//       base64data,
//       "testAttachment2.json",
//       "Test attachment upload",
//       "GeneralAttachment"
//     );
//     expect(result.status).toBe(200);
//   });
// });

// describe("Get all test case data", () => {
//   test("should return OK(200) as response ", async () => {
//     let restApi = new AzureRestApi(orgUrl, token);
//     let result: any = await restApi.GetTestSuiteByTestCase("2235");
//     expect(result).toBeDefined;
//   });
// });

// //GetTestPointByTestCaseId
// describe("Get test points by test case id", () => {
//   test("should return OK(200) as response ", async () => {
//     let restApi = new AzureRestApi(orgUrl, token);
//     let result: any = await restApi.GetTestPointByTestCaseId("Devops", "2235");
//     expect(result).toBeDefined;
//   });
// });
