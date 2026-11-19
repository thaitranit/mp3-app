@echo off
set PATH=C:\Program Files\nodejs;%PATH%
echo ========================================================
echo       KHOI DONG HE THONG FELIX MP3 CHO IPHONE
echo ========================================================
echo 1. Dang mo Web Server (Port 3000)...
start "Felix MP3 - Web Server" cmd /k "call start.bat"

timeout /t 3 /nobreak >nul

echo 2. Dang mo Expo Metro Server cho iPhone...
start "Felix MP3 - Expo Mobile" cmd /k "call start-mobile.bat"

echo.
echo Da khoi dong ca 2 server trong 2 cua so rieng biet!
echo - Web: http://localhost:3000 (hoac http://192.168.1.9:3000 tren iPhone)
echo - Expo: Quet ma QR tren man hinh cua so Expo bang ung dung Expo Go tren iPhone
echo.
pause
