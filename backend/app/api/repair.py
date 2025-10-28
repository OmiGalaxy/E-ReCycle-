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
                "name": "QuickFix Mobile", 
                "address": "123 Tech St, Downtown", 
                "rating": 4.7, 
                "specialties": ["iPhone", "Android", "Screen Repair"],
                "phone": "+1 (555) 123-4567",
                "hours": "Mon-Sat 9AM-7PM",
                "warranty": "90 days",
                "price_range": "$50-200",
                "reviews": [
                    {"user": "John D.", "rating": 5, "comment": "Fixed my iPhone screen perfectly!"},
                    {"user": "Sarah M.", "rating": 4, "comment": "Quick service, reasonable prices."}
                ]
            },
            {
                "name": "Phone Repair Pro", 
                "address": "456 Mobile Ave, Uptown", 
                "rating": 4.5, 
                "specialties": ["Samsung", "Google", "Battery Replacement"],
                "phone": "+1 (555) 987-6543",
                "hours": "Mon-Fri 10AM-6PM",
                "warranty": "60 days",
                "price_range": "$40-180",
                "reviews": [
                    {"user": "Mike R.", "rating": 5, "comment": "Great expertise with Android devices."},
                    {"user": "Lisa K.", "rating": 4, "comment": "Professional service, fair pricing."}
                ]
            }
        ],
        "computers": [
            {
                "name": "PC Doctor", 
                "address": "789 Computer Blvd, Tech District", 
                "rating": 4.8, 
                "specialties": ["Laptops", "Desktops", "Data Recovery"],
                "phone": "+1 (555) 456-7890",
                "hours": "Mon-Sat 8AM-8PM",
                "warranty": "120 days",
                "price_range": "$80-400",
                "reviews": [
                    {"user": "David L.", "rating": 5, "comment": "Saved my laptop and all my data!"},
                    {"user": "Emma W.", "rating": 5, "comment": "Excellent technical knowledge."}
                ]
            },
            {
                "name": "Tech Solutions", 
                "address": "321 IT Way, Business Park", 
                "rating": 4.6, 
                "specialties": ["Gaming PCs", "Business Systems", "Upgrades"],
                "phone": "+1 (555) 321-0987",
                "hours": "Mon-Fri 9AM-6PM",
                "warranty": "90 days",
                "price_range": "$100-500",
                "reviews": [
                    {"user": "Alex T.", "rating": 5, "comment": "Built an amazing gaming rig for me."},
                    {"user": "Rachel P.", "rating": 4, "comment": "Good for business computer needs."}
                ]
            }
        ],
        "appliances": [
            {
                "name": "Home Appliance Repair", 
                "address": "654 Service Rd, Residential Area", 
                "rating": 4.3, 
                "specialties": ["Kitchen", "Laundry", "HVAC"],
                "phone": "+1 (555) 654-3210",
                "hours": "Mon-Sat 7AM-5PM",
                "warranty": "180 days",
                "price_range": "$120-600",
                "reviews": [
                    {"user": "Tom B.", "rating": 4, "comment": "Fixed my washing machine quickly."},
                    {"user": "Nancy H.", "rating": 5, "comment": "Reliable service for all appliances."}
                ]
            },
            {
                "name": "Fix-It-All Services", 
                "address": "987 Repair Lane, Industrial Zone", 
                "rating": 4.1, 
                "specialties": ["Electronics", "Small Appliances", "Diagnostics"],
                "phone": "+1 (555) 789-0123",
                "hours": "Tue-Sat 8AM-6PM",
                "warranty": "60 days",
                "price_range": "$60-300",
                "reviews": [
                    {"user": "Steve C.", "rating": 4, "comment": "Good diagnostic skills."},
                    {"user": "Maria G.", "rating": 4, "comment": "Honest pricing and service."}
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