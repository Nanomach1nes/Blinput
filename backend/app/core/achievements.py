from sqlalchemy.orm import Session
from ..models.user import User, TypingSession
from ..models.achievement import Achievement, UserAchievement

INITIAL_ACHIEVEMENTS = [
    {"code": "first_race", "title": "Первый заезд", "description": "Завершите свой первый заезд", "icon": "🏎️"},
    {"code": "perfectionist", "title": "Перфекционист", "description": "Завершите заезд со 100% точностью", "icon": "🎯"},
    {"code": "speed_demon", "title": "Демон скорости", "description": "Наберите более 70 WPM", "icon": "⚡"}
]

def init_achievements(db: Session):
    for ach in INITIAL_ACHIEVEMENTS:
        if not db.query(Achievement).filter(Achievement.code == ach["code"]).first():
            db.add(Achievement(**ach))
    db.commit()

def check_and_grant_achievements(user: User, session: TypingSession, db: Session) -> list:
    unlocked = []
    
    def grant(code: str):
        ach = db.query(Achievement).filter(Achievement.code == code).first()
        if ach:
            already = db.query(UserAchievement).filter(
                UserAchievement.user_id == user.id,
                UserAchievement.achievement_id == ach.id
            ).first()
            if not already:
                db.add(UserAchievement(user_id=user.id, achievement_id=ach.id))
                unlocked.append({"code": ach.code, "title": ach.title, "icon": ach.icon})

    grant("first_race")

    if session.accuracy >= 100.0:
        grant("perfectionist")

    if session.wpm >= 70.0:
        grant("speed_demon")

    db.commit()
    return unlocked