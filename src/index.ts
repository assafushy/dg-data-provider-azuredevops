import { Workitem } from "./models/tfs-data";
import { TFSServices } from "./helpers/tfs";
import { Helper, suiteData, Links, Trace, Relations } from "./helpers/helper";
import { Query, TestSteps } from "./models/tfs-data";
import { QueryType } from "./models/tfs-data";
import { QueryAllTypes } from "./models/tfs-data";
import { Column } from "./models/tfs-data";
import { value } from "./models/tfs-data";
import { TestCase } from "./models/tfs-data";
import * as xml2js from "xml2js";

import GitDataProvider from "./modules/GitDataProvider";

import logger from "./utils/logger";

export default class DgDataProviderAzureDevOps {
  orgUrl: string = "";
  token: string = "";
  apiVersion: string;
  queriesList: Array<any> = new Array<any>();

  constructor(orgUrl: string, token: string, apiVersion?: string) {
    this.orgUrl = orgUrl;
    this.token = token;
    this.apiVersion = apiVersion || "5.1";
  }

  getGitDataProvider() {
    return new GitDataProvider(this.orgUrl, this.token, this.apiVersion);
  }
} //class
