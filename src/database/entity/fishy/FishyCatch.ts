import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Fishy } from "../../../services/fishy/classes/Fishy";
import { findFishy } from "../../../services/fishy/fishyList";
import { User } from "../User";

@Entity({ name: "fishy_catches" })
export class FishyCatch extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne((_) => User, (user) => user.fishies, { eager: true })
  owner!: User;

  @ManyToOne((_) => User, (user) => user.fishyGifts, { eager: true })
  gifter?: User;

  @Column()
  fishyId!: string;

  @Column({ type: "float" })
  weight!: number;

  @CreateDateColumn()
  fishedAt!: Date;

  get fishy(): Fishy {
    return findFishy({ byID: this.fishyId })!;
  }
}
