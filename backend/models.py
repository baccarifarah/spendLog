from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    price = Column(Float)
    quantity = Column(Integer, default=1)
    receipt_id = Column(Integer, ForeignKey("receipts.id", ondelete="CASCADE"))

    receipt = relationship("Receipt", back_populates="items")

class Receipt(Base):
    __tablename__ = "receipts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True) # Link to Supabase User ID
    merchant_name = Column(String, index=True)
    date = Column(Date)
    total_amount = Column(Float)
    currency = Column(String, default="TND")
    category = Column(String, index=True, default="Uncategorized")
    location = Column(String, nullable=True)
    image_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    items = relationship("Item", back_populates="receipt", cascade="all, delete-orphan")

class Income(Base):
    __tablename__ = "income"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True) # Link to Supabase User ID
    source = Column(String, index=True)
    amount = Column(Float)
    currency = Column(String, default="TND")
    category = Column(String, index=True)  # Salary, Freelance, Business, Investment, Other
    date = Column(Date)
    description = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Settings(Base):
    __tablename__ = "settings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True) # Link to Supabase User ID
    currency = Column(String, default="TND")  # ISO code: TND, USD, EUR

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True) # UUID from Supabase
    email = Column(String, unique=True, index=True)
    full_name = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

