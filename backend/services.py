from sqlalchemy.orm import Session, selectinload
from sqlalchemy import func, extract
from typing import List, Optional
from datetime import datetime, timedelta, date
import models
import schemas


# Receipt CRUD Operations
def create_receipt(db: Session, receipt: schemas.ReceiptCreate, user_id: str) -> models.Receipt:
    """Create a new receipt with associated items"""
    # Create receipt instance
    db_receipt = models.Receipt(
        merchant_name=receipt.merchant_name,
        date=receipt.date,
        total_amount=receipt.total_amount,
        currency=receipt.currency,
        category=receipt.category.value if receipt.category else "Uncategorized",
        location=receipt.location,
        image_url=receipt.image_url,
        user_id=user_id
    )
    
    db.add(db_receipt)
    db.flush()  # Get the receipt ID
    
    # Create associated items
    for item_data in receipt.items:
        db_item = models.Item(
            name=item_data.name,
            price=item_data.price,
            quantity=item_data.quantity,
            receipt_id=db_receipt.id
        )
        db.add(db_item)
    
    db.commit()
    db.refresh(db_receipt)
    return db_receipt


def get_receipt(db: Session, receipt_id: int, user_id: str) -> Optional[models.Receipt]:
    """Retrieve a single receipt by ID"""
    return db.query(models.Receipt).options(selectinload(models.Receipt.items)).filter(
        models.Receipt.id == receipt_id,
        models.Receipt.user_id == user_id
    ).first()


def get_receipts(
    db: Session, 
    user_id: str,
    skip: int = 0, 
    limit: int = 100,
    category: Optional[str] = None,
    merchant_name: Optional[str] = None
) -> List[models.Receipt]:
    """Retrieve receipts with optional filtering"""
    query = db.query(models.Receipt).filter(models.Receipt.user_id == user_id)
    
    if category:
        query = query.filter(models.Receipt.category == category)
    if merchant_name:
        query = query.filter(models.Receipt.merchant_name.ilike(f"%{merchant_name}%"))
    
    return query.options(selectinload(models.Receipt.items)).order_by(models.Receipt.date.desc()).offset(skip).limit(limit).all()


def update_receipt(db: Session, receipt_id: int, receipt_update: schemas.ReceiptUpdate, user_id: str) -> Optional[models.Receipt]:
    """Update a receipt and optionally its items"""
    db_receipt = db.query(models.Receipt).filter(
        models.Receipt.id == receipt_id,
        models.Receipt.user_id == user_id
    ).first()
    
    if not db_receipt:
        return None
    
    # Update receipt fields
    update_data = receipt_update.dict(exclude_unset=True, exclude={'items'})
    
    # Convert category enum to string if present
    if 'category' in update_data and update_data['category']:
        update_data['category'] = update_data['category'].value
    
    for field, value in update_data.items():
        setattr(db_receipt, field, value)
    
    # Handle items update if provided
    if receipt_update.items is not None:
        # Delete existing items
        db.query(models.Item).filter(models.Item.receipt_id == receipt_id).delete()
        
        # Create new items
        for item_data in receipt_update.items:
            db_item = models.Item(
                name=item_data.name,
                price=item_data.price,
                quantity=item_data.quantity,
                receipt_id=receipt_id
            )
            db.add(db_item)
    
    db.commit()
    db.refresh(db_receipt)
    return db_receipt


def delete_receipt(db: Session, receipt_id: int, user_id: str) -> bool:
    """Delete a receipt (items are cascade deleted)"""
    db_receipt = db.query(models.Receipt).filter(
        models.Receipt.id == receipt_id,
        models.Receipt.user_id == user_id
    ).first()
    
    if not db_receipt:
        return False
    
    db.delete(db_receipt)
    db.commit()
    return True


# Item CRUD Operations
def create_item(db: Session, item: schemas.ItemCreate, receipt_id: int) -> models.Item:
    """Create a new item for a receipt"""
    # Assuming receipt ownership checked in controller logic before calling this
    db_item = models.Item(
        name=item.name,
        price=item.price,
        quantity=item.quantity,
        receipt_id=receipt_id
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


def get_item(db: Session, item_id: int, user_id: str) -> Optional[models.Item]:
    """Retrieve a single item by ID checking ownership via parent receipt"""
    return db.query(models.Item).join(models.Receipt).filter(
        models.Item.id == item_id,
        models.Receipt.user_id == user_id
    ).first()


def get_items_by_receipt(db: Session, receipt_id: int) -> List[models.Item]:
    """Retrieve all items for a specific receipt"""
    # Ownership checked before calling via get_receipt
    return db.query(models.Item).filter(models.Item.receipt_id == receipt_id).all()


def update_item(db: Session, item_id: int, item_update: schemas.ItemCreate, user_id: str) -> Optional[models.Item]:
    """Update an item"""
    # Check ownership
    db_item = db.query(models.Item).join(models.Receipt).filter(
        models.Item.id == item_id,
        models.Receipt.user_id == user_id
    ).first()
    
    if not db_item:
        return None
    
    db_item.name = item_update.name
    db_item.price = item_update.price
    db_item.quantity = item_update.quantity
    
    db.commit()
    db.refresh(db_item)
    return db_item


def delete_item(db: Session, item_id: int, user_id: str) -> bool:
    """Delete an item"""
    db_item = db.query(models.Item).join(models.Receipt).filter(
        models.Item.id == item_id,
        models.Receipt.user_id == user_id
    ).first()
    
    if not db_item:
        return False
    
    db.delete(db_item)
    db.commit()
    return True


# Dashboard Statistics
def get_dashboard_stats(db: Session, user_id: str, start_date: Optional[date] = None, end_date: Optional[date] = None) -> schemas.DashboardData:
    """Calculate dashboard statistics with optional date range filtering"""
    
    # Base queries for receipts and income
    receipt_query = db.query(models.Receipt).filter(models.Receipt.user_id == user_id)
    income_query = db.query(models.Income).filter(models.Income.user_id == user_id)
    
    # Apply date filters
    if start_date:
        receipt_query = receipt_query.filter(models.Receipt.date >= start_date)
        income_query = income_query.filter(models.Income.date >= start_date)
    if end_date:
        receipt_query = receipt_query.filter(models.Receipt.date <= end_date)
        income_query = income_query.filter(models.Income.date <= end_date)
        
    # Total receipts
    total_receipts = receipt_query.with_entities(func.count(models.Receipt.id)).scalar() or 0
    
    # This month receipts (strictly this current calendar month)
    current_month = datetime.now().month
    current_year = datetime.now().year
    
    # Note: reusing receipt_query here keeps date filters if applied, which IS desired behavior for dashboard date picker
    # But usually dashboard stats cards might want 'Current Month' regardless of picker?
    # The requirement usually implies dynamic filtering. Let's stick to the filtered query.
    # Actually, the original code used 'db.query' for 'this_month', implying it ignored filters? 
    # Logic: "This Month" usually means generic "current calendar month" stats, while charts follow filters.
    # However, filtering by user is MUST.
    
    this_month_query = db.query(func.count(models.Receipt.id)).filter(
        models.Receipt.user_id == user_id,
        extract('month', models.Receipt.date) == current_month,
        extract('year', models.Receipt.date) == current_year
    )
    this_month = this_month_query.scalar()
    
    # Total spent in range
    total_spent = receipt_query.with_entities(func.sum(models.Receipt.total_amount)).scalar() or 0.0
    
    # Total income in range
    total_income = income_query.with_entities(func.sum(models.Income.amount)).scalar() or 0.0
    
    # Average receipt in range
    avg_receipt = receipt_query.with_entities(func.avg(models.Receipt.total_amount)).scalar() or 0.0
    
    # Most expensive in range
    most_expensive = receipt_query.with_entities(func.max(models.Receipt.total_amount)).scalar() or 0.0
    
    # Receipts per week (last 30 days - keeping this static as a "velocity" indicator)
    thirty_days_ago = datetime.now() - timedelta(days=30)
    recent_receipts_count = db.query(func.count(models.Receipt.id)).filter(
        models.Receipt.user_id == user_id,
        models.Receipt.date >= thirty_days_ago.date()
    ).scalar()
    receipts_per_week = (recent_receipts_count / 4.0) if recent_receipts_count else 0.0
    
    # Top merchants in range
    top_merchants_data = receipt_query.with_entities(
        models.Receipt.merchant_name,
        func.sum(models.Receipt.total_amount).label('amount'),
        func.count(models.Receipt.id).label('count')
    ).group_by(models.Receipt.merchant_name).order_by(func.sum(models.Receipt.total_amount).desc()).limit(5).all()
    
    top_merchants = []
    for merchant in top_merchants_data:
        percentage = (merchant.amount / total_spent * 100) if total_spent > 0 else 0
        top_merchants.append(schemas.MerchantStat(
            merchant_name=merchant.merchant_name,
            amount=merchant.amount,
            percentage=round(percentage, 2),
            count=merchant.count
        ))

    # Spending by category in range
    category_data = receipt_query.with_entities(
        models.Receipt.category,
        func.sum(models.Receipt.total_amount).label('amount'),
        func.count(models.Receipt.id).label('count')
    ).group_by(models.Receipt.category).order_by(func.sum(models.Receipt.total_amount).desc()).all()
    
    spending_by_category = []
    for category in category_data:
        percentage = (category.amount / total_spent * 100) if total_spent > 0 else 0
        spending_by_category.append(schemas.CategoryStat(
            category=category.category,
            amount=category.amount,
            percentage=round(percentage, 2),
            count=category.count
        ))
    
    # Income by category in range
    income_category_data = income_query.with_entities(
        models.Income.category,
        func.sum(models.Income.amount).label('amount'),
        func.count(models.Income.id).label('count')
    ).group_by(models.Income.category).order_by(func.sum(models.Income.amount).desc()).all()
    
    income_by_category = []
    for category in income_category_data:
        percentage = (category.amount / total_income * 100) if total_income > 0 else 0
        income_by_category.append(schemas.CategoryStat(
            category=category.category,
            amount=category.amount,
            percentage=round(percentage, 2),
            count=category.count
        ))
    
    # Top income sources in range
    top_income_sources_data = income_query.with_entities(
        models.Income.source,
        func.sum(models.Income.amount).label('amount'),
        func.count(models.Income.id).label('count')
    ).group_by(models.Income.source).order_by(func.sum(models.Income.amount).desc()).limit(5).all()
    
    top_income_sources = []
    for source in top_income_sources_data:
        percentage = (source.amount / total_income * 100) if total_income > 0 else 0
        top_income_sources.append(schemas.MerchantStat(
            merchant_name=source.source,
            amount=source.amount,
            percentage=round(percentage, 2),
            count=source.count
        ))

    stats = schemas.DashboardStats(
        total_receipts=total_receipts,
        this_month=this_month or 0,
        total_spent=round(total_spent, 2),
        total_income=round(total_income, 2),
        avg_receipt=round(avg_receipt, 2),
        most_expensive=round(most_expensive, 2),
        receipts_per_week=round(receipts_per_week, 2)
    )
    
    return schemas.DashboardData(
        stats=stats,
        top_merchants=top_merchants,
        spending_by_category=spending_by_category,
        top_income_sources=top_income_sources,
        income_by_category=income_by_category
    )

# Income CRUD Operations
def create_income(db: Session, income: schemas.IncomeCreate, user_id: str) -> models.Income:
    """Create a new income entry"""
    db_income = models.Income(
        source=income.source,
        amount=income.amount,
        currency=income.currency,
        category=income.category.value if income.category else "Other",
        date=income.date,
        description=income.description,
        user_id=user_id
    )
    db.add(db_income)
    db.commit()
    db.refresh(db_income)
    return db_income

def get_income(db: Session, income_id: int, user_id: str) -> Optional[models.Income]:
    """Retrieve a single income entry by ID"""
    return db.query(models.Income).filter(
        models.Income.id == income_id,
        models.Income.user_id == user_id
    ).first()

def get_incomes(
    db: Session, 
    user_id: str,
    skip: int = 0, 
    limit: int = 100,
    category: Optional[str] = None
) -> List[models.Income]:
    """Retrieve income entries with optional filtering"""
    query = db.query(models.Income).filter(models.Income.user_id == user_id)
    if category:
        query = query.filter(models.Income.category == category)
    return query.order_by(models.Income.date.desc()).offset(skip).limit(limit).all()

def update_income(db: Session, income_id: int, income_update: schemas.IncomeUpdate, user_id: str) -> Optional[models.Income]:
    """Update an income entry"""
    db_income = db.query(models.Income).filter(
        models.Income.id == income_id,
        models.Income.user_id == user_id
    ).first()
    if not db_income:
        return None
    
    update_data = income_update.dict(exclude_unset=True)
    if 'category' in update_data and update_data['category']:
        update_data['category'] = update_data['category'].value
        
    for field, value in update_data.items():
        setattr(db_income, field, value)
        
    db.commit()
    db.refresh(db_income)
    return db_income

def delete_income(db: Session, income_id: int, user_id: str) -> bool:
    """Delete an income entry"""
    db_income = db.query(models.Income).filter(
        models.Income.id == income_id,
        models.Income.user_id == user_id
    ).first()
    if not db_income:
        return False
    db.delete(db_income)
    db.commit()
    return True

# Settings Operations
def get_settings(db: Session, user_id: str) -> models.Settings:
    """Get user-specific settings, creating default if not found"""
    settings = db.query(models.Settings).filter(models.Settings.user_id == user_id).first()
    if not settings:
        settings = models.Settings(currency="TND", user_id=user_id)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings

def update_settings(db: Session, settings_update: schemas.SettingsUpdate, user_id: str) -> models.Settings:
    """Update user settings"""
    settings = get_settings(db, user_id)
    if settings_update.currency:
        settings.currency = settings_update.currency
    
    db.commit()
    db.refresh(settings)
    return settings
