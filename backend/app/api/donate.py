from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from app.core.database import get_db, Donation, Classification, User
from app.core.security import verify_token
from pydantic import BaseModel
from typing import List

router = APIRouter()

class DonationCreate(BaseModel):
    classification_id: int
    location: str

class DonationResponse(BaseModel):
    id: int
    user_id: int
    classification_id: int
    location: str
    status: str
    created_at: str
    
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
async def register_donation(
    donation: DonationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        classification = db.query(Classification).filter(
            Classification.id == donation.classification_id,
            Classification.user_id == current_user.id
        ).first()
        
        if not classification:
            raise HTTPException(status_code=404, detail="Classification not found")
        
        # Check if item condition is suitable for donation
        if classification.condition != 'working':
            raise HTTPException(status_code=400, detail="Only working items can be donated")
        
        db_donation = Donation(
            user_id=current_user.id,
            classification_id=donation.classification_id,
            location=donation.location
        )
        db.add(db_donation)
        db.commit()
        db.refresh(db_donation)
        
        return {
            "id": db_donation.id,
            "user_id": db_donation.user_id,
            "classification_id": db_donation.classification_id,
            "location": db_donation.location,
            "status": db_donation.status,
            "created_at": db_donation.created_at.isoformat() if db_donation.created_at else None
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to register donation")

@router.get("/")
async def get_donations(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        donations = db.query(Donation).filter(Donation.user_id == current_user.id).all()
        result = []
        for donation in donations:
            result.append({
                "id": donation.id,
                "user_id": donation.user_id,
                "classification_id": donation.classification_id,
                "location": donation.location,
                "status": donation.status,
                "created_at": donation.created_at.isoformat() if donation.created_at else None
            })
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch donations")

@router.get("/organizations")
async def get_donation_organizations():
    organizations = [
        {
            "name": "Tech for Schools",
            "type": "Educational",
            "description": "Providing technology to underfunded schools",
            "location": "City Wide",
            "contact": "contact@techforschools.org",
            "image": "/images/school.jpg"
        },
        {
            "name": "Digital Divide Foundation",
            "type": "Non-Profit",
            "description": "Bridging the digital gap in communities",
            "location": "Metro Area",
            "contact": "info@digitaldivide.org",
            "image": "/images/foundation.jpg"
        },
        {
            "name": "Senior Tech Support",
            "type": "Community",
            "description": "Helping seniors access technology",
            "location": "Local Community",
            "contact": "help@seniortech.org",
            "image": "/images/seniors.jpg"
        }
    ]
    return organizations