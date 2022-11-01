import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  CreateDateColumn,
} from "typeorm";
import { TimeRange } from "../../../lib/timeAndDate/TimeRange";

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

  @Column()
  channelID!: string;

  @Column()
  serverID!: string;

  @Column()
  userID!: string;

  @CreateDateColumn()
  runAt!: Date;

  static async mostUsedCommands(
    serverID: string,
    timeRange?: TimeRange
  ): Promise<MostUsedCommandsResponse[]> {
    let query = timeRange?.from
      ? this.query(
          `SELECT "commandID", count("commandID")
    FROM ${tableName}
    WHERE "serverID" = $1
      AND "runAt" between $2 and $3
    GROUP BY "commandID"
    ORDER BY 2 DESC`,
          [serverID, timeRange.from, timeRange.to ?? new Date()]
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
