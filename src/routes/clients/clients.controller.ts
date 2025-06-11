import { Controller, Get, Post, Body, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateClientDto } from './dto/create.client.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('clients')
export class ClientsController {
  constructor(private readonly service: ClientsService) {}

  @Get()
  findAll(@Req() req) {
    // CORREÇÃO: Usando req.user.empresaId para pegar o ID da empresa
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
  create(@Body() dto: CreateClientDto, @Req() req) {
    // CORREÇÃO: Usando req.user.empresaId
    const empresaId = req.user.empresaId;
    return this.service.create(dto, empresaId);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @Req() req) {
    // CORREÇÃO: Usando req.user.empresaId
    const empresaId = req.user.empresaId;
    return this.service.delete(Number(id), empresaId);
  }
}