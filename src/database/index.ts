import { createConnection, Connection } from "typeorm";

export class DB {
  connection!: Connection;

  async connect() {
    this.connection = await createConnection("default");

    await this.connection.synchronize();
  }

  async connectTest() {
    if (this.connection) this.connection.connect();
    else {
      this.connection = await createConnection({
        name: "default",
        type: "postgres",
        host: "localhost",
        port: 5432,
        username: "john",
        password: "password",
        database: "gowon_test",
        synchronize: true,
        logging: false,
        entities: [__dirname + "/entity/**/*.ts"],
      });
    }

    await this.connection.synchronize();
  }

  async close() {
    await this.connection.close(); // bug in typeorm, closing a connection doesn't fully close it, causing it to error when trying to reconnect
  }
}
