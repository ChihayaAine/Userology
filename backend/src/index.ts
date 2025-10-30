import 'module-alias/register';
import moduleAlias from 'module-alias';
moduleAlias.addAlias('@', __dirname);
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from root directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import interviewersRoutes from './routes/interviewers.routes';
import interviewsRoutes from './routes/interviews.routes';
import responsesRoutes from './routes/responses.routes';
import analyticsRoutes from './routes/analytics.routes';
import callRoutes from './routes/call.routes';
import clientsRoutes from './routes/clients.routes';
import feedbackRoutes from './routes/feedback.routes';
import questionsRoutes from './routes/questions.routes';

dotenv.config();

const app = express();
const PORT = process.env.BACKEND_PORT || process.env.PORT || 8090;

// Middleware
app.use(helmet());
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'https://userology.xin',
    'https://userology.xin',
    'http://localhost:8089',
    'http://127.0.0.1:8089',
    'http://47.93.101.73:8089',  // 生产环境前端地址
    'http://47.93.101.73'         // 不带端口的版本
  ],
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 为长访谈设置更长的超时时间（10分钟）
app.use((req, res, next) => {
  // 对于 call retrieve endpoint，设置更长的超时（长访谈需要更多处理时间）
  if (req.path.includes('/api/call/') && req.method === 'GET') {
    req.setTimeout(600000); // 10分钟
    res.setTimeout(600000); // 10分钟
  }
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/interviewers', interviewersRoutes);
app.use('/api/interviews', interviewsRoutes);
app.use('/api/responses', responsesRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/call', callRoutes);
app.use('/api', clientsRoutes);
app.use('/api', feedbackRoutes);
app.use('/api', questionsRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, async () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'https://userology.xin'}`);
  
  // 数据库预热：异步执行，不阻塞服务启动
  setImmediate(async () => {
    try {
      const { supabase } = await import('./config/database');
      await supabase.from('interviewer').select('id').limit(1);
      console.log('🔥 Database warmed up');
    } catch (error) {
      console.warn('⚠️  Database warm-up failed (non-critical)');
    }
  });
});

export default app;
