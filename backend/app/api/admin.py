from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from app.core.database import get_db, User
from app.core.security import verify_token, get_password_hash
from app.schemas.user import UserCreate, UserResponse
from typing import List

router = APIRouter()

def get_admin_user(authorization: str = Header(None), db: Session = Depends(get_db)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authorization header required")
    
    token = authorization.split(" ")[1]
    email = verify_token(token)
    user = db.query(User).filter(User.email == email).first()
    if not user or not user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

@router.get("/users", response_model=List[UserResponse])
async def get_all_users(admin_user: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    users = db.query(User).all()
    return users

@router.post("/create-admin", response_model=UserResponse)
async def create_admin_user(
    user: UserCreate,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        username=user.username,
        hashed_password=hashed_password,
        full_name=user.full_name,
        phone=user.phone,
        address=user.address,
        is_admin=True
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.post("/init-admin")
async def initialize_admin(db: Session = Depends(get_db)):
    # Check if any admin exists
    admin_exists = db.query(User).filter(User.is_admin == True).first()
    if admin_exists:
        raise HTTPException(status_code=400, detail="Admin already exists")
    
    # Create initial admin
    hashed_password = get_password_hash("admin123")
    admin_user = User(
        email="admin@ecycle.com",
        username="admin",
        hashed_password=hashed_password,
        full_name="System Administrator",
        is_admin=True
    )
    db.add(admin_user)
    db.commit()
    db.refresh(admin_user)
    
    return {"message": "Initial admin created", "email": "admin@ecycle.com", "password": "admin123"}