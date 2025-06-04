import * as nodemailer from 'nodemailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailerService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.configure();
  }

  private async configure() {
    const testAccount = await nodemailer.createTestAccount();
    this.transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    console.log('📩 Conta Ethereal criada:', testAccount.user);
  }

  async sendCode(email: string, code: string) {
    const info = await this.transporter.sendMail({
      from: 'Mock App <no-reply@mock.com>',
      to: email,
      subject: 'Redefinição de senha',
      text: `Seu código é: ${code}`,
     html: `
  <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 24px; background-color: #ffffff; border-radius: 8px; border: 1px solid #e0e0e0;">
    <h2 style="color: #333; text-align: center;">🔐 Redefinição de Senha</h2>
    <p style="font-size: 15px; color: #555;">
      Recebemos uma solicitação para redefinir sua senha. Insira o código abaixo no aplicativo para continuar:
    </p>

    <div style="background-color: #f5f5f5; border: 2px dashed #666; border-radius: 12px; padding: 24px; text-align: center; margin: 32px 0;">
      <span style="display: inline-block; font-size: 32px; font-weight: bold; color: #2c3e50; letter-spacing: 6px; font-family: 'Courier New', monospace;">
        ${code}
      </span>
    </div>

    <p style="font-size: 14px; color: #888;">
      Este código é válido por 10 minutos. Caso você não tenha solicitado a redefinição de senha, ignore este e-mail.
    </p>

    <p style="font-size: 13px; color: #aaa; margin-top: 32px; text-align: center;">
      — Equipe Mock App
    </p>
  </div>
`


    });

    console.log('📨 E-mail enviado:', info.messageId);
    console.log('🔗 Preview:', nodemailer.getTestMessageUrl(info));
  }
}
