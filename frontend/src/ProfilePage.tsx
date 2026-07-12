import { useState } from 'react';
import { changePassword } from './api';

interface ProfilePageProps {
  email: string;
}

function ProfilePage({ email }: ProfilePageProps) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('новый пароль и подтверждение не совпадают');
      return;
    }

    setSaving(true);
    try {
      await changePassword(oldPassword, newPassword);
      setSuccess('пароль успешно изменён');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } 
    catch 
    (err) 
    {
      if (err instanceof Error) 
        setError(err.message);
    } 
    finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 360 }}>
      <h2>Личный кабинет</h2>

      <p>
        <strong>Email:</strong> {email}
      </p>

      <h3>Сменить пароль</h3>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>Текущий пароль</label>
          <br />
          <input
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Новый пароль</label>
          <br />
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={6}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Подтвердите новый пароль</label>
          <br />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            style={{ width: '100%' }}
          />
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}
        {success && <p style={{ color: 'green' }}>{success}</p>}

        <button type="submit" disabled={saving}>
          {saving ? 'Сохранение...' : 'Сменить пароль'}
        </button>
      </form>
    </div>
  );
}

export default ProfilePage;