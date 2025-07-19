"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const datasource_1 = require("./datasource");
const cors_1 = __importDefault(require("cors"));
const list_entity_1 = require("./entities/list.entity");
const typeorm_1 = require("typeorm");
const card_entity_1 = require("./entities/card.entity");
const app = (0, express_1.default)();
const PORT = 8888;
app.use(express_1.default.json());
const allowedOrigin = [
    'http://localhost:5173',
    'https://trello-lxh5.vercel.app'
];
const options = {
    origin: allowedOrigin
};
app.use((0, cors_1.default)(options));
const listRepository = datasource_1.AppDataSource.getRepository(list_entity_1.List);
const cardRepository = datasource_1.AppDataSource.getRepository(card_entity_1.Card);
app.get('/', (req, res) => {
    res.send('Hello World');
});
app.post('/lists', async (req, res) => {
    try {
        const { title } = req.body;
        const maxPositionListArray = await listRepository.find({
            order: { position: 'DESC' },
            take: 1,
        });
        const maxPositionList = maxPositionListArray[0];
        const nextPosition = maxPositionList != null ? maxPositionList.position + 1 : 0;
        const list = await listRepository.save({
            title,
            position: nextPosition,
        });
        res.status(201).json(list);
    }
    catch (error) {
        console.error('リスト作成エラー:', error);
        res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
});
app.get('/lists', async (req, res) => {
    try {
        const lists = await listRepository.find({
            order: { position: 'ASC' },
        });
        res.status(200).json(lists);
    }
    catch (error) {
        console.error('リスト取得エラー:', error);
        res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
});
app.delete('/lists/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const existingList = await listRepository.findOne({ where: { id } });
        if (existingList == null) {
            res.status(404).json({ message: 'リストが見つかりません' });
            return;
        }
        await listRepository.delete(id);
        res.status(200).json({ message: 'リストを削除しました' });
    }
    catch (error) {
        console.error('リスト削除エラー:', error);
        res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
});
app.put('/lists', async (req, res) => {
    try {
        const { lists } = req.body;
        const listArray = Array.isArray(lists) ? lists : [lists];
        for await (const list of listArray) {
            await listRepository.save(list);
        }
        const updatedLists = await listRepository.findBy({
            id: (0, typeorm_1.In)(listArray.map((list) => list.id)),
        });
        res.status(200).json(updatedLists);
    }
    catch (error) {
        console.error('リスト更新エラー:', error);
        res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
});
app.post('/cards', async (req, res) => {
    try {
        const { title, listId } = req.body;
        const maxPositionCardArray = await cardRepository.find({
            where: { listId },
            order: { position: 'DESC' },
            take: 1,
        });
        const maxPositionCard = maxPositionCardArray[0];
        const nextPosition = maxPositionCard != null ? maxPositionCard.position : 0;
        const card = await cardRepository.save({
            title,
            listId,
            position: nextPosition,
        });
        res.status(201).json(card);
    }
    catch (error) {
        console.error('カード作成エラー:', error);
        res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
});
app.get('/cards', async (req, res) => {
    try {
        const cards = await cardRepository.find({
            order: { position: 'ASC' },
        });
        res.status(200).json(cards);
    }
    catch (error) {
        console.error('カード取得エラー:', error);
        res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
});
app.delete('/cards/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const existingCard = await cardRepository.findOne({
            where: { id },
        });
        if (existingCard == null) {
            res.status(404).json({ message: 'カードが見つかりません' });
            return;
        }
        await cardRepository.delete(id);
        res.status(200).json({ message: 'カードを削除しました' });
    }
    catch (error) {
        console.error('カード削除エラー:', error);
        res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
});
app.put('/cards', async (req, res) => {
    try {
        const { cards } = req.body;
        const cardArray = Array.isArray(cards) ? cards : [cards];
        for await (const card of cardArray) {
            await cardRepository.save(card);
        }
        const updatedCards = await cardRepository.findBy({
            id: (0, typeorm_1.In)(cardArray.map((card) => card.id)),
        });
        res.status(200).json(updatedCards);
    }
    catch (error) {
        console.error('カード更新エラー:', error);
        res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
});
datasource_1.AppDataSource.initialize().then(() => {
    console.log('データベースと接続しました');
    app.listen(PORT, () => {
        console.log(`サーバーがポート${PORT}で起動しました`);
    });
});
