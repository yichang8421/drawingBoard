#!/usr/bin/env bash

yarn build &&

cd dist &&

git init &&
git add .  &&
git commit -m "deploy" &&

git remote add origin git@gitee.com:yichang8421/drawingBoard-website.git &&
git push -u origin master -f

cd -