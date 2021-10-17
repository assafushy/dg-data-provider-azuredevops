export default class GitDataProvider {
  orgUrl: string = "";
  token: string = "";

  constructor(orgUrl: string, token: string) {
    this.orgUrl = orgUrl;
    this.token = token;
  }

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
}
