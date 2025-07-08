import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { MailerService } from 'src/routes/redefinir_senha/nodemailer/mailer.service';
import { ResetCodeModule } from 'src/routes/redefinir_senha/reset-code.module';
import { JwtStrategy } from './jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { EmpresasModule } from '../empresas/empresas.module'; // 1. Importe o módulo de Empresas
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtRefreshStrategy } from './jwt-refresh.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({}), // Deixe vazio, vamos configurar no serviço
      inject: [ConfigService],
    }),
    UsersModule,
    ResetCodeModule,
    EmpresasModule, // 2. Adicione o EmpresasModule aqui
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    MailerService,
    JwtRefreshStrategy,
  ],
})
export class AuthModule { }
