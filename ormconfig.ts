import { DataSource } from "typeorm";

export const gowonDatabase = new DataSource({
  migrationsTableName: "migrations",
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "gowon",
  password: "supersecret2",
  database: "gowon",
  logging: false,
  synchronize: false,
  name: "default",
  entities: ["src/database/entity/**/*.ts"],
  migrations: ["src/database/migration/**/*.ts"],
});
