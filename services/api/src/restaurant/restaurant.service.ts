import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  ScanCommand,
  PutCommand,
  PutCommandInput,
  ScanCommandInput,
  DynamoDBDocumentPaginationConfiguration,
  GetCommandInput,
  GetCommand,
  UpdateCommandInput,
  UpdateCommand,
  QueryCommandInput,
  paginateQuery,
} from '@aws-sdk/lib-dynamodb';
import { v4 as uuid } from 'uuid';

import { DynamoClientsProvider } from 'src/dynamodb/dynamodb.provider';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { CreateTableDto } from './dto/create-table.dto';

@Injectable()
export class RestaurantService {
  constructor(private dynamoClientsProvider: DynamoClientsProvider) {}

  async create(createRestaurantDto: CreateRestaurantDto) {
    try {
      const id = uuid();

      const params: PutCommandInput = {
        TableName: process.env.TABLE_RESTAURANTS,
        Item: {
          restaurantId: id,
          entityType: `restaurant#${id}`,
          ...createRestaurantDto,
        },
        ConditionExpression: 'attribute_not_exists(restaurantId)',
      };

      await this.dynamoClientsProvider.dbDocumentClient.send(
        new PutCommand(params),
      );

      return;
    } catch (error) {
      throw new HttpException('Error', HttpStatus.BAD_REQUEST);
    }
  }

  async findAll(startKey?: string, limit: number = 10) {
    try {
      const params: ScanCommandInput = {
        TableName: process.env.TABLE_RESTAURANTS,
        Limit: limit,
        FilterExpression: 'contains(#entityType, :entityType)',
        ProjectionExpression: 'restaurantId, #name, description, score, urlImg',
        ExpressionAttributeNames: {
          '#name': 'name',
          '#entityType': 'entityType',
        },
        ExpressionAttributeValues: {
          ':entityType': 'restaurant',
        },
      };

      if (startKey) {
        params.ExclusiveStartKey = {
          restaurantId: startKey,
          entityType: `restaurant#${startKey}`,
        };
      }

      const response = await this.dynamoClientsProvider.dbDocumentClient.send(
        new ScanCommand(params),
      );

      const items = response.Items.length ? response.Items : [];

      return {
        items,
        startKey: response?.LastEvaluatedKey?.restaurantId ?? null,
      };
    } catch (error) {
      throw new HttpException('Error', HttpStatus.BAD_REQUEST);
    }
  }

  async findAllTable(id: string) {
    try {
      const params: QueryCommandInput = {
        TableName: process.env.TABLE_RESTAURANTS,
        KeyConditionExpression:
          '#restaurantId = :restaurantId AND begins_with(#entityType, :entityType)',
        ExpressionAttributeNames: {
          '#restaurantId': 'restaurantId',
          '#entityType': 'entityType',
        },
        ExpressionAttributeValues: {
          ':restaurantId': id,
          ':entityType': 'table',
        },
        ProjectionExpression: 'restaurantId, numTable, numSeats',
      };

      const paginatorConfig: DynamoDBDocumentPaginationConfiguration = {
        client: this.dynamoClientsProvider.dbDocumentClient,
      };

      const paginator = paginateQuery(paginatorConfig, params);

      let pageCount = 0;

      const items = [];
      for await (const page of paginator) {
        pageCount++;
        // console.log(`Page ${pageCount}, Items:`, page.Items);
        items.push(...page.Items);
      }

      return {
        items,
      };
    } catch (error) {
      throw new HttpException('Error', HttpStatus.BAD_REQUEST);
    }
  }

  async findOne(id: string) {
    try {
      const params: GetCommandInput = {
        TableName: process.env.TABLE_RESTAURANTS,
        Key: {
          restaurantId: id,
          entityType: `restaurant#${id}`,
        },
      };

      const response = await this.dynamoClientsProvider.dbDocumentClient.send(
        new GetCommand(params),
      );

      response?.Item && delete response.Item.entityType;

      return response.Item;
    } catch (error) {
      throw new HttpException('Error', HttpStatus.BAD_REQUEST);
    }
  }

  async update(id: string, createRestaurantDto: CreateRestaurantDto) {
    try {
      const params: UpdateCommandInput = {
        TableName: process.env.TABLE_RESTAURANTS,
        Key: {
          restaurantId: id,
          entityType: `restaurant#${id}`,
        },
        UpdateExpression:
          'SET #name=:name, #description=:description, #urlImg=:urlImg',
        ExpressionAttributeNames: {
          '#name': 'name',
          '#description': 'description',
          '#urlImg': 'urlImg',
        },
        ExpressionAttributeValues: {
          ':name': createRestaurantDto.name,
          ':description': createRestaurantDto.description,
          ':urlImg': createRestaurantDto.urlImg,
        },
      };

      await this.dynamoClientsProvider.dbDocumentClient.send(
        new UpdateCommand(params),
      );

      return;
    } catch (error) {
      throw new HttpException('Error update table', HttpStatus.BAD_REQUEST);
    }
  }

  async createTable(id: string, createTableDto: CreateTableDto) {
    try {
      const params: PutCommandInput = {
        TableName: process.env.TABLE_RESTAURANTS,
        Item: {
          restaurantId: id,
          entityType: `table#${createTableDto.numTable}`,
          ...createTableDto,
        },
        ConditionExpression:
          'attribute_not_exists(restaurantId) AND attribute_not_exists(entityType)',
      };

      await this.dynamoClientsProvider.dbDocumentClient.send(
        new PutCommand(params),
      );

      return;
    } catch (error) {
      throw new HttpException('Error creating table', HttpStatus.BAD_REQUEST);
    }
  }
}
