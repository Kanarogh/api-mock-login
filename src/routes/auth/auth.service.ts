import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { EmpresasService } from '../empresas/empresas.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../users/dto/create-user.dto'; // Importa o DTO de criação

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private empresasService: EmpresasService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        const { password, ...result } = user;
        return result;
      }
    }
    return null;
  }

  async login(user: any) {
    const empresa = await this.empresasService.findOne(user.empresaId);
    const payload = {
      sub: user.id,
      id: user.id,
      empresaId: user.empresaId,
      email: user.email,
      nome: user.nome,
    };

    return {
      access_token: this.jwtService.sign(payload),
      id: user.id,
      nome: user.nome,
      email: user.email,
      empresa: {
        id: empresa.id,
        nome: empresa.nome,
      },
    };
  }

  /**
   * CORREÇÃO: O método register agora recebe o DTO completo,
   * que inclui o 'empresaId', e o repassa para o usersService.
   */
  async register(createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    // Após criar, busca o usuário recém-criado para ter todos os dados para o login.
    const newUser = await this.usersService.findByEmail(user.email);
    return this.login(newUser);
  }

  async validateEmailExists(email: string) {
    return await this.usersService.findByEmail(email);
  }

  /**
   * CORREÇÃO: O método resetPassword agora busca o usuário e usa a 'empresaId'
   * dele para chamar o updateById com os 3 argumentos corretos.
   */
  async resetPassword(email: string, newPassword: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new BadRequestException('Usuário não encontrado');
    }

    // Passando os 3 argumentos esperados pelo método updateById
    await this.usersService.updateById(user.id, { password: newPassword }, user.empresaId);
  }
}