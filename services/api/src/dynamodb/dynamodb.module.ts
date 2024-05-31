import { Global, Module } from '@nestjs/common';

import { DynamoClientsProvider } from './dynamodb.provider';

@Global()
@Module({
  providers: [DynamoClientsProvider],
  exports: [DynamoClientsProvider],
})
export class DynamoClientsModule {}
