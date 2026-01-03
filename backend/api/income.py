from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
import schemas
import services
from auth_utils import get_current_user

router = APIRouter(prefix="/income", tags=["income"])

@router.post("/", response_model=schemas.Income, status_code=201)
def create_income(
    income: schemas.IncomeCreate, 
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user)
):
    """Create a new income entry"""
    return services.create_income(db=db, income=income, user_id=current_user_id)

@router.get("/", response_model=schemas.PaginatedIncomes)
def read_incomes(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    sort_by: str = Query("date"),
    order: str = Query("desc"),
    category: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user)
):
    """Retrieve income entries with optional filtering, sorting and pagination"""
    items, total = services.get_incomes(
        db=db, 
        skip=skip, 
        limit=limit, 
        sort_by=sort_by,
        order=order,
        category=category, 
        user_id=current_user_id
    )
    return {
        "items": items,
        "total": total,
        "skip": skip,
        "limit": limit
    }

@router.get("/{income_id}", response_model=schemas.Income)
def read_income(
    income_id: int, 
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user)
):
    """Get a specific income entry by ID"""
    db_income = services.get_income(db, income_id=income_id, user_id=current_user_id)
    if not db_income:
        raise HTTPException(status_code=404, detail="Income entry not found")
    return db_income

@router.patch("/{income_id}", response_model=schemas.Income)
def update_income(
    income_id: int, 
    income_update: schemas.IncomeUpdate, 
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user)
):
    """Update an existing income entry"""
    db_income = services.update_income(db, income_id=income_id, income_update=income_update, user_id=current_user_id)
    if not db_income:
        raise HTTPException(status_code=404, detail="Income entry not found")
    return db_income

@router.delete("/{income_id}", status_code=204)
def delete_income(
    income_id: int, 
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user)
):
    """Delete an income entry"""
    success = services.delete_income(db, income_id=income_id, user_id=current_user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Income entry not found")
    return None
