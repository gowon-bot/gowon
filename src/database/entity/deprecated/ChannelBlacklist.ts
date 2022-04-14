import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from "typeorm";

@Entity({ name: "channel_blacklists" })
export class __DeprecatedChannelBlacklist extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  commandID!: string;

  @Column()
  serverID!: string;

  @Column()
  channelID!: string;
}
