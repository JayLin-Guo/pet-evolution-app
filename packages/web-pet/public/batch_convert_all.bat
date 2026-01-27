@echo off
chcp 65001 >nul
echo ========================================
echo Spine 批量转换工具
echo ========================================
echo.

REM 设置目标目录
set TARGET_DIR=D:\petZoom\spine-role

echo 目标目录: %TARGET_DIR%
echo.

REM 检查目录是否存在
if not exist "%TARGET_DIR%" (
    echo 错误: 目录不存在: %TARGET_DIR%
    pause
    exit /b 1
)

echo 开始批量转换...
echo 这可能需要一些时间，请耐心等待...
echo.

REM 运行批量转换脚本
py -3 batch_convert_spine_directory.py "%TARGET_DIR%"

echo.
echo ========================================
if %ERRORLEVEL% EQU 0 (
    echo 批量转换完成！
) else (
    echo 转换过程中出现错误
)
echo ========================================
echo.

pause
