from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import schemas
import services
from database import get_db
from auth_utils import get_current_user

router = APIRouter(prefix="/items", tags=["items"])

@router.get("/pending", response_model=List[schemas.Item])
def read_pending_items(
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user)
):
    """Retrieve all pending items (To Buy List) for current user"""
    return services.get_pending_items(db=db, user_id=current_user_id)

@router.post("/pending", response_model=schemas.Item, status_code=status.HTTP_201_CREATED)
def create_pending_item(
    item: schemas.PendingItemCreate,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user)
):
    """Create a new pending item"""
    # We use ItemCreate internally, setting price to 0
    item_create = schemas.ItemCreate(
        name=item.name,
        quantity=item.quantity,
        price=0.0 
    )
    return services.create_item(db=db, item=item_create, user_id=current_user_id, receipt_id=None)

@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user)
):
    """Delete a pending item"""
    success = services.delete_pending_item(db=db, item_id=item_id, user_id=current_user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Item not found")
    return None
