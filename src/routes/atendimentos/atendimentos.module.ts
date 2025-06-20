import { Module } from '@nestjs/common';
import { AtendimentosService } from './atendimentos.service';
import { AtendimentosController } from './atendimentos.controller';
import { ClientsModule } from '../clients/clients.module'; // ✅ IMPORTE O MÓDULO DE CLIENTES

@Module({
  imports: [ClientsModule], // ✅ ADICIONE AQUI
  controllers: [AtendimentosController],
  providers: [AtendimentosService],
})
export class AtendimentosModule {}