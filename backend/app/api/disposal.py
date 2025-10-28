from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from app.core.database import get_db, Disposal, Classification, User
from app.core.security import verify_token
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

class DisposalCreate(BaseModel):
    classification_id: int
    disposal_method: str
    pickup_date: Optional[str] = None
    pickup_location: Optional[str] = None
    vendor_filter: str
    selected_vendor: Optional[str] = None

class DisposalResponse(BaseModel):
    id: int
    user_id: int
    classification_id: int
    disposal_method: str
    pickup_date: Optional[str] = None
    pickup_location: Optional[str] = None
    vendor_filter: str
    selected_vendor: Optional[str] = None
    status: str
    
    class Config:
        from_attributes = True

def get_current_user(authorization: str = Header(None, alias="Authorization"), db: Session = Depends(get_db)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authorization header required")
    
    token = authorization.split(" ")[1]
    email = verify_token(token)
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.post("/")
async def schedule_disposal(
    disposal: DisposalCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        classification = db.query(Classification).filter(
            Classification.id == disposal.classification_id,
            Classification.user_id == current_user.id
        ).first()
        
        if not classification:
            raise HTTPException(status_code=404, detail="Classification not found")
        
        db_disposal = Disposal(
            user_id=current_user.id,
            classification_id=disposal.classification_id,
            disposal_method=disposal.disposal_method,
            pickup_date=disposal.pickup_date,
            pickup_location=disposal.pickup_location,
            vendor_filter=disposal.vendor_filter,
            selected_vendor=disposal.selected_vendor
        )
        db.add(db_disposal)
        db.commit()
        db.refresh(db_disposal)
        
        return {
            "id": db_disposal.id,
            "user_id": db_disposal.user_id,
            "classification_id": db_disposal.classification_id,
            "disposal_method": db_disposal.disposal_method,
            "pickup_date": db_disposal.pickup_date,
            "pickup_location": db_disposal.pickup_location,
            "vendor_filter": db_disposal.vendor_filter,
            "selected_vendor": db_disposal.selected_vendor,
            "status": db_disposal.status,
            "created_at": db_disposal.created_at.isoformat() if db_disposal.created_at else None
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/")
async def get_disposals(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        disposals = db.query(Disposal).filter(Disposal.user_id == current_user.id).all()
        result = []
        for disposal in disposals:
            result.append({
                "id": disposal.id,
                "user_id": disposal.user_id,
                "classification_id": disposal.classification_id,
                "disposal_method": disposal.disposal_method,
                "pickup_date": disposal.pickup_date,
                "pickup_location": disposal.pickup_location,
                "vendor_filter": disposal.vendor_filter,
                "selected_vendor": disposal.selected_vendor,
                "status": disposal.status,
                "created_at": disposal.created_at.isoformat() if disposal.created_at else None
            })
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/vendors")
async def get_vendors(vendor_type: str):
    vendors = {
        "batteries": [
            {"name": "EcoBattery Recycling", "location": "Downtown", "rating": 4.5, "pickup": True},
            {"name": "Green Power Solutions", "location": "Uptown", "rating": 4.2, "pickup": False}
        ],
        "computers": [
            {"name": "TechRecycle Pro", "location": "Tech District", "rating": 4.8, "pickup": True},
            {"name": "Digital Waste Management", "location": "Business Park", "rating": 4.3, "pickup": True}
        ],
        "appliances": [
            {"name": "Home Appliance Recyclers", "location": "Industrial Zone", "rating": 4.1, "pickup": True},
            {"name": "White Goods Disposal", "location": "Suburb Area", "rating": 4.0, "pickup": False}
        ],
        "phones": [
            {"name": "Mobile Recycle Hub", "location": "City Center", "rating": 4.6, "pickup": True},
            {"name": "Phone Disposal Service", "location": "Mall District", "rating": 4.4, "pickup": False}
        ]
    }
    return vendors.get(vendor_type, [])