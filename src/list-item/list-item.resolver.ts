import { Resolver, Query, Mutation, Args, Int, ID } from '@nestjs/graphql';
import { ListItemService } from './list-item.service';
import { ListItem } from './entities/list-item.entity';
import { CreateListItemInput, UpdateListItemInput } from './dto/inputs';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Resolver(() => ListItem)
@UseGuards(JwtAuthGuard)
export class ListItemResolver {
  constructor(private readonly listItemService: ListItemService) { }

  @Mutation(() => ListItem)
  async createListItem(
    @Args('createListItemInput') createListItemInput: CreateListItemInput
  ): Promise<ListItem> {
    return await this.listItemService.create(createListItemInput);
  }

  @Query(() => ListItem, { name: 'listItem' })
  async findOne(
    @Args('id', { type: () => ID }) id: string
  ): Promise<ListItem> {
    return await this.listItemService.findOne(id);
  }

  @Mutation(() => ListItem)
  async updateListItem(
    @Args('updateListItemInput') updateListItemInput: UpdateListItemInput
  ): Promise<ListItem> {
    return await this.listItemService.update(updateListItemInput.id, updateListItemInput);
  }

  // @Query(() => [ListItem], { name: 'listItem' })
  // findAll() {
  //   return this.listItemService.findAll();
  // }

  // @Mutation(() => ListItem)
  // removeListItem(@Args('id', { type: () => Int }) id: number) {
  //   return this.listItemService.remove(id);
  // }
}
