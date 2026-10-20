// Шаблон страницы под будущие функции: заголовок, описание и каркас с подсказкой, что подключить.
export default function Soon({ title, lead, tabs = [], need }) {
  return (
    <section className="page">
      <h1>{title}</h1>
      <p className="lead">{lead}</p>
      {tabs.length > 0 && (
        <div className="tabs">
          {tabs.map((t, i) => <button key={t} className={i === 0 ? "tab on" : "tab"} disabled>{t}</button>)}
        </div>
      )}
      <div className="panel skeleton">
        {[...Array(5)].map((_, i) => <div key={i} className="sk-row"><span /><span /><span /></div>)}
        <p className="muted">Раздел в разработке. Для подключения нужно: {need}</p>
      </div>
    </section>
  );
}
