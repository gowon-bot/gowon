import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from "typeorm";

@Entity()
export class Friend extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  userID!: string;

  @Column()
  friendUsername!: string;
}
