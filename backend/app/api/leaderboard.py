from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from datetime import datetime, timedelta
from typing import List, Optional
from pydantic import BaseModel

from ..database import get_db
from ..models.user import User, TypingSession

router = APIRouter(prefix="/api/leaderboard", tags=["Leaderboard"])

class LeaderboardItem(BaseModel):
    rank: int
    username: str
    level: int
    score: float # Здесь будет wpm, accuracy или exp в зависимости от фильтра

    class Config:
        from_attributes = True

@router.get("/", response_model=List[LeaderboardItem])
def get_leaderboard(
    metric: str = Query("wpm", regex="^(wpm|accuracy|exp)$"),
    period: str = Query("all", regex="^(day|week|all)$"),
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """
    Эндпоинт таблицы лидеров с фильтрацией по метрике (wpm, accuracy, exp) 
    и периоду (day, week, all).
    """
    # Если запрашивается EXP, берем данные напрямую из таблицы пользователей
    if metric == "exp":
        query = db.query(User)
        
        # Если нужен период по EXP, можно фильтровать по сессиям за этот период
        if period != "all":
            now = datetime.utcnow()
            start_date = now - timedelta(days=1 if period == "day" else 7)
            
            # Подсчитываем сумму опыта за период из сессий
            subquery = (
                db.query(
                    TypingSession.user_id,
                    func.sum(TypingSession.wpm * (TypingSession.accuracy / 100)).label("period_exp")
                )
                .filter(TypingSession.created_at >= start_date)
                .group_by(TypingSession.user_id)
                .subquery()
            )
            
            query = (
                db.query(User, subquery.c.period_exp)
                .join(subquery, User.id == subquery.c.user_id)
                .order_by(desc(subquery.c.period_exp))
                .limit(limit)
                .all()
            )
            
            result = []
            for index, (user, p_exp) in enumerate(query, start=1):
                result.append(LeaderboardItem(
                    rank=index,
                    username=user.username,
                    level=user.level,
                    score=round(p_exp or 0, 2)
                ))
            return result

        # По умолчанию (все время по EXP)
        users = query.order_by(desc(User.exp)).limit(limit).all()
        return [
            LeaderboardItem(rank=i, username=u.username, level=u.level, score=float(u.exp))
            for i, u in enumerate(users, start=1)
        ]

    # Для метрик WPM и Accuracy считаем показатели по сессиям с учетом периода
    session_query = db.query(TypingSession).filter(TypingSession.user_id.isnot(None))

    if period != "all":
        now = datetime.utcnow()
        start_date = now - timedelta(days=1 if period == "day" else 7)
        session_query = session_query.filter(TypingSession.created_at >= start_date)

    if metric == "wpm":
        # Группируем по пользователям и берем средний (или максимальный) WPM
        agg_query = (
            db.query(
                TypingSession.user_id,
                func.max(TypingSession.wpm).label("best_score")
            )
            .group_by(TypingSession.user_id)
        )
        if period != "all":
            agg_query = agg_query.filter(TypingSession.created_at >= start_date)
            
        leaderboard_data = agg_query.order_by(desc("best_score")).limit(limit).all()

    elif metric == "accuracy":
        agg_query = (
            db.query(
                TypingSession.user_id,
                func.avg(TypingSession.accuracy).label("avg_accuracy")
            )
            .group_by(TypingSession.user_id)
        )
        if period != "all":
            agg_query = agg_query.filter(TypingSession.created_at >= start_date)
            
        leaderboard_data = agg_query.order_by(desc("avg_accuracy")).limit(limit).all()

    result = []
    for index, item in enumerate(leaderboard_data, start=1):
        user_id, score = item
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            result.append(
                LeaderboardItem(
                    rank=index,
                    username=user.username,
                    level=user.level,
                    score=round(score, 2) if score else 0.0
                )
            )

    return result