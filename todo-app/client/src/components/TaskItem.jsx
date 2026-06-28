import { Check, Trash2 } from 'lucide-react';

const priorityColors = {
  high: 'var(--state-error)',
  medium: 'var(--state-warning)',
  low: 'var(--state-success)',
  none: 'transparent',
};

export default function TaskItem({ task, onToggle, onDelete }) {
  const completed = !!task.completed;

  return (
    <div
      className="group flex items-center gap-3 rounded-todo-md border px-4 py-3.5 transition-all duration-200"
      style={{
        background: 'var(--todo-bg-card)',
        borderColor: 'var(--todo-border)',
      }}
    >
      {/* Checkbox */}
      <div
        onClick={() => onToggle(task.id)}
        className="flex items-center justify-center w-5 h-5 rounded-full border-2 shrink-0 cursor-pointer transition-all duration-200 active:scale-90"
        style={{
          borderColor: completed ? 'var(--todo-primary-500)' : 'var(--todo-primary-400)',
          background: completed ? 'var(--todo-primary-500)' : 'transparent',
        }}
      >
        {completed && <Check size={12} color="white" strokeWidth={3} />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className="text-[14px] font-medium leading-snug transition-all duration-200"
          style={{
            color: completed ? 'var(--todo-text-tertiary)' : 'var(--todo-text-primary)',
            textDecoration: completed ? 'line-through' : 'none',
          }}
        >
          {task.title}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span
            className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium"
            style={{
              background: 'var(--todo-primary-50)',
              color: completed ? 'var(--todo-text-tertiary)' : 'var(--todo-primary-700)',
            }}
          >
            {task.category_name}
          </span>
          <span className="text-[11px]" style={{ color: 'var(--todo-text-tertiary)' }}>
            {formatDate(task.due_date)}
          </span>
        </div>
      </div>

      {/* Priority + Delete */}
      <div className="flex items-center gap-2 shrink-0">
        {task.priority !== 'none' && (
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ background: priorityColors[task.priority] }}
          />
        )}
        <button
          onClick={() => onDelete(task.id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1"
          style={{ color: 'var(--todo-text-tertiary)' }}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const inputDate = new Date(date);
  inputDate.setHours(0, 0, 0, 0);

  const diffDays = Math.round((inputDate - today) / 86400000);

  if (diffDays === 0) return '今天';
  if (diffDays === 1) return '明天';
  if (diffDays > 1 && diffDays < 7) {
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return weekdays[inputDate.getDay()];
  }
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}
