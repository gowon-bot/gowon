import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  CreateDateColumn,
} from "typeorm";
import { TimeRange } from "../../../helpers/date";

export interface MostUsedCommandsResponse {
  commandID: string;
  count: number;
}

@Entity({ name: "meta__commandruns" })
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
    FROM meta__commandruns
    WHERE "serverID" like $1
      AND "runAt" between $2 and $3
    GROUP BY "commandID"
    ORDER BY 2 DESC`,
          [serverID, timeRange.from, timeRange.to ?? new Date()]
        )
      : this.query(
          `SELECT "commandID", count("commandID")
    FROM meta__commandruns
    WHERE "serverID" like $1
    GROUP BY "commandID"
    ORDER BY 2 DESC`,
          [serverID]
        );

    return (await query) as MostUsedCommandsResponse[];
  }
}
