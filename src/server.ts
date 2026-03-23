import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { connectDB } from './database';
import authRoutes from './routes/auth';
import inventoryRoutes from './routes/inventory';
import noteRoutes from './routes/note';
import searchRoutes from './routes/search';

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 3000;

console.log('环境变量加载:', {
  DOUBAO_API_KEY: process.env.DOUBAO_API_KEY ? '已加载' : '未加载',
  PORT: process.env.PORT
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/inventories', inventoryRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/search', searchRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '东西笔记 API 运行中' });
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: '服务器内部错误' });
});

app.listen(PORT, () => {
  console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
});

export default app;
