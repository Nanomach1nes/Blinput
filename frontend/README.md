# Blinput — фронтенд (React + Vite)

## Запуск
1. Бэкенд (из корня проекта): `uvicorn backend.app.main:app --reload --port 8000`
2. Фронтенд: `npm install && npm run dev` → http://localhost:5173
   (запросы `/api/*` проксируются на :8000, см. `vite.config.js`; для другого адреса — переменная `VITE_API_URL`)

## Структура
- `src/api.js` — все запросы к бэкенду
- `src/store.js` — локальный прогресс, уровни, список достижений
- `src/texts.js` — тексты для режимов/языков, которых нет на бэкенде
- `src/pages/` — Trainer, Stats, Achievements, Auth, Leaderboard (заглушка)
- `src/components/` — Keyboard (подсказка пальцев), Soon (шаблон будущих страниц)
