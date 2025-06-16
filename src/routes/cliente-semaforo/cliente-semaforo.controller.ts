import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { ClienteSemaforoService } from './cliente-semaforo.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('clientes-semaforo')
export class ClienteSemaforoController {
  constructor(private readonly service: ClienteSemaforoService) {}

  @Get()
  listar(@Req() req) {
    const empresaId = req.user.empresaId;
    return this.service.findStatusClientes(empresaId);
  }
}