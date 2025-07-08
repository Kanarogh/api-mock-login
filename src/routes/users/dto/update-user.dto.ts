import { IsOptional, IsString, IsEmail, MinLength, IsInt } from 'class-validator';

export class UpdateUserDto {
  @IsInt()
  @IsOptional()
  id?: number; // Mantido conforme sua necessidade

  @IsString()
  @IsOptional()
  @MinLength(2)
  nome?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  @MinLength(6)
  password?: string;

  @IsString()
  @IsOptional()
  refreshToken?: string | null;
}