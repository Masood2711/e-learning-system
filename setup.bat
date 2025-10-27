@echo off
echo 🚀 Setting up E-Learning System...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

echo ✅ Node.js detected

REM Install dependencies
echo 📦 Installing dependencies...
npm install

REM Generate Prisma client
echo 🔧 Generating Prisma client...
npx prisma generate

REM Create .env.local if it doesn't exist
if not exist ".env.local" (
    echo 📝 Creating .env.local file...
    (
        echo # Database
        echo DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/e-learning-system?retryWrites=true&w=majority"
        echo.
        echo # NextAuth
        echo NEXTAUTH_URL="http://localhost:3000"
        echo NEXTAUTH_SECRET="your-secret-key-here"
        echo.
        echo # App
        echo NODE_ENV="development"
    ) > .env.local
    echo ⚠️  Please update .env.local with your MongoDB connection string and NextAuth secret
)

echo ✅ Setup complete!
echo.
echo Next steps:
echo 1. Update .env.local with your MongoDB connection string
echo 2. Run 'npm run dev' to start the development server
echo 3. Visit http://localhost:3000 to access the application
echo.
echo For more information, see README.md
pause
