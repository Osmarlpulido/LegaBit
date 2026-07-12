import { MongoClient, type Db } from "mongodb";

export type DatabaseHealth = {
  check(): Promise<void>;
};

export class MongoDatabase implements DatabaseHealth {
  readonly #client: MongoClient;
  readonly #databaseName: string;
  #database: Db | undefined;

  constructor(uri: string, databaseName: string) {
    this.#client = new MongoClient(uri, {
      appName: "legabit-api",
      maxIdleTimeMS: 30_000,
      serverSelectionTimeoutMS: 5_000
    });
    this.#databaseName = databaseName;
  }

  async connect(): Promise<Db> {
    if (!this.#database) {
      await this.#client.connect();
      this.#database = this.#client.db(this.#databaseName);
    }

    return this.#database;
  }

  async check(): Promise<void> {
    const database = await this.connect();
    await database.command({ ping: 1 });
  }

  async close(): Promise<void> {
    await this.#client.close();
    this.#database = undefined;
  }
}
