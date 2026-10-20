from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel

from ..database import get_db
from ..models.user import User

router = APIRouter(prefix="/api/leaderboard", tags=["Leaderboard"])

class LeaderboardUser(BaseModel):
    id: int
    username: str
    level: int
    exp: int

    class Config:
        from_attributes = True

@router.get("/exp", response_model=List[LeaderboardUser])
def get_top_by_exp(limit: int = 10, db: Session = Depends(get_db)):
    """Выдаёт топ пользователей по набранному опыту"""
    users = db.query(User).order_by(User.exp.desc()).limit(limit).all()
    return users