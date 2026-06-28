import { Router } from 'express';
import db from '../database.js';

const router = Router();

// 获取所有分类（含任务数统计）
router.get('/', (req, res) => {
  const categories = db.prepare(`
    SELECT c.*, COUNT(t.id) as task_count
    FROM categories c
    LEFT JOIN tasks t ON t.category_id = c.id
    GROUP BY c.id
    ORDER BY c.sort_order ASC
  `).all();
  res.json(categories);
});

// 获取单个分类
router.get('/:id', (req, res) => {
  const category = db.prepare(`
    SELECT c.*, COUNT(t.id) as task_count
    FROM categories c
    LEFT JOIN tasks t ON t.category_id = c.id
    WHERE c.id = ?
    GROUP BY c.id
  `).get(req.params.id);

  if (!category) return res.status(404).json({ error: '分类不存在' });
  res.json(category);
});

// 创建分类
router.post('/', (req, res) => {
  const { name, description = '', color = '#3d8f52', icon = 'folder' } = req.body;
  if (!name) return res.status(400).json({ error: '分类名称为必填项' });

  const maxOrder = db.prepare('SELECT MAX(sort_order) as max_order FROM categories').get();
  const sortOrder = (maxOrder.max_order || 0) + 1;

  const result = db.prepare(`
    INSERT INTO categories (name, description, color, icon, sort_order)
    VALUES (?, ?, ?, ?, ?)
  `).run(name, description, color, icon, sortOrder);

  const newCategory = db.prepare(`
    SELECT c.*, COUNT(t.id) as task_count
    FROM categories c
    LEFT JOIN tasks t ON t.category_id = c.id
    WHERE c.id = ?
    GROUP BY c.id
  `).get(result.lastInsertRowid);

  res.status(201).json(newCategory);
});

// 更新分类
router.put('/:id', (req, res) => {
  const { name, description, color, icon, sort_order } = req.body;
  const existing = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: '分类不存在' });

  db.prepare(`
    UPDATE categories SET
      name = COALESCE(?, name),
      description = COALESCE(?, description),
      color = COALESCE(?, color),
      icon = COALESCE(?, icon),
      sort_order = COALESCE(?, sort_order),
      updated_at = datetime('now')
    WHERE id = ?
  `).run(name ?? null, description ?? null, color ?? null, icon ?? null, sort_order ?? null, req.params.id);

  const updated = db.prepare(`
    SELECT c.*, COUNT(t.id) as task_count
    FROM categories c
    LEFT JOIN tasks t ON t.category_id = c.id
    WHERE c.id = ?
    GROUP BY c.id
  `).get(req.params.id);

  res.json(updated);
});

// 删除分类
router.delete('/:id', (req, res) => {
  const taskCount = db.prepare('SELECT COUNT(*) as count FROM tasks WHERE category_id = ?').get(req.params.id);
  if (taskCount.count > 0) {
    return res.status(400).json({ error: '该分类下还有任务，无法删除' });
  }

  const result = db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: '分类不存在' });
  res.status(204).send();
});

export default router;
