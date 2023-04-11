import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "server_tag_bans" })
export class TagBan extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: true })
  serverID?: string;

  @Column()
  tag!: string;

  @Column({ default: false, nullable: true })
  isRegex!: boolean;

  asRegex(): RegExp {
    return new RegExp(this.tag, "i");
  }
}
