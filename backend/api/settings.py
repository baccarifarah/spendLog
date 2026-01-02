from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import schemas
import services
from database import get_db
from auth_utils import get_current_user

router = APIRouter(prefix="/settings", tags=["settings"])

@router.get("/", response_model=schemas.Settings)
def read_settings(
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user)
):
    """Retrieve user-specific settings"""
    return services.get_settings(db, user_id=current_user_id)

@router.patch("/", response_model=schemas.Settings)
def update_settings(
    settings: schemas.SettingsUpdate, 
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user)
):
    """Update user-specific settings"""
    return services.update_settings(db, settings, user_id=current_user_id)
