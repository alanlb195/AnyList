import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { ItemsService } from './items.service';
import { CreateItemInput, UpdateItemInput } from './dto/inputs';
import { ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { ValidRoles } from 'src/auth/enums/valid-roles.enums';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

import { Item } from './entities/item.entity';
import { User } from 'src/users/entities/user.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

import { PaginationArgs, SearchArgs } from 'src/common/dto/args';

@Resolver(() => Item)
@UseGuards(JwtAuthGuard)
export class ItemsResolver {

  constructor(private readonly itemsService: ItemsService) { }

  @Mutation(() => Item, { name: 'createItem' })
  async createItem(
    @Args('createItemInput') createItemInput: CreateItemInput,
    @CurrentUser([ValidRoles.admin]) currentUser: User
  ): Promise<Item> {
    return this.itemsService.create(createItemInput, currentUser);
  }


  @Query(() => [Item], { name: 'items' })
  findAll(
    @CurrentUser() currentUser: User,
    @Args() paginationArgs: PaginationArgs,
    @Args() searchArgs: SearchArgs
  ): Promise<Item[]> {
    return this.itemsService.findAll(currentUser, paginationArgs, searchArgs);
  }


  @Query(() => Item, { name: 'item' })
  findOne(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: User
  ): Promise<Item> {
    return this.itemsService.findOne(id, currentUser);
  }


  @Mutation(() => Item, { name: 'updateItem' })
  updateItem(
    @Args('updateItemInput') updateItemInput: UpdateItemInput,
    @CurrentUser() currentUser: User
  ): Promise<Item> {
    return this.itemsService.update(updateItemInput.id, updateItemInput, currentUser);
  }


  @Mutation(() => Item, { name: 'removeItem' })
  removeItem(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: User
  ): Promise<Item> {
    return this.itemsService.remove(id, currentUser);
  }
}
