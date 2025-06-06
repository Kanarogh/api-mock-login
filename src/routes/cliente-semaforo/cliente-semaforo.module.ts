import { Module } from '@nestjs/common';
import { ClienteSemaforoService } from './cliente-semaforo.service';
import { ClienteSemaforoController } from './cliente-semaforo.controller';

@Module({
  controllers: [ClienteSemaforoController],
  providers: [ClienteSemaforoService],
})
export class ClienteSemaforoModule {}