import random

WORDS_RU = [
    "алгоритм", "переменная", "функция", "массив", "цикл", "клавиатура",
    "скорость", "точность", "хакатон", "разработка", "контейнер", "запрос",
    "сервер", "клиент", "база", "данные", "поток", "память", "указатель"
]

CODE_SNIPPETS = [
    "def calculate_wpm(words, seconds):\n    return (words / seconds) * 60",
    "for (let i = 0; i < array.length; i++) {\n    console.log(array[i]);\n}",
    "int main() {\n    std::cout << \"CyberBreak 2026!\" << std::endl;\n    return 0;\n}"
]

def generate_text(mode: str = "words", count: int = 10) -> str:
    if mode == "code":
        return random.choice(CODE_SNIPPETS)
    elif mode == "words":
        # Выбираем N случайных слов
        selected = [random.choice(WORDS_RU) for _ in range(count)]
        return " ".join(selected)
    
    return "Быстрая коричневая лиса прыгает через ленивую собаку."