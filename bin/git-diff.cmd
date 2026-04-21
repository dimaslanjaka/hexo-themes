@echo off
setlocal

set "REL_PATH=node_modules\binary-collections\lib\git-diff-cli.cjs"
set "SEARCH_DIR=%CD%"

:search
if exist "%SEARCH_DIR%\%REL_PATH%" (
    set "BIN_PATH=%SEARCH_DIR%\%REL_PATH%"
    goto found
)

:: stop if we reached root
if "%SEARCH_DIR%"=="%SEARCH_DIR:~0,3%" goto notfound

:: move to parent directory
for %%I in ("%SEARCH_DIR%\..") do set "SEARCH_DIR=%%~fI"
goto search

:found
node "%BIN_PATH%" %*
goto end

:notfound
echo binary-collections not found. Installing...
npx -y binary-collections@https://github.com/dimaslanjaka/bin/raw/refs/heads/master/releases/bin.tgz git-diff %*

:end
endlocal
