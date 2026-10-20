import { Link } from "react-router-dom";
import { useHistory } from "../store.js";

function Line({ data, color, max }) {
  if (data.length < 2) return <p className="muted">Нужно хотя бы 2 тренировки.</p>;
  const W = 400, H = 110, m = max ?? Math.max(...data, 1);
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * W},${H - (v / m) * (H - 8) - 4}`).join(" ");
  return <svg viewBox={`0 0 ${W} ${H}`} className="chart" role="img"><polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" /></svg>;
}

export default function Stats() {
  const h = useHistory();
  if (!h.length) return (
    <section className="page"><h1>Статистика</h1>
      <p className="lead">Пока пусто. Завершите первую тренировку — здесь появятся графики и разбор ошибок.</p>
      <Link className="btn" to="/">К тренажёру</Link></section>
  );
  const last = h.slice(-30);
  const mistakes = {};
  h.forEach((r) => Object.entries(r.mistakes || {}).forEach(([k, v]) => (mistakes[k] = (mistakes[k] || 0) + v)));
  const hard = Object.entries(mistakes).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const mins = h.reduce((s, r) => s + r.time, 0) / 60;
  const best = Math.max(...h.map((r) => r.wpm));
  const cards = [["Тренировок", h.length], ["Всего времени", `${mins.toFixed(1)} мин`], ["Рекорд", `${best.toFixed(0)} сл/мин`], ["Средняя точность", `${(h.reduce((s, r) => s + r.accuracy, 0) / h.length).toFixed(1)}%`]];

  return (
    <section className="page">
      <h1>Статистика</h1>
      <div className="cards">{cards.map(([k, v]) => <div className="panel stat" key={k}><span>{k}</span><b>{v}</b></div>)}</div>
      <div className="two">
        <div className="panel"><h3>Скорость, сл/мин</h3><Line data={last.map((r) => r.wpm)} color="var(--gold)" /></div>
        <div className="panel"><h3>Точность, %</h3><Line data={last.map((r) => r.accuracy)} color="var(--ok)" max={100} /></div>
      </div>
      <div className="panel">
        <h3>Сложные символы</h3>
        {hard.length ? <div className="hard">{hard.map(([k, v]) => <span key={k}><kbd>{k === " " ? "␣" : k}</kbd>{v}</span>)}</div> : <p className="muted">Ошибок ещё не было.</p>}
      </div>
    </section>
  );
}
