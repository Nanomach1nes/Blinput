import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function LeaderboardPage() {
  const [metric, setMetric] = useState('wpm'); // wpm, accuracy, exp
  const [period, setPeriod] = useState('all'); // day, week, all
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`/api/leaderboard`, {
          params: { metric, period }
        });
        setLeaders(response.data);
      } catch (err) {
        console.error('Ошибка загрузки таблицы лидеров:', err);
        setError('Не удалось загрузить таблицу лидеров.');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [metric, period]);

  return (
    <div className="leaderboard-container" style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', color: '#fff' }}>
      <h2>Таблица лидеров</h2>
      <p style={{ color: '#aaa', marginBottom: '20px' }}>Скорость, точность и опыт — за сегодня, неделю и всё время.</p>

      {/* Фильтры по метрикам */}
      <div className="filters-group" style={{ marginBottom: '10px' }}>
        <span style={{ marginRight: '10px' }}>Метрика: </span>
        {['wpm', 'accuracy', 'exp'].map((m) => (
          <button
            key={m}
            onClick={() => setMetric(m)}
            style={{
              marginRight: '5px',
              fontWeight: metric === m ? 'bold' : 'normal',
              background: metric === m ? '#e50914' : '#222',
              color: '#fff',
              border: '1px solid #444',
              padding: '6px 12px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {m === 'wpm' ? 'Скорость' : m === 'accuracy' ? 'Точность' : 'Опыт'}
          </button>
        ))}
      </div>

      {/* Фильтры по периодам */}
      <div className="filters-group" style={{ marginBottom: '20px' }}>
        <span style={{ marginRight: '10px' }}>Период: </span>
        {['day', 'week', 'all'].map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            style={{
              marginRight: '5px',
              fontWeight: period === p ? 'bold' : 'normal',
              background: period === p ? '#007bff' : '#222',
              color: '#fff',
              border: '1px solid #444',
              padding: '6px 12px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {p === 'day' ? 'День' : p === 'week' ? 'Неделя' : 'Всё время'}
          </button>
        ))}
      </div>

      {/* Контент таблицы */}
      {loading && <p>Загрузка...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}


      {!loading && !error && (
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#1a1a1a', borderRadius: '8px', overflow: 'hidden' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #333', textAlign: 'left', background: '#252525' }}>
              <th style={{ padding: '12px' }}>#</th>
              <th style={{ padding: '12px' }}>Имя</th>
              <th style={{ padding: '12px' }}>Уровень</th>
              <th style={{ padding: '12px' }}>Результат ({metric.toUpperCase()})</th>
            </tr>
          </thead>
          <tbody>
            {leaders.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
                  Пока нет результатов.
                </td>
              </tr>
            ) : (
              leaders.map((item) => (
                <tr key={item.rank} style={{ borderBottom: '1px solid #333' }}>
                  <td style={{ padding: '12px' }}>{item.rank}</td>
                  <td style={{ padding: '12px' }}>{item.username}</td>
                  <td style={{ padding: '12px' }}>{item.level}</td>
                  <td style={{ padding: '12px', fontWeight: 'bold', color: '#4caf50' }}>{item.score}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
