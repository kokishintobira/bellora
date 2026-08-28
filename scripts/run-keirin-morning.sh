#!/bin/zsh
set -eu
SCRIPT_DIR=${0:A:h}
PROJECT_DIR=${SCRIPT_DIR:h}
cd "$PROJECT_DIR"
if [[ ! -x .venv/bin/python ]]; then
  print -u2 "まず python3 -m venv .venv && .venv/bin/pip install -r worker/requirements.txt を実行してください"
  exit 1
fi
.venv/bin/python worker/predict_today.py
npm run keirin:import:today
