import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function UserProfile() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      // Достаем токен, который сохранился после логина
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        setError('Пользователь не авторизован');
        setLoading(false);
        return;
      }

      try {
        // Запрос идет на только что созданный нами эндпоинт
        const response = await axios.get('/api/auth/me/stats', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setStats(response.data);
      } catch (err) {
        console.error('Ошибка загрузки статистики:', err);
        setError('Не удалось загрузить данные профиля с сервера.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div className="loading">Загрузка профиля...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!stats) return null;

  return (
    <div className="profile-container" style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Профиль: {stats.username}</h2>
      
      <div className="stats-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', margin: '20px 0' }}>
        <div className="card" style={{ background: '#f5f5f5', padding: '15px', borderRadius: '8px' }}>
          <h4>Уровень</h4>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.level}</p>
        </div>
        <div className="card" style={{ background: '#f5f5f5', padding: '15px', borderRadius: '8px' }}>
          <h4>Опыт (EXP)</h4>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.exp} / {stats.next_level_exp}</p>
        </div>
        <div className="card" style={{ background: '#f5f5f5', padding: '15px', borderRadius: '8px' }}>
          <h4>Заездов пройдено</h4>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.races_completed}</p>
        </div>
        <div className="card" style={{ background: '#f5f5f5', padding: '15px', borderRadius: '8px' }}>
          <h4>Ср. скорость</h4>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.average_wpm} WPM</p>
        </div>
      </div>

      <h3>Достижения</h3>
      <div className="achievements-list">
        {stats.achievements.length === 0 ? (
          <p>Пока нет разблокированных достижений. Пора садиться за тренажер!</p>
        ) : (
          stats.achievements.map((ach) => (
            <div key={ach.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#fafafa', padding: '10px', marginBottom: '8px', borderRadius: '6px' }}>
              <span style={{ fontSize: '24px' }}>{ach.icon || '🏆'}</span>
              <div>
                <strong>{ach.title}</strong>
                <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>{ach.description}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
