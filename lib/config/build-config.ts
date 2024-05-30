import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

enum APP_ENV {
  DEV = "dev",
  QA = "qa",
  PROD = "prod",
}

function getConfig(scope: cdk.App | Construct, appEnv: string) {
  const context = scope.node.tryGetContext(appEnv);

  const conf = {
    account: context.account,
    region: context.region,
    ...context,
  };

  return conf;
}

function getAppEnv() {
  const appEnv = process.env.APP_ENV || APP_ENV.DEV;

  if (!appEnv) {
    return APP_ENV.DEV.toString();
  }

  if (Object.values(APP_ENV).includes(appEnv as APP_ENV)) {
    return appEnv;
  } else {
    throw new Error(`
      Unrecognized application environment stage supplied. \n
      Please supply one of [${APP_ENV.DEV}, ${APP_ENV.QA}, ${APP_ENV.PROD}] valid variable.
    `);
  }
}

export { getConfig, getAppEnv };
