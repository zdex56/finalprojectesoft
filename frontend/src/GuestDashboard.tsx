import { useState, useEffect } from 'react';
import { getLocalTasks, type LocalTask } from './localTasks';
import GuestTaskModal from './GuestTaskModal';

interface GuestDashboardProps {
  onRequireLogin: () => void;
}

function statusLabel(status: string) {
  if (status === 'new') return 'Новая';
  if (status === 'in_progress') return 'В работе';
  return 'Готова';
}

function GuestDashboard({ onRequireLogin }: GuestDashboardProps) {
  const [tasks, setTasks] = useState<LocalTask[]>([]);
  const [filterStatus, setFilterStatus] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [selectedTask, setSelectedTask] = useState<LocalTask | null>(null);

  const reload = () => {
    setTasks(getLocalTasks());
  };

  useEffect(() => {
    reload();
  }, []);

  const filteredTasks = filterStatus ? tasks.filter((t) => t.status === filterStatus) : tasks;

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
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">Все</option>
          <option value="new">Новые</option>
          <option value="in_progress">В работе</option>
          <option value="done">Готовые</option>
        </select>
      </div>

      {filteredTasks.length === 0 && <p className="empty-state">Задач нет</p>}

      <div className="task-grid">
        {filteredTasks.map((task) => (
          <div key={task.id} className="task-card" onClick={() => setSelectedTask(task)}>
            <h3>{task.title}</h3>
            <span className={`badge badge-${task.status}`}>{statusLabel(task.status)}</span>
          </div>
        ))}
      </div>

      {showCreate && (
        <GuestTaskModal
          task={null}
          onClose={() => setShowCreate(false)}
          onSaved={reload}
          onRequireLogin={onRequireLogin}
        />
      )}

      {selectedTask && (
        <GuestTaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onSaved={reload}
          onRequireLogin={onRequireLogin}
        />
      )}
    </div>
  );
}

export default GuestDashboard;