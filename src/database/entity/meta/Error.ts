import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from "typeorm";

@Entity({ name: "errors" })
export class TrackedError extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  occurrenceCount!: number;

  static async logError(error: Error) {
    let existingError = await this.findOne({ where: { name: error.name } });

    if (existingError) {
      existingError.occurrenceCount++;

      await existingError.save();
    } else {
      let newError = this.create({ name: error.name, occurrenceCount: 1 });

      await newError.save()
    }
  }
}
