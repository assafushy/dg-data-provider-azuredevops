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

  async getMangementDataProvider() : Promise<MangementDataProvider> {
    return new MangementDataProvider(this.orgUrl, this.token, this.apiVersion);
  }
  async getTicketsDataProvider() : Promise<TicketsDataProvider> {
    return new TicketsDataProvider(this.orgUrl, this.token, this.apiVersion);
  }
  async getGitDataProvider() : Promise<GitDataProvider> {
    return new GitDataProvider(this.orgUrl, this.token, this.apiVersion);
  }
  async getPipelinesDataProvider() : Promise<PipelinesDataProvider> {
    return new PipelinesDataProvider(this.orgUrl, this.token, this.apiVersion);
  }
  async getTestDataProvider() : Promise<TestDataProvider> {
    return new TestDataProvider(this.orgUrl, this.token, this.apiVersion);
  }
} //class
