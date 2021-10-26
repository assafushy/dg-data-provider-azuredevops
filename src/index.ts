import MangementDataProvider from './modules/MangementDataProvider'
import TicketsDataProvider from './modules/TicketsDataProvider'
import GitDataProvider from "./modules/GitDataProvider";
import PipelinesDataProvider from './modules/PipelinesDataProvider'
import TestDataProvider from './modules/TestDataProvider'

import logger from "./utils/logger";

export default class DgDataProviderAzureDevOps {
  orgUrl: string = "";
  token: string = "";
  apiVersion: string;
  
  
  constructor(orgUrl: string, token: string, apiVersion?: string) {
    this.orgUrl = orgUrl;
    this.token = token;
    this.apiVersion = apiVersion || "5.1";
    logger.info(`azure devops data provider initilized`);
  }

  async getMangementDataProvider() {
    return new MangementDataProvider(this.orgUrl, this.token, this.apiVersion);
  }
  async getTicketsDataProvider() {
    return new TicketsDataProvider(this.orgUrl, this.token, this.apiVersion);
  }
  async getGitDataProvider() {
    return new GitDataProvider(this.orgUrl, this.token, this.apiVersion);
  }
  async getPipelinesDataProvider() {
    return new PipelinesDataProvider(this.orgUrl, this.token, this.apiVersion);
  }
  async getTestDataProvider() {
    return new TestDataProvider(this.orgUrl, this.token, this.apiVersion);
  }
} //class
