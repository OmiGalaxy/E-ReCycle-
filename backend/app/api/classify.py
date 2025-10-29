from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Header
from sqlalchemy.orm import Session
from app.core.database import get_db, Classification, User
from app.core.security import verify_token
from typing import List, Optional
import shutil
import os

router = APIRouter()

def get_current_user(authorization: str = Header(None, alias="Authorization"), db: Session = Depends(get_db)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Please login to classify items")
    
    token = authorization.split(" ")[1]
    email = verify_token(token)
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.post("/")
async def classify_item(
    classification: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        db_classification = Classification(
            user_id=current_user.id,
            item_name=classification["item_name"],
            description=classification["description"],
            condition=classification["condition"],
            category=classification["category"]
        )
        db.add(db_classification)
        db.commit()
        db.refresh(db_classification)
        
        return {
            "id": db_classification.id,
            "user_id": db_classification.user_id,
            "item_name": db_classification.item_name,
            "description": db_classification.description,
            "condition": db_classification.condition,
            "image_path": db_classification.image_path,
            "category": db_classification.category,
            "created_at": db_classification.created_at.isoformat() if db_classification.created_at else None
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/upload-image/{classification_id}")
async def upload_image(
    classification_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        classification = db.query(Classification).filter(
            Classification.id == classification_id,
            Classification.user_id == current_user.id
        ).first()
        
        if not classification:
            raise HTTPException(status_code=404, detail="Classification not found")
        
        upload_dir = "uploads"
        os.makedirs(upload_dir, exist_ok=True)
        file_path = f"{upload_dir}/{classification_id}_{file.filename}"
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        classification.image_path = file_path
        db.commit()
        
        return {"message": "Image uploaded successfully", "path": file_path}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/")
async def get_classifications(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        classifications = db.query(Classification).filter(Classification.user_id == current_user.id).all()
        result = []
        for c in classifications:
            result.append({
                "id": c.id,
                "user_id": c.user_id,
                "item_name": c.item_name,
                "description": c.description,
                "condition": c.condition,
                "image_path": c.image_path,
                "category": c.category,
                "created_at": c.created_at.isoformat() if c.created_at else None
            })
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))