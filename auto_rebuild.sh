#!/bin/bash

echo '正在拉取更新'
git pull

cd client
echo '开始重新编译'
npm run build
echo '编译结束'

cd ..
echo '正在重新启动项目'
node index.js

