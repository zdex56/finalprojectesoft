import { useState, useEffect } from 'react';
import { getTasks, type Task } from './api';
import CreateTaskModal from './CreateTaskModal';
import TaskDetailModal from './TaskDetailModal';

const PAGE_SIZE = 8;

function statusLabel(status: string) {
  if (status === 'new') return 'Новая';
  if (status === 'in_progress') return 'В работе';
  return 'Готова';
}

function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);

  const loadTasks = async () => 
{
    setLoading(true);
    setError('');
    try {
      const data = await getTasks(filterStatus || undefined, page, PAGE_SIZE);
      setTasks(data);
    } 
    catch (err) 
    {
      if (err instanceof Error) setError(err.message);
    } 
    finally 
    {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [filterStatus, page]);

  const handleFilterChange = (value: string) => {
    setFilterStatus(value);
    setPage(1);
  };

  return (
    <div>
      <div className="section-header">
        <h2>Мои задачи</h2>
        <button className="btn-primary" onClick={() => setShowCreate(true)}>
          + Создать задачу
        </button>
      </div>

      <div className="filter-row">
        <label>Фильтр:</label>
        <select value={filterStatus} onChange={(e) => handleFilterChange(e.target.value)}>
          <option value="">Все</option>
          <option value="new">Новые</option>
          <option value="in_progress">В работе</option>
          <option value="done">Готовые</option>
        </select>
      </div>

      {error && <p className="error-text">{error}</p>}
      {loading && <p className="empty-state">Загрузка...</p>}
      {!loading && tasks.length === 0 && <p className="empty-state">Задач нет</p>}


      <div className="task-grid">
        {tasks.map((task) => (
          <div key={task.id} className="task-card" onClick={() => setSelectedTaskId(task.id)}>
            <h3>{task.title}</h3>
            <h4>{task.description}</h4>
            <span className={`badge badge-${task.status}`}>{statusLabel(task.status)}</span>
          </div>
        ))}
      </div>



      {showCreate && (
        <CreateTaskModal onClose={() => setShowCreate(false)} onCreated={loadTasks} />
      )}

      {selectedTaskId !== null && (
        <TaskDetailModal
          taskId={selectedTaskId}
          onClose={() => setSelectedTaskId(null)}
          onChanged={loadTasks}
        />
      )}
            <div className="pagination">
        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
          Назад
        </button>
        <span>Страница {page}</span>
        <button onClick={() => setPage((p) => p + 1)} disabled={tasks.length < PAGE_SIZE}>
          Дальше
        </button>
      </div>
    </div>
  );
}

export default Dashboard;