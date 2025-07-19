"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'sqlite',
    database: 'trello-clone.sqlite',
    synchronize: true,
    logging: false,
    entities: ['entities/*.entity.ts'],
    migrations: [],
    subscribers: [],
});
