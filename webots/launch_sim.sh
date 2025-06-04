#!/usr/bin/env bash
WORLD="$1"          # absolute path to .wbt
MISSION_ID="$2"
/Applications/Webots.app/Contents/MacOS/webots \
  --batch \
  "$WORLD" 