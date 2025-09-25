@echo off
echo Stopping FinSync Application Servers...
echo.

REM Kill processes on ports 5000 and 8000
echo Stopping Node.js server (Port 5000)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do (
    echo Killing process %%a on port 5000...
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo Stopping Python server (Port 8000)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000') do (
    echo Killing process %%a on port 8000...
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo All servers stopped.
echo.
pause