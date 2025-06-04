import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { MailerService } from 'src/routes/redefinir_senha/nodemailer/mailer.service';
import { ResetCodeModule } from 'src/routes/redefinir_senha/reset-code.module';
import { JwtStrategy } from './jwt.strategy'; // ✅ importar a strategy
import { PassportModule } from '@nestjs/passport'; // ✅ importar passport

@Module({
  imports: [
    PassportModule, // ✅ necessário
    JwtModule.register({ secret: 'jwt_secret', signOptions: { expiresIn: '1d' } }),
    UsersModule,
    ResetCodeModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy, // ✅ registrar aqui
    MailerService,
  ],
})
export class AuthModule {}
