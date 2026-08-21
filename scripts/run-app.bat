title Empório das Coxinhas - PDV
color 0A
cd /d "C:\Users\emporio\dyad-apps\novo-pdv"

echo Carregando .env ...
echo Carregando .env.local ...

echo.
echo ==== INICIANDO BUILD ====
pnpm run build

echo.
echo ==== INICIANDO DEV ====
npm run dev