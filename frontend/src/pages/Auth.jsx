import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, register } from "../api.js";

export default function Auth({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [f, setF] = useState({ username: "", email: "", password: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setErr(""); setBusy(true);
    try {
      if (mode === "register") await register({ username: f.username, password: f.password, email: f.email || null });
      const { access_token } = await login({ username: f.username, password: f.password });
      localStorage.setItem("token", access_token);
      localStorage.setItem("username", f.username);
      onLogin(f.username);
      nav("/");
    } catch (x) { setErr(x.message); }
    setBusy(false);
  };

  return (
    <section className="page narrow">
      <h1>{mode === "login" ? "Вход" : "Регистрация"}</h1>
      <form className="panel form" onSubmit={submit}>
        <label>Имя пользователя<input value={f.username} onChange={set("username")} required minLength={3} autoComplete="username" /></label>
        {mode === "register" && <label>Email (необязательно)<input type="email" value={f.email} onChange={set("email")} /></label>}
        <label>Пароль<input type="password" value={f.password} onChange={set("password")} required minLength={6} autoComplete={mode === "login" ? "current-password" : "new-password"} /></label>
        {err && <p className="err" role="alert">{err}</p>}
        <button className="btn" disabled={busy}>{mode === "login" ? "Войти" : "Создать аккаунт"}</button>
        <button type="button" className="link" onClick={() => { setMode(mode === "login" ? "register" : "login"); setErr(""); }}>
          {mode === "login" ? "Нет аккаунта? Зарегистрироваться" : "Уже есть аккаунт? Войти"}
        </button>
      </form>
    </section>
  );
}
