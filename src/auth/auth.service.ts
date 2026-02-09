import { BadRequestException, Injectable } from '@nestjs/common';
import { AuthResponse } from './dto/types/auth-response.type';
import { SignupInput, LoginInput } from './dto/inputs';
import { UsersService } from 'src/users/users.service';
import * as argon2 from 'argon2';


@Injectable()
export class AuthService {

    constructor(
        private readonly usersService: UsersService,
    ) { }


    async signup(signupInput: SignupInput): Promise<AuthResponse> {

        const user = await this.usersService.create(signupInput);

        // todo: crear token
        return {
            user,
            token: '1234567890'
        }
    }

    async login(loginInput: LoginInput): Promise<AuthResponse> {
        const user = await this.usersService.findOneByEmail(loginInput.email);

        const isPasswordValid = await argon2.verify(user.password, loginInput.password);

        if (!isPasswordValid) {
            throw new BadRequestException('Invalid password');
        }

        return {
            user,
            token: '1234567890'
        }
    }


}
