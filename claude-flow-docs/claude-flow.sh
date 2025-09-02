#!/bin/bash
# Claude Flow Wrapper Script
# This script allows you to use Claude Flow without global npm installation
# Usage: ./claude-flow.sh [command] [options]

# Change to the claude-flow directory
cd "$(dirname "$0")"

# Use local installation if available, otherwise use npx
if [ -f "./node_modules/.bin/claude-flow" ]; then
    ./node_modules/.bin/claude-flow "$@"
elif [ -f "./bin/claude-flow.js" ]; then
    node ./bin/claude-flow.js "$@"
else
    # Fallback to npx (may have permission issues)
    echo "Using npx claude-flow@alpha (may have npm cache issues)..."
    npx claude-flow@alpha "$@"
fi