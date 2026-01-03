from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from dotenv import load_dotenv
load_dotenv()
import models
from database import engine
from api import receipts, income, settings
from api import webhooks
from api import users
from api import items

# Create tables
models.Base.metadata.create_all(bind=engine)

# Create uploads directory if it doesn't exist
UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

app = FastAPI()

# Mount static files for uploads
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://spend-log-hazel.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(receipts.router)
app.include_router(income.router)
app.include_router(settings.router)
app.include_router(webhooks.router)
app.include_router(users.router)
app.include_router(items.router)

@app.get("/")
def root():
    """Root endpoint - API status and information"""
    return {
        "message": "SpendLog API is running",
        "version": "1.0.0",
        "docs": "/docs",
        "endpoints": {
            "receipts": "/receipts",
            "income": "/income",
            "dashboard": "/receipts/dashboard/stats"
        }
    }
