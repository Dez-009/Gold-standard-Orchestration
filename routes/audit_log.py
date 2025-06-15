from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database.utils import get_db
from services import audit_log_service
from schemas.audit_log_schemas import AuditLogCreate, AuditLogResponse
from auth.dependencies import get_current_user
from models.user import User

router = APIRouter(prefix="/audit-logs", tags=["audit-logs"])


@router.post("/", response_model=AuditLogResponse)
def create_audit_log(
    log_data: AuditLogCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> AuditLogResponse:
    new_log = audit_log_service.create_audit_log(db, log_data.model_dump())
    return new_log


@router.get("/user/{user_id}", response_model=list[AuditLogResponse])
def read_audit_logs_by_user(user_id: int, db: Session = Depends(get_db)) -> list[AuditLogResponse]:
    logs = audit_log_service.get_audit_logs_by_user(db, user_id)
    return logs


@router.get("/", response_model=list[AuditLogResponse])
def read_all_audit_logs(db: Session = Depends(get_db)) -> list[AuditLogResponse]:
    logs = audit_log_service.get_all_audit_logs(db)
    return logs
