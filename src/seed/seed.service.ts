import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Item } from 'src/items/entities/item.entity';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { SEED_ITEMS, SEED_USERS } from './data/seed-data';
import { UsersService } from 'src/users/users.service';
import { ItemsService } from 'src/items/items.service';

@Injectable()
export class SeedService {

    private isProduction: boolean;

    constructor(
        private readonly configService: ConfigService,
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
        @InjectRepository(Item)
        private readonly itemsRepository: Repository<Item>,

        private readonly usersService: UsersService,
        private readonly itemsService: ItemsService,
    ) {
        this.isProduction = this.configService.get<string>('ENV', 'dev') === 'prod';
    }

    async executeSeed() {

        if (this.isProduction) {
            throw new Error('This action can only be performed in development environment.');
        }

        await this.deleteDatabase();

        const user = await this.loadUsers();

        await this.loadItems(user);

        return true;
    }

    async loadUsers(): Promise<User> {
        const users: User[] = [];

        for (const user of SEED_USERS) {
            users.push(await this.usersService.create(user));
        }

        return users[0];
    }

    async loadItems(user: User): Promise<void> {
        const itemsPromises: Promise<Item>[] = [];
        for (const item of SEED_ITEMS) {
            itemsPromises.push(this.itemsService.create({
                category: item.category,
                name: item.name,
                quantityUnits: item.quantityUnits || "",
            }, user));
        }
        await Promise.all(itemsPromises);
    }

    async deleteDatabase() {
        await this.itemsRepository.deleteAll();
        await this.usersRepository.deleteAll();
    }

}
