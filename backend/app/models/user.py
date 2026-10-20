from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=True)
    hashed_password = Column(String, nullable=False)
    level = Column(Integer, default=1)
    exp = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Связь с результатами заездов
    typing_sessions = relationship("TypingSession", back_populates="user")


class TypingSession(Base):
    __tablename__ = "typing_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True) # None для анонимных заездов
    wpm = Column(Float, nullable=False)
    cpm = Column(Float, nullable=False)
    accuracy = Column(Float, nullable=False)
    time_seconds = Column(Float, nullable=False)
    mode = Column(String, nullable=False)
    errors_count = Column(Integer, default=0)
    mistake_keys = Column(JSON, nullable=True) # Храним ошибки формата {"a": 2, "k": 1}
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="typing_sessions")