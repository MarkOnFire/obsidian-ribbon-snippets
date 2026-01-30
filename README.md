# Ribbon Snippets

Define text blocks and assign each to a ribbon button for one-click insertion into your notes.

![Settings UI](https://raw.githubusercontent.com/markonfire/obsidian-ribbon-snippets/main/.github/screenshot-settings.png)

## Features

- **Multiple snippets** — create as many as you need, each with its own ribbon icon
- **Lucide icon picker** — choose any [Lucide icon](https://lucide.dev) for each button (with live preview)
- **Insert positions** — top of note (after frontmatter), at cursor, or bottom of note
- **Duplicate detection** — optionally skip insertion if the snippet's first line already exists in the note
- **Command palette** — every snippet is also available as a command (`Insert: <name>`)
- **Reorder and manage** — move snippets up/down or delete them from settings
- **Dynamic lifecycle** — adding or removing snippets updates the ribbon and command palette immediately (no reload needed)

## Use cases

- Insert a [Tasks plugin](https://publish.obsidian.md/tasks) query block with one click
- Stamp a standard template section into any note
- Add boilerplate frontmatter, callouts, or code blocks
- Quick-insert recurring checklists or status headers

## Installation

### From community plugins (recommended)

1. Open **Settings > Community plugins**
2. Click **Browse** and search for **Ribbon Snippets**
3. Click **Install**, then **Enable**

### Manual install

1. Download `main.js`, `manifest.json`, and `styles.css` from the [latest release](https://github.com/markonfire/obsidian-ribbon-snippets/releases/latest)
2. Create a folder: `<vault>/.obsidian/plugins/ribbon-snippets/`
3. Copy the three files into that folder
4. Reload Obsidian and enable the plugin in **Settings > Community plugins**

## Usage

1. Go to **Settings > Ribbon Snippets**
2. Click **+ New snippet**
3. Configure:
   - **Name** — tooltip for the ribbon button and command palette label
   - **Icon** — any Lucide icon name (e.g. `check-circle`, `star`, `bookmark`)
   - **Insert position** — top of note (after frontmatter), at cursor, or bottom
   - **Prevent duplicates** — skip if the first line already appears in the note
   - **Content** — the markdown text to insert
4. A ribbon icon appears immediately. Click it to insert the snippet into the active note.

## Compatibility

Requires **Obsidian 1.7.2** or later (uses the `removeCommand()` API for dynamic command lifecycle management).

Works on desktop and mobile.

## License

[MIT](LICENSE)
