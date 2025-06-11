import { Module } from '@nestjs/common';
import { EmpresasService } from './empresas.service';
import { EmpresasController } from './empresas.controller';

@Module({
  controllers: [EmpresasController],
  providers: [EmpresasService],
  exports: [EmpresasService], // <-- ADICIONE ESTA LINHA
})
export class EmpresasModule {}
