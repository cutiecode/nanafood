@echo off
echo === NanaFood Setup ===

node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js non trouve - installe-le sur https://nodejs.org
    pause
    exit /b 1
)

git -v >nul 2>&1
if %errorlevel% neq 0 (
    echo Git non trouve - installe-le sur https://git-scm.com
    pause
    exit /b 1
)

echo Installation des dependances...
npm install

if not exist .env.local (
    echo.
    echo ATTENTION: .env.local manquant !
    echo Cree ce fichier avec:
    echo   DATABASE_URL=file:./prisma/dev.db
    echo   STRIPE_SECRET_KEY=sk_test_...
    echo   STRIPE_WEBHOOK_SECRET=whsec_...
    echo   ADMIN_PASSWORD=...
    echo   RESEND_API_KEY=re_...
    echo   CONTACT_EMAIL=...
    pause
    exit /b 1
)

echo Setup base de donnees...
npx prisma migrate deploy
npx prisma generate

echo.
echo === Setup termine ===
echo Lance: npm run dev
echo Dans un autre terminal: stripe listen --forward-to localhost:3000/api/webhook
pause