from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.user import User
from ..schemas.user import UserRegister, UserLogin, Token, UserOut
from ..core.security import get_password_hash, verify_password, create_access_token
from .deps import get_current_user

router = APIRouter(prefix="/api/auth", tags=["Auth"])

@router.post("/register", response_model=UserOut)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.username == user_data.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Пользователь с таким именем уже существует")
    
    hashed_pwd = get_password_hash(user_data.password)
    new_user = User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=hashed_pwd
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=Token)
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == user_data.username).first()
    if not user or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Неверное имя пользователя или пароль")
    
    access_token = create_access_token(data={"sub": str(user.id), "username": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    """Возвращает профиль текущего авторизованного пользователя"""
    return current_user

from typing import List, Optional
from pydantic import BaseModel

class AchievementOut(BaseModel):
    id: int
    title: str
    description: str
    icon: Optional[str] = None
    unlocked_at: Optional[str] = None

    class Config:
        from_attributes = True

class UserStatsOut(BaseModel):
    username: str
    level: int
    exp: int
    next_level_exp: int
    races_completed: int
    average_wpm: float
    average_accuracy: float
    achievements: List[AchievementOut]

    class Config:
        from_attributes = True

@router.get("/me/stats", response_model=UserStatsOut)
def get_my_stats(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Возвращает детальную статистику текущего авторизованного пользователя.
    """
    next_level_exp = current_user.level * 1000

    user_achievements = []
    if hasattr(current_user, "achievements") and current_user.achievements:
        user_achievements = [
            AchievementOut(
                id=ach.id,
                title=ach.title,
                description=ach.description,
                icon=getattr(ach, "icon", "🏆"),
                unlocked_at=str(ach.unlocked_at) if hasattr(ach, "unlocked_at") else None
            )
            for ach in current_user.achievements
        ]

    return UserStatsOut(
        username=current_user.username,
        level=getattr(current_user, "level", 1),
        exp=getattr(current_user, "exp", 0),
        next_level_exp=next_level_exp,
        races_completed=getattr(current_user, "races_completed", 0),
        average_wpm=getattr(current_user, "average_wpm", 0.0),
        average_accuracy=getattr(current_user, "average_accuracy", 0.0),
        achievements=user_achievements
    )