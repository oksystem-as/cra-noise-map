@ECHO OFF
call npm install --production
cd dist
call http-server . -p 8079