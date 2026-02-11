import { ConfigService } from "@nestjs/config";
import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

import { User } from "src/users/entities/user.entity";
import { JwtPayload } from "src/auth/interfaces/jwt-payload.interface";
import { AuthService } from "src/auth/auth.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {


    constructor(
        configService: ConfigService,
        private readonly authService: AuthService
    ) {
        super({
            secretOrKey: configService.getOrThrow('JWT_SECRET'),
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
        })
    }


    async validate(payload: JwtPayload): Promise<User> {

        const { id } = payload;

        const user = await this.authService.validateUser(id);

        // console.log({ user });

        return user;
    }
}