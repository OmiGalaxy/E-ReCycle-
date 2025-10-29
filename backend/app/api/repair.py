from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from app.core.database import get_db, User
from app.core.security import verify_token
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

# Repair request functionality removed - focusing on repair shop directory

@router.get("/shops")
async def get_repair_shops(repair_type: str):
    shops = {
        "phones": [
            {
                "name": "Rajesh Mobile Care", 
                "address": "Shop 15, Connaught Place, New Delhi", 
                "rating": 4.7, 
                "specialties": ["iPhone", "Android", "Screen Repair"],
                "phone": "+91 98765 43210",
                "hours": "Mon-Sat 10AM-8PM",
                "warranty": "90 days",
                "price_range": "₹500-2000",
                "reviews": [
                    {"user": "Amit S.", "rating": 5, "comment": "Fixed my iPhone screen perfectly!"},
                    {"user": "Priya M.", "rating": 4, "comment": "Quick service, reasonable prices."}
                ]
            },
            {
                "name": "Sharma Electronics", 
                "address": "MG Road, Bangalore", 
                "rating": 4.5, 
                "specialties": ["Samsung", "OnePlus", "Battery Replacement"],
                "phone": "+91 87654 32109",
                "hours": "Mon-Fri 9AM-7PM",
                "warranty": "60 days",
                "price_range": "₹400-1800",
                "reviews": [
                    {"user": "Rohit K.", "rating": 5, "comment": "Great expertise with Android devices."},
                    {"user": "Kavya R.", "rating": 4, "comment": "Professional service, fair pricing."}
                ]
            }
        ],
        "computers": [
            {
                "name": "Gupta Computer Services", 
                "address": "Nehru Place, New Delhi", 
                "rating": 4.8, 
                "specialties": ["Laptops", "Desktops", "Data Recovery"],
                "phone": "+91 99887 76543",
                "hours": "Mon-Sat 10AM-8PM",
                "warranty": "120 days",
                "price_range": "₹800-4000",
                "reviews": [
                    {"user": "Vikash L.", "rating": 5, "comment": "Saved my laptop and all my data!"},
                    {"user": "Sneha W.", "rating": 5, "comment": "Excellent technical knowledge."}
                ]
            },
            {
                "name": "Kumar Tech Solutions", 
                "address": "IT Park, Pune", 
                "rating": 4.6, 
                "specialties": ["Gaming PCs", "Business Systems", "Upgrades"],
                "phone": "+91 88776 65432",
                "hours": "Mon-Fri 9AM-6PM",
                "warranty": "90 days",
                "price_range": "₹1000-5000",
                "reviews": [
                    {"user": "Arjun T.", "rating": 5, "comment": "Built an amazing gaming rig for me."},
                    {"user": "Riya P.", "rating": 4, "comment": "Good for business computer needs."}
                ]
            }
        ],
        "appliances": [
            {
                "name": "Patel Home Services", 
                "address": "Sector 18, Noida", 
                "rating": 4.3, 
                "specialties": ["Kitchen", "Laundry", "AC Repair"],
                "phone": "+91 77665 54321",
                "hours": "Mon-Sat 8AM-6PM",
                "warranty": "180 days",
                "price_range": "₹1200-6000",
                "reviews": [
                    {"user": "Suresh B.", "rating": 4, "comment": "Fixed my washing machine quickly."},
                    {"user": "Nisha H.", "rating": 5, "comment": "Reliable service for all appliances."}
                ]
            },
            {
                "name": "Singh Repair Services", 
                "address": "Lajpat Nagar, Delhi", 
                "rating": 4.1, 
                "specialties": ["Electronics", "Small Appliances", "Diagnostics"],
                "phone": "+91 66554 43210",
                "hours": "Tue-Sat 9AM-7PM",
                "warranty": "60 days",
                "price_range": "₹600-3000",
                "reviews": [
                    {"user": "Sanjay C.", "rating": 4, "comment": "Good diagnostic skills."},
                    {"user": "Meera G.", "rating": 4, "comment": "Honest pricing and service."}
                ]
            }
        ]
    }
    return shops.get(repair_type, [])

@router.get("/faq")
async def get_repair_faq():
    faq = [
        {
            "question": "How long does a typical repair take?",
            "answer": "Most repairs are completed within 1-3 business days. Complex issues may take longer."
        },
        {
            "question": "Do you offer warranties on repairs?",
            "answer": "Yes, all our partner shops offer warranties ranging from 60-180 days depending on the repair type."
        },
        {
            "question": "What should I do before bringing my device for repair?",
            "answer": "Back up your data if possible, remove any cases or accessories, and note down the specific issues you're experiencing."
        },
        {
            "question": "How much do repairs typically cost?",
            "answer": "Costs vary by device and issue. Phone repairs: $40-200, Computer repairs: $80-500, Appliances: $60-600."
        },
        {
            "question": "Can you repair water-damaged devices?",
            "answer": "Many water-damaged devices can be repaired, but success depends on the extent of damage and how quickly you bring it in."
        },
        {
            "question": "Do I need an appointment?",
            "answer": "While walk-ins are welcome, we recommend calling ahead to ensure availability and reduce wait times."
        }
    ]
    return faq