import { Controller, Post, Body, UnauthorizedException, HttpCode, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ResetCodeService } from 'src/routes/redefinir_senha/reset-code.service';
import { MailerService } from 'src/routes/redefinir_senha/nodemailer/mailer.service';
import { ResetPasswordDto } from 'src/routes/redefinir_senha/dto/reset-password.dto';
import { CreateUserDto } from '../users/dto/create-user.dto'; // 1. Importar o DTO de criação de usuário

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService, 
    private resetCodeService: ResetCodeService,
    private mailerService: MailerService,
  ) {}

  @Post('login')
  @HttpCode(200)
  async login(@Body() body: { email: string; password: string }) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
    return this.authService.login(user);
  }

  /**
   * CORREÇÃO: A rota de registro agora espera o DTO completo no corpo
   * da requisição, que inclui o `empresaId`.
   */
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() body: { email: string }) {
    const user = await this.authService.validateEmailExists(body.email);
    if (!user) throw new BadRequestException('E-mail não encontrado');

    const code = this.resetCodeService.generateCode(body.email);
    await this.mailerService.sendCode(body.email, code);

    return { message: 'Código de verificação enviado para o e-mail' };
  }

  @Post('verify-code')
  async verifyCode(@Body() body: { email: string; code: string }) {
    const valid = this.resetCodeService.validateCode(body.email, body.code);
    if (!valid) throw new BadRequestException('Código inválido ou expirado');
    return { message: 'Código válido' };
  }

  @Post('reset-password')
  async resetPassword(@Body() body: ResetPasswordDto) {
    const valid = this.resetCodeService.validateCode(body.email, body.code);
    if (!valid) throw new BadRequestException('Código inválido ou expirado');

    await this.authService.resetPassword(body.email, body.password);
    this.resetCodeService.invalidateCode(body.email);

    return { message: 'Senha redefinida com sucesso' };
  }
}
