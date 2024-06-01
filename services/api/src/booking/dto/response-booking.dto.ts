import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ResponaeBookingDto {
  @ApiProperty()
  @IsString()
  readonly bookingId: string;

  @ApiProperty()
  @IsString()
  readonly restaurantId: string;

  @ApiProperty()
  readonly bookingDate: string;

  @ApiProperty()
  readonly bookingTime: string;

  @ApiProperty()
  readonly seating: number;

  @ApiProperty()
  readonly table: number;

  @ApiProperty()
  readonly customerEmail: string;
}
