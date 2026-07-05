from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.auth import get_current_user
from app.database import get_session
from app.models import Task, TaskPriority, TaskStatus, User
from app.schemas import TaskCreate, TaskRead, TaskStats, TaskUpdate

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.post("", response_model=TaskRead, status_code=status.HTTP_201_CREATED)
def create_task(
    task_in: TaskCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    task = Task(**task_in.model_dump(), owner_id=current_user.id)
    session.add(task)
    session.commit()
    session.refresh(task)
    return task


@router.get("", response_model=list[TaskRead])
def list_tasks(
    status_filter: Optional[TaskStatus] = None,
    priority: Optional[TaskPriority] = None,
    sort_by: str = "created_at",
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    query = select(Task).where(Task.owner_id == current_user.id)
    if status_filter is not None:
        query = query.where(Task.status == status_filter)
    if priority is not None:
        query = query.where(Task.priority == priority)

    sortable_columns = {
        "created_at": Task.created_at,
        "due_date": Task.due_date,
        "priority": Task.priority,
        "title": Task.title,
    }
    column = sortable_columns.get(sort_by, Task.created_at)
    query = query.order_by(column)

    return session.exec(query).all()


@router.get("/stats", response_model=TaskStats)
def task_stats(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    tasks = session.exec(select(Task).where(Task.owner_id == current_user.id)).all()
    todo = sum(1 for t in tasks if t.status == TaskStatus.todo)
    in_progress = sum(1 for t in tasks if t.status == TaskStatus.in_progress)
    done = sum(1 for t in tasks if t.status == TaskStatus.done)
    return TaskStats(todo=todo, in_progress=in_progress, done=done, total=len(tasks))


def _get_owned_task(task_id: int, session: Session, current_user: User) -> Task:
    task = session.get(Task, task_id)
    if task is None or task.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return task


@router.get("/{task_id}", response_model=TaskRead)
def get_task(
    task_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    return _get_owned_task(task_id, session, current_user)


@router.put("/{task_id}", response_model=TaskRead)
def update_task(
    task_id: int,
    task_in: TaskUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    task = _get_owned_task(task_id, session, current_user)
    updates = task_in.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(task, field, value)
    task.updated_at = datetime.utcnow()

    session.add(task)
    session.commit()
    session.refresh(task)
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    task = _get_owned_task(task_id, session, current_user)
    session.delete(task)
    session.commit()
    return None
