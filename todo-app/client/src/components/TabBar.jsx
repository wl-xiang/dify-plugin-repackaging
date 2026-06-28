import { useNavigate, useLocation } from 'react-router-dom';
import { CheckSquare, PlusCircle, FolderPlus } from 'lucide-react';

export default function TabBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const tabStyle = (active) => ({
    background: active ? 'var(--todo-primary-50)' : 'transparent',
    color: active ? 'var(--todo-primary-500)' : 'var(--todo-text-tertiary)',
  });

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t"
      style={{
        background: 'var(--todo-bg-card)',
        borderColor: 'var(--todo-border)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="flex items-end justify-around max-w-[430px] mx-auto px-2 pt-2 pb-2">
        {/* Tasks Tab */}
        <button
          onClick={() => navigate('/')}
          className="flex flex-col items-center justify-center gap-0.5 w-16 h-14 rounded-xl transition-colors duration-200"
          style={tabStyle(isActive('/'))}
        >
          <CheckSquare size={20} strokeWidth={2} />
          <span className="text-[10px] font-medium">Tasks</span>
        </button>

        {/* Add Tab - Center FAB */}
        <button
          onClick={() => navigate('/add')}
          className="flex items-center justify-center w-12 h-12 -mt-6 rounded-full transition-transform duration-200 active:scale-95"
          style={{
            background: 'var(--todo-primary-500)',
            boxShadow: 'var(--shadow-float)',
          }}
        >
          <PlusCircle size={24} color="white" strokeWidth={2.5} />
        </button>

        {/* Categories Tab */}
        <button
          onClick={() => navigate('/categories')}
          className="flex flex-col items-center justify-center gap-0.5 w-16 h-14 rounded-xl transition-colors duration-200"
          style={tabStyle(isActive('/categories'))}
        >
          <FolderPlus size={20} strokeWidth={2} />
          <span className="text-[10px] font-medium">Categories</span>
        </button>
      </div>
    </nav>
  );
}
