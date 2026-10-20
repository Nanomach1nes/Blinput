// Все запросы к бэкенду в одном месте. Токен хранится в localStorage.
const BASE = import.meta.env.VITE_API_URL || "";

async function req(path, opts = {}) {
  const token = localStorage.getItem("token");
  const res = await fetch(BASE + path, {
    ...opts,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(typeof data.detail === "string" ? data.detail : `Ошибка ${res.status}`);
  return data;
}

export const getText = (mode, count) => req(`/api/typing/text?mode=${mode}&count=${count}`);
export const saveResult = (body) => req("/api/typing/result", { method: "POST", body: JSON.stringify(body) });
export const register = (b) => req("/api/auth/register", { method: "POST", body: JSON.stringify(b) });
export const login = (b) => req("/api/auth/login", { method: "POST", body: JSON.stringify(b) });
// TODO (нужны эндпоинты на бэкенде): GET /api/leaderboard?metric=&period=, GET /api/me, GET /api/me/stats
