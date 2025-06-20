import { Module } from '@nestjs/common';
import { ClientesProximosService } from './clientes-proximos.service';
import { ClientesProximosController } from './clientes-proximos.controller';
import { ClientsModule } from '../clients/clients.module'; // ✅ Verifique se o import está aqui

@Module({
  // ✅ GARANTA QUE ESTA LINHA EXISTA
  imports: [ClientsModule], 
  controllers: [ClientesProximosController],
  providers: [ClientesProximosService],
})
export class ClientesProximosModule {}