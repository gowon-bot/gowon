import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from "typeorm";

@Entity({ name: "settings" })
export class Setting extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ nullable: true })
  scope?: string;

  @Column({ nullable: true })
  secondaryScope?: string;

  @Column()
  value!: string;
}
