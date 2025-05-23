import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { PreordersService } from './preorders.service';
import { CreatePreorderDto } from './dto/create-preorder.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('preorders')
export class PreordersController {
  constructor(private readonly service: PreordersService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findById(Number(id));
  }

  @Post()
  create(@Body() dto: CreatePreorderDto) {
    return this.service.create(dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(Number(id));
  }
}