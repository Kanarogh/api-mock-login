import { Module } from '@nestjs/common';
import { PreordersService } from './preorders.service';
import { PreordersController } from './preorders.controller';

@Module({
  controllers: [PreordersController],
  providers: [PreordersService],
})
export class PreordersModule {}