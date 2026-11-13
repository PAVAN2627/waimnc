#!/bin/bash
# Convenient root proxy to deploy/update.sh
exec "$(dirname "$0")/deploy/update.sh" "$@"

