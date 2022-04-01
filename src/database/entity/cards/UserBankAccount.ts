import {
  Entity,
  PrimaryGeneratedColumn,
  BaseEntity,
  OneToOne,
  JoinColumn,
  Column,
} from "typeorm";
import { User } from "../User";

@Entity({ name: "bank_accounts" })
export class UserBankAccount extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  amount!: number;

  @OneToOne((_) => User, { eager: true })
  @JoinColumn()
  user!: User;
}
