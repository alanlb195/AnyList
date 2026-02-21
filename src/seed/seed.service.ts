import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UsersService } from 'src/users/users.service';
import { ItemsService } from 'src/items/items.service';
import { ListsService } from 'src/lists/lists.service';
import { ListItemService } from 'src/list-item/list-item.service';

import { ListItem } from 'src/list-item/entities/list-item.entity';
import { List } from 'src/lists/entities/list.entity';
import { Item } from 'src/items/entities/item.entity';
import { User } from 'src/users/entities/user.entity';

import { SEED_ITEMS, SEED_USERS, SEED_LISTS } from './data/seed-data';


@Injectable()
export class SeedService {

    private isProduction: boolean;

    private logger = new Logger(SeedService.name);

    constructor(
        private readonly configService: ConfigService,
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
        @InjectRepository(Item)
        private readonly itemsRepository: Repository<Item>,
        @InjectRepository(List)
        private readonly listsRepository: Repository<List>,
        @InjectRepository(ListItem)
        private readonly listItemsRepository: Repository<ListItem>,

        private readonly usersService: UsersService,
        private readonly itemsService: ItemsService,
        private readonly listsService: ListsService,
        private readonly listItemsService: ListItemService,
    ) {
        this.isProduction = this.configService.get<string>('ENV', 'dev') === 'prod';
    }

    async executeSeed() {

        if (this.isProduction) {
            this.logger.error('This action can only be performed in development environment.');
            return false;
        }

        await this.deleteDatabase();

        // Seed users
        const users = await this.loadUsers();

        for (const user of users) {
            const items = await this.loadItems(user);
            const lists = await this.loadLists(user);
            await this.loadListItems(items, lists);
        }

        return true;
    }

    async loadUsers(): Promise<User[]> {
        const users: User[] = [];

        for (const user of SEED_USERS) {
            users.push(await this.usersService.create(user));
        }

        return users;
    }


    async loadItems(user: User): Promise<Item[]> {
        const itemsPromises: Promise<Item>[] = [];
        for (const item of SEED_ITEMS) {
            itemsPromises.push(this.itemsService.create({
                category: item.category,
                name: item.name,
                quantityUnits: item.quantityUnits || "",
            }, user));
        }
        return await Promise.all(itemsPromises);
    }

    async loadLists(user: User): Promise<List[]> {
        const listsPromises: Promise<List>[] = [];
        for (const list of SEED_LISTS) {
            listsPromises.push(
                this.listsService.create(
                    { name: `${list.name} - ${user.fullName}` },
                    user
                )
            );
        }
        return await Promise.all(listsPromises);
    }

    async loadListItems(items: Item[], lists: List[]) {

        const MAX_PER_LIST = 5;

        // Tomamos solo los primeros 15 items
        const selectedItems = items.slice(0, MAX_PER_LIST * lists.length);

        let itemIndex = 0;

        const listItemPromises: Promise<ListItem>[] = [];

        for (const list of lists) {

            for (let i = 0; i < MAX_PER_LIST; i++) {

                const item = selectedItems[itemIndex++];

                if (!item) break;

                listItemPromises.push(
                    this.listItemsService.create({
                        quantity: Math.floor(Math.random() * 10) + 1,
                        completed: Math.random() < 0.5,
                        listId: list.id,
                        itemId: item.id,
                    })
                );
            }
        }

        await Promise.all(listItemPromises);
    }


    async deleteDatabase() {
        await this.listItemsRepository.deleteAll();
        await this.listsRepository.deleteAll();
        await this.itemsRepository.deleteAll();
        await this.usersRepository.deleteAll();
    }

}
