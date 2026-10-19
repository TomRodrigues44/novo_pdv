@echo off
echo ========================================
echo  Emporio das Coxinhas - PDV - Dev
echo ========================================
echo.

REM Usa os certificados confiaveis do Windows no Node.js
set NODE_OPTIONS=--use-system-ca

echo NODE_OPTIONS=%NODE_OPTIONS%
echo.

pnpm run dev

pause