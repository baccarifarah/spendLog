from fastapi import APIRouter, Depends, HTTPException, Query, File, UploadFile
from sqlalchemy.orm import Session
from typing import List, Optional
import datetime
import schemas
import services
import os
import uuid
import shutil
from database import get_db
from auth_utils import get_current_user

router = APIRouter(prefix="/receipts", tags=["receipts"])


# Receipt Endpoints
@router.post("/", response_model=schemas.Receipt, status_code=201)
def create_receipt(
    receipt: schemas.ReceiptCreate, 
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user)
):
    """Create a new receipt with items for the current user"""
    # We need to modify the service to accept user_id or handle it here
    # The service layer should ideally handle user_id assignation
    # For now, let's update service calls to pass user_id if we update service signatures,
    # OR we handle model creation here if services are simple.
    # Let's assume we update services.py next.
    return services.create_receipt(db=db, receipt=receipt, user_id=current_user_id)


@router.get("/", response_model=schemas.PaginatedReceipts)
def read_receipts(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    sort_by: str = Query("date"),
    order: str = Query("desc"),
    category: Optional[str] = None,
    merchant_name: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user)
):
    """Retrieve all receipts for current user with optional filtering, sorting and pagination"""
    items, total = services.get_receipts(
        db=db, 
        skip=skip, 
        limit=limit,
        sort_by=sort_by,
        order=order,
        category=category,
        merchant_name=merchant_name,
        user_id=current_user_id
    )
    return {
        "items": items,
        "total": total,
        "skip": skip,
        "limit": limit
    }


@router.get("/{receipt_id}", response_model=schemas.Receipt)
def read_receipt(
    receipt_id: int, 
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user)
):
    """Retrieve a specific receipt by ID (owned by user)"""
    db_receipt = services.get_receipt(db=db, receipt_id=receipt_id, user_id=current_user_id)
    if db_receipt is None:
        raise HTTPException(status_code=404, detail="Receipt not found")
    return db_receipt


@router.put("/{receipt_id}", response_model=schemas.Receipt)
def update_receipt(
    receipt_id: int, 
    receipt: schemas.ReceiptUpdate, 
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user)
):
    """Update a receipt and optionally its items (owned by user)"""
    db_receipt = services.update_receipt(
        db=db, 
        receipt_id=receipt_id, 
        receipt_update=receipt, 
        user_id=current_user_id
    )
    if db_receipt is None:
        raise HTTPException(status_code=404, detail="Receipt not found")
    return db_receipt


@router.delete("/{receipt_id}", status_code=204)
def delete_receipt(
    receipt_id: int, 
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user)
):
    """Delete a receipt (cascade deletes associated items)"""
    success = services.delete_receipt(db=db, receipt_id=receipt_id, user_id=current_user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Receipt not found")
    return None


# Item Endpoints
@router.post("/{receipt_id}/items", response_model=schemas.Item, status_code=201)
def create_item(
    receipt_id: int, 
    item: schemas.ItemCreate, 
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user)
):
    """Create a new item for a specific receipt"""
    # Verify receipt exists and belongs to user
    db_receipt = services.get_receipt(db=db, receipt_id=receipt_id, user_id=current_user_id)
    if db_receipt is None:
        raise HTTPException(status_code=404, detail="Receipt not found")
    
    return services.create_item(db=db, item=item, receipt_id=receipt_id)


@router.get("/{receipt_id}/items", response_model=List[schemas.Item])
def read_items(
    receipt_id: int, 
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user)
):
    """Retrieve all items for a specific receipt"""
    # Verify receipt exists and belongs to user
    db_receipt = services.get_receipt(db=db, receipt_id=receipt_id, user_id=current_user_id)
    if db_receipt is None:
        raise HTTPException(status_code=404, detail="Receipt not found")
    
    return services.get_items_by_receipt(db=db, receipt_id=receipt_id)


@router.get("/items/{item_id}", response_model=schemas.Item)
def read_item(
    item_id: int, 
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user)
):
    """Retrieve a specific item by ID (must belong to user's receipt)"""
    # logic inside service needs to check ownership of parent receipt
    db_item = services.get_item(db=db, item_id=item_id, user_id=current_user_id)
    if db_item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    return db_item


@router.put("/items/{item_id}", response_model=schemas.Item)
def update_item(
    item_id: int, 
    item: schemas.ItemCreate, 
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user)
):
    """Update a specific item"""
    db_item = services.update_item(db=db, item_id=item_id, item_update=item, user_id=current_user_id)
    if db_item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    return db_item


@router.delete("/items/{item_id}", status_code=204)
def delete_item(
    item_id: int, 
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user)
):
    """Delete a specific item"""
    success = services.delete_item(db=db, item_id=item_id, user_id=current_user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Item not found")
    return None


# Dashboard Endpoint
@router.get("/dashboard/stats", response_model=schemas.DashboardData)
def get_dashboard_stats(
    start_date: Optional[datetime.date] = Query(None),
    end_date: Optional[datetime.date] = Query(None),
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user)
):
    """Get dashboard statistics including top merchants and spending by category"""
    return services.get_dashboard_stats(
        db=db, 
        start_date=start_date, 
        end_date=end_date,
        user_id=current_user_id
    )


@router.post("/upload")
async def upload_receipt_image(file: UploadFile = File(...)):
    """Upload a receipt image or PDF and return its URL"""
    # Create uploads directory if it doesn't exist
    UPLOAD_DIR = "uploads"
    if not os.path.exists(UPLOAD_DIR):
        os.makedirs(UPLOAD_DIR)
        
    # Check file extension
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in [".jpg", ".jpeg", ".png", ".pdf"]:
        raise HTTPException(status_code=400, detail="Invalid file type. Only JPG, PNG, and PDF are allowed.")
    
    # Generate unique filename
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    # Save file
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not save file: {str(e)}")
        
    # Return URL (relative to API base)
    return {"url": f"/uploads/{unique_filename}"}


@router.delete("/upload/{filename}")
async def delete_upload(filename: str):
    """Delete a previously uploaded file"""
    UPLOAD_DIR = "uploads"
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    # Security check: ensure path is within UPLOAD_DIR
    if not os.path.abspath(file_path).startswith(os.path.abspath(UPLOAD_DIR)):
        raise HTTPException(status_code=400, detail="Invalid filename")
        
    if os.path.exists(file_path):
        try:
            os.remove(file_path)
            return {"message": "File deleted successfully"}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Could not delete file: {str(e)}")
    else:
        raise HTTPException(status_code=404, detail="File not found")
