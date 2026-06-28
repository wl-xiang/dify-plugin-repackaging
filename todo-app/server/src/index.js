import express from 'express';
import cors from 'cors';
import tasksRouter from './routes/tasks.js';
import categoriesRouter from './routes/categories.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// 静态文件服务（生产环境前端构建产物）
// app.use(express.static('../client/dist'));

// API 路由
app.use('/api/tasks', tasksRouter);
app.use('/api/categories', categoriesRouter);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`✅ Todo API Server running at http://localhost:${PORT}`);
});
