#/bin/bash

printf "Building frontend... \n"

echo "pwd $PWD \n"
(cd ./frontend; npm install)
(cd ./frontend; npm run build)
