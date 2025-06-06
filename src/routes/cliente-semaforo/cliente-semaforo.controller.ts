import { Controller, Get, UseGuards } from '@nestjs/common';
import { ClienteSemaforoService } from './cliente-semaforo.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('clientes-semaforo')
export class ClienteSemaforoController {
  constructor(private readonly service: ClienteSemaforoService) {}

@Get()
listar() {
  return this.service.findStatusClientes();
}

}
