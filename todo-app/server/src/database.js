import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, '..', 'data', 'todo.db');

const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// 初始化表结构
db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT DEFAULT '',
    color TEXT NOT NULL DEFAULT '#3d8f52',
    icon TEXT NOT NULL DEFAULT 'briefcase',
    sort_order INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    category_id INTEGER NOT NULL,
    priority TEXT NOT NULL DEFAULT 'none',
    due_date TEXT,
    completed INTEGER NOT NULL DEFAULT 0,
    reminder INTEGER NOT NULL DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
  );
`);

// 种子数据 - 仅在表为空时插入
const categoryCount = db.prepare('SELECT COUNT(*) as count FROM categories').get();
if (categoryCount.count === 0) {
  const insertCategory = db.prepare(`
    INSERT INTO categories (name, description, color, icon, sort_order)
    VALUES (@name, @description, @color, @icon, @sort_order)
  `);
  insertCategory.run({ name: '工作', description: '项目、会议、报告', color: '#22c55e', icon: 'briefcase', sort_order: 1 });
  insertCategory.run({ name: '生活', description: '购物、家务、健康', color: '#f59e0b', icon: 'home', sort_order: 2 });
  insertCategory.run({ name: '学习', description: '阅读、课程、笔记', color: '#3b82f6', icon: 'book', sort_order: 3 });
  insertCategory.run({ name: '灵感', description: '创意、想法、灵感', color: '#a855f7', icon: 'lightbulb', sort_order: 4 });
}

const taskCount = db.prepare('SELECT COUNT(*) as count FROM tasks').get();
if (taskCount.count === 0) {
  const insertTask = db.prepare(`
    INSERT INTO tasks (title, description, category_id, priority, due_date, completed)
    VALUES (@title, @description, @category_id, @priority, @due_date, @completed)
  `);
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const wednesday = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0];

  insertTask.run({ title: '完成项目方案', description: '完成Q2项目方案的撰写和评审', category_id: 1, priority: 'high', due_date: today, completed: 0 });
  insertTask.run({ title: '购买食材', description: '去超市购买本周食材', category_id: 2, priority: 'none', due_date: today, completed: 1 });
  insertTask.run({ title: '阅读设计文章', description: '阅读最新的UX设计趋势文章', category_id: 3, priority: 'none', due_date: tomorrow, completed: 0 });
  insertTask.run({ title: '回复客户邮件', description: '回复客户的反馈邮件', category_id: 1, priority: 'medium', due_date: today, completed: 0 });
  insertTask.run({ title: '整理桌面', description: '整理办公桌面文件', category_id: 2, priority: 'none', due_date: wednesday, completed: 0 });
  insertTask.run({ title: '准备周会材料', description: '准备周一例会的汇报材料', category_id: 1, priority: 'high', due_date: tomorrow, completed: 0 });
}

export default db;
