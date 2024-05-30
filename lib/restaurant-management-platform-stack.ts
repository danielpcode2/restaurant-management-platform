import * as cdk from "aws-cdk-lib";
import {
  Peer,
  Port,
  SecurityGroup,
  SubnetType,
  Vpc,
} from "aws-cdk-lib/aws-ec2";
import { ContainerImage } from "aws-cdk-lib/aws-ecs";
import { DockerImageAsset } from "aws-cdk-lib/aws-ecr-assets";
import { ApplicationLoadBalancedFargateService } from "aws-cdk-lib/aws-ecs-patterns";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";
import { HostedZone } from "aws-cdk-lib/aws-route53";
import { type Construct } from "constructs";
import { join } from "node:path";
import { getAppEnv, getConfig } from "./config";
import { ManagedPolicy, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";

export class RestaurantManagementPlatformStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
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

    const apiImage = new DockerImageAsset(this, "dockerimage", {
      directory: join(__dirname, "..", "services/api"),
    });

    const defaultVpc = new Vpc(this, "VPC", {
      cidr: "10.1.0.0/16",
      maxAzs: 2,
      enableDnsHostnames: true,
      enableDnsSupport: true,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: "PublicSubnet",
          subnetType: SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: "PrivateIsolatedSubnet",
          subnetType: SubnetType.PRIVATE_WITH_EGRESS,
        },
      ],
    });

    const securityGroups = new SecurityGroup(this, "SecurityGroup", {
      vpc: defaultVpc,
      allowAllOutbound: true,
    });
    securityGroups.addIngressRule(Peer.anyIpv4(), Port.tcp(443));

    const task = new ApplicationLoadBalancedFargateService(
      this,
      "ApplicationFargateService",
      {
        cpu: 256,
        memoryLimitMiB: 1024,
        desiredCount: 1,
        publicLoadBalancer: true,
        taskImageOptions: {
          image: ContainerImage.fromDockerImageAsset(apiImage),
          containerPort: 8080,
          enableLogging: true,
          environment: {},
          taskRole: new Role(this, "RoleTaskECS", {
            assumedBy: new ServicePrincipal("ecs-tasks.amazonaws.com"),
            managedPolicies: [
              ManagedPolicy.fromAwsManagedPolicyName("CloudWatchFullAccess"),
            ],
          }),
        },
        domainName: `api.${conf.domain}`,
        domainZone: rootZone,
        certificate: primaryDomainCert,
        vpc: defaultVpc,
        securityGroups: [securityGroups],
      }
    );

    task.targetGroup.configureHealthCheck({
      path: "/",
      unhealthyThresholdCount: 2,
    });
  }
}
