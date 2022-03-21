import {
  Entity,
  PrimaryGeneratedColumn,
  BaseEntity,
  CreateDateColumn,
  ManyToOne,
  Column,
} from "typeorm";
import { User } from "../User";

@Entity({ name: "album_cards" })
export class AlbumCard extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne((_) => User, (user) => user.albumCards, { eager: true })
  firstOwner!: User;

  @ManyToOne((_) => User, (user) => user.albumCards, { eager: true })
  owner!: User;

  @Column()
  artist!: string;

  @Column()
  album!: string;

  @Column()
  playcount!: number;

  @CreateDateColumn()
  createdAt!: Date;
}
