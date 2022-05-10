#/bin/bash

printf "Building backend"

(cd ./server; cargo build)
