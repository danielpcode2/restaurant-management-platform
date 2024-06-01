import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNumber, IsString } from 'class-validator';

export class CreateBookingDto {
  @ApiProperty()
  @IsString()
  readonly restaurantId: string;

  @ApiProperty()
  @IsString()
  readonly bookingDate: string;

  @ApiProperty()
  @IsString()
  readonly bookingTime: string;

  @ApiProperty()
  @IsNumber()
  readonly seating: number;

  @ApiProperty()
  @IsEmail()
  readonly customerEmail: string;
}
