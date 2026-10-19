import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# По умолчанию локальная SQLite база, чтобы не мучиться с настройкой Postgres на старте
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./blinput.db")

# Для SQLite нужно разрешить работу с несколькими потоками
connect_args = {"check_same_thread": False} if "sqlite" in SQLALCHEMY_DATABASE_URL else {}

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Вспомогательная функция (Dependency) для получения сессии БД в эндпоинтах
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()