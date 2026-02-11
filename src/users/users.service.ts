import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { User } from './entities/user.entity';
import { SignupInput } from 'src/auth/dto/inputs/signup.input';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as argon2 from 'argon2';

@Injectable()
export class UsersService {

  private readonly logger = new Logger('UsersService');

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  async create(signupInput: SignupInput): Promise<User> {
    try {

      const newUser = this.userRepository.create({
        ...signupInput,
        password: await argon2.hash(signupInput.password)
      });

      return await this.userRepository.save(newUser)

    } catch (error) {
      this.handleErrors(error);
    }

  }

  async findAll(): Promise<User[]> {
    return [];
  }

  async findOneByEmailWithPassword(email: string): Promise<User> {
    try {
      return this.userRepository
        .createQueryBuilder('user')
        .addSelect('user.password')
        .where('user.email = :email', { email })
        .getOneOrFail();

    } catch (error) {
      this.handleErrors(error);
    }
  }

  async findOneById(id: string): Promise<User> {
    try {

      const user = await this.userRepository.findOneByOrFail({ id });

      return user;

    } catch (error) {
      this.handleErrors(error);
    }
  }

  async blockUser(id: string): Promise<User> {
    throw new Error('Method not implemented.');
  }


  private handleErrors(error: any): never {
    this.logger.error(error.detail);

    if (error.code === '23505') {
      throw new BadRequestException(error.detail.replace('Key (email)=', ''));
    }

    throw new InternalServerErrorException('Please check logs');

  }
}
