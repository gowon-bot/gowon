import { Connection, createConnection } from "typeorm";

export class DB {
  connection!: Connection;

  async connect() {
    this.connection = await createConnection("default");
  }

  async close() {
    await this.connection.close(); // bug in typeorm, closing a connection doesn't fully close it, causing it to error when trying to reconnect
  }
}
