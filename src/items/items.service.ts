import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateItemInput, UpdateItemInput } from './dto/inputs';

import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { Item } from './entities/item.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class ItemsService {

  constructor(
    @InjectRepository(Item)
    private readonly itemsRepository: Repository<Item>
  ) { }


  async create(createItemInput: CreateItemInput, user: User): Promise<Item> {

    const newItem = this.itemsRepository.create({
      ...createItemInput,
      user
    });

    return await this.itemsRepository.save(newItem);
  }


  async findAll(user: User): Promise<Item[]> {
    return this.itemsRepository.find({
      //? lazy: true in entity is required for this to work
      // relations: { user: true },
      where: {
        user: {
          id: user.id
        }
      }
    });
  }


  async findOne(id: string, user: User): Promise<Item> {

    const item = await this.itemsRepository.findOne({
      where: {
        id,
        user: {
          id: user.id
        }
      }
    });

    if (!item) {
      throw new NotFoundException(`Item with id ${id} not found`);
    }
    return item;
  }


  async update(id: string, updateItemInput: UpdateItemInput, user: User): Promise<Item> {

    await this.findOne(id, user);

    const item = await this.itemsRepository.preload(updateItemInput);

    if (!item) {
      throw new NotFoundException(`Item with id ${id} not found`);
    }

    return await this.itemsRepository.save(item);
  }


  //* soft delete not implemented here
  async remove(id: string, user: User): Promise<Item> {

    const item = await this.findOne(id, user);

    await this.itemsRepository.remove(item);

    return {
      ...item,
      id: id
    };
  }


}
