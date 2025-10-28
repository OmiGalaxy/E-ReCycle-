# 🌱 E-ReCycle - Electronic Waste Management System

A comprehensive web application for managing electronic waste through classification, disposal, donation, and marketplace features.

## 🚀 Features

- **🔐 User Authentication** - Secure JWT-based login/registration
- **📱 Item Classification** - AI-powered e-waste categorization
- **🗑️ Disposal Management** - Schedule pickup/drop-off with vendors
- **❤️ Donation Platform** - Connect with organizations needing electronics
- **🛒 Marketplace** - Buy/sell refurbished electronics with ₹ pricing
- **🔧 Repair Services** - Directory of certified repair shops with reviews
- **📊 Dashboard** - Track all activities and approvals
- **👨‍💼 Admin Panel** - User management and system oversight

## 🛠️ Tech Stack

**Frontend:**
- Next.js 14 with TypeScript
- Tailwind CSS for styling
- Framer Motion for animations
- React Hot Toast for notifications

**Backend:**
- FastAPI (Python)
- SQLAlchemy ORM
- SQLite Database
- JWT Authentication
- Pydantic for data validation

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js 18+
- Python 3.8+
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/e-recycle.git
cd e-recycle
```

2. **Backend Setup**
```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

3. **Frontend Setup**
```bash
cd frontend
npm install
npm run dev
```

### 🐳 Docker Deployment

```bash
docker-compose up --build
```

## 📱 Access URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 🌟 Key Features Showcase

### 💰 Indian Market Ready
- Pricing in Indian Rupees (₹)
- GST calculation (18%)
- Indian payment methods (UPI, Net Banking, COD)
- Local phone number formats

### 🔄 Complete E-Waste Lifecycle
1. **Classify** → Upload and categorize electronics
2. **Decide** → Choose disposal, donation, sale, or repair
3. **Execute** → Connect with vendors, buyers, or organizations
4. **Track** → Monitor status and approvals

### 📊 Smart Dashboard
- Real-time statistics
- Item approval status
- Activity timeline
- Quick action buttons

## 🚀 Deployment Options

### Vercel (Frontend)
1. Connect GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `.next`

### Railway/Render (Backend)
1. Connect GitHub repository
2. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
3. Add environment variables

### Heroku (Full Stack)
1. Create Heroku app
2. Add buildpacks for Python and Node.js
3. Deploy via Git

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Icons by Lucide React
- Images from Unsplash
- UI inspiration from modern design systems

---

**Made with ❤️ for a sustainable future**