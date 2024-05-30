#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";

import { RestaurantManagementPlatformStack } from "../lib/restaurant-management-platform-stack";
import { getAppEnv, getConfig } from "../lib/config";
import { ApplyTags } from "../lib/aspects/apply-tags";

const app = new cdk.App();
const appEnv = getAppEnv();
const conf = getConfig(app, appEnv);

const env = { account: conf.account, region: conf.region };

new RestaurantManagementPlatformStack(
  app,
  "RestaurantManagementPlatformStack",
  { env }
);

cdk.Aspects.of(app).add(
  new ApplyTags({
    stage: `${appEnv}` as "dev" | "qa" | "prod",
    project: "restaurant-management",
    owner: "daparadab@gmail.com",
  })
);
