@echo off

set "script_dir=%~dp0"
npx -y -p @babel/core -p @babel/node babel-node -- "%script_dir%switch-theme.mjs" %*