import { Entity, PrimaryGeneratedColumn, BaseEntity, Column } from "typeorm";

@Entity({ name: "server_tag_bans" })
export class TagBan extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  serverID!: string;

  @Column()
  tag!: string;
}
