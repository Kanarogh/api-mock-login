import { IsNotEmpty, IsNumber, IsOptional} from 'class-validator';

export class CreateCheckinDto {
  @IsNumber()
  @IsNotEmpty()
  clienteId: number;

  @IsNumber()
  @IsOptional() // Opcional, caso o app não consiga pegar a localização
  latitude?: number;

  @IsNumber()
  @IsOptional()
  longitude?: number;
}