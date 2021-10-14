import { Workitem } from "./../models/tfs-data";
import { TFSServices } from "../helpers/tfs";
import { Helper, suiteData, Links, Trace, Relations } from "../helpers/helper";
import { Query, TestSteps } from "../models/tfs-data";
import { QueryType } from "../models/tfs-data";
import { QueryAllTypes } from "../models/tfs-data";
import { Column } from "../models/tfs-data";
import { value } from "../models/tfs-data";
import { TestCase } from "../models/tfs-data";
import * as xml2js from "xml2js";

import logger from "./utils/logger";

export default class AzureRestApi {
  orgUrl = "";
  token = "";
  queriesList: Array<any> = new Array<any>();

  constructor(orgUrl: string, token: string) {
    this.orgUrl = orgUrl;
    this.token = token;
  }

  // get project by  name return project object
  async GetProjectByName(projectName: string): Promise<any> {
    try {
      let projects: any = await this.GetProjects();
      for (let i = 0; i < projects.value.length; i++) {
        if (projects.value[i].name === projectName) return projects.value[i];
      }
      return {};
    } catch (err) {
      console.log(err);
      return {};
    }
  }

  // get project by id return project object
  async GetProjectByID(projectID: string): Promise<any> {
    let projectUrl: string =
      this.orgUrl + "_apis/projects/" + projectID + "?api-version=5.1";
    let project: any = await TFSServices.getItemContent(projectUrl, this.token);
    return project;
  }

  //get all projects in the collection
  async GetProjects(): Promise<any> {
    let projectUrl: string = this.orgUrl + "_apis/projects?api-version=5.1";
    let projects: any = await TFSServices.getItemContent(
      projectUrl,
      this.token
    );
    return projects;
  }

  async GetTestSuiteByTestCase(testCaseId: string): Promise<any> {
    let url =
      this.orgUrl +
      `/_apis/testplan/suites?testCaseId=${testCaseId}&api-version=5.0`;
    let testCaseData = await TFSServices.getItemContent(url, this.token);
    return testCaseData;
  }

  //get all test plans in the project
  async GetTestPlans(project: string): Promise<string> {
    let testPlanUrl: string =
      this.orgUrl + project + "/_apis/test/plans/?api-version=5.0";
    let testPlans: any = await TFSServices.getItemContent(
      testPlanUrl,
      this.token
    );
    return testPlans;
  }

  // get all test suits in projct test plan
  async GetTestSuites(project: string, planId: string): Promise<any> {
    let testsuitesUrl: string =
      this.orgUrl + project + "/_apis/test/Plans/" + planId + "/suites/";
    try {
      let testSuites = await TFSServices.getItemContent(
        testsuitesUrl,
        this.token
      );
      return testSuites;
    } catch (e) {}
  }

  async GetTestSuitesForPlan(project: string, planid: string): Promise<any> {
    let url =
      this.orgUrl +
      "/" +
      project +
      "/_api/_testManagement/GetTestSuitesForPlan?__v=5&planId=" +
      planid;
    let suites = await TFSServices.getItemContent(url, this.token);
    return suites;
  }

  async GetTestSuitesByPlan(
    project: string,
    planId: string,
    recursive: boolean
  ): Promise<any> {
    let suiteId = Number(planId) + 1;
    let suites = await this.GetTestSuiteById(
      project,
      planId,
      suiteId.toString(),
      recursive
    );
    return suites;
  }
  //gets all testsuits recorsivly under test suite
  async GetTestSuiteById(
    project: string,
    planId: string,
    suiteId: string,
    recursive: boolean
  ): Promise<any> {
    let testSuites = await this.GetTestSuitesForPlan(project, planId);
    // GetTestSuites(project, planId);
    Helper.suitList = [];
    let dataSuites: any = Helper.findSuitesRecursive(
      planId,
      this.orgUrl,
      project,
      testSuites.testSuites,
      suiteId,
      recursive
    );
    Helper.first = true;
    // let levledSuites: any = Helper.buildSuiteslevel(dataSuites);

    return dataSuites;
  }
  //gets all testcase under test suite acording to recursive flag
  async GetTestCasesBySuites(
    project: string,
    planId: string,
    suiteId: string,
    recursiv: boolean
  ): Promise<Array<any>> {
    let testCasesList: Array<any> = new Array<any>();
    let suitesTestCasesList: Array<suiteData> = await this.GetTestSuiteById(
      project,
      planId,
      suiteId,
      recursiv
    );
    for (let i = 0; i < suitesTestCasesList.length; i++) {
      let testCases: any = await this.GetTestCases(
        project,
        planId,
        suitesTestCasesList[i].id
      );
      let testCseseWithSteps: any = await this.StructureTestCase(
        project,
        testCases,
        suitesTestCasesList[i]
      );
      if (testCseseWithSteps.length > 0)
        testCasesList = [...testCasesList, ...testCseseWithSteps];
    }
    return testCasesList;
  }
  async StructureTestCase(
    project: string,
    testCases: any,
    suite: suiteData
  ): Promise<Array<any>> {
    let url = this.orgUrl + project + "/_workitems/edit/";
    let testCasesUrlList: Array<any> = new Array<any>();
    //let tesrCase:TestCase;
    for (let i = 0; i < testCases.count; i++) {
      let test: any = await TFSServices.getItemContent(
        testCases.value[i].testCase.url,
        this.token
      );
      let testCase: TestCase = new TestCase();
      testCase.title = test.fields["System.Title"];
      testCase.area = test.fields["System.AreaPath"];
      testCase.description = test.fields["System.Description"];
      testCase.url = url + test.id;
      //testCase.steps = test.fields["Microsoft.VSTS.TCM.Steps"];
      testCase.id = test.id;
      testCase.suit = suite.id;
      if (test.fields["Microsoft.VSTS.TCM.Steps"] != null) {
        let steps: Array<TestSteps> = this.ParseSteps(
          test.fields["Microsoft.VSTS.TCM.Steps"]
        );
        testCase.steps = steps;
      }

      testCasesUrlList.push(testCase);
    }

    return testCasesUrlList;
  }
  ParseSteps(steps: String) {
    let stepsLsist: Array<TestSteps> = new Array<TestSteps>();
    const start: string = ";P&gt;";
    const end: string = "&lt;/P";
    let totalString: String = steps;
    xml2js.parseString(steps, function (err, result) {
      if (err) console.log(err);
      if (result.steps.step != null)
        for (let i = 0; i < result.steps.step.length; i++) {
          let step: TestSteps = new TestSteps();
          try {
            if (result.steps.step[i].parameterizedString[0]._ != null)
              step.action = result.steps.step[
                i
              ].parameterizedString[0]._.replace(/<BR ?\/?>/g, "\n").replace(
                /<[^>]*>?/gm,
                ""
              );
          } catch (e) {
            logger.warn(`No test step action data to parse for testcase `);
          }
          try {
            if (result.steps.step[i].parameterizedString[1]._ != null)
              step.expected = result.steps.step[
                i
              ].parameterizedString[1]._.replace(/<[^>]*>?/gm, "");
          } catch (e) {
            logger.warn(`No test step expected data to parse for testcase `);
          }
          stepsLsist.push(step);
        }
    });

    return stepsLsist;
  }
  async GetTestCases(
    project: string,
    planId: string,
    suiteId: string
  ): Promise<any> {
    let testCaseUrl: string =
      this.orgUrl +
      project +
      "/_apis/test/Plans/" +
      planId +
      "/suites/" +
      suiteId +
      "/testcases/";
    let testCases: any = await TFSServices.getItemContent(
      testCaseUrl,
      this.token
    );
    return testCases;
  }
  //gets all test point in a test case
  async GetTestPoint(
    project: string,
    planId: string,
    suiteId: string,
    testCaseId: string
  ): Promise<any> {
    let testPointUrl: string =
      this.orgUrl +
      project +
      "/_apis/test/Plans/" +
      planId +
      "/Suites/" +
      suiteId +
      "/points?testCaseId=" +
      testCaseId +
      "&api-version=5.1";
    let testPoints: any = await TFSServices.getItemContent(
      testPointUrl,
      this.token
    );
    return testPoints;
  }
  async GetWorkItem(project: string, id: string): Promise<any> {
    let wiuRL =
      this.orgUrl + project + "/_apis/wit/workitems/" + id + "?$expand=All";
    let wi = await TFSServices.getItemContent(wiuRL, this.token);
    return wi;
  }
  async GetLinksByIds(project: string, ids: any) {
    var trace: Array<Trace> = new Array<Trace>();
    let wis = await this.PopulateWorkItemsByIds(ids, project);
    let linksMap: any = await this.GetRelationsIds(wis);

    let relations;
    for (let i = 0; i < wis.length; i++) {
      let traceItem: Trace; //= new Trace();
      traceItem = await this.GetParentLink(project, wis[i]);

      if (linksMap.get(wis[i].id).rels.length > 0) {
        relations = await this.PopulateWorkItemsByIds(
          linksMap.get(wis[i].id).rels,
          project
        );
        traceItem.links = await this.GetLinks(project, wis[i], relations);
      }
      trace.push(traceItem);
    }
    return trace;
  }
  async GetParentLink(project: string, wi: any) {
    let trace: Trace = new Trace();
    if (wi != null) {
      trace.id = wi.id;
      trace.title = wi.fields["System.Title"];
      trace.url = this.orgUrl + project + "/_workitems/edit/" + wi.id;
      if (
        wi.fields["System.CustomerId"] != null &&
        wi.fields["System.CustomerId"] != undefined
      ) {
        trace.customerId = wi.fields["System.CustomerId"];
      }
    }
    return trace;
  }
  async GetRelationsIds(ids: any) {
    //let links: Array<Relations> = new Array<Relations>();

    let rel = new Map<string, Relations>();
    try {
      for (let i = 0; i < ids.length; i++) {
        var link = new Relations();
        link.id = ids[i].id;
        if (ids[i].relations != null)
          for (let j = 0; j < ids[i].relations.length; j++) {
            if (ids[i].relations[j].rel != "AttachedFile") {
              let index = ids[i].relations[j].url.lastIndexOf("/");
              let id = ids[i].relations[j].url.substring(index + 1);
              link.rels.push(id);
            }
          }
        rel.set(ids[i].id, link);
      }
    } catch (e) {}

    return rel;
  }
  async GetLinks(project: string, wi: any, links: any) {
    var linkList: Array<Links> = new Array<Links>();

    for (let i = 0; i < wi.relations.length; i++) {
      for (let j = 0; j < links.length; j++) {
        let index = wi.relations[i].url.lastIndexOf("/");
        let linkId = wi.relations[i].url.substring(index + 1);
        if (linkId == links[j].id) {
          var link = new Links();
          link.type = wi.relations[i].rel;
          link.id = links[j].id;
          link.title = links[j].fields["System.Title"];
          link.description = links[j].fields["System.Description"];
          link.url = this.orgUrl + project + "/_workitems/edit/" + linkId;
          linkList.push(link);
          break;
        }
      }
    }
    return linkList;
  }
  // gets queries recursiv
  async GetSharedQueries(project: string, path: string): Promise<any> {
    let url;
    try {
      if (path == "")
        url =
          this.orgUrl +
          project +
          "/_apis/wit/queries/Shared%20Queries?$depth=1";
      else
        url =
          this.orgUrl + project + "/_apis/wit/queries/" + path + "?$depth=1";

      let queries: any = await TFSServices.getItemContent(url, this.token);
      for (let i = 0; i < queries.children.length; i++)
        if (queries.children[i].isFolder) {
          this.queriesList.push(queries.children[i]);
          await this.GetSharedQueries(project, queries.children[i].path);
        } else {
          this.queriesList.push(queries.children[i]);
        }
      return this.GetModeledQuery(this.queriesList);
    } catch (e) {}
  }
  // get queris structured
  GetModeledQuery(list: Array<any>): Array<any> {
    let queryListObject: Array<any> = [];
    list.forEach((query) => {
      let newObj = {
        queryName: query.name,
        wiql: query._links.wiql != null ? query._links.wiql : null,
        id: query.id,
      };
      queryListObject.push(newObj);
    });
    return queryListObject;
  }
  // gets query results
  async GetQueryResultsByWiqlHref(
    wiqlHref: string,
    project: string
  ): Promise<any> {
    try {
      let results: any = await TFSServices.getItemContent(wiqlHref, this.token);
      let modeledResult = await this.GetModeledQueryResults(results, project);
      if (modeledResult.queryType == "tree") {
        let levelResults: Array<Workitem> = Helper.LevelBuilder(
          modeledResult,
          modeledResult.workItems[0].fields[0].value
        );
        return levelResults;
      }
      return modeledResult.workItems;
    } catch (e) {}
  }
  // gets query results
  async GetQueryResultsByWiqlString(
    wiql: string,
    projectName: string
  ): Promise<any> {
    let res;
    let url: string = `${this.orgUrl}${projectName}/_apis/wit/wiql?$top=2147483646&expand={all}&api-version=3.1`;
    try {
      res = await TFSServices.getItemContent(url, this.token, "post", {
        query: wiql,
      });
    } catch (error) {
      console.log(error);
      return [];
    }
    return res;
  }
  async GetQueryResultById(query: string, project: string): Promise<any> {
    var url = this.orgUrl + project + "/_apis/wit/queries/" + query;

    let querie: any = await TFSServices.getItemContent(url, this.token);
    var wiql = querie._links.wiql;
    return await this.GetQueryResultsByWiqlHref(wiql.href, project);
  }

  async PopulateWorkItemsByIds(
    workItemsArray: any[] = [],
    projectName: string = ""
  ): Promise<any[]> {
    let url = `${this.orgUrl}${projectName}/_apis/wit/workitemsbatch?api-version=5.0`;
    let res: any[] = [];
    let divByMax = Math.floor(workItemsArray.length / 200);
    let modulusByMax = workItemsArray.length % 200;

    //iterating
    for (let i = 0; i < divByMax; i++) {
      let from = i * 200;
      let to = (i + 1) * 200;
      let currentIds = workItemsArray.slice(from, to);
      try {
        let subRes = await TFSServices.getItemContent(url, this.token, "post", {
          $expand: "Relations",
          ids: currentIds,
        });
        res = [...res, ...subRes.value];
      } catch (error) {
        logger.error(`error populating workitems array`);
        logger.error(JSON.stringify(error));
        return [];
      }
    }
    //compliting the rimainder
    if (modulusByMax !== 0) {
      try {
        let currentIds = workItemsArray.slice(
          workItemsArray.length - modulusByMax,
          workItemsArray.length
        );
        let subRes = await TFSServices.getItemContent(url, this.token, "post", {
          $expand: "Relations",
          ids: currentIds,
        });
        res = [...res, ...subRes.value];
      } catch (error) {
        logger.error(`error populating workitems array`);
        logger.error(JSON.stringify(error));
        return [];
      }
    } //if

    return res;
  }
  async GetModeledQueryResults(results: any, project: string) {
    let restApi = new AzureRestApi(this.orgUrl, this.token);
    var queryResult: Query = new Query();
    queryResult.asOf = results.asOf;
    queryResult.queryResultType = results.queryResultType;
    queryResult.queryType = results.queryType;
    if (results.queryType == QueryType.Flat) {
      //     //Flat Query
      //TODo: attachment
      //TODO:check if wi.relations exist
      //TODO: add attachment to any list from 1
      for (var j = 0; j < results.workItems.length; j++) {
        let wi = await restApi.GetWorkItem(project, results.workItems[j].id);

        queryResult.workItems[j] = new Workitem();
        queryResult.workItems[j].url = results.workItems[j].url;
        queryResult.workItems[j].fields = new Array(results.columns.length);
        if (wi.relations != null) {
          queryResult.workItems[j].attachments = wi.relations;
        }
        var rel = new QueryAllTypes();
        for (var i = 0; i < results.columns.length; i++) {
          queryResult.columns[i] = new Column();
          queryResult.workItems[j].fields[i] = new value();
          queryResult.columns[i].name = results.columns[i].name;
          queryResult.columns[i].referenceName =
            results.columns[i].referenceName;
          queryResult.columns[i].url = results.columns[i].url;
          if (results.columns[i].referenceName.toUpperCase() == "SYSTEM.ID") {
            queryResult.workItems[j].fields[i].value = wi.id.toString();
            queryResult.workItems[j].fields[i].name = "ID";
          } else if (
            results.columns[i].referenceName.toUpperCase() ==
              "SYSTEM.ASSIGNEDTO" &&
            wi.fields[results.columns[i].referenceName] != null
          )
            queryResult.workItems[j].fields[i].value =
              wi.fields[results.columns[i].referenceName].displayName;
          else {
            let s: string = wi.fields[results.columns[i].referenceName];
            queryResult.workItems[j].fields[i].value =
              wi.fields[results.columns[i].referenceName];
            queryResult.workItems[j].fields[i].name = results.columns[i].name;
          }
        }
      }
    } //Tree Query
    else {
      this.BuildColumns(results, queryResult);
      for (var j = 0; j < results.workItemRelations.length; j++) {
        if (results.workItemRelations[j].target != null) {
          let wiT = await restApi.GetWorkItem(
            project,
            results.workItemRelations[j].target.id
          );
          // var rel = new QueryAllTypes();
          queryResult.workItems[j] = new Workitem();
          queryResult.workItems[j].url = wiT.url;
          queryResult.workItems[j].fields = new Array(results.columns.length);
          if (wiT.relations != null) {
            queryResult.workItems[j].attachments = wiT.relations;
          }
          // rel.q = queryResult;
          for (i = 0; i < queryResult.columns.length; i++) {
            //..  rel.q.workItems[j].fields[i] = new value();
            queryResult.workItems[j].fields[i] = new value();
            queryResult.workItems[j].fields[i].name =
              queryResult.columns[i].name;
            if (
              results.columns[i].referenceName.toUpperCase() ==
                "SYSTEM.ASSIGNEDTO" &&
              wiT.fields[results.columns[i].referenceName] != null
            )
              queryResult.workItems[j].fields[i].value =
                wiT.fields[results.columns[i].referenceName].displayName;
            else
              queryResult.workItems[j].fields[i].value =
                wiT.fields[queryResult.columns[i].referenceName];
            //}
          }
          if (results.workItemRelations[j].source != null)
            queryResult.workItems[j].Source =
              results.workItemRelations[j].source.id;
        }
      }
    }
    return queryResult;
  }

  BuildColumns(results: any, queryResult: Query) {
    for (var i = 0; i < results.columns.length; i++) {
      queryResult.columns[i] = new Column();
      queryResult.columns[i].name = results.columns[i].name;
      queryResult.columns[i].referenceName = results.columns[i].referenceName;
      queryResult.columns[i].url = results.columns[i].url;
    }
  }

  async GetIterationsByTeamName(
    projectName: string,
    teamName: string
  ): Promise<any[]> {
    let res: any;
    let url;
    if (teamName) {
      url = `${this.orgUrl}${projectName}/${teamName}/_apis/work/teamsettings/iterations`;
    } else {
      url = `${this.orgUrl}${projectName}/_apis/work/teamsettings/iterations`;
    }
    res = await TFSServices.getItemContent(url, this.token, "get");
    return res;
  } //GetIterationsByTeamName

  async GetJsonFileFromGitRepo(
    projectName: string,
    repoName: string,
    filePath: string
  ) {
    let url = `${this.orgUrl}${projectName}/_apis/git/repositories/${repoName}/items?path=${filePath}&includeContent=true`;
    let res = await TFSServices.getItemContent(url, this.token, "get");
    let jsonObject = JSON.parse(res.content);
    return jsonObject;
  } //GetJsonFileFromGitRepo

  async GetGitRepoFromRepoId(repoId: string) {
    let url = `${this.orgUrl}_apis/git/repositories/${repoId}?api-version=5.0`;
    let res = await TFSServices.getItemContent(url, this.token, "get");
    return res;
  } //GetGitRepoFromPrId

  async GetGitRepoFromPrId(pullRequestId: number) {
    let url = `${this.orgUrl}_apis/git/pullrequests/${pullRequestId}?api-version=5.0`;
    let res = await TFSServices.getItemContent(url, this.token, "get");
    return res;
  } //GetGitRepoFromPrId

  async GetPullRequestCommits(repositoryId: string, pullRequestId: number) {
    let url = `${this.orgUrl}_apis/git/repositories/${repositoryId}/pullRequests/${pullRequestId}/commits?api-version=5.0`;
    let res = await TFSServices.getItemContent(url, this.token, "get");
    return res;
  } //GetGitRepoFromPrId

  async GetPullRequestsLinkedItemsInCommitRange(
    projectId: string,
    repositoryId: string,
    commitRangeArray: any
  ) {
    let pullRequestsFilteredArray: any = [];
    let ChangeSetsArray: any = [];
    //get all pr's in git repo
    let url = `${this.orgUrl}${projectId}/_apis/git/repositories/${repositoryId}/pullrequests?status=completed&includeLinks=true&api-version=5.1`;
    logger.debug(`request url: ${url}`);
    let pullRequestsArray = await TFSServices.getItemContent(
      url,
      this.token,
      "get"
    );
    logger.info(
      `got ${pullRequestsArray.count} pullrequests for repo: ${repositoryId}`
    );
    //iterate commit list to filter relavant pullrequests
    pullRequestsArray.value.forEach((pr: any) => {
      commitRangeArray.value.forEach((commit: any) => {
        if (pr.lastMergeCommit.commitId == commit.commitId) {
          pullRequestsFilteredArray.push(pr);
        }
      });
    });
    logger.info(
      `filtered in commit range ${pullRequestsFilteredArray.length} pullrequests for repo: ${repositoryId}`
    );
    //extract linked items and append them to result
    await Promise.all(
      pullRequestsFilteredArray.map(async (pr: any) => {
        let linkedItems: any = {};
        try {
          if (pr._links.workItems.href) {
            //get workitems linked to pr
            let url: string = pr._links.workItems.href;
            linkedItems = await TFSServices.getItemContent(
              url,
              this.token,
              "get"
            );
            logger.info(
              `got ${linkedItems.count} items linked to pr ${pr.pullRequestId}`
            );
            await Promise.all(
              linkedItems.value.map(async (item: any) => {
                let populatedItem = await this.GetWorkItem(projectId, item.id);
                let changeSet: any = {
                  workItem: populatedItem,
                  pullrequest: pr,
                };
                ChangeSetsArray.push(changeSet);
              })
            );
          }
        } catch (error) {
          logger.error(error);
        }
      })
    );
    return ChangeSetsArray;
  } //GetPullRequestsInCommitRange

  async GetItemsInCommitRange(
    projectId: string,
    repositoryId: string,
    fromCommitSha: string,
    toCommitSha: string
  ) {
    //get date for each commit
    let fromCommit = await this.GetCommitByCommitId(
      projectId,
      repositoryId,
      fromCommitSha
    );
    let toCommit = await this.GetCommitByCommitId(
      projectId,
      repositoryId,
      toCommitSha
    );
    //get commits in date range
    let commitRange = await this.GetCommitsInDateRange(
      projectId,
      repositoryId,
      fromCommit.push.date,
      toCommit.push.date
    );
    //get all items linked to commits
    let res: any = [];
    let commitChangesArray: any = [];
    //extract linked items and append them to result
    await Promise.all(
      commitRange.value.map(async (commit: any) => {
        if (commit.workItems) {
          Promise.all(
            commit.workItems.map(async (wi: any) => {
              let populatedItem = await this.GetWorkItem(projectId, wi.id);
              let changeSet: any = { workItem: populatedItem, commit: commit };
              commitChangesArray.push(changeSet);
            })
          );
        }
      })
    );
    //get all items and pr data from pr's in commit range - using the above function
    let pullRequestsChangesArray =
      await this.GetPullRequestsLinkedItemsInCommitRange(
        projectId,
        repositoryId,
        commitRange
      );
    //merge commit links with pr links
    logger.info(`got ${pullRequestsChangesArray.length} items from pr's and`);
    res = [...commitChangesArray, ...pullRequestsChangesArray];
    return res;
  } //GetItemsInCommitRange

  async GetCommitByCommitId(
    projectId: string,
    repositoryId: string,
    commitSha: string
  ) {
    let url = `${this.orgUrl}${projectId}/_apis/git/repositories/${repositoryId}/commits/${commitSha}?api-version=5.0`;
    let res = await TFSServices.getItemContent(url, this.token, "get");
    return res;
  }
  async GetCommitForPipeline(projectId: string, buildId: number) {
    let url = `${this.orgUrl}${projectId}/_apis/build/builds/${buildId}?api-version=5.0`;
    let res = await TFSServices.getItemContent(url, this.token, "get");
    return res.sourceVersion;
  } //GetCommitForPipeline

  async GetItemsForPipelinesRange(
    projectId: string,
    fromBuildId: number,
    toBuildId: number
  ) {
    let linkedItemsArray: any = [];
    let url = `${this.orgUrl}${projectId}/_apis/build/workitems?fromBuildId=${fromBuildId}&toBuildId=${toBuildId}&api-version=5.0-preview.2`;
    let res = await TFSServices.getItemContent(url, this.token, "get");
    logger.info(
      `recieved ${res.count} items in build rang ${fromBuildId}-${toBuildId}`
    );
    await Promise.all(
      res.value.map(async (wi: any) => {
        let populatedItem = await this.GetWorkItem(projectId, wi.id);
        let changeSet: any = { workItem: populatedItem, build: toBuildId };
        linkedItemsArray.push(changeSet);
      })
    );
    return linkedItemsArray;
  } //GetCommitForPipeline

  async GetPipelineFromPipelineId(projectId: string, buildId: number) {
    let url = `${this.orgUrl}${projectId}/_apis/build/builds/${buildId}?api-version=5.0`;
    return TFSServices.getItemContent(url, this.token, "get");
  } //GetCommitForPipeline

  async GetCommitsInDateRange(
    projectId: string,
    repositoryId: string,
    fromDate: string,
    toDate: string
  ) {
    let url = `${this.orgUrl}${projectId}/_apis/git/repositories/${repositoryId}/commits?fromDate=${fromDate}&toDate=${toDate}&api-version=5.0`;
    let res = await TFSServices.getItemContent(url, this.token, "get");
    return res;
  } //GetCommitsInDateRange

  async CreateNewWorkItem(
    projectName: string,
    wiBody: any,
    wiType: string,
    byPass: boolean
  ) {
    let res: any;
    let url: string = `${
      this.orgUrl
    }${projectName}/_apis/wit/workitems/$${wiType}?bypassRules=${String(
      byPass
    ).toString()}&api-version=4.1`;
    res = await TFSServices.getItemContent(url, this.token, "post", wiBody, {
      "Content-Type": "application/json-patch+json",
    });
    return res;
  } //CreateNewWorkItem

  async GetWorkitemAttachments(project: string, id: string) {
    let attachmentList: Array<string> = [];
    let restApi = new AzureRestApi(this.orgUrl, this.token);
    try {
      let wi = await restApi.GetWorkItem(project, id);
      if (!wi.relations) return [];
      await Promise.all(
        wi.relations.map(async (relation: any) => {
          if (relation.rel == "AttachedFile") {
            let attachment = JSON.parse(JSON.stringify(relation));
            attachment.downloadUrl = `${relation.url}/${relation.attributes.name}`;
            attachmentList.push(attachment);
          }
        })
      );
      return attachmentList;
    } catch (e) {
      logger.error(`error fetching attachments for work item ${id}`);
      logger.error(`${JSON.stringify(e)}`);
      return [];
    }
  }

  async GetWorkitemAttachmentsJSONData(project: string, attachmentId: string) {
    let wiuRL =
      this.orgUrl +
      project +
      "/_apis/wit/attachments/" +
      attachmentId +
      "?api-version=5.0-preview.3";
    let attachment = await TFSServices.getItemContent(wiuRL, this.token);
    return attachment;
  }

  async UpdateWorkItem(
    projectName: string,
    wiBody: any,
    workItemId: number,
    byPass: boolean
  ) {
    let res: any;
    let url: string = `${
      this.orgUrl
    }${projectName}/_apis/wit/workitems/${workItemId}?bypassRules=${String(
      byPass
    ).toString()}&api-version=4.1`;
    res = await TFSServices.getItemContent(url, this.token, "patch", wiBody, {
      "Content-Type": "application/json-patch+json",
    });
    return res;
  } //CreateNewWorkItem

  async CreatePullRequestComment(
    projectName: string,
    repoID: string,
    pullRequestID: number,
    threads: any
  ) {
    let url: string = `${this.orgUrl}${projectName}/_apis/git/repositories/${repoID}/pullRequests/${pullRequestID}/threads?api-version=5.0`;
    let res: any = await TFSServices.getItemContent(
      url,
      this.token,
      "post",
      threads,
      null
    );
    return res;
  }

  async GetPullRequestComments(
    projectName: string,
    repoID: string,
    pullRequestID: number
  ) {
    let url: string = `${this.orgUrl}${projectName}/_apis/git/repositories/${repoID}/pullRequests/${pullRequestID}/threads?api-version=5.0`;
    let res: any = await TFSServices.getItemContent(
      url,
      this.token,
      "get",
      null,
      null
    );
    return res;
  }

  async GetCllectionLinkTypes() {
    let url: string = `${this.orgUrl}_apis/wit/workitemrelationtypes`;
    let res: any = await TFSServices.getItemContent(
      url,
      this.token,
      "get",
      null,
      null
    );
    return res;
  }

  async TriggerBuildById(
    project: string,
    buildDefanitionId: string,
    parameter: any
  ) {
    let data = {
      definition: {
        id: buildDefanitionId,
      },
      parameters: parameter, //'{"Test":"123"}'
    };
    logger.info(JSON.stringify(data));
    let uRL =
      this.orgUrl + project + "/_apis/build/builds" + "?api-version=5.1";
    let res = await TFSServices.postRequest(
      uRL,
      this.token,
      "post",
      data,
      null
    );
    return res;
  }

  async GetArtifactByBuildId(
    projectName: string,
    buildId: string,
    artifactName: string
  ): Promise<any> {
    try {
      logger.info(
        `Get artifactory from project ${projectName},BuildId ${buildId} artifact name ${artifactName}`
      );
      logger.info(`Check if build ${buildId} have artifact`);
      let Url =
        this.orgUrl +
        projectName +
        `/_apis/build/builds/${buildId}/artifacts?` +
        "api-version=5.1";
      let response = await TFSServices.getItemContent(
        Url,
        this.token,
        "Get",
        null,
        null
      );
      if (response.count == 0) {
        logger.info(`No artifact for build ${buildId} was published `);
        return response;
      }
      Url =
        this.orgUrl +
        projectName +
        `/_apis/build/builds/${buildId}/artifacts?artifactName=${artifactName}` +
        "&api-version=5.1";
      let res = await TFSServices.getItemContent(
        Url,
        this.token,
        "Get",
        null,
        null
      );
      logger.info(`Url for download :${res.resource.downloadUrl}`);
      let result = await TFSServices.downloadZipFile(
        res.resource.downloadUrl,
        this.token
      );
      return result;
    } catch (err) {
      logger.error(`Error : ${err}`);
      throw new Error(err);
    }
  }

  async CreateTestRun(
    projectName: string,
    testRunName: string,
    testPlanId: string,
    testPointId: string
  ): Promise<any> {
    try {
      logger.info(
        `Create test run op test point  ${testPointId} ,test planId : ${testPlanId}`
      );
      let Url = this.orgUrl + projectName + `/_apis/test/runs?api-version=5.1`;
      let data = {
        name: testRunName,
        plan: {
          id: testPlanId,
        },
        pointIds: [testPointId],
      };
      let res = await TFSServices.postRequest(
        Url,
        this.token,
        "Post",
        data,
        null
      );
      return res;
    } catch (err) {
      logger.error(`Error : ${err}`);
      throw new Error(err);
    }
  }

  async UpdateTestRun(
    projectName: string,
    runId: string,
    state: string
  ): Promise<any> {
    logger.info(`Update runId : ${runId} to state : ${state}`);
    let Url =
      this.orgUrl + projectName + `/_apis/test/Runs/${runId}?api-version=5.1`;
    let data = {
      state: state,
    };
    let res = await TFSServices.postRequest(
      Url,
      this.token,
      "PATCH",
      data,
      null
    );
    return res;
  }
  async UpdateTestCase(
    projectName: string,
    runId: string,
    state: number
  ): Promise<any> {
    let data: any;
    logger.info(`Update test case, runId : ${runId} to state : ${state}`);
    let Url =
      this.orgUrl +
      projectName +
      `/_apis/test/Runs/${runId}/results?api-version=5.1`;
    switch (state) {
      case 0:
        logger.info(`Reset test case to Active state `);
        data = [
          {
            id: 100000,
            outcome: "0",
          },
        ];
        break;
      case 1:
        logger.info(`Update test case to complite state `);
        data = [
          {
            id: 100000,
            state: "Completed",
            outcome: "1",
          },
        ];
        break;
      case 2:
        logger.info(`Update test case to passed state `);
        data = [
          {
            id: 100000,
            state: "Completed",
            outcome: "2",
          },
        ];
        break;
      case 3:
        logger.info(`Update test case to failed state `);
        data = [
          {
            id: 100000,
            state: "Completed",
            outcome: "3",
          },
        ];
        break;
    }
    let res = await TFSServices.postRequest(
      Url,
      this.token,
      "PATCH",
      data,
      null
    );
    return res;
  }

  async UploadTestAttachment(
    runID: string,
    projectName: string,
    stream: any,
    fileName: string,
    comment: string,
    attachmentType: string
  ): Promise<any> {
    logger.info(`Upload attachment to test run : ${runID}`);
    let Url =
      this.orgUrl +
      projectName +
      `/_apis/test/Runs/${runID}/attachments?api-version=5.1-preview.1`;
    let data = {
      stream: stream,
      fileName: fileName,
      comment: comment,
      attachmentType: attachmentType,
    };
    let res = await TFSServices.postRequest(
      Url,
      this.token,
      "Post",
      data,
      null
    );
    return res;
  }
  async GetTestRunById(projectName: string, runId: string): Promise<any> {
    logger.info(`getting test run id: ${runId}`);
    let url = `${this.orgUrl}${projectName}/_apis/test/Runs/${runId}?api-version=5.1`;
    let res = await TFSServices.getItemContent(
      url,
      this.token,
      "get",
      null,
      null
    );
    return res;
  }

  async GetTestPointByTestCaseId(
    projectName: string,
    testCaseId: string
  ): Promise<any> {
    logger.info(
      `get test points at project ${projectName} , of testCaseId : ${testCaseId}`
    );
    let url = `${this.orgUrl}${projectName}/_apis/test/points?api-version=5.1-preview.2`;
    let data = {
      PointsFilter: {
        TestcaseIds: [testCaseId],
      },
    };
    let res = await TFSServices.postRequest(
      url,
      this.token,
      "Post",
      data,
      null
    );
    return res;
  }

  async GetReleaseByReleaseId(
    projectName: string,
    releaseId: number
  ): Promise<any> {
    let url = `${this.orgUrl}${projectName}/_apis/release/releases/${releaseId}?api-version=5.0`;
    let res = await TFSServices.getItemContent(
      url,
      this.token,
      "get",
      null,
      null
    );
    return res;
  }
} //class
