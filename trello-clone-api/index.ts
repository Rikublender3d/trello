import express from "express";
import { AppDataSource } from "./datasource";
import cors from "cors";
import { List } from "./entities/list.entity";
import { Card } from "./entities/card.entity";
import { In } from "typeorm";

const app = express();
const PORT = process.env.PORT || 8888;

// CORS設定（重複を削除）
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://your-trello-clone.vercel.app'] // 実際のデプロイURLに変更
    : ['http://localhost:5173']
}));

app.use(express.json());

// データベース初期化を待つ
let isDbInitialized = false;
let listRepository: any;
let cardRepository: any;

const initializeDb = async () => {
  if (!isDbInitialized) {
    await AppDataSource.initialize();
    listRepository = AppDataSource.getRepository(List);
    cardRepository = AppDataSource.getRepository(Card);
    isDbInitialized = true;
    console.log("DB接続成功");
  }
};

// 全てのAPIルートの前にDB初期化を確認
app.use(async (req, res, next) => {
  if (!isDbInitialized) {
    await initializeDb();
  }
  next();
});

// ヘルスチェック用
app.get("/", (req, res) => {
  res.json({ message: "Trello Clone API is running!" });
});

// 既存のAPIルート（そのまま使用）
app.post("/lists", async (req, res) => {
  try {
    const { title } = req.body;
    const maxPositionListArray = await listRepository.find({
      order: { position: "DESC" },
      take: 1,
    });
    const maxPositionList = maxPositionListArray[0];
    const nextPosition = maxPositionList != null ? maxPositionList.position + 1 : 0;
    const list = await listRepository.save({ title, position: nextPosition });
    res.status(201).json(list);
  } catch (error) {
    console.log('リスト作成エラー:', error);
    res.status(500).json({ message: "サーバーエラー" });
  }
});

app.get("/lists", async (req, res) => {
  try {
    const lists = await listRepository.find({
      order: { position: "ASC" },
    });
    res.status(200).json(lists);
  } catch (error) {
    console.log('リスト取得エラー:', error);
    res.status(500).json({ message: "サーバーエラー" });
  }
});

// 他のAPIルートも同様に続ける...
app.delete("/lists/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const existingList = await listRepository.findOne({ where: { id } });
    if (existingList == null) {
      res.status(404).json({ message: "リストが見つかりません" });
      return;
    }
    await listRepository.delete({ id });
    res.status(200).json({ message: "リストを削除しました" });
  } catch (error) {
    console.log('リスト削除エラー:', error);
    res.status(500).json({ message: "サーバーエラー" });
  }
});

// 残りのAPIルートも同じように続ける...

// Vercel用のexport（重要！）
export default app;

// ローカル開発用
if (process.env.NODE_ENV !== 'production') {
  initializeDb().then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  });
}