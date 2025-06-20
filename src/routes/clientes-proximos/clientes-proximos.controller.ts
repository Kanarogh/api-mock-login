import { Controller, Get, Param, Query, UseGuards, Req, ParseIntPipe } from '@nestjs/common';
import { ClientesProximosService } from './clientes-proximos.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('clientes-proximos')
export class ClientesProximosController {
  constructor(private readonly service: ClientesProximosService) {}

  @Get(':clienteId')
  findProximos(
    @Param('clienteId', ParseIntPipe) clienteId: number,
    @Query('raio') raio: string,
    @Req() req,
  ) {
    // Pega o ID da empresa do token do usuário logado
    const empresaId = req.user.empresaId;

    // Define um raio padrão de 1km se não for fornecido na URL
    const raioKm = raio ? parseFloat(raio) : 1.0; 

    return this.service.findProximos(clienteId, empresaId, raioKm);
  }
}