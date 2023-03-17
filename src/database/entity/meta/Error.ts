import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "errors" })
export class TrackedError extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  occurrenceCount!: number;

  static async logError(error: Error) {
    const existingError = await this.findOneBy({ name: error.name });

    if (existingError) {
      existingError.occurrenceCount++;

      await existingError.save();
    } else {
      const newError = this.create({ name: error.name, occurrenceCount: 1 });

      await newError.save();
    }
  }
}
