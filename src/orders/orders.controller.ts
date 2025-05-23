import { Controller, Get, Post, Body, Param, Delete, UseGuards, Patch } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('orders')
export class OrdersController {
  constructor(private readonly service: OrdersService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findById(Number(id));
  }

  @Post()
  createManual(@Body() dto: CreateOrderDto) {
    return this.service.create(dto);
  }

  @Post('from-preorder/:preorderId')
  createFromPreorder(@Param('preorderId') preorderId: string, @Body() dto: { formaPagamento: string; comissao: string; vendedor: string }) {
    return this.service.createFromPreorder(Number(preorderId), dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() update: { status?: string; dataEntrega?: string }) {
    return this.service.update(Number(id), update);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(Number(id));
  }
}
