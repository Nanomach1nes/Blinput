import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Leaderboard() {
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
    <div className="leaderboard-container" style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Таблица лидеров</h2>

      {/* Фильтры по метрикам */}
      <div className="filters-group" style={{ marginBottom: '10px' }}>
        <span>Метрика: </span>
        {['wpm', 'accuracy', 'exp'].map((m) => (
          <button
            key={m}
            onClick={() => setMetric(m)}
            style={{
              marginRight: '5px',
              fontWeight: metric === m ? 'bold' : 'normal',
              background: metric === m ? '#007bff' : '#f8f9fa',
              color: metric === m ? '#fff' : '#000',
              border: '1px solid #ccc',
              padding: '5px 10px',
              cursor: 'pointer'
            }}
          >
            {m.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Фильтры по периодам */}
      <div className="filters-group" style={{ marginBottom: '20px' }}>
        <span>Период: </span>
        {['day', 'week', 'all'].map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            style={{
              marginRight: '5px',
              fontWeight: period === p ? 'bold' : 'normal',
              background: period === p ? '#28a745' : '#f8f9fa',
              color: period === p ? '#fff' : '#000',
              border: '1px solid #ccc',
              padding: '5px 10px',
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
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ccc', textAlign: 'left' }}>
              <th style={{ padding: '8px' }}>#</th>
              <th style={{ padding: '8px' }}>Имя</th>
              <th style={{ padding: '8px' }}>Уровень</th>
              <th style={{ padding: '8px' }}>Результат ({metric.toUpperCase()})</th>
            </tr>
          </thead>
          <tbody>
            {leaders.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>
                  Пока нет результатов.
                </td>
              </tr>
            ) : (
              leaders.map((item) => (
                <tr key={item.rank} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '8px' }}>{item.rank}</td>
                  <td style={{ padding: '8px' }}>{item.username}</td>
                  <td style={{ padding: '8px' }}>{item.level}</td>
                  <td style={{ padding: '8px', fontWeight: 'bold' }}>{item.score}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
