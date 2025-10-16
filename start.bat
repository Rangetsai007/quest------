@echo off
chcp 65001 >nul
cls

echo =========================================
echo   ⚔️  技能五子棋游戏启动脚本  ⚔️
echo =========================================
echo.

REM 检查Node.js是否安装
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 错误: 未检测到Node.js
    echo 请先安装Node.js (https://nodejs.org/)
    echo 推荐版本: Node.js 14.0.0 或更高
    pause
    exit /b 1
)

REM 检查npm是否安装
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 错误: 未检测到npm
    echo npm通常随Node.js一起安装
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i

echo ✅ Node.js版本: %NODE_VERSION%
echo ✅ npm版本: %NPM_VERSION%
echo.

REM 检查依赖是否已安装
if not exist "node_modules\" (
    echo 📦 首次运行,正在安装依赖...
    echo 这可能需要几分钟时间,请耐心等待...
    echo.
    call npm install
    
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ 依赖安装失败!
        echo 请检查网络连接或手动运行: npm install
        pause
        exit /b 1
    )
    
    echo.
    echo ✅ 依赖安装成功!
    echo.
) else (
    echo ✅ 依赖已安装
    echo.
)

REM 启动开发服务器
echo 🚀 正在启动游戏...
echo 游戏将在浏览器中自动打开: http://localhost:3000
echo.
echo 提示:
echo   - 按 Ctrl+C 停止游戏服务器
echo   - 游戏支持热重载,修改代码会自动刷新
echo.
echo =========================================
echo.

call npm start
