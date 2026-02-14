import { ObjectType, Field, ID } from '@nestjs/graphql';
import { ValidRoles } from 'src/auth/enums/valid-roles.enums';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'users' })
@ObjectType()
export class User {

  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column()
  @Field(() => String)
  fullName: string;

  @Column({ unique: true })
  @Field(() => String)
  email: string

  @Column({ select: false })
  password: string;

  @Column({
    type: 'enum',
    enum: ValidRoles,
    array: true,
    default: [ValidRoles.user],
  })
  @Field(() => [ValidRoles])
  roles: ValidRoles[];

  @Column({
    type: 'boolean',
    default: true,
  })
  @Field(() => Boolean)
  isActive: boolean;

  // Relationships
  @ManyToOne(() => User, (user) => user.updatedBy, { nullable: true, lazy: true })
  @JoinColumn({ name: 'updatedBy' })
  @Field(() => User, { nullable: true })
  updatedBy?: User;

}
