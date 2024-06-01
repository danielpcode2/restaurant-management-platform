import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { RestaurantModule } from './restaurant/restaurant.module';
import { HealthModule } from './health/health.module';
import { DynamoClientsModule } from './dynamodb/dynamodb.module';
import { BookingModule } from './booking/booking.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HealthModule,
    RestaurantModule,
    DynamoClientsModule,
    BookingModule,
  ],
  controllers: [],
})
export class AppModule {}
