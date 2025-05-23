import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'jwt_secret', // ou process.env.JWT_SECRET
    });
  }

  async validate(payload: any) {
    const user = await this.usersService.findById(payload.sub); // sub = id

    if (!user) {
      throw new UnauthorizedException('Usuário não existe mais');
    }

    return {
      userId: user.id,
      email: user.email,
      nome: user.nome,
    };
  }
}
