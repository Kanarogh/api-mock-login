import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { EstoqueModule } from '../estoque/estoque.module'; // <-- Importe o EstoqueModule

@Module({
  imports: [EstoqueModule], // <-- Adicione o EstoqueModule aqui
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}