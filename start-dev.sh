#!/bin/bash

echo "Starting E-ReCycle Development Environment..."
echo

echo "[1/2] Starting Backend Server..."
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

echo "Waiting for backend to start..."
sleep 5

echo "[2/2] Starting Frontend Server..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo
echo "✅ Both servers are running!"
echo
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo
echo "Press Ctrl+C to stop both servers"

# Wait for user to stop
wait $BACKEND_PID $FRONTEND_PID