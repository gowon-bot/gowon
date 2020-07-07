import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from "typeorm";

@Entity({ name: "disabled_commands" })
export class DisabledCommand extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  commandID!: string;

  @Column()
  serverID!: string;

  @Column()
  commandFriendlyName!: string;
}
