import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { User } from './entities/user.entity';
import { SignupInput } from 'src/auth/dto/inputs/signup.input';
import { ArrayOverlap, EntityNotFoundError, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as argon2 from 'argon2';
import { ValidRoles } from 'src/auth/enums/valid-roles.enums';
import { UpdateUserInput } from './dto/update-user.input';

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

  async findAll(roles: ValidRoles[]): Promise<User[]> {

    if (roles.length === 0) return this.userRepository.find();

    return this.userRepository.find({
      where: {
        roles: ArrayOverlap(roles),
      },
      //? Not necessary to load relations, entity does it automatically
      // relations: {
      //   updatedBy: true
      // }
    });
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

  async blockUser(id: string, adminUser: User): Promise<User> {

    try {

      const userToBlock = await this.userRepository.findOneByOrFail({ id });

      await this.userRepository.update(userToBlock.id, { isActive: false, updatedBy: adminUser });
      return {
        ...userToBlock,
        isActive: false
      };

    } catch (error) {
      this.handleErrors(error);
    }
  }

  async update(updateUserInput: UpdateUserInput, adminUser: User): Promise<User> {
    try {

      const userToUpdate = await this.findOneById(updateUserInput.id);

      await this.userRepository.update(userToUpdate.id, { ...updateUserInput, updatedBy: adminUser });

      return {
        ...userToUpdate,
        ...updateUserInput
      };

    } catch (error) {
      this.handleErrors(error);
    }
  }


  private handleErrors(error: any): never {
    // this.logger.error(error);

    if (error instanceof EntityNotFoundError) {
      throw new NotFoundException('User not found');
    }

    if (error.code === '23505') {
      throw new BadRequestException(error.detail.replace('Key (email)=', ''));
    }

    throw new InternalServerErrorException('Please check logs');

  }
}
