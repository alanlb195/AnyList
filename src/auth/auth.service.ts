import { BadRequestException, Injectable } from '@nestjs/common';
import { AuthResponse } from './dto/types/auth-response.type';
import { SignupInput, LoginInput } from './dto/inputs';
import { UsersService } from 'src/users/users.service';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/entities/user.entity';


@Injectable()
export class AuthService {

    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) { }


    private getJwtToken(userId: string): string {
        return this.jwtService.sign({ id: userId });
    }

    async signup(signupInput: SignupInput): Promise<AuthResponse> {

        const user = await this.usersService.create(signupInput);

        const token = this.getJwtToken(user.id);

        return {
            user,
            token
        }
    }

    async login(loginInput: LoginInput): Promise<AuthResponse> {
        const user = await this.usersService.findOneByEmailWithPassword(loginInput.email);

        const isPasswordValid = await argon2.verify(user.password, loginInput.password);

        if (!isPasswordValid) {
            throw new BadRequestException('Invalid password');
        }

        if (!user.isActive) {
            throw new BadRequestException('User is not active, talk to admin');
        }

        const token = this.getJwtToken(user.id);

        return {
            user,
            token
        }
    }

    async validateUser(id: string): Promise<User> {
        const user = await this.usersService.findOneById(id);

        if (!user.isActive) {
            throw new BadRequestException('User is not active, talk to admin');
        }

        return user;
    }


    revalidateToken(user: User): AuthResponse {

        const token = this.getJwtToken(user.id);

        return {
            user,
            token
        }
    }


}
