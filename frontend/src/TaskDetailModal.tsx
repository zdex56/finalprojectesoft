import { useState, useEffect } from 'react';
import Modal from './Modal';
import {
  getTaskDetail,
  updateTask,
  deleteTask,
  addAssignee,
  removeAssignee,
  getUsers,
  type TaskDetail,
  type UserListItem,
} from './api';

interface TaskDetailModalProps {
  taskId: number;
  onClose: () => void;
  onChanged: () => void;
}

function TaskDetailModal({ taskId, onClose, onChanged }: TaskDetailModalProps) {
  const [task, setTask] = useState<TaskDetail | null>(null);
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('new');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getTaskDetail(taskId);
      setTask(data);
      setTitle(data.title);
      setDescription(data.description || '');
      setStatus(data.status);
    }
     catch (err) {
      if (err instanceof Error) setError(err.message);
    } 
    finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      setUsers(await getUsers());
    } 
    catch (err)
     {
      if (err instanceof Error) setError(err.message);
    }
  };

  useEffect(() => {
    load();
    loadUsers();
  }, [taskId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    setSaving(true);
    setError('');
    try {
      await updateTask(taskId, { title, description, status });
      onChanged();
      await load();
    } 
    catch (err) 
    {
      if (err instanceof Error) setError(err.message);
    } 
    finally 
    {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTask(taskId);
      onChanged();
      onClose();
    } 
    catch (err) 
    {
      if (err instanceof Error) setError(err.message);
    }
  };

  const handleAddAssignee = async (userId: number) => 
    {
    try {
      await addAssignee(taskId, userId);
      onChanged();
      await load();
    } 
    catch (err) 
    {
      if (err instanceof Error) setError(err.message);
    }
  };

  const handleRemoveAssignee = async (userId: number) => {
    try {
      await removeAssignee(taskId, userId);
      onChanged();
      await load();
    } catch (err) {
      if (err instanceof Error) setError(err.message);
    }
  };

  if (loading || !task) {
    return (
      <Modal onClose={onClose}>
        <p>Загрузка...</p>
      </Modal>
    );
  }

  const assignedIds = new Set(task.assignees.map((a) => a.id)); // бесит
  const availableUsers = users.filter((u) => !assignedIds.has(u.id));

  return (
    <Modal onClose={onClose}>
      <h2>Задача</h2>

      <form onSubmit={handleSave}>
        <div style={{ marginBottom: 12 }}>
          <label>Название</label>
          <br />
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Описание</label>
          <br />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Статус</label>
          <br />
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="new">Новая</option>
            <option value="in_progress">В работе</option>
            <option value="done">Готова</option>
          </select>
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button type="submit" disabled={saving}>
          {saving ? 'Сохранение...' : 'Сохранить'}
        </button>{' '}
        <button type="button" onClick={handleDelete}>
          Удалить задачу
        </button>{' '}
        <button type="button" onClick={onClose}>
          Закрыть
        </button>
      </form>

      <hr style={{ margin: '16px 0' }} />

      <h3>Исполнители</h3>
      {task.assignees.length === 0 && <p>Пока никто не назначен</p>}
      <ul>
        {task.assignees.map((a) => (
          <li key={a.id}>
            {a.email}{' '}
            <button onClick={() => handleRemoveAssignee(a.id)}>Убрать</button>
          </li>
        ))}
      </ul>

      {availableUsers.length > 0 && (
        <select
          defaultValue=""
          onChange={(e) => {
            if (e.target.value) {
              handleAddAssignee(Number(e.target.value));
            }
          }}
        >
          <option value="" disabled>
            + Добавить исполнителя
          </option>
          {availableUsers.map((u) => (
            <option key={u.id} value={u.id}>
              {u.email}
            </option>
          ))}
        </select>
      )}
    </Modal>
  );
}

export default TaskDetailModal;