@echo off
title Glance
cd /d "%~dp0"

if exist "%~dp0Glance.html" (
  start "" "%~dp0Glance.html"
  exit /b 0
)

if exist "%~dp0public\Glance.html" (
  start "" "%~dp0public\Glance.html"
  exit /b 0
)

echo.
echo  Glance.html is missing from this folder.
echo  Download the ZIP again from GitHub and unzip the whole folder.
echo.
pause
exit /b 1
