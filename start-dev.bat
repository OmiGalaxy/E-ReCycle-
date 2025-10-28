@echo off
echo Starting E-ReCycle Development Environment...
echo.

echo [1/2] Starting Backend Server...
start "Backend" cmd /k "cd backend && python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000"

echo Waiting for backend to start...
timeout /t 5 /nobreak > nul

echo [2/2] Starting Frontend Server...
start "Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ✅ Both servers are starting!
echo.
echo 📱 Frontend: http://localhost:3000
echo 🔧 Backend API: http://localhost:8000
echo 📚 API Docs: http://localhost:8000/docs
echo.
echo Press any key to exit...
pause > nul