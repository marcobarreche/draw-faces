#!/bin/bash
cp -R system/* /
mkdir -p /opt/var/log/draw-faces
chown -R www-data:www-data /opt/var/log/draw-faces

BASE_PROJECT_NAME='git@github.com:marcobarreche/draw-faces.git'
PROJECT_DIR="/opt/draw-faces"

if [[ -d "$PROJECT_DIR" ]]; then
  pushd "$PROJECT_DIR" > /dev/null
  echo 'Fetching GIT repository...'
  git fetch origin || exit 1
  echo 'Merging GIT repository...'
  git merge origin/master || exit 1
  popd > /dev/null
else
  echo 'Creating GIT repository...'
  git clone $BASE_PROJECT_NAME || exit 1
fi

supervisorctl restart draw-faces