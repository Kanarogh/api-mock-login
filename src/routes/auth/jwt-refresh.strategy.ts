import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
    constructor(private readonly configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: configService.get<string>('JWT_REFRESH_SECRET'),
            passReqToCallback: true,
        });
    }

    validate(req: Request, payload: any) {
        // ✅ AJUSTE APLICADO AQUI
        // 1. Pega o cabeçalho de autorização.
        const authorization = req.get('authorization');

        // 2. Verifica se o cabeçalho existe. Se não, lança um erro.
        if (!authorization) {
            throw new UnauthorizedException('Cabeçalho de autorização não encontrado.');
        }

        // 3. Se o cabeçalho existe, podemos usá-lo com segurança.
        const refreshToken = authorization.replace('Bearer', '').trim();

        return { ...payload, refreshToken };
    }
}