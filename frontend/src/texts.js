// Тексты для режимов, которых пока нет на бэкенде, и для английской раскладки.
const pick = (a) => a[Math.floor(Math.random() * a.length)];

const WORDS_EN = ["array", "loop", "server", "client", "query", "stack", "token", "cache", "route", "state", "event", "hook", "build", "merge", "input", "speed", "focus", "rhythm", "thread", "binary"];
const WORDS_RU = ["алгоритм", "функция", "массив", "цикл", "клавиатура", "скорость", "точность", "хакатон", "сервер", "клиент", "данные", "поток", "память", "запрос"];
const SENT_RU = ["Быстрая коричневая лиса прыгает через ленивую собаку.", "Тот, кто печатает не глядя, видит больше.", "Каждая ошибка делает следующий удар точнее.", "Ровный ритм важнее скорости."];
const SENT_EN = ["The quick brown fox jumps over the lazy dog.", "Practice makes the fingers remember.", "Steady rhythm beats raw speed.", "Look at the screen, not at the keys."];
const CODE = [
  "def calculate_wpm(words, seconds):\n    return (words / seconds) * 60",
  "for (let i = 0; i < items.length; i++) {\n  console.log(items[i]);\n}",
  "<div class=\"box\">\n  <p>Hello</p>\n</div>",
  ".btn {\n  color: #fff;\n  padding: 8px 16px;\n}",
];
const SYM = "abcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()[]{};:,.<>/?+-=_";

export function localText(mode, lang, count) {
  const ru = lang === "ru";
  if (mode === "words") return Array.from({ length: count }, () => pick(ru ? WORDS_RU : WORDS_EN)).join(" ");
  if (mode === "sentences") return pick(ru ? SENT_RU : SENT_EN);
  if (mode === "code") return pick(CODE);
  return Array.from({ length: 4 }, () => Array.from({ length: 5 }, () => pick([...SYM])).join("")).join(" ");
}
