import { useState } from 'react';
import LoginForm from './LoginForm';
import Dashboard from './Dashboard';
import AdminPanel from './AdminPanel';
import ProfilePage from './ProfilePage';
import GuestDashboard from './GuestDashboard';
import type { AuthResponse } from './types';

function App() {
  const [auth, setAuth] = useState<AuthResponse | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [view, setView] = useState<'tasks' | 'profile' | 'admin'>('tasks');

  const handleLoginSuccess = (data: AuthResponse) => {
    setAuth(data);
    localStorage.setItem('token', data.token);
    setShowLogin(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setAuth(null);
    setView('tasks');
  };

 
  if (!auth && showLogin) {
    return <LoginForm onSuccess={handleLoginSuccess} onCancel={() => setShowLogin(false)} />;
  }


  if (!auth) {
    return (
      <div className="page">
        <div className="topbar">
          <h1>Stacy</h1>
          <div className="topbar-buttons">
            <button className="btn-primary" onClick={() => setShowLogin(true)}>
              Войти / Зарегистрироваться
            </button>
          </div>
        </div>

        <GuestDashboard onRequireLogin={() => setShowLogin(true)} />
      </div>
    );
  }



  return (
    <div className="page">
      <div className="topbar">
        <h1>Stacy</h1>

        <div className="topbar-buttons">
          <button onClick={() => setView('tasks')} disabled={view === 'tasks'}>
            Мои задачи
          </button>
          <button onClick={() => setView('profile')} disabled={view === 'profile'}>
            Личный кабинет
          </button>
          {auth.user.role === 'admin' && (
            <button onClick={() => setView('admin')} disabled={view === 'admin'}>
              Админ-панель
            </button>
          )}
          <button className="btn-danger" onClick={handleLogout}>
            Выйти
          </button>
        </div>
      </div>

      {view === 'tasks' && <Dashboard />}
      {view === 'profile' && <ProfilePage email={auth.user.email} />}
      {view === 'admin' && auth.user.role === 'admin' && (
        <AdminPanel currentUserId={auth.user.id} />
      )}
    </div>
  );
}

export default App;
