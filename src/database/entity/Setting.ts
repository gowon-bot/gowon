import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from "typeorm";

import { Settings } from "../../lib/Settings";

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

  static async getByName(
    name: Settings,
    scope?: string,
    secondaryScope?: string
  ): Promise<Setting | undefined> {
    let whereClause: {
      name: string;
      scope?: string;
      secondaryScope?: string;
    } = { name };

    if (scope) whereClause.scope = scope;
    if (secondaryScope) whereClause.secondaryScope = secondaryScope;

    return await this.findOne({ where: whereClause });
  }

  static async createUpdateOrDelete(
    name: Settings,
    scope: string,
    value?: string,
    secondaryScope?: string
  ): Promise<Setting | undefined> {
    let whereClause: {
      scope: string;
      name: string;
      secondaryScope?: string;
    } = { scope, name };

    if (secondaryScope) whereClause.secondaryScope = secondaryScope;

    let existingSetting = await this.findOne({
      where: whereClause,
    });

    if (existingSetting) {
      if (value === undefined) {
        await this.delete(existingSetting);

        return undefined;
      } else {
        existingSetting.value = value!;
        await existingSetting.save();
        return existingSetting;
      }
    } else if (value !== undefined) {
      let setting = this.create({ scope, name, value, secondaryScope });

      await setting.save();

      return setting;
    } else return undefined;
  }
}
