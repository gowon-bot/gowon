import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  UpdateDateColumn,
  ManyToOne,
} from "typeorm";
import { User } from "./User";

@Entity()
export class Crown extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  serverID!: string;

  @ManyToOne((type) => User, (user) => user.crowns, { eager: true })
  user!: User;

  @Column()
  artistName!: string;

  @Column()
  plays!: number;

  @Column()
  version!: number;

  @UpdateDateColumn()
  updatedAt!: Date;

  // static methods
  static async getCrown(
    serverID: string,
    artistName: string
  ): Promise<Crown | undefined> {
    return await Crown.findOne({ where: { serverID, artistName } });
  }
}
