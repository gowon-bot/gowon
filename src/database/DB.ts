import { DataSource } from "typeorm";
import { gowonDatabase } from "../../ormconfig";

export class DB {
  dataSource!: DataSource;

  async connect(): Promise<DataSource> {
    this.dataSource = await gowonDatabase.initialize();
    await gowonDatabase.synchronize();

    return gowonDatabase;
  }

  async close() {
    await this.dataSource.destroy();
  }
}
