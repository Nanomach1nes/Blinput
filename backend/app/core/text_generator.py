import random

WORDS_RU = ["программа", "алгоритм", "функция", "переменная", "клавиатура", "скорость", "разработка", "код", "запрос", "сервер"]
WORDS_EN = ["program", "algorithm", "function", "variable", "keyboard", "speed", "development", "code", "request", "server"]

SENTENCES_RU = [
    "Быстрая печать помогает быстрее воплощать идеи в код.",
    "Слепой метод печати развивает мышечную память пальцев.",
    "Хороший бэкенд на FastAPI обрабатывает запросы молниеносно."
]
SENTENCES_EN = [
    "Fast typing helps bring ideas to code much quicker.",
    "Touch typing develops muscle memory for your fingers.",
    "A solid FastAPI backend handles requests lightning fast."
]

CODE_SNIPPETS = [
    "def hello_world():\n    print('Hello, Blinput!')",
    "const sum = (a, b) => a + b;\nconsole.log(sum(5, 10));",
    "async def get_user(db: Session, user_id: int):\n    return db.query(User).get(user_id)"
]

SYMBOLS = ["!@#$%", "^&*()", "12345", "_+-=", "{}[]", "<>/?~"]

def generate_text(mode: str = "words", lang: str = "ru", count: int = 10) -> str:
    if mode == "code":
        return random.choice(CODE_SNIPPETS)
    elif mode == "sentences":
        return random.choice(SENTENCES_RU if lang == "ru" else SENTENCES_EN)
    elif mode == "symbols":
        return " ".join(random.choices(SYMBOLS, k=count))
    else:  # mode == "words"
        words_list = WORDS_RU if lang == "ru" else WORDS_EN
        return " ".join(random.choices(words_list, k=count))