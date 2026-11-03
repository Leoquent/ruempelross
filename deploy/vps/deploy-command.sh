#!/bin/sh
# Root-owned forced command for the dedicated GitHub key. No arbitrary SSH shell.
set -eu
exec /usr/bin/flock -w 90 /run/ruempelross-deploy.lock /usr/bin/setpriv --reuid=10000 --regid=10000 --clear-groups /bin/sh /docker/ruempelross/sync-github.sh
