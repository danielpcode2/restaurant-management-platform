import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsIn, IsNumber, IsString, Matches } from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({
    example: '7c51eeb6-be95-4067-b9b1-eb5a18af9058',
    description: 'Restaurant identifier',
  })
  @IsString()
  readonly restaurantId: string;

  @ApiProperty({
    example: '2024-05-31',
    description: 'Booking date',
  })
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  readonly bookingDate: string;

  @ApiProperty({
    example: '20:00',
    description: 'Booking time',
  })
  @IsIn([
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
    '18:00',
    '19:00',
    '20:00',
    '21:00',
    '22:00',
    '23:00',
  ])
  readonly bookingTime: string;

  @ApiProperty({
    example: 2,
    description: 'Number of seats to reserve',
  })
  @IsNumber()
  readonly seating: number;

  @ApiProperty({
    example: 'xxx@gmail.com',
    description: 'Customer email',
  })
  @IsEmail()
  readonly customerEmail: string;
}
