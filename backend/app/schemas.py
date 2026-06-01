from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

# Product
class ProductCreate(BaseModel):
    name: str
    sku: str
    price: float
    quantity: int

class ProductUpdate(BaseModel):
    name: Optional[str]
    price: Optional[float]
    quantity: Optional[int]

class ProductOut(BaseModel):
    id: int
    name: str
    sku: str
    price: float
    quantity: int
    class Config:
        from_attributes = True

# Customer
class CustomerCreate(BaseModel):
    full_name: str
    email: str
    phone: str

class CustomerOut(BaseModel):
    id: int
    full_name: str
    email: str
    phone: str
    class Config:
        from_attributes = True

# Order
class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int

class OrderCreate(BaseModel):
    customer_id: int
    items: List[OrderItemCreate]

class OrderItemOut(BaseModel):
    product_id: int
    quantity: int
    unit_price: float
    class Config:
        from_attributes = True

class OrderOut(BaseModel):
    id: int
    customer_id: int
    total_amount: float
    created_at: datetime
    items: List[OrderItemOut]
    class Config:
        from_attributes = True