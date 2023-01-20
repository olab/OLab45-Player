#!/bin/bash
git pull
npm install
npm run-script build
pushd build/static
ln -s /var/www/vhosts/olab46/files files
popd
