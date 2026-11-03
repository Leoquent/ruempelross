#!/bin/sh
set -eu
cd /docker/hermes-agent-yasb/data/clients/ruempelross/RRwebsite
# No credentials needed: this is the public website repository.
export GIT_TERMINAL_PROMPT=0
git diff --quiet
git diff --cached --quiet
git fetch --no-tags https://github.com/Leoquent/ruempelross.git main
if [ "$(git rev-parse HEAD)" = "$(git rev-parse FETCH_HEAD)" ]; then
  exit 0
fi
# Refuse divergence or local modifications; never discard anyone's work.
git merge --ff-only FETCH_HEAD
printf 'Website updated to %s\n' "$(git rev-parse HEAD)"
# nginx serves this checkout via a read-only mount; no restart is needed.
