import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "disabled_commands" })
export class __DeprecatedDisabledCommand extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  commandID!: string;

  @Column()
  serverID!: string;

  @Column()
  commandFriendlyName!: string;

  // devPermissions can only be modified by developers
  @Column({ default: false })
  devPermission!: boolean;
}
