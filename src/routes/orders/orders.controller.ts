import { Controller, Get, Post, Body, Param, Delete, UseGuards, Patch, Req } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('orders')
export class OrdersController {
  constructor(private readonly service: OrdersService) {}

  @Get()
  findAll(@Req() req) {
    // CORREÇÃO: Usando req.user.empresaId
    const empresaId = req.user.empresaId;
    return this.service.findAll(empresaId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    // CORREÇÃO: Usando req.user.empresaId
    const empresaId = req.user.empresaId;
    return this.service.findById(Number(id), empresaId);
  }

  @Post()
  createManual(@Body() dto: CreateOrderDto, @Req() req) {
    // CORREÇÃO: Passando empresaId e o ID do usuário como vendedorId
    const empresaId = req.user.empresaId;
    const vendedorId = req.user.id;
    return this.service.create(dto, empresaId, vendedorId);
  }

  @Post('from-preorder/:preorderId')
  createFromPreorder(
    @Param('preorderId') preorderId: string,
    @Body() dto: { formaPagamento: string; comissao: string; vendedor: string },
    @Req() req,
  ) {
    // CORREÇÃO: Passando empresaId e o ID do usuário como vendedorId
    const empresaId = req.user.empresaId;
    const vendedorId = req.user.id;
    // O service precisará ser ajustado para aceitar o vendedorId aqui também
    return this.service.createFromPreorder(Number(preorderId), dto, empresaId, vendedorId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() update: { status?: string; dataEntrega?: string }, @Req() req) {
    // CORREÇÃO: Usando req.user.empresaId
    const empresaId = req.user.empresaId;
    return this.service.update(Number(id), update, empresaId);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @Req() req) {
    // CORREÇÃO: Usando req.user.empresaId
    const empresaId = req.user.empresaId;
    return this.service.delete(Number(id), empresaId);
  }
}
