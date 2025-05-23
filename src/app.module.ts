import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { ClientsModule } from './clients/clients.module';
import { OrdersModule } from './orders/orders.module';
import { PreordersModule } from './preorders/preorders.module';

@Module({
  imports: [
    AuthModule, 
    UsersModule,
    ProductsModule,
    ClientsModule,
    OrdersModule, 
    PreordersModule,
  ],
  controllers: [AppController],
  providers: [AppService],

})
export class AppModule {}
