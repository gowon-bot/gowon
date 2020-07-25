import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  CreateDateColumn,
} from "typeorm";

@Entity({ name: "meta__commandruns" })
export class CommandRun extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  commandID!: string;

  @Column()
  channelID!: string;

  @Column()
  serverID!: string;

  @Column()
  userID!: string;

  @CreateDateColumn()
  runAt!: Date;
}
