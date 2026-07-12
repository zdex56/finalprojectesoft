import { useState } from 'react';
import { login, register } from './api';
import type { AuthResponse } from './types';

interface LoginFormProps {
  onSuccess: (data: AuthResponse) => void;
  onCancel?: () => void;
}

function LoginForm({ onSuccess, onCancel }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegisterMode) {
        await register(email, password);
        const data = await login(email, password);
        onSuccess(data);
      } else {
        const data = await login(email, password);
        onSuccess(data);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>{isRegisterMode ? 'Регистрация' : 'Вход в Stacy'}</h2>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label>Пароль</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="error-text">{error}</p>}

          <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Подождите...' : isRegisterMode ? 'Зарегистрироваться' : 'Войти'}
          </button>
        </form>

        <p className="auth-switch" onClick={() => setIsRegisterMode(!isRegisterMode)}>
          {isRegisterMode ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться'}
        </p>

        {onCancel && (
          <p className="auth-switch" onClick={onCancel}>
            ← Продолжить без входа
          </p>
        )}
      </div>
    </div>
  );
}

export default LoginForm;
