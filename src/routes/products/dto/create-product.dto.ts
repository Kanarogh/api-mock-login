import { IsString, IsNumber, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsNumber()
  @IsNotEmpty()
  preco: number;
  
  // Adicione as validações para os outros campos também
  @IsNumber()
  @IsNotEmpty()
  imposto1: number;

  @IsNumber()
  @IsNotEmpty()
  imposto2: number;

  @IsNumber()
  @IsNotEmpty()
  custo: number;

  @IsBoolean()
  @IsOptional()
  jaFoiComprado?: boolean;

  @IsNumber()
  @IsOptional()
  quantidade?: number;
}