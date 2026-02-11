import { UseGuards } from '@nestjs/common';
import { Args, Resolver, Mutation, Query } from '@nestjs/graphql';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

import { SignupInput, LoginInput } from './dto/inputs';
import { AuthResponse } from './dto/types/auth-response.type';

import { CurrentUser } from './decorators/current-user.decorator';
import { ValidRoles } from './enums/valid-roles.enums';
import { AuthService } from './auth.service';
import { User } from 'src/users/entities/user.entity';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) { }


  @Mutation(() => AuthResponse, { name: 'signup' })
  async signup(
    @Args('signupInput') signupInput: SignupInput
  ): Promise<AuthResponse> {
    return await this.authService.signup(signupInput);
  }

  @Mutation(() => AuthResponse, { name: 'login' })
  async login(
    @Args('loginInput') loginInput: LoginInput
  ): Promise<AuthResponse> {
    return await this.authService.login(loginInput);
  }


  @Query(() => AuthResponse, { name: 'revalidateToken' })
  @UseGuards(JwtAuthGuard)
  revalidateToken(
    @CurrentUser() user: User
  ): AuthResponse {
    return this.authService.revalidateToken(user);
  }
}
