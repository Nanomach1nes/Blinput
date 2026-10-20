import { ACHIEVEMENTS, useHistory } from "../store.js";

export default function Achievements() {
  const h = useHistory();
  const done = ACHIEVEMENTS.filter((a) => a.test(h)).length;
  return (
    <section className="page">
      <h1>Награды</h1>
      <p className="lead">Открыто {done} из {ACHIEVEMENTS.length}</p>
      <div className="ach-grid">
        {ACHIEVEMENTS.map((a) => {
          const ok = a.test(h);
          return (
            <div key={a.id} className={`panel ach ${ok ? "ok" : ""}`}>
              <span className="seal">{ok ? "✦" : "·"}</span>
              <h3>{a.name}</h3><p>{a.desc}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
