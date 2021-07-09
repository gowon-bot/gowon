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

  @ManyToOne((_) => User, { eager: true, nullable: true })
  friend?: User;

  @Column({ nullable: true })
  friendUsername?: string;
}
