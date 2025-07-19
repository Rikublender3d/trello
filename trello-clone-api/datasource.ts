import { DataSource } from "typeorm";
import { List } from "./entities/list.entity";
import { Card } from "./entities/card.entity";

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: process.env.NODE_ENV === 'production'
    ? '/tmp/trello-clone.sqlite' // Vercelの一時ディレクトリ
    : 'trello-clone.sqlite',     // ローカル開発用
  synchronize: true,
  logging: process.env.NODE_ENV !== 'production', // 本番では無効化
  entities: [List, Card], // パス指定ではなく実際のエンティティクラスを指定
  migrations: [],
  subscribers: [],
});