import { Controller, Post, Body, UnauthorizedException, HttpCode, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ResetCodeService } from 'src/routes/redefinir_senha/reset-code.service';
import { MailerService } from 'src/routes/redefinir_senha/nodemailer/mailer.service';
import { ResetPasswordDto } from 'src/routes/redefinir_senha/dto/reset-password.dto';


@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService, private resetCodeService: ResetCodeService,
    private mailerService: MailerService,) {}

  @Post('login')
  @HttpCode(200)
  async login(@Body() body: { email: string; password: string }) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
    return this.authService.login(user);
  }

  @Post('register')
  async register(@Body() body: { email: string; password: string , nome: string}) {
    return this.authService.register(body.email, body.password, body.nome);
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