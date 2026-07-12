import { useState } from 'react';
import Modal from './Modal';
import { createLocalTask, updateLocalTask, deleteLocalTask, type LocalTask } from './localTasks';

interface GuestTaskModalProps {
  task: LocalTask | null; 
  onClose: () => void;
  onSaved: () => void;
  onRequireLogin: () => void;
}

function GuestTaskModal({ task, onClose, onSaved, onRequireLogin }: GuestTaskModalProps) {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [status, setStatus] = useState(task?.status || 'new');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Название обязательно');
      return;
    }

    if (task) {
      updateLocalTask(task.id, { title, description, status });
    } else {
      createLocalTask(title, description, status);
    }
    onSaved();
    onClose();
  };

  const handleDelete = () => {
    if (!task) return;
    deleteLocalTask(task.id);
    onSaved();
    onClose();
  };

  return (
    <Modal onClose={onClose}>
      <h2>{task ? 'Задача' : 'Новая задача'}</h2>

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>Название</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>

        <div className="field">
          <label>Описание</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />
        </div>

        <div className="field">
          <label>Статус</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as LocalTask['status'])}
          >
            <option value="new">Новая</option>
            <option value="in_progress">В работе</option>
            <option value="done">Готова</option>
          </select>
        </div>

        {error && <p className="error-text">{error}</p>}

        <div className="modal-actions">
          <button type="submit" className="btn-primary">
            {task ? 'Сохранить' : 'Создать'}
          </button>
          {task && (
            <button type="button" className="btn-danger" onClick={handleDelete}>
              Удалить
            </button>
          )}
          <button type="button" onClick={onClose}>
            Закрыть
          </button>
        </div>
      </form>

      <hr className="divider" />

      <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
        Эта задача хранится только в этом браузере чтобы добавлять в неё других пользователей,
        нужно войти или зарегистрироваться.
      </p>
      <button type="button" onClick={onRequireLogin}>
        войти, чтобы добавить исполнителей
      </button>
    </Modal>
  );
}

export default GuestTaskModal;