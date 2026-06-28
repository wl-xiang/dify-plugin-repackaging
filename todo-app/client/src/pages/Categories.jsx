import { useState, useEffect } from 'react';
import {
  Briefcase, Home, Book, Lightbulb, Plus, MoreVertical, ChevronRight, FolderPlus,
} from 'lucide-react';
import { categoriesAPI } from '../services/api';
import TabBar from '../components/TabBar';

const categoryIcons = {
  briefcase: Briefcase,
  home: Home,
  book: Book,
  lightbulb: Lightbulb,
};

const availableColors = [
  { name: 'success', value: '#22c55e' },
  { name: 'warning', value: '#f59e0b' },
  { name: 'info', value: '#3b82f6' },
  { name: 'purple', value: '#a855f7' },
];

const availableIcons = ['briefcase', 'home', 'book', 'lightbulb'];

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    color: '#22c55e',
    icon: 'briefcase',
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = () => {
    categoriesAPI.getAll()
      .then(res => setCategories(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) {
      alert('请输入分类名称');
      return;
    }
    try {
      await categoriesAPI.create(newCategory);
      setNewCategory({ name: '', description: '', color: '#22c55e', icon: 'briefcase' });
      setShowAddForm(false);
      loadCategories();
    } catch (err) {
      console.error('Failed to create category:', err);
      alert('创建分类失败');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm('确定要删除此分类吗？')) return;
    try {
      await categoriesAPI.delete(id);
      loadCategories();
    } catch (err) {
      alert('该分类下还有任务，无法删除');
    }
  };

  return (
    <main
      className="max-w-[430px] mx-auto px-5 pb-[calc(80px+env(safe-area-inset-bottom,0px))]"
    >
      {/* Header */}
      <div className="flex items-center justify-between pt-14 pb-2 safe-top">
        <h1 className="text-xl font-semibold" style={{ color: 'var(--todo-text-primary)' }}>
          分类管理
        </h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="text-base font-semibold border-none bg-transparent cursor-pointer py-2"
          style={{ color: 'var(--todo-primary-500)' }}
        >
          新建
        </button>
      </div>

      {/* Summary */}
      <p className="text-xs mb-5 pl-0.5" style={{ color: 'var(--todo-text-tertiary)' }}>
        共 {categories.length} 个分类
      </p>

      {/* Category Cards */}
      <div className="flex flex-col gap-3">
        {loading ? (
          <div className="text-center py-10" style={{ color: 'var(--todo-text-tertiary)' }}>
            加载中...
          </div>
        ) : (
          categories.map(cat => {
            const Icon = categoryIcons[cat.icon] || Briefcase;
            return (
              <div
                key={cat.id}
                className="flex items-center border rounded-todo-md p-4 cursor-pointer transition-colors duration-200"
                style={{
                  background: 'var(--todo-bg-card)',
                  borderColor: 'var(--todo-border)',
                }}
              >
                {/* Color dot + Icon */}
                <div className="flex items-center gap-3 flex-shrink-0 min-w-[80px]">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: cat.color }} />
                  <div
                    className="w-10 h-10 rounded-todo-sm flex items-center justify-center flex-shrink-0"
                    style={{ background: hexToRgba(cat.color, 0.08) }}
                  >
                    <Icon size={20} style={{ color: cat.color }} />
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 ml-1">
                  <div className="text-base font-semibold" style={{ color: 'var(--todo-text-primary)', lineHeight: 1.3 }}>
                    {cat.name}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--todo-text-tertiary)' }}>
                    {cat.description}
                  </div>
                  <div className="text-xs mt-1.5" style={{ color: 'var(--todo-text-secondary)' }}>
                    {cat.task_count} 项任务
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                  <button
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="bg-transparent border-none cursor-pointer p-1 transition-colors duration-200"
                    style={{ color: 'var(--todo-text-tertiary)' }}
                  >
                    <MoreVertical size={18} />
                  </button>
                  <ChevronRight size={16} style={{ color: 'var(--todo-text-tertiary)' }} />
                </div>
              </div>
            );
          })
        )}

        {/* Add New Category Card */}
        <div
          onClick={() => setShowAddForm(true)}
          className="flex items-center justify-center gap-2 rounded-todo-md p-4 cursor-pointer transition-colors duration-200"
          style={{
            background: 'var(--todo-bg-subtle)',
            border: '1.5px dashed var(--todo-border)',
          }}
        >
          <Plus size={20} style={{ color: 'var(--todo-primary-500)' }} />
          <span className="text-base font-semibold" style={{ color: 'var(--todo-primary-500)' }}>
            添加新分类
          </span>
        </div>
      </div>

      {/* Add Category Modal */}
      {showAddForm && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center"
          style={{ background: 'rgba(0,0,0,0.3)' }}
          onClick={() => setShowAddForm(false)}
        >
          <div
            className="w-full max-w-[430px] rounded-t-2xl p-6 pb-8"
            style={{ background: 'var(--todo-bg-card)' }}
            onClick={e => e.stopPropagation()}
          >
            <h2 className="todo-h2 mb-5">新建分类</h2>

            {/* Name */}
            <div className="mb-4">
              <label className="todo-h3 block mb-2">分类名称</label>
              <input
                type="text"
                placeholder="输入分类名称..."
                value={newCategory.name}
                onChange={e => setNewCategory({ ...newCategory, name: e.target.value })}
                className="w-full bg-transparent border-0 border-b-2 outline-none transition-colors duration-200 pb-2"
                style={{
                  borderBottomColor: 'var(--todo-primary-200)',
                  fontSize: '16px',
                  color: 'var(--todo-text-primary)',
                }}
              />
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="todo-h3 block mb-2">描述</label>
              <input
                type="text"
                placeholder="输入描述（可选）..."
                value={newCategory.description}
                onChange={e => setNewCategory({ ...newCategory, description: e.target.value })}
                className="w-full bg-transparent border-0 border-b-2 outline-none transition-colors duration-200 pb-2"
                style={{
                  borderBottomColor: 'var(--todo-primary-200)',
                  fontSize: '16px',
                  color: 'var(--todo-text-primary)',
                }}
              />
            </div>

            {/* Color */}
            <div className="mb-4">
              <label className="todo-h3 block mb-2">颜色</label>
              <div className="flex gap-3">
                {availableColors.map(c => (
                  <button
                    key={c.name}
                    onClick={() => setNewCategory({ ...newCategory, color: c.value })}
                    className="w-8 h-8 rounded-full transition-transform duration-200"
                    style={{
                      background: c.value,
                      transform: newCategory.color === c.value ? 'scale(1.2)' : 'scale(1)',
                      border: newCategory.color === c.value ? '3px solid var(--todo-bg-card)' : 'none',
                      boxShadow: newCategory.color === c.value ? `0 0 0 2px ${c.value}` : 'none',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Icon */}
            <div className="mb-6">
              <label className="todo-h3 block mb-2">图标</label>
              <div className="flex gap-3">
                {availableIcons.map(iconName => {
                  const Icon = categoryIcons[iconName] || Briefcase;
                  const selected = newCategory.icon === iconName;
                  return (
                    <button
                      key={iconName}
                      onClick={() => setNewCategory({ ...newCategory, icon: iconName })}
                      className="w-10 h-10 rounded-todo-md flex items-center justify-center transition-all duration-200"
                      style={
                        selected
                          ? { background: 'var(--todo-primary-500)', color: 'white' }
                          : { background: 'var(--todo-bg-subtle)', color: 'var(--todo-text-secondary)' }
                      }
                    >
                      <Icon size={20} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 rounded-full font-semibold text-sm py-3"
                style={{
                  background: 'var(--todo-bg-subtle)',
                  color: 'var(--todo-text-secondary)',
                }}
              >
                取消
              </button>
              <button
                onClick={handleAddCategory}
                className="flex-1 rounded-full text-white font-semibold text-sm py-3 transition-opacity duration-200 active:opacity-90"
                style={{ background: 'var(--todo-primary-500)' }}
              >
                创建
              </button>
            </div>
          </div>
        </div>
      )}

      <TabBar />
    </main>
  );
}

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
