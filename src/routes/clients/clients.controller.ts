import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { ClientsService } from './clients.service';

import { AuthGuard } from '@nestjs/passport';
import { CreateClientDto } from './dto/create.client.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('clients')
export class ClientsController {
  constructor(private readonly service: ClientsService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findById(Number(id));
  }

  @Post()
  create(@Body() dto: CreateClientDto) {
    return this.service.create(dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(Number(id));
  }
}
