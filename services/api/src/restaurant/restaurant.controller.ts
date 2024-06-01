import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

import { RestaurantService } from './restaurant.service';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { CreateTableDto } from './dto/create-table.dto';

@ApiTags('restaurant')
@Controller('restaurant')
export class RestaurantController {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Post()
  @ApiOperation({ summary: 'Add new a Restaurant' })
  @ApiResponse({ status: 201 })
  create(@Body() createRestaurantDto: CreateRestaurantDto) {
    return this.restaurantService.create(createRestaurantDto);
  }

  @Get()
  @ApiOperation({ summary: 'Returns list of Restaurant' })
  @ApiQuery({ name: 'startKey', required: false, type: String })
  @ApiResponse({ status: 200 })
  findAll(@Query('startKey') startKey?: string) {
    return this.restaurantService.findAll(startKey);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find Restaurant by Id' })
  @ApiResponse({ status: 200 })
  findOne(@Param('id') id: string) {
    return this.restaurantService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update Restaurant' })
  @ApiResponse({ status: 200 })
  update(
    @Param('id') id: string,
    @Body() createRestaurantDto: CreateRestaurantDto,
  ) {
    return this.restaurantService.update(id, createRestaurantDto);
  }

  @Post(':id/table')
  @ApiOperation({ summary: 'Add new a table' })
  @ApiResponse({ status: 201 })
  addTable(@Param('id') id: string, @Body() createTableDto: CreateTableDto) {
    return this.restaurantService.createTable(id, createTableDto);
  }

  @Get(':id/table')
  @ApiOperation({ summary: 'Returns list table of Restaurant' })
  @ApiResponse({ status: 200 })
  findAlltable(@Param('id') id: string) {
    return this.restaurantService.findAllTable(id);
  }
}
