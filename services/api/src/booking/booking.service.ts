import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  DynamoDBDocumentPaginationConfiguration,
  paginateQuery,
  PutCommand,
  PutCommandInput,
  QueryCommandInput,
} from '@aws-sdk/lib-dynamodb';
import { v4 as uuid } from 'uuid';

import { RestaurantService } from 'src/restaurant/restaurant.service';
import {
  filterUnavailableTimes,
  getAllHours,
  isAnyTableAvailable,
} from 'src/shared/helpers';
import { DynamoClientsProvider } from 'src/dynamodb/dynamodb.provider';
import { CreateBookingDto } from './dto/create-booking.dto';
import { ResponaeBookingDto } from './dto/response-booking.dto';

@Injectable()
export class BookingService {
  constructor(
    private readonly restaurantService: RestaurantService,
    private dynamoClientsProvider: DynamoClientsProvider,
  ) {}

  async create(
    createBookingDto: CreateBookingDto,
  ): Promise<ResponaeBookingDto> {
    try {
      const responseTables = await this.restaurantService.findAllTable(
        createBookingDto.restaurantId,
      );

      if (!responseTables.items.length)
        throw new HttpException('not available', HttpStatus.BAD_REQUEST);

      const tables = responseTables.items.filter(
        (item) =>
          item.numSeats >= createBookingDto.seating &&
          item.numSeats <= createBookingDto.seating + 1,
      );

      if (!tables.length)
        throw new HttpException(
          'Number of persons exceeds table capacity',
          HttpStatus.BAD_REQUEST,
        );

      const timeNotAvailable = [];
      for (const table of tables) {
        const resutl = await this.ListTableReservation(
          createBookingDto.restaurantId,
          table.numTable,
          createBookingDto.bookingDate,
        );

        timeNotAvailable.push(...resutl);
      }

      const availableTables = isAnyTableAvailable(
        tables,
        timeNotAvailable,
        createBookingDto.bookingTime,
      );

      if (!availableTables.length)
        throw new HttpException(
          'Booking not available',
          HttpStatus.BAD_REQUEST,
        );

      const bookingId = uuid();
      const params: PutCommandInput = {
        TableName: process.env.TABLE_BOOKINGS,
        Item: {
          ...createBookingDto,
          bookingId: bookingId,
          restaurantTable: `${createBookingDto.restaurantId}#${availableTables[0].numTable}`,
          table: availableTables[0].numTable,
        },
      };

      await this.dynamoClientsProvider.dbDocumentClient.send(
        new PutCommand(params),
      );

      return {
        ...createBookingDto,
        bookingId,
        table: availableTables[0].numTable,
      };
    } catch (error) {
      throw error;
    }
  }

  async availableHoursForBooking(
    restaurantId: string,
    bookingDate: string,
    minSeats: number,
  ) {
    try {
      const responseTables =
        await this.restaurantService.findAllTable(restaurantId);

      if (!responseTables.items.length)
        throw new HttpException('not available', HttpStatus.BAD_REQUEST);

      const tables = responseTables.items.filter(
        (item) => item.numSeats >= minSeats && item.numSeats <= minSeats + 1,
      );

      if (!tables.length)
        throw new HttpException(
          'Number of persons exceeds table capacity',
          HttpStatus.BAD_REQUEST,
        );

      const timeNotAvailable = [];
      for (const table of tables) {
        const resutl = await this.ListTableReservation(
          restaurantId,
          table.numTable,
          bookingDate,
        );

        timeNotAvailable.push(...resutl);
      }

      if (!timeNotAvailable.length) return getAllHours();

      const result = filterUnavailableTimes(tables, timeNotAvailable, minSeats);

      return result;
    } catch (error) {
      throw error;
    }
  }

  private async ListTableReservation(
    restaurantId: string,
    tableId: number,
    bookingDate: string,
  ) {
    try {
      const params: QueryCommandInput = {
        TableName: process.env.TABLE_BOOKINGS,
        IndexName: 'gsi-booking',
        KeyConditionExpression:
          '#restaurantTable = :restaurantTable AND #bookingDate = :bookingDate',
        ExpressionAttributeNames: {
          '#restaurantTable': 'restaurantTable',
          '#bookingDate': 'bookingDate',
          '#table': 'table',
        },
        ExpressionAttributeValues: {
          ':restaurantTable': `${restaurantId}#${tableId}`,
          ':bookingDate': bookingDate,
        },
        ProjectionExpression: '#table, bookingTime',
      };

      const paginatorConfig: DynamoDBDocumentPaginationConfiguration = {
        client: this.dynamoClientsProvider.dbDocumentClient,
      };

      const paginator = paginateQuery(paginatorConfig, params);

      const items = [];
      for await (const page of paginator) {
        items.push(...page.Items);
      }

      return items;
    } catch (error) {
      throw new Error('Error ListTableReservation');
    }
  }
}
