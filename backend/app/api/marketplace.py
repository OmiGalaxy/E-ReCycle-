from fastapi import APIRouter, Depends, HTTPException, Header
from fastapi.responses import Response
from sqlalchemy.orm import Session
from app.core.database import get_db, MarketplaceItem, Classification, User, ProductCategory, Purchase
from app.core.security import verify_token
# from app.services.receipt_generator import generate_receipt_pdf
from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
import json
from ..static_products import STATIC_PRODUCTS

router = APIRouter()

class MarketplaceItemCreate(BaseModel):
    classification_id: int
    title: str
    brand: str
    model: str
    description: str
    price: float
    original_price: Optional[float] = None
    category_id: int
    images: List[str] = []
    specifications: dict = {}
    warranty_info: Optional[str] = None
    is_selling: bool = True

class MarketplaceItemResponse(BaseModel):
    id: int
    user_id: int
    classification_id: int
    title: str
    brand: str
    model: str
    description: str
    price: float
    original_price: Optional[float]
    category_id: int
    images: List[str]
    specifications: dict
    warranty_info: Optional[str]
    seller_name: str
    seller_rating: float
    is_selling: bool
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class CategoryResponse(BaseModel):
    id: int
    name: str
    icon: str
    
    class Config:
        from_attributes = True

class PurchaseCreate(BaseModel):
    marketplace_item_id: int

class PurchaseFormData(BaseModel):
    marketplace_item_id: int
    shipping_address: str
    phone_number: str
    payment_method: str
    card_number: Optional[str] = None
    card_expiry: Optional[str] = None
    card_cvv: Optional[str] = None

class PurchaseResponse(BaseModel):
    id: int
    user_id: int
    marketplace_item_id: int
    purchase_price: float
    shipping_address: str
    phone_number: str
    payment_method: str
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True

def get_current_user(authorization: str = Header(None), db: Session = Depends(get_db)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authorization header required")
    
    token = authorization.split(" ")[1]
    email = verify_token(token)
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/categories", response_model=List[CategoryResponse])
async def get_categories(db: Session = Depends(get_db)):
    categories = db.query(ProductCategory).all()
    if not categories:
        # Create default categories
        default_categories = [
            {"name": "Mobile Phones", "icon": "Smartphone"},
            {"name": "Laptops", "icon": "Laptop"},
            {"name": "Home Appliances", "icon": "Home"},
            {"name": "Audio & Video", "icon": "Headphones"},
            {"name": "Gaming", "icon": "Gamepad2"},
            {"name": "Accessories", "icon": "Cable"}
        ]
        for cat in default_categories:
            db_cat = ProductCategory(**cat)
            db.add(db_cat)
        db.commit()
        
        # Categories are created, static products are handled separately
        pass
        
        categories = db.query(ProductCategory).all()
    return categories

@router.post("/", response_model=MarketplaceItemResponse)
async def create_marketplace_item(
    item: MarketplaceItemCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    
    classification = db.query(Classification).filter(
        Classification.id == item.classification_id,
        Classification.user_id == current_user.id
    ).first()
    
    if not classification:
        raise HTTPException(status_code=404, detail="Classification not found")
    
    db_item = MarketplaceItem(
        user_id=current_user.id,
        classification_id=item.classification_id,
        title=item.title,
        brand=item.brand,
        model=item.model,
        description=item.description,
        price=item.price,
        original_price=item.original_price,
        category_id=item.category_id,
        images=json.dumps(item.images),
        specifications=json.dumps(item.specifications),
        warranty_info=item.warranty_info,
        seller_name=current_user.full_name or current_user.username,
        is_selling=item.is_selling
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    
    # Convert JSON strings back to objects for response
    db_item.images = json.loads(db_item.images or '[]')
    db_item.specifications = json.loads(db_item.specifications or '{}')
    return db_item

@router.get("/", response_model=List[MarketplaceItemResponse])
async def get_marketplace_items(
    is_selling: Optional[bool] = None,
    category_id: Optional[int] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    db: Session = Depends(get_db)
):
    # Get database items
    query = db.query(MarketplaceItem).filter(MarketplaceItem.status == "available")
    if is_selling is not None:
        query = query.filter(MarketplaceItem.is_selling == is_selling)
    if category_id is not None:
        query = query.filter(MarketplaceItem.category_id == category_id)
    if min_price is not None:
        query = query.filter(MarketplaceItem.price >= min_price)
    if max_price is not None:
        query = query.filter(MarketplaceItem.price <= max_price)
    db_items = query.all()
    
    # Convert JSON strings to objects for DB items
    for item in db_items:
        item.images = json.loads(item.images or '[]')
        item.specifications = json.loads(item.specifications or '{}')
    
    # Filter static products
    static_items = STATIC_PRODUCTS.copy()
    if is_selling is not None and not is_selling:
        static_items = []
    if category_id is not None:
        static_items = [item for item in static_items if item['category_id'] == category_id]
    if min_price is not None:
        static_items = [item for item in static_items if item['price'] >= min_price]
    if max_price is not None:
        static_items = [item for item in static_items if item['price'] <= max_price]
    
    # Convert static items to response format
    static_responses = []
    for item in static_items:
        static_responses.append(MarketplaceItemResponse(
            id=item['id'],
            user_id=1,
            classification_id=1,
            title=item['title'],
            brand=item['brand'],
            model=item['model'],
            description=item['description'],
            price=item['price'],
            original_price=item.get('original_price'),
            category_id=item['category_id'],
            images=item['images'],
            specifications=item['specifications'],
            warranty_info=item['warranty_info'],
            seller_name=item['seller_name'],
            seller_rating=item['seller_rating'],
            is_selling=item['is_selling'],
            status=item['status'],
            created_at=datetime.now()
        ))
    
    return static_responses + db_items

@router.post("/purchase", response_model=PurchaseResponse)
async def purchase_item(
    purchase_data: PurchaseFormData,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if it's a static product (ID >= 1000)
    if purchase_data.marketplace_item_id >= 1000:
        # Find static product
        static_item = next((item for item in STATIC_PRODUCTS if item['id'] == purchase_data.marketplace_item_id), None)
        if not static_item:
            raise HTTPException(status_code=404, detail="Item not found")
        
        # Create purchase record for static item
        db_purchase = Purchase(
            user_id=current_user.id,
            marketplace_item_id=purchase_data.marketplace_item_id,
            purchase_price=static_item['price'],
            shipping_address=purchase_data.shipping_address,
            phone_number=purchase_data.phone_number,
            payment_method=purchase_data.payment_method
        )
        db.add(db_purchase)
        db.commit()
        db.refresh(db_purchase)
        return db_purchase
    
    # Handle database items
    item = db.query(MarketplaceItem).filter(
        MarketplaceItem.id == purchase_data.marketplace_item_id,
        MarketplaceItem.status == "available"
    ).first()
    
    if not item:
        raise HTTPException(status_code=404, detail="Item not found or not available")
    
    if item.user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot purchase your own item")
    
    # Create purchase record
    db_purchase = Purchase(
        user_id=current_user.id,
        marketplace_item_id=item.id,
        purchase_price=item.price,
        shipping_address=purchase_data.shipping_address,
        phone_number=purchase_data.phone_number,
        payment_method=purchase_data.payment_method
    )
    db.add(db_purchase)
    
    # Update item status
    item.status = "sold"
    
    db.commit()
    db.refresh(db_purchase)
    return db_purchase

@router.get("/my-items", response_model=List[MarketplaceItemResponse])
async def get_my_marketplace_items(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    items = db.query(MarketplaceItem).filter(MarketplaceItem.user_id == current_user.id).all()
    
    # Convert JSON strings to objects
    for item in items:
        item.images = json.loads(item.images or '[]')
        item.specifications = json.loads(item.specifications or '{}')
    return items

@router.get("/receipt/{purchase_id}")
async def download_receipt(
    purchase_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Get purchase record
    purchase = db.query(Purchase).filter(
        Purchase.id == purchase_id,
        Purchase.user_id == current_user.id
    ).first()
    
    if not purchase:
        raise HTTPException(status_code=404, detail="Purchase not found")
    
    # Get item data
    if purchase.marketplace_item_id >= 1000:
        # Static product
        item_data = next((item for item in STATIC_PRODUCTS if item['id'] == purchase.marketplace_item_id), None)
        if not item_data:
            raise HTTPException(status_code=404, detail="Item not found")
    else:
        # Database item
        db_item = db.query(MarketplaceItem).filter(MarketplaceItem.id == purchase.marketplace_item_id).first()
        if not db_item:
            raise HTTPException(status_code=404, detail="Item not found")
        item_data = {
            'title': db_item.title,
            'brand': db_item.brand,
            'model': db_item.model,
            'seller_name': db_item.seller_name,
            'warranty_info': db_item.warranty_info
        }
    
    # Generate simple text receipt
    subtotal = purchase.purchase_price
    tax = subtotal * 0.08
    total = subtotal + tax
    
    receipt_text = f"""
===============================================
            E-CYCLE MARKETPLACE
               Purchase Receipt
===============================================

Order ID: ECY{purchase.id:06d}
Date: {purchase.created_at.strftime('%B %d, %Y at %I:%M %p')}
Customer: {current_user.full_name or current_user.username}
Email: {current_user.email}
Phone: {purchase.phone_number}

-----------------------------------------------
                ITEM DETAILS
-----------------------------------------------
Product: {item_data['title']}
Brand: {item_data['brand']}
Model: {item_data['model']}
Seller: {item_data['seller_name']}
Warranty: {item_data['warranty_info']}

-----------------------------------------------
              PAYMENT SUMMARY
-----------------------------------------------
Item Price:        ${subtotal:.2f}
Tax (8%):          ${tax:.2f}
Shipping:          FREE
                   --------
Total Paid:        ${total:.2f}

-----------------------------------------------
             SHIPPING ADDRESS
-----------------------------------------------
{purchase.shipping_address}

===============================================
        Thank you for your purchase!
    For support, contact: support@ecycle.com
===============================================
"""
    
    # Update receipt generated flag
    purchase.receipt_generated = True
    db.commit()
    
    # Return text receipt
    filename = f"ECycle_Receipt_{purchase.id:06d}.txt"
    return Response(
        content=receipt_text.encode('utf-8'),
        media_type="text/plain",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )