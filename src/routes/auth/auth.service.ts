import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
  const user = await this.usersService.findByEmail(email);

  // Detecta se a senha está em texto puro e faz o hash dinamicamente
  const isHash = user?.password?.startsWith('$2b$'); // simples verificação de hash bcrypt

  if (user) {
    const match = isHash
      ? await bcrypt.compare(password, user.password)
      : password === user.password;

    if (match) {
      const { password, ...result } = user;
      return result;
    }
  }
  return null;
}


async login(user: any) {
  const payload = { sub: user.id, email: user.email };
  return {
    access_token: this.jwtService.sign(payload),
    id: user.id,
    nome: user.nome,
    email: user.email,
      
    
  };
}


  async register(email: string, password: string, nome: string) {
  const user = await this.usersService.create(email, password, nome);
  return this.login(user);

}

async validateEmailExists(email: string) {
  return await this.usersService.findByEmail(email);
}

async resetPassword(email: string, newPassword: string) {
  const user = await this.usersService.findByEmail(email);
  if (!user) throw new BadRequestException('Usuário não encontrado');

  await this.usersService.updateById(user.id, { password: newPassword });

}

}
