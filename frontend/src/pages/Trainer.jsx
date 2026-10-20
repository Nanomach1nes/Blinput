import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { getText, saveResult } from "../api.js";
import { localText } from "../texts.js";
import { pushRun } from "../store.js";
import Keyboard from "../components/Keyboard.jsx";

// Уровень, на котором открывается режим (поставьте везде 1, чтобы открыть всё сразу)
const MODES = [["words", "Слова", 1], ["sentences", "Предложения", 2], ["symbols", "Символы", 3], ["code", "Код", 4]];
const multiplier = (c) => (c >= 50 ? 5 : c >= 25 ? 3 : c >= 10 ? 2 : 1);
const fresh = () => ({ pos: 0, correct: 0, errors: 0, mistakes: {}, combo: 0, maxCombo: 0, score: 0, start: 0, now: 0, bonusUntil: 0 });

function beep(on) {
  if (!on) return;
  try {
    const a = new (window.AudioContext || window.webkitAudioContext)(), o = a.createOscillator(), g = a.createGain();
    o.type = "square"; o.frequency.value = 160; g.gain.value = 0.05;
    o.connect(g); g.connect(a.destination); o.start(); o.stop(a.currentTime + 0.08);
  } catch { /* звук недоступен */ }
}

export default function Trainer({ level }) {
  const [mode, setMode] = useState("words");
  const [lang, setLang] = useState("ru");
  const [count, setCount] = useState(10);
  const [sound, setSound] = useState(true);
  const [text, setText] = useState("");
  const [phase, setPhase] = useState("idle"); // idle | run | done
  const [result, setResult] = useState(null);
  const [note, setNote] = useState("");
  const g = useRef(fresh());
  const [, tick] = useReducer((x) => x + 1, 0);

  const load = useCallback(async () => {
    g.current = fresh(); setPhase("idle"); setResult(null); setNote("");
    let t;
    try {
      if (mode === "code" || (mode === "words" && lang === "ru")) t = (await getText(mode, count)).text;
    } catch { setNote("Бэкенд недоступен — тексты сгенерированы локально."); }
    setText(t || localText(mode, lang, count));
  }, [mode, lang, count]);
  useEffect(() => { load(); }, [load]);

  // таймер для живой скорости и бонуса
  useEffect(() => {
    if (phase !== "run") return;
    const id = setInterval(() => { g.current.now = Date.now(); tick(); }, 200);
    return () => clearInterval(id);
  }, [phase]);

  const finish = async (s) => {
    const time = Math.max((Date.now() - s.start) / 1000, 0.1);
    const total = s.correct + s.errors;
    const body = {
      mode, time_seconds: +time.toFixed(2), errors_count: s.errors, mistake_keys: s.mistakes,
      wpm: +((s.correct / 5) / (time / 60)).toFixed(1), cpm: +(s.correct / (time / 60)).toFixed(1),
      accuracy: +((s.correct / total) * 100).toFixed(1),
    };
    let exp = Math.floor(body.wpm * (body.accuracy / 100)), saved = false;
    try { exp = (await saveResult(body)).earned_exp; saved = true; } catch { /* офлайн: сохраним локально */ }
    pushRun({ ...body, time, exp, chars: s.correct, date: Date.now(), mistakes: s.mistakes });
    setResult({ ...body, exp, saved, score: s.score, maxCombo: s.maxCombo });
    setPhase("done");
  };

  useEffect(() => {
    const onKey = (e) => {
      if (/INPUT|SELECT|TEXTAREA/.test(e.target.tagName) || e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === "Tab") { e.preventDefault(); load(); return; }
      const ch = e.key === "Enter" ? "\n" : e.key;
      if (ch.length !== 1 || !text) return;
      e.preventDefault();
      const s = g.current;
      if (phase === "done") return;
      if (phase === "idle") { s.start = Date.now(); setPhase("run"); }
      s.now = Date.now();
      if (ch === text[s.pos]) {
        s.pos++; s.correct++; s.combo++; s.maxCombo = Math.max(s.maxCombo, s.combo);
        if (s.now > s.bonusUntil && Math.random() < 0.03) s.bonusUntil = s.now + 10000; // случайный бонус: x2 очки на 10 с
        s.score += 10 * multiplier(s.combo) * (s.now < s.bonusUntil ? 2 : 1);
        if (s.pos >= text.length) finish(s);
      } else {
        s.errors++; s.combo = 0;
        s.mistakes[text[s.pos]] = (s.mistakes[text[s.pos]] || 0) + 1;
        beep(sound);
      }
      tick();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const s = g.current;
  const elapsed = s.start ? ((s.now || Date.now()) - s.start) / 60000 : 0;
  const liveWpm = elapsed > 0.01 ? Math.round(s.correct / 5 / elapsed) : 0;
  const acc = s.correct + s.errors ? Math.round((s.correct / (s.correct + s.errors)) * 100) : 100;
  const bonus = phase === "run" && s.now < s.bonusUntil;
  const m = multiplier(s.combo);
  const pick = (fn) => (e) => { e.currentTarget.blur(); fn(); };

  return (
    <section className="page trainer">
      <div className="bar">
        <div className="seg">
          {MODES.map(([id, name, need]) => (
            <button key={id} className={mode === id ? "on" : ""} disabled={level < need} onClick={pick(() => setMode(id))}
              title={level < need ? `Откроется на ${need} уровне` : ""}>{name}{level < need && ` 🔒${need}`}</button>
          ))}
        </div>
        <div className="seg">
          {["ru", "en"].map((l) => <button key={l} className={lang === l ? "on" : ""} onClick={pick(() => setLang(l))}>{l.toUpperCase()}</button>)}
        </div>
        {mode === "words" && (
          <label className="inline">Слов
            <select value={count} onChange={(e) => setCount(+e.target.value)}>{[10, 20, 30].map((n) => <option key={n}>{n}</option>)}</select>
          </label>
        )}
        <label className="inline"><input type="checkbox" checked={sound} onChange={(e) => setSound(e.target.checked)} /> Звук</label>
      </div>

      <div className="hud">
        <div><span>Сл/мин</span><b>{liveWpm}</b></div>
        <div><span>Точность</span><b>{acc}%</b></div>
        <div><span>Ошибки</span><b>{s.errors}</b></div>
        <div><span>Очки</span><b>{s.score}</b></div>
        <div className={`combo c${m} ${s.combo >= 10 ? "hot" : ""}`}><span>Комбо</span><b key={s.combo} className="pop">{s.combo} · x{m}</b></div>
      </div>
      {bonus && <p className="bonus">Бонус: очки x2 ещё {Math.ceil((s.bonusUntil - s.now) / 1000)} с</p>}

      {phase !== "done" ? (
        <>
          <div className="text" data-hot={s.combo >= 10}>
            <span key={s.errors} className={s.errors ? "zap" : ""} />
            {[...text].map((c, i) => (
              <span key={i} className={i < s.pos ? "c ok" : i === s.pos ? "c cur" : "c"}>{c === "\n" ? "↵\n" : c}</span>
            ))}
          </div>
          <p className="muted">{phase === "idle" ? "Начните печатать — таймер запустится сам. " : ""}Tab — новый текст. Неверная клавиша не засчитывается.</p>
          <Keyboard next={text[s.pos]} lang={mode === "code" || mode === "symbols" ? "en" : lang} />
        </>
      ) : (
        <div className="panel result">
          <h2>Заезд окончен</h2>
          <div className="cards">
            {[["Сл/мин", result.wpm], ["Зн/мин", result.cpm], ["Точность", `${result.accuracy}%`], ["Ошибки", result.errors_count], ["Макс. комбо", result.maxCombo], ["Очки", result.score], ["Опыт", `+${result.exp}`]]
              .map(([k, v]) => <div className="stat" key={k}><span>{k}</span><b>{v}</b></div>)}
          </div>
          {!result.saved && <p className="muted">Сервер недоступен — результат сохранён только на этом устройстве.</p>}
          <button className="btn" onClick={load} autoFocus>Ещё раз</button>
        </div>
      )}
      {note && <p className="muted">{note}</p>}
    </section>
  );
}
