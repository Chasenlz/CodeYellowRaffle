if not "%minimized%"=="" goto :minimized
set minimized=true
@echo off
%cd%

start /min cmd /C "npm run package-win"
goto :EOF
:minimized
