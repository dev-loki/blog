#!/usr/bin/env bash
USER=lokidev
SERVER=hergenrother.uberspace.de
FOLDER_LOCAL="public/"
FOLDER_REMOTE="~/html"

hugo
rsync \
  -avzu \
  --delete \
  --progress \
  -h \
  $FOLDER_LOCAL \
  $USER@$SERVER:$FOLDER_REMOTE
