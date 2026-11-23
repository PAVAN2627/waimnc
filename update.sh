#!/bin/bash
# Convenient root proxy to deploy/update.sh
exec bash "$(dirname "$0")/deploy/update.sh" "$@"

