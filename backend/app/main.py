from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import Optional

from .database import Base, engine, get_db
from .models.user import TypingSession, User
from .core.text_generator import generate_text
from .schemas.typing import TypingResultCreate
from .api.auth import router as auth_router
from .api.leaderboard import router as leaderboard_router
from .api.deps import get_current_user_optional
from .core.achievements import init_achievements, check_and_grant_achievements

Base.metadata.create_all(bind=engine)

with Session(engine) as session:
    init_achievements(session)

app = FastAPI(title="Blinput API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(leaderboard_router)

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Blinput Backend is running!"}

@app.get("/api/typing/text")
def get_typing_text(mode: str = "words", lang: str = "ru", count: int = 10):
    text = generate_text(mode=mode, lang=lang, count=count)
    return {
        "mode": mode,
        "lang": lang,
        "text": text
    }

@app.post("/api/typing/result")
def save_typing_result(
    result: TypingResultCreate, 
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    earned_exp = int(result.wpm * (result.accuracy / 100))
    
    user_id = current_user.id if current_user else None

    db_session = TypingSession(
        user_id=user_id,
        wpm=result.wpm,
        cpm=result.cpm,
        accuracy=result.accuracy,
        time_seconds=result.time_seconds,
        mode=result.mode,
        errors_count=result.errors_count,
        mistake_keys=result.mistake_keys
    )
    db.add(db_session)

    leveled_up = False
    unlocked_achievements = []

    if current_user:
        current_user.exp += earned_exp
        new_level = (current_user.exp // 1000) + 1
        if new_level > current_user.level:
            current_user.level = new_level
            leveled_up = True
            
        db.commit()
        db.refresh(db_session)
        unlocked_achievements = check_and_grant_achievements(current_user, db_session, db)
    else:
        db.commit()
        db.refresh(db_session)

    return {
        "status": "success",
        "session_id": db_session.id,
        "earned_exp": earned_exp,
        "leveled_up": leveled_up,
        "current_level": current_user.level if current_user else 1,
        "unlocked_achievements": unlocked_achievements,
        "summary": {
            "wpm": result.wpm,
            "accuracy": result.accuracy,
            "errors": result.errors_count
        }
    }