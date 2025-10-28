# E-Cycle Setup Guide

## Prerequisites
- Python 3.8+ installed
- Node.js 18+ installed
- npm package manager

## Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
```

3. Activate virtual environment:
```bash
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate
```

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Start the backend server:
```bash
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

## 🚀 Quick Start

### Option 1: Use Start Scripts (Recommended)

**Windows:**
```bash
# Double-click start-dev.bat or run:
start-dev.bat
```

**Linux/Mac:**
```bash
# Make executable and run:
chmod +x start-dev.sh
./start-dev.sh
```

### Option 2: Manual Start

**Terminal 1 - Backend:**
```bash
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## Access URLs
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## Features
- User authentication with JWT tokens
- E-waste classification system
- Disposal management
- Donation platform
- Marketplace for buying/selling
- Repair services directory
- Admin panel

## Database
- SQLite database (ecycle.db) created automatically
- All tables created on first run
- No manual database setup required