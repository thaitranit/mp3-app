@echo off
set PATH=C:\Program Files\nodejs;%PATH%
echo ========================================================
echo          DANG DONG GOI VA DAY CODE LEN GITHUB
echo ========================================================
echo Repository: https://github.com/thaitranit/mp3-app
echo.
git add -A
git commit -m "Deploy Felix MP3 to Render" >nul 2>&1
echo Dang day len GitHub (origin main)...
git push origin main
if %errorlevel% equ 0 (
    echo.
    echo ========================================================
    echo  [THANH CONG] Code da duoc day len GitHub thanh cong!
    echo  Ban co the vao https://dashboard.render.com de Deploy.
    echo ========================================================
) else (
    echo.
    echo ========================================================
    echo  [CHU Y] Neu hien cua so trinh duyet dang nhap GitHub,
    echo  ban hay xac nhan de hoan tat.
    echo ========================================================
)
echo.
pause
