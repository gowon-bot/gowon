import { createConnection } from "typeorm";

export class DB {
  static async connect() {
    await createConnection();
  }
}
