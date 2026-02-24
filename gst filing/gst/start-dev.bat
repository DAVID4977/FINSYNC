@echo off
echo ===================================
echo        FinSync Development Server
echo ===================================
echo.
echo Checking for existing processes on port 5000...

:: Kill any existing Node.js processes on port 5000
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000 2^>nul') do (
    echo Terminating existing process %%a on port 5000
    taskkill /F /PID %%a >nul 2>&1
)

echo Port 5000 is now available
echo.
echo Starting FinSync development server...
echo Server will be available at: http://localhost:5000
echo.
npm run dev