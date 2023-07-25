import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";
import { DateRange } from "../../../lib/timeAndDate/DateRange";

export interface MostUsedCommandsResponse {
  commandID: string;
  count: number;
}

const tableName = "command_runs";

@Entity({ name: tableName })
export class CommandRun extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  commandID!: string;

  @Column({ nullable: true })
  channelID?: string;

  @Column({ nullable: true })
  serverID?: string;

  @Column()
  userID!: string;

  @CreateDateColumn()
  runAt!: Date;

  static async mostUsedCommands(
    serverID: string,
    dateRange?: DateRange
  ): Promise<MostUsedCommandsResponse[]> {
    let query = dateRange?.from
      ? this.query(
          `SELECT "commandID", count("commandID")
    FROM ${tableName}
    WHERE "serverID" = $1
      AND "runAt" between $2 and $3
    GROUP BY "commandID"
    ORDER BY 2 DESC`,
          [serverID, dateRange.from, dateRange.to ?? new Date()]
        )
      : this.query(
          `SELECT "commandID", count("commandID")
    FROM ${tableName}
    WHERE "serverID" = $1
    GROUP BY "commandID"
    ORDER BY 2 DESC`,
          [serverID]
        );

    return (await query) as MostUsedCommandsResponse[];
  }
}
