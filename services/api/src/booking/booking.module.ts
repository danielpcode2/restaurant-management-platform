import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { RestaurantService } from 'src/restaurant/restaurant.service';

@Module({
  controllers: [BookingController],
  providers: [BookingService, RestaurantService],
})
export class BookingModule {}
