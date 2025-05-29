import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import * as Services from '@services';

@Controller('routes')
export class RouteController {
  constructor(private readonly service: Services.RouteService) {}

  @Post('create')
  create(@Body() body: any) {
    return this.service.create(body);
  }

  @Get()
  getAll(@Query('userId') userId?: string) {
    if (userId) {
      return this.service.findUserTemplates(userId);
    }
    return this.service.findAllPublic();
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
