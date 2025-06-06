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

@Module({
  imports: [
    AuthModule, 
    UsersModule,
    ProductsModule,
    ClientsModule,
    OrdersModule, 
    PreordersModule,
    EstoqueModule,
    ClienteSemaforoModule
  ],
  controllers: [AppController],
  providers: [AppService],

})
export class AppModule {}
