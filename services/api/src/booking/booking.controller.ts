import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { ResponaeBookingDto } from './dto/response-booking.dto';

@ApiTags('booking')
@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  @ApiOperation({ summary: 'Create booking' })
  @ApiResponse({
    status: 201,
    type: ResponaeBookingDto,
  })
  create(
    @Body() createBookingDto: CreateBookingDto,
  ): Promise<ResponaeBookingDto> {
    return this.bookingService.create(createBookingDto);
  }

  @Get(':restaurantId')
  @ApiOperation({ summary: 'Search available hours for booking' })
  @ApiResponse({
    status: 200,
    description: 'List of available hours',
  })
  findAll(
    @Param('restaurantId') restaurantId: string,
    @Query('bookingDate') bookingDate: string,
    @Query('seats') seats: number,
  ) {
    return this.bookingService.availableHoursForBooking(
      restaurantId,
      bookingDate,
      seats,
    );
  }
}
