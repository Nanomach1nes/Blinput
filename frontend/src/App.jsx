import { useState, useEffect } from "react";
import { NavLink, Route, Routes } from "react-router-dom";
import Trainer from "./pages/Trainer.jsx";
import Stats from "./pages/Stats.jsx";
import Achievements from "./pages/Achievements.jsx";
import Leaderboard from "./pages/Leaderboard.jsx";
import Auth from "./pages/Auth.jsx";
import { useHistory, levelInfo, totalExp } from "./store.js";
import LeaderboardPage from './pages/Leaderboard';


export default function App() {
  const [user, setUser] = useState(() => localStorage.getItem("username"));
  const h = useHistory();
  const lv = levelInfo(totalExp(h));
  useEffect(() => { if (!user) localStorage.removeItem("token"); }, [user]);

  const logout = () => { localStorage.removeItem("token"); localStorage.removeItem("username"); setUser(null); };

  return (
    <>
      <header className="top">
        <NavLink to="/" className="logo">Blinput</NavLink>
        <nav>
          <NavLink to="/" end>Тренажёр</NavLink>
          <NavLink to="/stats">Статистика</NavLink>
          <NavLink to="/achievements">Награды</NavLink>
          <NavLink to="/leaderboard">Лидеры</NavLink>
        </nav>
        <div className="me">
          <div className="lvl" title={`${lv.exp} / ${lv.to} опыта`}>
            <b>Ур. {lv.level}</b><i><u style={{ width: `${lv.pct}%` }} /></i>
          </div>
          {user ? <button className="link" onClick={logout}>{user} · выйти</button> : <NavLink to="/auth">Войти</NavLink>}
        </div>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Trainer level={lv.level} />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/auth" element={<Auth onLogin={setUser} />} />
        </Routes>
      </main>
    </>
  );
}
