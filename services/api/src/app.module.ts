import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { RestaurantModule } from './restaurant/restaurant.module';
import { HealthModule } from './health/health.module';
import { DynamoClientsModule } from './dynamodb/dynamodb.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HealthModule,
    RestaurantModule,
    DynamoClientsModule,
  ],
  controllers: [],
})
export class AppModule {}
