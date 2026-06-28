import { Router } from 'express';
import db from '../database.js';

const router = Router();

// 获取所有任务（支持按分类筛选）
router.get('/', (req, res) => {
  const { category_id, completed } = req.query;
  let query = `
    SELECT t.*, c.name as category_name, c.color as category_color, c.icon as category_icon
    FROM tasks t
    JOIN categories c ON t.category_id = c.id
    WHERE 1=1
  `;
  const params = [];

  if (category_id) {
    query += ' AND t.category_id = ?';
    params.push(category_id);
  }
  if (completed !== undefined) {
    query += ' AND t.completed = ?';
    params.push(completed === 'true' ? 1 : 0);
  }

  query += ' ORDER BY t.completed ASC, t.created_at DESC';
  const tasks = db.prepare(query).all(...params);
  res.json(tasks);
});

// 获取单个任务
router.get('/:id', (req, res) => {
  const task = db.prepare(`
    SELECT t.*, c.name as category_name, c.color as category_color, c.icon as category_icon
    FROM tasks t
    JOIN categories c ON t.category_id = c.id
    WHERE t.id = ?
  `).get(req.params.id);

  if (!task) return res.status(404).json({ error: '任务不存在' });
  res.json(task);
});

// 创建任务
router.post('/', (req, res) => {
  const { title, description = '', category_id, priority = 'none', due_date = null, reminder = 0 } = req.body;
  if (!title || !category_id) {
    return res.status(400).json({ error: '标题和分类为必填项' });
  }

  const result = db.prepare(`
    INSERT INTO tasks (title, description, category_id, priority, due_date, reminder)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(title, description, category_id, priority, due_date, reminder ? 1 : 0);

  const newTask = db.prepare(`
    SELECT t.*, c.name as category_name, c.color as category_color, c.icon as category_icon
    FROM tasks t
    JOIN categories c ON t.category_id = c.id
    WHERE t.id = ?
  `).get(result.lastInsertRowid);

  res.status(201).json(newTask);
});

// 更新任务
router.put('/:id', (req, res) => {
  const { title, description, category_id, priority, due_date, completed, reminder } = req.body;
  const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: '任务不存在' });

  db.prepare(`
    UPDATE tasks SET
      title = COALESCE(?, title),
      description = COALESCE(?, description),
      category_id = COALESCE(?, category_id),
      priority = COALESCE(?, priority),
      due_date = COALESCE(?, due_date),
      completed = COALESCE(?, completed),
      reminder = COALESCE(?, reminder),
      updated_at = datetime('now')
    WHERE id = ?
  `).run(
    title ?? null,
    description ?? null,
    category_id ?? null,
    priority ?? null,
    due_date ?? null,
    completed ?? null,
    reminder ?? null,
    req.params.id
  );

  const updated = db.prepare(`
    SELECT t.*, c.name as category_name, c.color as category_color, c.icon as category_icon
    FROM tasks t
    JOIN categories c ON t.category_id = c.id
    WHERE t.id = ?
  `).get(req.params.id);

  res.json(updated);
});

// 切换任务完成状态
router.patch('/:id/toggle', (req, res) => {
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  if (!task) return res.status(404).json({ error: '任务不存在' });

  db.prepare('UPDATE tasks SET completed = ?, updated_at = datetime(\'now\') WHERE id = ?')
    .run(task.completed ? 0 : 1, req.params.id);

  res.json({ id: task.id, completed: task.completed ? 0 : 1 });
});

// 删除任务
router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: '任务不存在' });
  res.status(204).send();
});

export default router;
