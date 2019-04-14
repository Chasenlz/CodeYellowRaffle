if not "%minimized%"=="" goto :minimized
set minimized=false
@echo off
%cd%

start /min cmd /C "npm start"
goto :EOF
:minimized
