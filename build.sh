#!/bin/bash
set -x 
if [ $# -eq 0 ]
  then
    echo "No arguments supplied: release | debug"
    exit -1
fi
git pull
if [ ! -L "build" ]; then
        ln -s /var/www/vhosts/olab46/$1/player.$1 build
fi

npm install
npm run-script build:$1
pushd build/static
if [ ! -L "files" ]; then
	ln -s /var/www/vhosts/olab46/files files
fi
popd
service nginx restart
