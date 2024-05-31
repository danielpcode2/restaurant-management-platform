import { Logger } from '@nestjs/common';
import { fromIni } from '@aws-sdk/credential-providers';
import { fromContainerMetadata } from '@aws-sdk/credential-providers';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DynamoClientsProvider {
  private readonly logger = new Logger(DynamoClientsProvider.name);
  public dbClient: DynamoDBClient;
  public dbDocumentClient: DynamoDBDocumentClient;

  constructor() {
    this.logger.log('DbClientsProvider init');

    const credentialsProvider =
      process.env.ENV === 'local'
        ? fromIni({
            profile: process.env.PROFILE,
          })
        : fromContainerMetadata();

    const marshallOptions = {
      convertEmptyValues: false,
      removeUndefinedValues: false,
      convertClassInstanceToMap: false,
    };

    const unmarshallOptions = {
      wrapNumbers: false,
    };

    const translateConfig = { marshallOptions, unmarshallOptions };

    this.dbClient = new DynamoDBClient({
      region: process.env.REGION,
      credentials: credentialsProvider,
    });

    this.dbDocumentClient = DynamoDBDocumentClient.from(
      this.dbClient,
      translateConfig,
    );
  }

  destroy() {
    this.dbDocumentClient.destroy();
    this.dbClient.destroy();
  }
}
