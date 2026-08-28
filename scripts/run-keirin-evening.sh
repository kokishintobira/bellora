#!/bin/zsh
set -eu
SCRIPT_DIR=${0:A:h}
PROJECT_DIR=${SCRIPT_DIR:h}
cd "$PROJECT_DIR"
TODAY=$(TZ=Asia/Tokyo date +%F)
.venv/bin/python worker/collect.py --date "$TODAY" --no-odds
.venv/bin/python worker/settle.py
node --env-file=.env.local scripts/import-keirin-worker.mjs worker/out/settled.json
