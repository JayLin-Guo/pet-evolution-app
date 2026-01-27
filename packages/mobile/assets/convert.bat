@echo off
REM Spine JSON Batch Converter (Simplified Version)
echo ========================================
echo Spine JSON Batch Converter
echo ========================================
echo.

REM Fixed target directory
set "TARGET_DIR=D:\petZoom\spine-role"

REM Get script directory
cd /d "%~dp0"

echo Target Directory: %TARGET_DIR%
echo.

REM Check if directory exists
if not exist "%TARGET_DIR%" (
    echo [ERROR] Directory does not exist: %TARGET_DIR%
    echo.
    echo Please modify TARGET_DIR variable in this file to the correct path
    echo.
    pause
    exit /b 1
)

REM Check if Python script exists
if not exist "batch_convert_spine_simple.py" (
    echo [ERROR] Cannot find batch_convert_spine_simple.py script
    echo.
    pause
    exit /b 1
)

REM Check if Python is available (prefer py launcher, then python)
set PYTHON_CMD=
py --version >nul 2>&1
if not errorlevel 1 (
    set PYTHON_CMD=py
) else (
    python --version >nul 2>&1
    if not errorlevel 1 (
        set PYTHON_CMD=python
    ) else (
        echo [ERROR] Python is not installed or not in PATH
        echo.
        echo Please choose one of the following:
        echo 1. Install Python 3.x and add it to PATH
        echo 2. Install Python from Windows Store
        echo 3. Or manually specify Python path
        echo.
        pause
        exit /b 1
    )
)

REM Execute conversion
echo.
echo Starting conversion...
echo ========================================
echo.

REM Execute Python script and capture output
echo Executing Python script...
echo.
%PYTHON_CMD% batch_convert_spine_simple.py "%TARGET_DIR%"
set CONVERT_RESULT=%errorlevel%
echo.

echo.
echo ========================================
if %CONVERT_RESULT% equ 0 (
    echo [SUCCESS] Conversion completed!
) else (
    echo [ERROR] Error occurred during conversion, error code: %CONVERT_RESULT%
    echo.
    echo Please check the error messages above. Common issues:
    echo 1. Python script syntax error
    echo 2. Target directory path is incorrect
    echo 3. File permission issues
)
echo ========================================
echo.
echo Script execution completed. Press any key to exit...
pause
