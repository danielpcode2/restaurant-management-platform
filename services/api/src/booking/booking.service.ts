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
  getAllHoursOfDay,
  getAvailableHours,
  getAvailableTable,
} from 'src/shared/helpers';
import { DynamoClientsProvider } from 'src/dynamodb/dynamodb.provider';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingService {
  constructor(
    private readonly restaurantService: RestaurantService,
    private dynamoClientsProvider: DynamoClientsProvider,
  ) {}

  async create(createBookingDto: CreateBookingDto) {
    try {
      const responseTables = await this.restaurantService.findAllTable(
        createBookingDto.restaurantId,
      );

      if (!responseTables.items.length)
        return new HttpException('not available', HttpStatus.BAD_REQUEST);

      const tables = responseTables.items.filter(
        (item) => item.numSeats >= createBookingDto.seating,
      );

      if (!tables.length)
        return new HttpException(
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

      const tableAssigned = getAvailableTable(
        tables,
        timeNotAvailable,
        createBookingDto.seating,
      );

      if (!tableAssigned)
        return new HttpException(
          'Booking not available',
          HttpStatus.BAD_REQUEST,
        );

      const params: PutCommandInput = {
        TableName: process.env.TABLE_BOOKINGS,
        Item: {
          ...createBookingDto,
          bookingId: uuid(),
          restaurantTable: `${createBookingDto.restaurantId}#${tableAssigned}`,
          table: tableAssigned,
        },
      };

      await this.dynamoClientsProvider.dbDocumentClient.send(
        new PutCommand(params),
      );

      return;
    } catch (error) {
      throw new HttpException('Error', HttpStatus.BAD_REQUEST);
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
        return new HttpException('not available', HttpStatus.BAD_REQUEST);

      const tables = responseTables.items.filter(
        (item) => item.numSeats >= minSeats && item.numSeats <= minSeats + 2,
      );

      if (!tables.length)
        return new HttpException(
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

      if (!timeNotAvailable.length) return getAllHoursOfDay(bookingDate);

      const result = filterUnavailableTimes(tables, timeNotAvailable, minSeats);

      if (!result.length) return getAllHoursOfDay(bookingDate);

      console.log(result);

      return getAvailableHours(bookingDate, result);
    } catch (error) {
      throw new HttpException('Error', HttpStatus.BAD_REQUEST);
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
