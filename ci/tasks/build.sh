#!/bin/bash

set -e -x

ls -l
npm install
./node_modules/.bin/ng build
ls -l
cp -R ./dist/. ../binaries/
cp ./start.bat ../binaries/
cp ./Dockerfile ../binaries/
ls -l ../binaries/