import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { tasksAPI, categoriesAPI } from '../services/api';
import TaskItem from '../components/TaskItem';
import TabBar from '../components/TabBar';

export default function TaskList() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([tasksAPI.getAll(), categoriesAPI.getAll()])
      .then(([tasksRes, catsRes]) => {
        setTasks(tasksRes.data);
        setCategories(catsRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = async (id) => {
    try {
      const res = await tasksAPI.toggle(id);
      setTasks(prev =>
        prev.map(t => (t.id === id ? { ...t, completed: res.data.completed } : t))
      );
    } catch (err) {
      console.error('Failed to toggle task:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await tasksAPI.delete(id);
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  // 过滤任务
  const filteredTasks = activeFilter === 'all'
    ? tasks
    : tasks.filter(t => t.category_name === activeFilter);

  // 统计
  const todayTasks = tasks.filter(t => isToday(t.due_date));
  const completedCount = todayTasks.filter(t => t.completed).length;
  const pendingCount = todayTasks.filter(t => !t.completed).length;

  // 问候语
  const hour = new Date().getHours();
  const greeting = hour < 6 ? '凌晨好' : hour < 12 ? '早上好' : hour < 14 ? '中午好' : hour < 18 ? '下午好' : '晚上好';
  const dateStr = formatDateCN(new Date());

  return (
    <main className="relative mx-auto max-w-[430px] min-h-screen pb-24">
      {/* Top Header */}
      <div className="flex items-start justify-between px-5 pt-14 pb-4 safe-top">
        <div>
          <h1
            className="text-[26px] leading-tight tracking-tight font-bold"
            style={{ color: 'var(--todo-text-primary)' }}
          >
            {greeting}
          </h1>
          <p
            className="mt-1 text-[13px]"
            style={{ color: 'var(--todo-text-tertiary)' }}
          >
            {dateStr}
          </p>
        </div>
        <div
          className="flex items-center justify-center w-10 h-10 rounded-full shrink-0"
          style={{ background: 'var(--todo-primary-100)' }}
        >
          <span
            className="text-[14px] font-semibold"
            style={{ color: 'var(--todo-primary-700)' }}
          >
            L
          </span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="flex gap-2.5 px-5 pb-5">
        <StatPill label="今天" value={`${todayTasks.length} 项`} />
        <StatPill label="已完成" value={completedCount} />
        <StatPill label="待处理" value={pendingCount} />
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 px-5 pb-5 overflow-x-auto no-scrollbar">
        <FilterTab
          label="全部"
          active={activeFilter === 'all'}
          onClick={() => setActiveFilter('all')}
        />
        {categories.map(cat => (
          <FilterTab
            key={cat.id}
            label={cat.name}
            active={activeFilter === cat.name}
            onClick={() => setActiveFilter(cat.name)}
          />
        ))}
      </div>

      {/* Task List */}
      <div className="flex flex-col gap-2.5 px-4">
        {loading ? (
          <div className="text-center py-10" style={{ color: 'var(--todo-text-tertiary)' }}>
            加载中...
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-10" style={{ color: 'var(--todo-text-tertiary)' }}>
            <p className="text-sm">暂无任务</p>
            <p className="text-xs mt-1">点击右下角 + 添加新任务</p>
          </div>
        ) : (
          filteredTasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {/* FAB Button */}
      <button
        onClick={() => navigate('/add')}
        className="fixed bottom-24 z-40 flex items-center justify-center w-12 h-12 rounded-full transition-transform duration-200 active:scale-95"
        style={{
          background: 'var(--todo-primary-500)',
          boxShadow: 'var(--shadow-float)',
          right: 'max(16px, calc(50vw - 215px + 16px))',
        }}
      >
        <Plus size={24} color="white" strokeWidth={2.5} />
      </button>

      <TabBar />
    </main>
  );
}

function StatPill({ label, value }) {
  return (
    <div
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
      style={{ background: 'var(--todo-primary-100)' }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: 'var(--todo-primary-500)' }}
      />
      <span
        className="text-[12px] font-medium"
        style={{ color: 'var(--todo-text-secondary)' }}
      >
        {label}
      </span>
      <span
        className="text-[12px] font-bold"
        style={{ color: 'var(--todo-primary-700)' }}
      >
        {value}
      </span>
    </div>
  );
}

function FilterTab({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="shrink-0 px-4 py-1.5 rounded-full text-[13px] font-medium transition-colors duration-200"
      style={
        active
          ? { background: 'var(--todo-primary-500)', color: 'var(--todo-text-inverse)' }
          : { background: 'var(--todo-bg-subtle)', color: 'var(--todo-text-secondary)' }
      }
    >
      {label}
    </button>
  );
}

function isToday(dateStr) {
  if (!dateStr) return false;
  const today = new Date();
  const date = new Date(dateStr);
  return date.toDateString() === today.toDateString();
}

function formatDateCN(date) {
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return `${date.getMonth() + 1}月${date.getDate()}日 ${weekdays[date.getDay()]}`;
}
