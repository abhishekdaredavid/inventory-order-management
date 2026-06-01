from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from . import models, schemas
from .database import engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Inventory & Order Management API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── PRODUCTS ───────────────────────────────────────────
@app.post("/products", response_model=schemas.ProductOut)
def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    if db.query(models.Product).filter(models.Product.sku == product.sku).first():
        raise HTTPException(status_code=400, detail="SKU already exists")
    if product.quantity < 0:
        raise HTTPException(status_code=400, detail="Quantity cannot be negative")
    db_product = models.Product(**product.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@app.get("/products", response_model=list[schemas.ProductOut])
def get_products(db: Session = Depends(get_db)):
    return db.query(models.Product).all()

@app.get("/products/{id}", response_model=schemas.ProductOut)
def get_product(id: int, db: Session = Depends(get_db)):
    p = db.query(models.Product).filter(models.Product.id == id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    return p

@app.put("/products/{id}", response_model=schemas.ProductOut)
def update_product(id: int, data: schemas.ProductUpdate, db: Session = Depends(get_db)):
    p = db.query(models.Product).filter(models.Product.id == id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    for key, value in data.dict(exclude_none=True).items():
        setattr(p, key, value)
    db.commit()
    db.refresh(p)
    return p

@app.delete("/products/{id}")
def delete_product(id: int, db: Session = Depends(get_db)):
    p = db.query(models.Product).filter(models.Product.id == id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(p)
    db.commit()
    return {"message": "Product deleted"}

# ─── CUSTOMERS ──────────────────────────────────────────
@app.post("/customers", response_model=schemas.CustomerOut)
def create_customer(customer: schemas.CustomerCreate, db: Session = Depends(get_db)):
    if db.query(models.Customer).filter(models.Customer.email == customer.email).first():
        raise HTTPException(status_code=400, detail="Email already exists")
    db_customer = models.Customer(**customer.dict())
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer

@app.get("/customers", response_model=list[schemas.CustomerOut])
def get_customers(db: Session = Depends(get_db)):
    return db.query(models.Customer).all()

@app.get("/customers/{id}", response_model=schemas.CustomerOut)
def get_customer(id: int, db: Session = Depends(get_db)):
    c = db.query(models.Customer).filter(models.Customer.id == id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Customer not found")
    return c

@app.delete("/customers/{id}")
def delete_customer(id: int, db: Session = Depends(get_db)):
    c = db.query(models.Customer).filter(models.Customer.id == id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Customer not found")
    db.delete(c)
    db.commit()
    return {"message": "Customer deleted"}

# ─── ORDERS ─────────────────────────────────────────────
@app.post("/orders", response_model=schemas.OrderOut)
def create_order(order: schemas.OrderCreate, db: Session = Depends(get_db)):
    customer = db.query(models.Customer).filter(models.Customer.id == order.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    total = 0
    order_items = []
    for item in order.items:
        product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
        if product.quantity < item.quantity:
            raise HTTPException(status_code=400, detail=f"Insufficient stock for {product.name}")
        product.quantity -= item.quantity
        total += product.price * item.quantity
        order_items.append(models.OrderItem(
            product_id=item.product_id,
            quantity=item.quantity,
            unit_price=product.price
        ))
    
    db_order = models.Order(customer_id=order.customer_id, total_amount=total)
    db.add(db_order)
    db.flush()
    for oi in order_items:
        oi.order_id = db_order.id
        db.add(oi)
    db.commit()
    db.refresh(db_order)
    return db_order

@app.get("/orders", response_model=list[schemas.OrderOut])
def get_orders(db: Session = Depends(get_db)):
    return db.query(models.Order).all()

@app.get("/orders/{id}", response_model=schemas.OrderOut)
def get_order(id: int, db: Session = Depends(get_db)):
    o = db.query(models.Order).filter(models.Order.id == id).first()
    if not o:
        raise HTTPException(status_code=404, detail="Order not found")
    return o

@app.delete("/orders/{id}")
def delete_order(id: int, db: Session = Depends(get_db)):
    o = db.query(models.Order).filter(models.Order.id == id).first()
    if not o:
        raise HTTPException(status_code=404, detail="Order not found")
    db.delete(o)
    db.commit()
    return {"message": "Order deleted"}

# ─── DASHBOARD ──────────────────────────────────────────
@app.get("/dashboard")
def dashboard(db: Session = Depends(get_db)):
    return {
        "total_products": db.query(models.Product).count(),
        "total_customers": db.query(models.Customer).count(),
        "total_orders": db.query(models.Order).count(),
        "low_stock_products": db.query(models.Product).filter(models.Product.quantity < 5).all()
    }