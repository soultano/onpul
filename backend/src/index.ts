import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import meRoutes from './routes/me.js';
import financeRoutes from './routes/finance.js';
import quizRoutes from './routes/quiz.js';
import historyRoutes from './routes/history.js';
import { telegramAuthMiddleware } from './middleware/telegramAuth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS и базовые middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'finuroven-backend', time: new Date().toISOString() });
});

// Публичный роут авторизации
app.use('/api', authRoutes);

// Все остальные роуты защищены Telegram авторизацией
app.use('/api', telegramAuthMiddleware);
app.use('/api', meRoutes);
app.use('/api', financeRoutes);
app.use('/api', quizRoutes);
app.use('/api', historyRoutes);

// Запуск сервера
app.listen(PORT, () => {
  console.log('====================================================');
  console.log(`🚀 ФинУровень Backend запущен на порту ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log('====================================================');
});

export default app;
