// Локальный прогресс (работает и без входа). Когда на бэкенде появится /api/me — заменить на запросы.
import { useEffect, useState } from "react";

const KEY = "blinput_history";
const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } };

export function pushRun(run) {
  localStorage.setItem(KEY, JSON.stringify([...load(), run].slice(-500)));
  window.dispatchEvent(new Event("blinput:history"));
}

export function useHistory() {
  const [h, setH] = useState(load);
  useEffect(() => {
    const f = () => setH(load());
    window.addEventListener("blinput:history", f);
    return () => window.removeEventListener("blinput:history", f);
  }, []);
  return h;
}

// уровень n начинается с 60·(n−1)² опыта
export const levelInfo = (exp) => {
  const level = Math.floor(Math.sqrt(exp / 60)) + 1;
  const from = 60 * (level - 1) ** 2, to = 60 * level ** 2;
  return { level, exp, from, to, pct: ((exp - from) / (to - from)) * 100 };
};
export const totalExp = (h) => h.reduce((s, r) => s + (r.exp || 0), 0);

export const ACHIEVEMENTS = [
  { id: "first", name: "Первый заезд", desc: "Завершить одну тренировку", test: (h) => h.length >= 1 },
  { id: "ten", name: "Постоянство", desc: "Завершить 10 тренировок", test: (h) => h.length >= 10 },
  { id: "clean", name: "Чистая работа", desc: "Тренировка со 100% точностью", test: (h) => h.some((r) => r.accuracy === 100) },
  { id: "cpm200", name: "Быстрые пальцы", desc: "200 символов в минуту", test: (h) => h.some((r) => r.cpm >= 200) },
  { id: "chars1000", name: "Тысяча без ошибок", desc: "1000 символов суммарно с точностью 100%", test: (h) => h.filter((r) => r.accuracy === 100).reduce((s, r) => s + r.chars, 0) >= 1000 },
  { id: "genius", name: "Печатный гений", desc: "300 слов в минуту", test: (h) => h.some((r) => r.wpm >= 300) },
];
