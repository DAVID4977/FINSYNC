@echo off
echo Starting FinSync Application Servers...
echo.

REM Kill any existing processes on ports 5000 and 8000
echo Checking for existing processes on ports 5000 and 8000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do (
    echo Killing process %%a on port 5000...
    taskkill /F /PID %%a >nul 2>&1
)

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000') do (
    echo Killing process %%a on port 8000...
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo Starting Node.js Express Server (Port 5000)...
start "Node.js Server" cmd /k "cd /d %~dp0 && npm run dev"

echo.
echo Waiting 3 seconds for Node.js server to start...
timeout /t 3 /nobreak >nul

echo.
echo Starting Python FastAPI Server (Port 8000)...
start "Python Server" cmd /k "cd /d %~dp0python_backend && python main.py"

echo.
echo Both servers are starting...
echo.
echo Node.js Express Server: http://localhost:5000
echo Python FastAPI Server: http://localhost:8000
echo.
echo Press any key to close this window...
pause >nul