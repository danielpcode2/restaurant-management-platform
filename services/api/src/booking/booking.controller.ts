import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';

@ApiTags('booking')
@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  create(@Body() createBookingDto: CreateBookingDto) {
    return this.bookingService.create(createBookingDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Search available hours for booking' })
  @ApiResponse({ status: 200 })
  findAll(
    @Param('id') id: string,
    @Query('bookingDate') bookingDate: string,
    @Query('seats') seats: number,
  ) {
    return this.bookingService.availableHoursForBooking(id, bookingDate, seats);
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.bookingService.findOne(+id);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.bookingService.remove(+id);
  // }
}
