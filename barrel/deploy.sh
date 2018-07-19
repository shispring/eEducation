#!/bin/sh
deployDir=/home/devops/web_demo/project/BarrelService/
ServerName=${@:$OPTIND:1}

Rev="$(git rev-parse HEAD)"

echo $Rev
rsync -v -z -r --progress -h --exclude=.* --exclude=node_modules --exclude=log --exclude=output . $ServerName:$deployDir

echo service deployed on:$ServerName:$deployDir
