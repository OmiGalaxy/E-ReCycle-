from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api import auth, classify, disposal, donate, marketplace, repair, admin
from app.core.database import create_tables, engine
from sqlalchemy import text
import os

app = FastAPI(title="E-Cycle API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads directory if it doesn't exist
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(classify.router, prefix="/classify", tags=["classify"])
app.include_router(disposal.router, prefix="/disposal", tags=["disposal"])
app.include_router(donate.router, prefix="/donate", tags=["donate"])
app.include_router(marketplace.router, prefix="/marketplace", tags=["marketplace"])
app.include_router(repair.router, prefix="/repair", tags=["repair"])
app.include_router(admin.router, prefix="/admin", tags=["admin"])

@app.on_event("startup")
async def startup_event():
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("\n" + "="*50)
        print("[SUCCESS] Database connected successfully!")
        print("[SUCCESS] Database: ecycle.db")
        print("="*50 + "\n")
        create_tables()
        print("[SUCCESS] Database tables created/verified\n")
    except Exception as e:
        print("\n" + "="*50)
        print("[ERROR] Database connection failed!")
        print(f"[ERROR] Error: {str(e)}")
        print("="*50 + "\n")
        raise

@app.get("/")
async def root():
    return {"message": "E-Cycle API is running", "database": "connected"}