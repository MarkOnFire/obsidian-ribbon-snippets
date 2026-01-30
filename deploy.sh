#!/bin/bash
# Deploy built plugin to Obsidian vault
set -euo pipefail

VAULT_PLUGINS="$HOME/Library/Mobile Documents/iCloud~md~obsidian/Documents/MarkBrain/.obsidian/plugins"
PLUGIN_DIR="$VAULT_PLUGINS/ribbon-snippets"

echo "Building..."
npm run build

echo "Deploying to $PLUGIN_DIR"
mkdir -p "$PLUGIN_DIR"
cp main.js manifest.json styles.css "$PLUGIN_DIR/"

echo "Done. Reload the plugin in Obsidian (Settings → Community plugins → toggle off/on)."
