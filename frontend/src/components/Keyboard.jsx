// Экранная клавиатура: подсвечивает нужную клавишу и палец.
const ROWS = {
  en: ["1234567890", "qwertyuiop", "asdfghjkl;", "zxcvbnm,./"],
  ru: ["1234567890", "йцукенгшщз", "фывапролдж", "ячсмитьбю"],
};
// 0–3: левая рука (мизинец→указательный), 4–7: правая (указательный→мизинец), 8: большие
const FINGER_OF_COL = [0, 1, 2, 3, 3, 4, 4, 5, 6, 7];
export const FINGERS = ["Левый мизинец", "Левый безымянный", "Левый средний", "Левый указательный", "Правый указательный", "Правый средний", "Правый безымянный", "Правый мизинец", "Большой палец"];

export function fingerFor(ch, lang) {
  if (ch === " ") return 8;
  for (const row of ROWS[lang]) {
    const i = row.indexOf(ch.toLowerCase());
    if (i >= 0) return FINGER_OF_COL[i];
  }
  return null;
}

export default function Keyboard({ next, lang }) {
  const target = next ? next.toLowerCase() : "";
  const f = next ? fingerFor(next, lang) : null;
  return (
    <div className="kb" aria-hidden="true">
      {ROWS[lang].map((row, r) => (
        <div className="kb-row" key={r} style={{ marginLeft: r * 14 }}>
          {[...row].map((k, i) => (
            <span key={k} className={`key f${FINGER_OF_COL[i]} ${k === target ? "on" : ""}`}>{k}</span>
          ))}
        </div>
      ))}
      <div className="kb-row"><span className={`key space f8 ${target === " " ? "on" : ""}`}>пробел</span></div>
      <p className="kb-hint">{f !== null ? FINGERS[f] : next ? "Спецсимвол: ищите клавишу с Shift" : "Начните печатать"}</p>
    </div>
  );
}
