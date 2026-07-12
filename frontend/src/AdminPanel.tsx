import { useState, useEffect } from 'react';
import {
  searchAdminUsers,
  getAdminUserTasks,
  updateAdminUserRole,
  updateAdminUserEmail,
  deleteAdminUser,
  deleteAdminTask,
  type AdminUser,
  type Task,
} from './api';

interface AdminPanelProps {
  currentUserId: number;
}

function statusLabel(status: string) {
  if (status === 'new') return 'Новая';
  if (status === 'in_progress') return 'В работе';
  return 'Готова';
}

function AdminPanel({ currentUserId }: AdminPanelProps) {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingEmailId, setEditingEmailId] = useState<number | null>(null);
  const [emailDraft, setEmailDraft] = useState('');
  const [error, setError] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(false);



  const loadUsers = async () => {
    setLoadingUsers(true);
    setError('');
    try 
    {
      const data = await searchAdminUsers(search || undefined);
      setUsers(data);
    }
     catch (err) 
    {
      if (err instanceof Error) setError(err.message);
    } 
    finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {loadUsers();}, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadUsers();
  };

  const loadTasksForUser = async (user: AdminUser) => {
    setSelectedUser(user);
    setLoadingTasks(true);
    setError('');
    try 
    {
      const data = await getAdminUserTasks(user.id);
      setTasks(data);
    } 
    catch (err) 
    {
      if (err instanceof Error) setError(err.message);
    } 
    finally 
    {
      setLoadingTasks(false);
    }
  };

  const handleToggleRole = async (user: AdminUser) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';

    try {
      await updateAdminUserRole(user.id, newRole);
      await loadUsers();
    } 
    catch (err) 
    {
      if (err instanceof Error) setError(err.message);
    }
  };

  const handleStartEditEmail = (user: AdminUser) => {
    setEditingEmailId(user.id);
    setEmailDraft(user.email);
  };

  const handleSaveEmail = async (userId: number) => {
    try 
    {
      await updateAdminUserEmail(userId, emailDraft);
      setEditingEmailId(null);
      await loadUsers();
    } 
    catch (err) 
    {
      if (err instanceof Error) setError(err.message);
    }
  }; // вернись сюда

  const handleDeleteUser = async (user: AdminUser) => {
    if (!confirm(`удалить пользователя ${user.email}? это действие необратимо.`)) return;

    try {
      await deleteAdminUser(user.id);
      if (selectedUser?.id === user.id) {
        setSelectedUser(null);
        setTasks([]);
      }
      await loadUsers();
    } catch (err) {
      if (err instanceof Error) setError(err.message);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!confirm('удалить эту задачу?')) return;

    try {
      await deleteAdminTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      
    } 
    catch (err) 
    {
      if (err instanceof Error) setError(err.message);
    }
  };




  return (
    <div>
      <h2>админ-панель</h2>

      <form onSubmit={handleSearchSubmit} style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="поиск по email (пусто — показать всех)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit">найти</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ display: 'flex', gap: 24 }}>
        <div style={{ flex: 1 }}>
          <h3>пользователи</h3>
          {loadingUsers && <p>загрузка...</p>}
          {!loadingUsers && users.length === 0 && <p>никого не найдено</p>}

          <ul style={{ listStyle: 'none', padding: 0 }}>
            {users.map((u) => (
              <li
                key={u.id}
                className='admin-li'
                style={{ 
                  background: selectedUser?.id === u.id ? '#242424' : 'rgba(34, 39, 48)',
                }}
              >
                {editingEmailId === u.id ? (
                  <div>
                    <input
                      value={emailDraft}
                      onChange={(e) => setEmailDraft(e.target.value)}
                      style={{ width: '100%',}}
                    />
                    <button onClick={() => handleSaveEmail(u.id)}>Сохранить</button>{' '}
                    <button onClick={() => setEditingEmailId(null)}>Отмена</button>
                  </div>
                ) 
                : 
                (
                  <div
                    onClick={() => loadTasksForUser(u)}
                    style={{ cursor: 'pointer', fontWeight: selectedUser?.id === u.id ? 'bold' : 'normal' }}
                  >
                    {u.email} ({u.role})
                  </div>
                )}

                <div style={{ marginTop: 6 }}>
                  <button onClick={() => handleToggleRole(u)} disabled={u.id === currentUserId}> {u.role === 'admin' ? 'Разжаловать' : 'Сделать админом'}</button>
                  {' '} 
                  {/* )) */}
                  <button onClick={() => handleStartEditEmail(u)}>редактировать email</button>{' '}
                  <button onClick={() => handleDeleteUser(u)} disabled={u.id === currentUserId}>
                    удалить
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div style={{ flex: 2 }}>
          {selectedUser ? (
            <>
              <h3>задачи пользователя {selectedUser.email}</h3>
              {loadingTasks && <p>загрузка...</p>}
              {!loadingTasks && tasks.length === 0 && <p>задач нет</p>}
              <ul>
                {tasks.map((t) => (
                  <li key={t.id} style={{ marginBottom: 8 }}>
                    <strong>{t.title}</strong> — {statusLabel(t.status)}{' '}
                    <button onClick={() => handleDeleteTask(t.id)}>Удалить</button>
                    {t.description && <div style={{ color: '#666' }}>{t.description}</div>}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p>выберите пользователя слева, чтобы увидеть его задачи</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;