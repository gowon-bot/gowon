import {
  Entity,
  PrimaryGeneratedColumn,
  BaseEntity,
  OneToOne,
  JoinColumn,
  Column,
} from "typeorm";
import { Crown } from "./Crown";

export interface BootlegRedirect {
  redirectedFrom: string;
  redirectedTo: string;
}

@Entity({ name: "bootleg_crowns" })
export class BootlegCrown extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  artistName!: string;

  @Column()
  serverID!: string;

  @OneToOne((_) => Crown, { eager: true })
  @JoinColumn()
  crown!: Crown;

  static async findRedirect(
    artistName: string,
    serverID: string
  ): Promise<BootlegRedirect | undefined> {
    let bootleg = await this.findOne({ artistName, serverID });

    if (bootleg) {
      return {
        redirectedFrom: bootleg.artistName,
        redirectedTo: bootleg.crown.artistName,
      };
    } else return undefined;
  }
}
