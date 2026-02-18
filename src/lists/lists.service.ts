import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { List } from './entities/list.entity';
import { User } from 'src/users/entities/user.entity';
import { CreateListInput, UpdateListInput } from './dto/inputs';
import { PaginationArgs, SearchArgs } from 'src/common/dto/args';

@Injectable()
export class ListsService {


  constructor(
    @InjectRepository(List)
    private readonly listsRepository: Repository<List>
  ) { }

  async create(createListInput: CreateListInput, user: User) {

    const newList = this.listsRepository.create({
      ...createListInput,
      user
    });

    return await this.listsRepository.save(newList);
  }

  async findAll(user: User, paginationArgs: PaginationArgs, searchArgs: SearchArgs) {
    const { limit, offset } = paginationArgs;
    const { search } = searchArgs;

    const queryBuilder = this.listsRepository.createQueryBuilder()
      .take(limit)
      .skip(offset)
      .where(`"userId" = :userId`, { userId: user.id });

    if (search) {
      queryBuilder.andWhere('LOWER(name) like :name', { name: `%${search.toLowerCase()}%` });
    }

    return queryBuilder.getMany();
  }

  async findOne(id: string, user: User) {
    const list = await this.listsRepository.findOne({
      where: {
        id,
        user: {
          id: user.id
        }
      }
    });

    if (!list) {
      throw new NotFoundException(`List with id ${id} not found`);
    }
    return list;
  }

  async update(id: string, updateListInput: UpdateListInput, user: User): Promise<List> {
    await this.findOne(id, user);

    const list = await this.listsRepository.preload(updateListInput);

    if (!list) {
      throw new NotFoundException(`List with id ${id} not found`);
    }

    return await this.listsRepository.save(list);
  }

  async remove(id: string, user: User): Promise<List> {
    const list = await this.findOne(id, user);

    await this.listsRepository.remove(list);

    return {
      ...list,
      id: id
    };
  }

  async listCounterByUser(user: User): Promise<number> {
    return this.listsRepository.count({
      where: {
        user: {
          id: user.id
        }
      }
    });
  }

}
