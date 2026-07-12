import { useState } from 'react';
import Modal from './Modal';
import { createTask } from './api';

interface CreateTaskModalProps {
  onClose: () => void;
  onCreated: () => void;
}

function CreateTaskModal({ onClose, onCreated }: CreateTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('new');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSaving(true);
    setError('');
    try {
      await createTask(title, description, status);
      onCreated();
      onClose();
    } 
    catch (err) {
      if (err instanceof Error) setError(err.message);
    } 
    finally {
      setSaving(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <h2>Новая задача</h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>Название</label>
          <br/>
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
          {saving ? 'Создание...' : 'Создать'}
        </button>{' '}
         {/* я уверен оч плохо для стиля мобилок )))) */}
        <button type="button" onClick={onClose}> 
          Отмена
        </button>
      </form>
    </Modal>
  );
}

export default CreateTaskModal;