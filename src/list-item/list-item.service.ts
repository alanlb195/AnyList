import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateListItemInput, UpdateListItemInput } from './dto/inputs';
import { ListItem } from './entities/list-item.entity';
import { List } from 'src/lists/entities/list.entity';
import { Item } from 'src/items/entities/item.entity';
import { PaginationArgs, SearchArgs } from 'src/common/dto/args';

@Injectable()
export class ListItemService {

  constructor(
    @InjectRepository(ListItem)
    private readonly listItemRepository: Repository<ListItem>
  ) { }

  async create(createListItemInput: CreateListItemInput): Promise<ListItem> {

    const { itemId, listId, ...rest } = createListItemInput;

    const newListItem = this.listItemRepository.create({
      ...rest,
      item: { id: itemId },
      list: { id: listId }
    });

    await this.listItemRepository.save(newListItem);

    return this.findOne(newListItem.id);

  }

  async findAll(list: List, paginationArgs: PaginationArgs, searchArgs: SearchArgs): Promise<ListItem[]> {

    const { limit, offset } = paginationArgs;
    const { search } = searchArgs;

    const queryBuilder = this.listItemRepository.createQueryBuilder()
      .take(limit)
      .skip(offset)
      .where(`"listId" = :listId`, { listId: list.id });

    if (search) {
      queryBuilder
        .leftJoin('listItem.item', 'item')
        .andWhere('LOWER(item.name) like :name', { name: `%${search.toLowerCase()}%` });
    }

    return await queryBuilder.getMany();
  }

  async count(list: List): Promise<number> {
    return this.listItemRepository.count({
      where: {
        list: {
          id: list.id
        }
      }
    });
  }

  async findOne(id: string) {

    const listItem = await this.listItemRepository.findOneBy({ id });

    if (!listItem) throw new NotFoundException(`List item with id: ${id} not found.`)

    return listItem;

  }

  async update(id: string, updateListItemInput: UpdateListItemInput): Promise<ListItem> {

    const listItem = await this.findOne(id);

    if (updateListItemInput.listId) {
      listItem.list = { id: updateListItemInput.listId } as List;
    }

    if (updateListItemInput.itemId) {
      listItem.item = { id: updateListItemInput.itemId } as Item;
    }

    Object.assign(listItem, updateListItemInput);

    await this.listItemRepository.save(listItem);

    // Return updated list item
    const updatedListItem = await this.listItemRepository.findOne({
      where: { id },
      relations: ['list', 'item'],
    });

    if (!updatedListItem) throw new NotFoundException(`List item with id: ${id} not found.`)

    return updatedListItem;
  }

  // remove(id: number) {
  //   return `This action removes a #${id} listItem`;
  // }
}
