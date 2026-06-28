import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Calendar, Bell, Briefcase, Home, Book, Lightbulb } from 'lucide-react';
import { tasksAPI, categoriesAPI } from '../services/api';
import TabBar from '../components/TabBar';

const categoryIcons = {
  briefcase: Briefcase,
  home: Home,
  book: Book,
  lightbulb: Lightbulb,
};

const priorities = [
  { key: 'high', label: '高', color: 'var(--state-error)' },
  { key: 'medium', label: '中', color: 'var(--state-warning)' },
  { key: 'low', label: '低', color: 'var(--state-success)' },
];

export default function AddTask() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category_id: null,
    priority: 'high',
    due_date: new Date().toISOString().split('T')[0],
    reminder: true,
  });

  useEffect(() => {
    categoriesAPI.getAll().then(res => {
      setCategories(res.data);
      if (res.data.length > 0) {
        setForm(prev => ({ ...prev, category_id: res.data[0].id }));
      }
    });
  }, []);

  const handleSave = async () => {
    if (!form.title.trim()) {
      alert('请输入任务标题');
      return;
    }
    try {
      await tasksAPI.create({
        title: form.title,
        description: form.description,
        category_id: form.category_id,
        priority: form.priority,
        due_date: form.due_date,
        reminder: form.reminder,
      });
      navigate('/');
    } catch (err) {
      console.error('Failed to create task:', err);
      alert('创建任务失败，请重试');
    }
  };

  return (
    <main>
      <div
        className="max-w-[430px] mx-auto min-h-screen"
        style={{ background: 'var(--todo-bg)', paddingBottom: '140px' }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 pt-14 pb-4 safe-top">
          <button onClick={() => navigate('/')} className="cursor-pointer">
            <ChevronLeft size={20} style={{ color: 'var(--todo-text-primary)' }} />
          </button>
          <h1 className="todo-h2">新建任务</h1>
        </div>

        {/* Form */}
        <div className="px-5 flex flex-col gap-6">
          {/* Title */}
          <div>
            <label className="todo-h3 block mb-2">任务标题</label>
            <input
              type="text"
              placeholder="输入任务名称..."
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              className="w-full bg-transparent border-0 border-b-2 outline-none transition-colors duration-200 pb-3"
              style={{
                borderBottomColor: form.title ? 'var(--todo-primary-500)' : 'var(--todo-primary-200)',
                fontSize: '18px',
                color: 'var(--todo-text-primary)',
              }}
            />
          </div>

          {/* Description */}
          <div>
            <label className="todo-h3 block mb-2">任务描述</label>
            <textarea
              placeholder="添加详细描述（可选）"
              rows={3}
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full resize-none rounded-todo-md border outline-none transition-colors duration-200 px-4 py-3"
              style={{
                background: 'var(--todo-bg-subtle)',
                borderColor: 'var(--todo-border)',
                color: 'var(--todo-text-primary)',
                fontSize: '14px',
              }}
            />
          </div>

          {/* Category Selector */}
          <div>
            <label className="todo-h3 block mb-3">选择分类</label>
            <div className="flex gap-2 flex-wrap">
              {categories.map(cat => {
                const Icon = categoryIcons[cat.icon] || Briefcase;
                const selected = form.category_id === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setForm({ ...form, category_id: cat.id })}
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
                    style={
                      selected
                        ? { background: 'var(--todo-primary-500)', color: 'white' }
                        : { background: 'var(--todo-neutral-100)', color: 'var(--todo-text-secondary)' }
                    }
                  >
                    <Icon size={16} />
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Priority Selector */}
          <div>
            <label className="todo-h3 block mb-3">优先级</label>
            <div className="flex gap-3">
              {priorities.map(p => {
                const selected = form.priority === p.key;
                return (
                  <button
                    key={p.key}
                    onClick={() => setForm({ ...form, priority: p.key })}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-todo-md text-sm font-medium transition-all duration-200"
                    style={
                      selected
                        ? {
                            borderLeft: '3px solid ' + p.color,
                            background: p.key === 'high' ? 'rgba(239,68,68,0.08)' : p.key === 'medium' ? 'rgba(245,158,11,0.08)' : 'rgba(34,197,94,0.08)',
                            color: 'var(--todo-text-primary)',
                          }
                        : { background: 'var(--todo-neutral-100)', color: 'var(--todo-text-secondary)' }
                    }
                  >
                    <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="todo-h3 block mb-3">截止日期</label>
            <div
              className="flex items-center justify-between rounded-todo-md border px-4 py-3 cursor-pointer"
              style={{ background: 'var(--todo-bg-card)', borderColor: 'var(--todo-border)' }}
            >
              <div className="flex items-center gap-3">
                <Calendar size={20} style={{ color: 'var(--todo-primary-500)' }} />
                <div>
                  <div className="text-sm font-medium" style={{ color: 'var(--todo-text-primary)' }}>
                    {formatDateLabel(form.due_date)}
                  </div>
                </div>
              </div>
              <input
                type="date"
                value={form.due_date}
                onChange={e => setForm({ ...form, due_date: e.target.value })}
                className="opacity-0 absolute pointer-events-auto w-0 h-0"
              />
              <ChevronLeft
                size={16}
                style={{ color: 'var(--todo-text-tertiary)', transform: 'rotate(-90deg)' }}
              />
            </div>
            <input
              type="date"
              value={form.due_date}
              onChange={e => setForm({ ...form, due_date: e.target.value })}
              className="mt-2 w-full rounded-todo-md border px-4 py-2 text-sm"
              style={{
                background: 'var(--todo-bg-subtle)',
                borderColor: 'var(--todo-border)',
                color: 'var(--todo-text-primary)',
              }}
            />
          </div>

          {/* Reminder Toggle */}
          <div>
            <div
              className="flex items-center justify-between rounded-todo-md border px-4 py-3"
              style={{ background: 'var(--todo-bg-card)', borderColor: 'var(--todo-border)' }}
            >
              <div className="flex items-center gap-3">
                <Bell size={20} style={{ color: 'var(--todo-primary-500)' }} />
                <span className="text-sm font-medium" style={{ color: 'var(--todo-text-primary)' }}>
                  设置提醒
                </span>
              </div>
              <div
                onClick={() => setForm({ ...form, reminder: !form.reminder })}
                className="w-11 h-6 rounded-full relative cursor-pointer transition-colors duration-200"
                style={{ background: form.reminder ? 'var(--todo-primary-500)' : 'var(--todo-neutral-300)' }}
              >
                <div
                  className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all duration-200"
                  style={{ left: form.reminder ? '22px' : '2px', boxShadow: 'var(--shadow-sm)' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Save Button */}
      <div
        className="fixed bottom-[68px] left-0 right-0 z-40 px-5 pb-3 pt-2 max-w-[430px] mx-auto"
        style={{ background: 'var(--todo-bg)' }}
      >
        <button
          onClick={handleSave}
          className="w-full rounded-full text-white font-semibold text-base transition-opacity duration-200 active:opacity-90"
          style={{ height: '48px', background: 'var(--todo-primary-500)' }}
        >
          保存任务
        </button>
      </div>

      <TabBar />
    </main>
  );
}

function formatDateLabel(dateStr) {
  if (!dateStr) return '选择日期';
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const inputDate = new Date(date);
  inputDate.setHours(0, 0, 0, 0);
  const diffDays = Math.round((inputDate - today) / 86400000);

  if (diffDays === 0) return `今天, ${date.getMonth() + 1}月${date.getDate()}日`;
  if (diffDays === 1) return `明天, ${date.getMonth() + 1}月${date.getDate()}日`;
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}
