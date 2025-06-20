import { IsOptional, IsString } from 'class-validator';

export class CreateCheckoutDto {
  @IsString()
  @IsOptional()
  observacoes?: string;
}