import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  ManyToOne,
} from "typeorm";
import { User } from "./User";

@Entity({ name: "friends" })
export class Friend extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne((_) => User, (user) => user.friends, { eager: true })
  user!: User;

  @Column()
  serverID!: string;

  @Column()
  friendUsername!: string;
}
