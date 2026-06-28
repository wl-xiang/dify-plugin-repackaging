import { Routes, Route, Navigate } from 'react-router-dom';
import TaskList from './pages/TaskList';
import AddTask from './pages/AddTask';
import Categories from './pages/Categories';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<TaskList />} />
      <Route path="/add" element={<AddTask />} />
      <Route path="/categories" element={<Categories />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
