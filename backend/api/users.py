from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import models, schemas
import os
from supabase import create_client, Client

router = APIRouter(
    prefix="/users",
    tags=["users"]
)

# Initialize Supabase Admin Client
# Ensure these environment variables are set in your backend environment
SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL") 
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

from auth_utils import get_current_user

@router.post("/", response_model=schemas.User)
def create_or_sync_user(user: schemas.UserCreate, db: Session = Depends(get_db), current_user_id: str = Depends(get_current_user)):
    if user.id != current_user_id:
        raise HTTPException(status_code=403, detail="Not authorized to sync this user")
        
    db_user = db.query(models.User).filter(models.User.id == current_user_id).first()
    if db_user:
        # Update existing user
        db_user.email = user.email
        if user.full_name:
            db_user.full_name = user.full_name
        if user.avatar_url:
            db_user.avatar_url = user.avatar_url
    else:
        # Create new user
        db_user = models.User(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            avatar_url=user.avatar_url
        )
        db.add(db_user)
    
    db.commit()
    db.refresh(db_user)
    return db_user

@router.get("/{user_id}", response_model=schemas.User)
def get_user(user_id: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/{user_id}", response_model=schemas.User)
def update_user(user_id: str, user_update: schemas.UserUpdate, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user_update.full_name is not None:
        user.full_name = user_update.full_name
    if user_update.avatar_url is not None:
        user.avatar_url = user_update.avatar_url
    
    db.commit()
    db.refresh(user)
    return user

@router.delete("/{user_id}")
def delete_user(user_id: str, db: Session = Depends(get_db)):
    # 1. Delete from Local DB
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db.delete(user)
    db.commit()

    # 2. Delete from Supabase Auth
    # Lazy initialization to prevent server blocking
    if SUPABASE_URL and SUPABASE_SERVICE_KEY:
        try:
            print(f"Initializing Supabase Client for user deletion...")
            supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
            supabase.auth.admin.delete_user(user_id)
            print(f"Deleted user {user_id} from Supabase Auth")
        except Exception as e:
            print(f"Error deleting user from Supabase: {e}")
            # We don't raise 500 here to ensure the client sees the deletion as successful
            # (since local data is gone).
    else:
        print("Supabase credentials not found. Auth deletion skipped.")

    return {"status": "success", "message": "User deleted"}
