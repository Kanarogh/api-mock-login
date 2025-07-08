import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './routes/auth/auth.module';
import { UsersModule } from './routes/users/users.module';
import { ProductsModule } from './routes/products/products.module';
import { ClientsModule } from './routes/clients/clients.module';
import { OrdersModule } from './routes/orders/orders.module';
import { PreordersModule } from './routes/preorders/preorders.module';
import { EstoqueModule } from './routes/estoque/estoque.module';
import { ClienteSemaforoModule } from './routes/cliente-semaforo/cliente-semaforo.module';
import { EmpresasModule } from './routes/empresas/empresas.module';
import { ClientesProximosModule } from './routes/clientes-proximos/clientes-proximos.module';
import { AtendimentosModule } from './routes/atendimentos/atendimentos.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UsersModule,
    ProductsModule,
    ClientsModule,
    OrdersModule,
    PreordersModule,
    EstoqueModule,
    ClienteSemaforoModule,
    EmpresasModule,
    ClientesProximosModule,
    AtendimentosModule
  ],
  controllers: [AppController],
  providers: [AppService],

})
export class AppModule { }
