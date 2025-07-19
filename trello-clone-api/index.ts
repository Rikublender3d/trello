import express from 'express';
import { AppDataSource } from './datasource';
import cors from 'cors';
import { List } from './entities/list.entity';
import { In } from 'typeorm';
import { Card } from './entities/card.entity';

const app = express();
// RenderはPORT環境変数を自動的に設定します。設定されていない場合は8888を使用します。
const PORT = parseInt(process.env.PORT || '8888', 10);

app.use(express.json());

// ----------------------------------------------------
// CORS設定の改善
// ----------------------------------------------------

// 環境変数 NODE_ENV を使用して、開発環境と本番環境を区別します。
// Renderでは通常、NODE_ENVは 'production' に設定されます。
const isProduction = process.env.NODE_ENV === 'production';

let allowedOrigin: string | string[];

if (isProduction) {
  // 本番環境では、Renderの環境変数に設定されたフロントエンドのURLを使用します。
  // Renderの環境変数に FRONTEND_URL=https://trello-lxh5.vercel.app を設定してください。
  allowedOrigin = process.env.FRONTEND_URL || 'https://trello-lxh5.vercel.app'; // 環境変数が設定されていない場合のフォールバック
  if (!process.env.FRONTEND_URL) {
    console.warn('警告: 環境変数 FRONTEND_URL が本番環境で設定されていません。CORSオリジンはデフォルト値に設定されます。');
  }
} else {
  // 開発環境では、ローカルのフロントエンドのURLを許可します。
  allowedOrigin = 'http://localhost:5173';
}

const corsOptions: cors.CorsOptions = {
  origin: allowedOrigin,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'], // 許可するHTTPメソッド
  credentials: true, // クッキーや認証情報を許可する場合にtrueに設定
  optionsSuccessStatus: 204 // プリフライトリクエスト成功時のステータスコード
};

app.use(cors(corsOptions));

// ----------------------------------------------------
// その他のルートとミドルウェア
// ----------------------------------------------------

const listRepository = AppDataSource.getRepository(List);
const cardRepository = AppDataSource.getRepository(Card);

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

    const nextPosition =
      maxPositionList != null ? maxPositionList.position + 1 : 0;

    const list = await listRepository.save({
      title,
      position: nextPosition,
    });

    res.status(201).json(list);
  } catch (error) {
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
  } catch (error) {
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
  } catch (error) {
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
      id: In(listArray.map((list) => list.id)),
    });

    res.status(200).json(updatedLists);
  } catch (error) {
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

    // maxPositionCard が存在しない場合、nextPosition を 0 に設定
    const nextPosition = maxPositionCard != null ? maxPositionCard.position + 1 : 0;


    const card = await cardRepository.save({
      title,
      listId,
      position: nextPosition,
    });

    res.status(201).json(card);
  } catch (error) {
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
  } catch (error) {
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
  } catch (error) {
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
      id: In(cardArray.map((card) => card.id)),
    });

    res.status(200).json(updatedCards);
  } catch (error) {
    console.error('カード更新エラー:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

AppDataSource.initialize().then(() => {
  console.log('データベースと接続しました');
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`サーバーがポート${PORT}で起動しました`);
  });
}).catch(error => console.error('データベース接続エラー:', error));
