import Soon from "../components/Soon.jsx";

export default function Leaderboard() {
  return (
    <Soon
      title="Таблица лидеров"
      lead="Скорость, точность и опыт — за сегодня, неделю и всё время."
      tabs={["Скорость", "Точность", "Опыт"]}
      need="GET /api/leaderboard?metric=wpm|accuracy|exp&period=day|week|all и привязка заездов к user_id"
    />
  );
}
