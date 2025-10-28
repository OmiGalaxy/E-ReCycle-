from sqlalchemy import create_engine, Column, Integer, String, DateTime, Boolean, Text, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime, timezone

SQLALCHEMY_DATABASE_URL = "sqlite:///./ecycle.db"

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_utc_now():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    phone = Column(String)
    address = Column(Text)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=get_utc_now)

class Classification(Base):
    __tablename__ = "classifications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer)
    item_name = Column(String)
    description = Column(Text)
    condition = Column(String)
    image_path = Column(String)
    category = Column(String)
    created_at = Column(DateTime, default=get_utc_now)

class Disposal(Base):
    __tablename__ = "disposals"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer)
    classification_id = Column(Integer)
    disposal_method = Column(String)
    pickup_date = Column(String)
    pickup_location = Column(Text)
    vendor_filter = Column(String)
    selected_vendor = Column(String)
    status = Column(String, default="pending")
    created_at = Column(DateTime, default=get_utc_now)

class Donation(Base):
    __tablename__ = "donations"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer)
    classification_id = Column(Integer)
    location = Column(Text)
    status = Column(String, default="available")
    created_at = Column(DateTime, default=get_utc_now)

class ProductCategory(Base):
    __tablename__ = "product_categories"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    icon = Column(String)
    created_at = Column(DateTime, default=get_utc_now)

class MarketplaceItem(Base):
    __tablename__ = "marketplace_items"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer)
    classification_id = Column(Integer)
    title = Column(String)
    brand = Column(String)
    model = Column(String)
    description = Column(Text)
    price = Column(Float)
    original_price = Column(Float)
    category_id = Column(Integer)
    images = Column(Text)
    specifications = Column(Text)
    warranty_info = Column(String)
    seller_name = Column(String)
    seller_rating = Column(Float, default=0.0)
    is_selling = Column(Boolean, default=True)
    status = Column(String, default="available")
    created_at = Column(DateTime, default=get_utc_now)

class Purchase(Base):
    __tablename__ = "purchases"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer)
    marketplace_item_id = Column(Integer)
    purchase_price = Column(Float)
    shipping_address = Column(Text)
    phone_number = Column(String)
    payment_method = Column(String)
    status = Column(String, default="completed")
    receipt_generated = Column(Boolean, default=False)
    created_at = Column(DateTime, default=get_utc_now)

class RepairRequest(Base):
    __tablename__ = "repair_requests"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer)
    item_name = Column(String)
    description = Column(Text)
    image_path = Column(String)
    repair_type = Column(String)
    status = Column(String, default="pending")
    created_at = Column(DateTime, default=get_utc_now)

def create_tables():
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        print(f"Error creating tables: {e}")
        raise

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

__all__ = ['engine', 'SessionLocal', 'Base', 'User', 'Classification', 'Disposal', 'Donation', 'ProductCategory', 'MarketplaceItem', 'Purchase', 'RepairRequest', 'create_tables', 'get_db']