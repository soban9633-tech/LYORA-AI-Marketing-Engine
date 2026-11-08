@echo off
title LYORA AI - Push to GitHub
color 0B
echo ======================================================================
echo           LYORA AI - GITHUB ONE-CLICK LOGIN & PUSH
echo ======================================================================
echo.

set PATH=C:\Users\Fine\AppData\Local\Programs\Git\cmd;%PATH%
cd /d "F:\LYORA AI"

echo [1/3] Checking GitHub Login Status...
gh auth status >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ----------------------------------------------------------------------
    echo  [ACTION REQUIRED] GitHub Login Karna Hoga
    echo.
    echo  1. Abhi browser me ek window khulegi: github.com/login/device
    echo  2. Code automatically aapke Clipboard par Copy ho chuka hoga!
    echo  3. Browser me bas "Ctrl + V" (Paste) karein aur "Continue" dabayein!
    echo ----------------------------------------------------------------------
    echo.
    gh auth login --hostname github.com -p https --web --clipboard
)

echo.
echo [2/3] Configuring Git Credentials...
gh auth setup-git

echo.
echo [3/3] Pushing Code to https://github.com/soban9633-tech/LYORA-AI-Marketing-Engine.git...
git branch -M main
git push -u origin main --force

if %errorlevel% equ 0 (
    echo.
    echo ======================================================================
    echo   [SUCCESS] MUBARAK HO! Aapka project GitHub par live ho chuka hai!
    echo   Check karein:
    echo   https://github.com/soban9633-tech/LYORA-AI-Marketing-Engine
    echo ======================================================================
) else (
    echo.
    echo [ERROR] Push me masla aaya.
)

echo.
echo Is window ko band karne ke liye koi bhi key dabayein...
pause >nul
