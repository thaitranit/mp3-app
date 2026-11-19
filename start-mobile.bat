@echo off
set PATH=C:\Program Files\nodejs;%PATH%
echo Giai phong cong 8081 neu co tien trinh cu...
for /f "tokens=5" %%p in ('netstat -aon ^| findstr :8081 ^| findstr LISTENING') do taskkill /F /PID %%p >nul 2>&1

cd mobile
echo Dang khoi dong Felix MP3 tren Expo SDK 58 cho iPhone 15 Pro Max...
npx expo start -c
pause
