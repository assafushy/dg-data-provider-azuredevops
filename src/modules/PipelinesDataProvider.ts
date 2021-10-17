class PipelinesDataProvider {
  orgUrl: string = "";
  token: string = "";

  constructor(orgUrl: string, token: string) {
    this.orgUrl = orgUrl;
    this.token = token;
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
}
