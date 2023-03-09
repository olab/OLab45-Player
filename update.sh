#!/bin/bash
git pull
npm run-script clean
npm install
npm run-script build:dev
npm run-script build
pushd build/static
ln -s /var/www/vhosts/olab46/files files
popd
