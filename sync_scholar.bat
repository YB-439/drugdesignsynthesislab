@echo off
echo ========================================================
echo   Updating Google Scholar Metrics and Publications...
echo ========================================================
cd /d "%~dp0"
py -3 scripts\update_scholar_metrics.py
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to fetch data from Google Scholar.
    pause
    exit /b %ERRORLEVEL%
)
echo.
echo Changes fetched successfully.
git add data/scholar-metrics.json data/publications.json js/publications-data.js publications.html
git diff --staged --quiet
if %ERRORLEVEL% EQU 0 (
    echo [INFO] No new changes detected. Everything is up to date.
) else (
    git commit -m "Update Google Scholar publications and metrics"
    git push origin main
    echo [SUCCESS] Updates pushed to GitHub main successfully!
)
echo ========================================================
echo Done.
pause
