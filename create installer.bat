if not "%minimized%"=="" goto :minimized
set minimized=true
@echo off
%cd%

start /min cmd /C "node createInstaller.js"
goto :EOF
:minimized
