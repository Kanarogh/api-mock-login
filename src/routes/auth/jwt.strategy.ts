import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() { // Não precisamos mais do UsersService aqui
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'jwt_secret', // Lembre-se de usar variáveis de ambiente para isso
    });
  }

  async validate(payload: any) {
    // O 'payload' é o conteúdo decodificado e confiável do seu token.
    // Ele já tem tudo que precisamos.
    return {
      id: payload.id,           // ID do usuário logado
      empresaId: payload.empresaId, // ID da empresa à qual ele pertence
      email: payload.email,
      nome: payload.nome,
    };
  }
}