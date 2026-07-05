from datetime import datetime, date
from enum import Enum
from typing import Optional

from sqlmodel import SQLModel, Field, Relationship


class TaskStatus(str, Enum):
    todo = "todo"
    in_progress = "in_progress"
    done = "done"


class TaskPriority(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(index=True, unique=True, nullable=False)
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    tasks: list["Task"] = Relationship(back_populates="owner")


class Task(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    description: Optional[str] = None
    due_date: Optional[date] = None
    priority: TaskPriority = Field(default=TaskPriority.medium)
    status: TaskStatus = Field(default=TaskStatus.todo)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    owner_id: Optional[int] = Field(default=None, foreign_key="user.id")
    owner: Optional[User] = Relationship(back_populates="tasks")
