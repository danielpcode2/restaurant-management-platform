import * as cdk from "aws-cdk-lib";
import { Peer, Port, SecurityGroup, Vpc } from "aws-cdk-lib/aws-ec2";
import { ContainerImage } from "aws-cdk-lib/aws-ecs";
import { DockerImageAsset } from "aws-cdk-lib/aws-ecr-assets";
import { ApplicationLoadBalancedFargateService } from "aws-cdk-lib/aws-ecs-patterns";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";
import { HostedZone } from "aws-cdk-lib/aws-route53";
import { ManagedPolicy, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { type Construct } from "constructs";
import { join } from "node:path";

interface StackProps extends cdk.StackProps {
  vpc: Vpc;
}

import { getAppEnv, getConfig } from "./config";
export class FrontStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    const appEnv = getAppEnv();
    const conf = getConfig(scope, appEnv);

    const primaryDomainCert = Certificate.fromCertificateArn(
      this,
      "Certificate",
      conf.domainCert
    );

    const rootZone = HostedZone.fromLookup(this, "baseZone", {
      domainName: conf.domain,
    });

    // Docker Image
    const frontImage = new DockerImageAsset(this, "dockerimage", {
      directory: join(__dirname, "..", "services/front"),
    });

    const securityGroups = new SecurityGroup(this, "SecurityGroup", {
      vpc: props.vpc,
      allowAllOutbound: true,
    });
    securityGroups.addIngressRule(Peer.anyIpv4(), Port.tcp(443));

    // Service
    const task = new ApplicationLoadBalancedFargateService(
      this,
      "FrontFargateService",
      {
        cpu: 256,
        memoryLimitMiB: 512,
        desiredCount: 1,
        publicLoadBalancer: true,
        taskImageOptions: {
          image: ContainerImage.fromDockerImageAsset(frontImage),
          containerPort: 80,
          enableLogging: true,
          taskRole: new Role(this, "RoleTaskECS", {
            assumedBy: new ServicePrincipal("ecs-tasks.amazonaws.com"),
            managedPolicies: [
              ManagedPolicy.fromAwsManagedPolicyName("CloudWatchFullAccess"),
            ],
          }),
        },
        redirectHTTP: true,
        domainName: `app.${conf.domain}`,
        domainZone: rootZone,
        certificate: primaryDomainCert,
        vpc: props.vpc,
        securityGroups: [securityGroups],
      }
    );

    task.targetGroup.configureHealthCheck({
      path: "/",
      unhealthyThresholdCount: 2,
    });
  }
}
