import { Workitem } from "../../models/tfs-data";
import logger from "utils/logger";
import { Console } from "winston/lib/winston/transports";
import AzureRestApi from "../..";
import { writeFileSync } from "fs";

require("dotenv").config();

const orgUrl = process.env.ORG_URL;
const token = process.env.PAT;

describe("buidl related tests", () => {
  // test("should returnbuild info", async () => {
  //   jest.setTimeout(1000000);
  //   const orgUrl = "<org-url> //!!chaanged";
  //   const token = "<pat-url> //!!chaanged";
  //   let restApi = new AzureRestApi(orgUrl, token);
  //   let json = await restApi.GetPipelineFromPipelineId("DevOps", 19072);
  //   expect(json.id).toBe(19072);
  // });
});
