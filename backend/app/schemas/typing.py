from pydantic import BaseModel, Field
from typing import Optional, Dict

class TypingResultCreate(BaseModel):
    mode: str = Field(default="words", example="words")
    wpm: float = Field(..., example=65.5)
    cpm: float = Field(..., example=327.0)
    accuracy: float = Field(..., example=98.2)
    time_seconds: float = Field(..., example=15.4)
    errors_count: int = Field(default=0, example=2)
    mistake_keys: Optional[Dict[str, int]] = Field(default_factory=dict)