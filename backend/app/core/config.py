import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "default_secret_key_change_me")
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./blinput.db")
ALGORITHM = os.getenv("ALGORITHM", "HS256")