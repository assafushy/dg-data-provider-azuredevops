import { TFSServices } from "../helpers/tfs";
import logger from "../utils/logger";

export default class MangementDataProvider {
  orgUrl: string = "";
  token: string = "";
  apiVersion: string ="";
  
  constructor(orgUrl: string, token: string, apiVersion: string) {
    this.orgUrl = orgUrl;
    this.token = token;
    this.apiVersion = apiVersion;
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

  //get all projects 
  async GetProjects(): Promise<any> {
    let projectUrl: string = `${this.orgUrl}_apis/projects?api-version=${this.apiVersion}`;
    let projects: any = await TFSServices.getItemContent(
      projectUrl,
      this.token
    );
    return projects;
  }

  // get project by  name return project object
  async GetProjectByName(
    projectName: string
  ): Promise<any> {
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
  async GetProjectByID(
    projectID: string
  ): Promise<any> {
    let projectUrl: string = `${this.orgUrl}_apis/projects/${projectID}?api-version=${this.apiVersion}`;
    let project: any = await TFSServices.getItemContent(projectUrl, this.token);
    return project;
  }
}
