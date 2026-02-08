import { Injectable } from '@nestjs/common';
import { CreateItemInput, UpdateItemInput } from './dto/inputs';
import { Item } from './entities/item.entity';

import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ItemsService {

  constructor(
    @InjectRepository(Item)
    private readonly itemsRepository: Repository<Item>
  ) { }


  async create(createItemInput: CreateItemInput): Promise<Item> {
    const newItem = this.itemsRepository.create(createItemInput);
    return await this.itemsRepository.save(newItem);
  }


  async findAll(): Promise<Item[]> {
    return this.itemsRepository.find();
  }


  async findOne(id: string): Promise<Item> {
    const item = await this.itemsRepository.findOne({ where: { id } });
    if (!item) {
      throw new Error('Item not found');
    }
    return item;
  }


  async update(id: string, updateItemInput: UpdateItemInput): Promise<Item> {

    const item = await this.itemsRepository.preload(updateItemInput);
    if (!item) {
      throw new Error('Item not found');
    }
    return await this.itemsRepository.save(item);
  }

  //* soft delete not implemented here
  async remove(id: string): Promise<Item> {
    const item = await this.findOne(id);
    await this.itemsRepository.remove(item);
    return {
      ...item,
      id: id
    };
  }


}
