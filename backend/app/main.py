from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

# Используем относительные импорты внутри приложения app
from .database import Base, engine, get_db
from .models.user import TypingSession
from .core.text_generator import generate_text
from .schemas.typing import TypingResultCreate

# Создаём таблицы
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Blinput API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Blinput Backend is running!"}

@app.get("/api/typing/text")
def get_typing_text(mode: str = "words", count: int = 10):
    text = generate_text(mode=mode, count=count)
    return {
        "mode": mode,
        "text": text
    }

@app.post("/api/typing/result")
def save_typing_result(result: TypingResultCreate, db: Session = Depends(get_db)):
    earned_exp = int(result.wpm * (result.accuracy / 100))
    
    db_session = TypingSession(
        user_id=None,
        wpm=result.wpm,
        cpm=result.cpm,
        accuracy=result.accuracy,
        time_seconds=result.time_seconds,
        mode=result.mode,
        errors_count=result.errors_count,
        mistake_keys=result.mistake_keys
    )
    db.add(db_session)
    db.commit()
    db.refresh(db_session)

    return {
        "status": "success",
        "session_id": db_session.id,
        "earned_exp": earned_exp,
        "summary": {
            "wpm": result.wpm,
            "accuracy": result.accuracy,
            "errors": result.errors_count
        },
        "message": f"Заезд сохранён в БД! Вы заработали {earned_exp} EXP."
    }