#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";

import { RestaurantManagementPlatformStack } from "../lib/api-stack";
import { getAppEnv, getConfig } from "../lib/config";
import { ApplyTags } from "../lib/aspects/apply-tags";
import { FrontStack } from "../lib/front-stack";

const app = new cdk.App();
const appEnv = getAppEnv();
const conf = getConfig(app, appEnv);

const env = { account: conf.account, region: conf.region };

const apiStack = new RestaurantManagementPlatformStack(
  app,
  "RestaurantManagementPlatformStack",
  {
    env,
  }
);

const frontStack = new FrontStack(app, "FrontStack", {
  env,
  vpc: apiStack.vpc,
});

frontStack.addDependency(apiStack);

cdk.Aspects.of(app).add(
  new ApplyTags({
    stage: `${appEnv}` as "dev" | "qa" | "prod",
    project: "restaurant-management",
    owner: "daparadab@gmail.com",
  })
);
