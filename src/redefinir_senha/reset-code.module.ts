import { Module } from '@nestjs/common';
import { ResetCodeService } from './reset-code.service';

@Module({
  providers: [ResetCodeService],
  exports: [ResetCodeService],
})
export class ResetCodeModule {}
