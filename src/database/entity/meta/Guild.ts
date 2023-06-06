import { Duration, add } from "date-fns";
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

const syncCooldown: Duration = { days: 30 };

@Entity({ name: "guilds" })
export class Guild extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  discordID!: string;

  @Column()
  lastSynced!: Date;

  public shouldSync(): boolean {
    return new Date() > add(this.lastSynced, syncCooldown);
  }
}
