import {
  Entity,
  BaseEntity,
  OneToOne,
  JoinColumn,
  Column,
  Index,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./User";

@Entity({ name: "scrobbles" })
export class Scrobble extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @Column()
  title!: string;

  @Index()
  @Column()
  artist!: string;

  @Index()
  @Column({ nullable: true })
  album?: string;

  @Column()
  scrobbledAt!: Date;

  @Index()
  @OneToOne((_) => User)
  @JoinColumn()
  user!: User;
}
