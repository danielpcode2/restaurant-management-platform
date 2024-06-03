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
import { ManagedPolicy, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { AttributeType, Table } from "aws-cdk-lib/aws-dynamodb";
import { type Construct } from "constructs";
import { join } from "node:path";

import { getAppEnv, getConfig } from "./config";
export class RestaurantManagementPlatformStack extends cdk.Stack {
  public readonly vpc: Vpc;

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

    // Tables
    const tableRestaurants = new Table(this, "TableRestaurants", {
      tableName: `${appEnv}Restaurants`,
      partitionKey: {
        name: "restaurantId",
        type: AttributeType.STRING,
      },
      sortKey: {
        name: "entityType",
        type: AttributeType.STRING,
      },
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });
    tableRestaurants.addGlobalSecondaryIndex({
      indexName: "gsi-entity",
      partitionKey: {
        name: "entity",
        type: AttributeType.STRING,
      },
    });

    const tableBookings = new Table(this, "TableBookings", {
      tableName: `${appEnv}Bookings`,
      partitionKey: {
        name: "bookingId",
        type: AttributeType.STRING,
      },
      sortKey: {
        name: "restaurantTable",
        type: AttributeType.STRING,
      },
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });
    tableBookings.addGlobalSecondaryIndex({
      indexName: "gsi-booking",
      partitionKey: {
        name: "restaurantTable",
        type: AttributeType.STRING,
      },
      sortKey: {
        name: "bookingDate",
        type: AttributeType.STRING,
      },
    });

    // Docker Image
    const apiImage = new DockerImageAsset(this, "dockerimage", {
      directory: join(__dirname, "..", "services/api"),
    });

    // Networking
    this.vpc = new Vpc(this, "VPC", {
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
      vpc: this.vpc,
      allowAllOutbound: true,
    });
    securityGroups.addIngressRule(Peer.anyIpv4(), Port.tcp(443));

    // Service
    const task = new ApplicationLoadBalancedFargateService(
      this,
      "APiFargateService",
      {
        cpu: 256,
        memoryLimitMiB: 512,
        desiredCount: 1,
        publicLoadBalancer: true,
        taskImageOptions: {
          image: ContainerImage.fromDockerImageAsset(apiImage),
          containerPort: 8080,
          enableLogging: true,
          environment: {
            ENV: appEnv,
            REGION: cdk.Aws.REGION,
            TABLE_RESTAURANTS: tableRestaurants.tableName,
            TABLE_BOOKINGS: tableBookings.tableName,
          },
          taskRole: new Role(this, "RoleTaskECS", {
            assumedBy: new ServicePrincipal("ecs-tasks.amazonaws.com"),
            managedPolicies: [
              ManagedPolicy.fromAwsManagedPolicyName("CloudWatchFullAccess"),
              ManagedPolicy.fromAwsManagedPolicyName(
                "AmazonDynamoDBFullAccess"
              ),
            ],
          }),
        },
        domainName: `api.${conf.domain}`,
        domainZone: rootZone,
        certificate: primaryDomainCert,
        vpc: this.vpc,
        securityGroups: [securityGroups],
      }
    );

    task.targetGroup.configureHealthCheck({
      path: "/health",
      unhealthyThresholdCount: 2,
    });
  }
}
