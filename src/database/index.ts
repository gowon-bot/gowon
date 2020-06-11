import { createConnection } from "typeorm";

export class DB {
  static async connect() {
    let conn = await createConnection();
  }
}
