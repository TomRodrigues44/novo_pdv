@echo off
echo ========================================
echo  Empório das Coxinhas - PDV - Stop
echo ========================================

echo Parando Vite e Nitro...

:: Mata processos que contenham "vite" ou "nitro" no nome
taskkill /f /fi "WINDOWTITLE eq vite" >nul 2>&1
taskkill /f /fi "WINDOWTITLE eq nitro" >nul 2>&1

:: Mata processos node que estejam rodando vite ou nitro
for /f "tokens=2 delims= " %%a in ('tasklist /fi "imagename eq node.exe" /fo table /nh ^| findstr /i "vite\|nitro"') do (
    taskkill /f /pid %%a >nul 2>&1
)

echo Processos finalizados.
pause