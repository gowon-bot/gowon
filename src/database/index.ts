import { createConnection } from "typeorm";

export class DB {
  static async connect() {
    let connection = await createConnection();

    await connection.synchronize();
  }
}
