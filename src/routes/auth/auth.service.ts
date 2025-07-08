import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService, User } from '../users/users.service';
import { EmpresasService } from '../empresas/empresas.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { ConfigService } from '@nestjs/config';
import { ResetPasswordDto } from 'src/routes/redefinir_senha/dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private empresasService: EmpresasService,
    private configService: ConfigService,
  ) { }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && user.password) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        const { password, refreshToken, ...result } = user;
        return result;
      }
    }
    return null;
  }

  async login(user: User): Promise<any> {
    const empresa = await this.empresasService.findOne(user.empresaId);
    const [accessToken, refreshToken] = await this.getTokens(user);

    await this.updateRefreshToken(user, refreshToken);

    return {
      accessToken,
      refreshToken,
      id: user.id,
      nome: user.nome,
      email: user.email,
      empresa: { id: empresa.id, nome: empresa.nome },
    };
  }

  async getTokens(user: User) {
    const accessTokenPayload = {
      sub: user.id,
      id: user.id,
      email: user.email,
      empresaId: user.empresaId,
      nome: user.nome,
    };
    // ✅ AJUSTE: O payload do refresh token agora também contém o empresaId.
    const refreshTokenPayload = {
      sub: user.id,
      empresaId: user.empresaId,
    };

    return Promise.all([
      this.jwtService.signAsync(accessTokenPayload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.configService.get<string>('JWT_EXPIRATION_TIME'),
      }),
      this.jwtService.signAsync(refreshTokenPayload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION_TIME'),
      }),
    ]);
  }

  async updateRefreshToken(user: User, refreshToken: string) {
    const salt = await bcrypt.genSalt();
    const hashedRefreshToken = await bcrypt.hash(refreshToken, salt);
    await this.usersService.updateById(
      user.id,
      { refreshToken: hashedRefreshToken },
      user.empresaId,
    );
  }

  async register(createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    const newUser = await this.usersService.findByEmail(user.email);
    if (!newUser) {
      throw new BadRequestException('Erro inesperado ao registrar o usuário.');
    }
    return this.login(newUser);
  }

  async validateEmailExists(email: string) {
    return this.usersService.findByEmail(email);
  }

  // ✅ AJUSTE: Método agora recebe o DTO para consistência.
  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const user = await this.usersService.findByEmail(resetPasswordDto.email);
    if (!user) {
      throw new BadRequestException('Usuário não encontrado');
    }
    await this.usersService.updateById(
      user.id,
      { password: resetPasswordDto.password },
      user.empresaId,
    );
  }

  async refreshTokens(userId: number, empresaId: number, refreshToken: string) {
    const user = await this.usersService.findById(userId, empresaId);
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Acesso Negado');
    }

    const refreshTokenMatches = await bcrypt.compare(
      refreshToken,
      user.refreshToken,
    );
    if (!refreshTokenMatches) {
      throw new UnauthorizedException('Acesso Negado');
    }

    const tokens = await this.getTokens(user);
    await this.updateRefreshToken(user, tokens[1]);
    return {
      accessToken: tokens[0],
      refreshToken: tokens[1],
    };
  }

  // ✅ AJUSTE: Método logout agora usa a busca segura com empresaId.
  async logout(userId: number, empresaId: number) {
    const user = await this.usersService.findById(userId, empresaId);
    if (user) {
      await this.usersService.updateById(
        user.id,
        { refreshToken: null },
        user.empresaId,
      );
    }
    return { message: 'Logout realizado com sucesso no servidor.' };
  }
}