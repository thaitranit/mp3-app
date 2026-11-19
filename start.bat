@echo off
set PATH=C:\Program Files\nodejs;%PATH%
set HOST=0.0.0.0
set PORT=3000

echo Giai phong cong 3000 neu co tien trinh cu dang chay...
for /f "tokens=5" %%p in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do taskkill /F /PID %%p >nul 2>&1

echo Dang khoi dong Felix MP3 tai http://192.168.1.9:3000 (va http://localhost:3000) ...
call npm start
pause
