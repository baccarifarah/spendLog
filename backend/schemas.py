from typing import List, Optional
from pydantic import BaseModel
import datetime
from enum import Enum

class ExpenseCategory(str, Enum):
    FOOD = "Food"
    TRANSPORTATION = "Transportation"
    SHOPPING = "Shopping"
    ENTERTAINMENT = "Entertainment"
    HEALTH = "Health"
    HOUSING = "Housing"
    TRAVEL = "Travel"
    WORK = "Work"
    BILLS = "Bills"
    FITNESS = "Fitness"
    UNCATEGORIZED = "Uncategorized"

class ItemBase(BaseModel):
    name: str
    price: float
    quantity: int

class ItemCreate(ItemBase):
    pass

class PendingItemCreate(BaseModel):
    name: str
    quantity: int = 1

class Item(ItemBase):
    id: int
    receipt_id: Optional[int] = None
    user_id: Optional[str] = None

    class Config:
        from_attributes = True

class ReceiptBase(BaseModel):
    merchant_name: Optional[str] = None
    date: Optional[datetime.date] = None
    total_amount: Optional[float] = None
    currency: Optional[str] = "TND"
    category: Optional[ExpenseCategory] = ExpenseCategory.UNCATEGORIZED
    location: Optional[str] = None
    image_url: Optional[str] = None

class ReceiptCreate(ReceiptBase):
    merchant_name: str
    date: datetime.date
    total_amount: float
    items: List[ItemCreate] = []
    pending_item_ids: List[int] = []

class ReceiptUpdate(BaseModel):
    merchant_name: Optional[str] = None
    date: Optional[datetime.date] = None
    total_amount: Optional[float] = None
    currency: Optional[str] = None
    category: Optional[ExpenseCategory] = None
    location: Optional[str] = None
    image_url: Optional[str] = None
    items: Optional[List[ItemCreate]] = None

class Receipt(ReceiptBase):
    id: int
    created_at: datetime.datetime
    items: List[Item] = []

    class Config:
        from_attributes = True

# Dashboard Schemas
class DashboardStats(BaseModel):
    total_receipts: int
    this_month: int
    total_spent: float
    total_income: float
    avg_receipt: float
    most_expensive: float
    receipts_per_week: float

class MerchantStat(BaseModel):
    merchant_name: str
    amount: float
    percentage: float
    count: int

class CategoryStat(BaseModel):
    category: str
    amount: float
    percentage: float
    count: int

class DashboardData(BaseModel):
    stats: DashboardStats
    top_merchants: List[MerchantStat]
    spending_by_category: List[CategoryStat]
    top_income_sources: List[MerchantStat]  # Reusing MerchantStat for source-based stats
    income_by_category: List[CategoryStat]  # Reusing CategoryStat for category-based stats

# Income Schemas
class IncomeCategory(str, Enum):
    SALARY = "Salary"
    FREELANCE = "Freelance"
    BUSINESS = "Business"
    INVESTMENT = "Investment"
    OTHER = "Other"

class IncomeBase(BaseModel):
    source: str
    amount: float
    currency: Optional[str] = "TND"
    category: IncomeCategory
    date: datetime.date
    description: Optional[str] = None

class IncomeCreate(IncomeBase):
    pass

class IncomeUpdate(BaseModel):
    source: Optional[str] = None
    amount: Optional[float] = None
    currency: Optional[str] = None
    category: Optional[IncomeCategory] = None
    date: Optional[datetime.date] = None
    description: Optional[str] = None

class Income(IncomeBase):
    id: int
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class SettingsBase(BaseModel):
    currency: str = "TND"

class SettingsUpdate(BaseModel):
    currency: Optional[str] = "TND"

class Settings(SettingsBase):
    id: int

    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    id: str
    email: str
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None

class User(BaseModel):
    id: str
    email: str
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True
