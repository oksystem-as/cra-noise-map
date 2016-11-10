cd ..
rmdir /Q /S dist
call npm install --production 
call ng build -prod 