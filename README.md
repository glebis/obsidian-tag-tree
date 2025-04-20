# Tag Folder Obsidian Plugin

A powerful panel for navigating your Obsidian vault by tags, with a native look and advanced features.

## Features
- **Tag Tree Panel**: Displays all tags in your vault as a hierarchical, collapsible tree—just like the Obsidian file explorer.
- **Nested Tag Support**: Subtags (e.g. `#tag1/test`) are shown as child folders under their parent tags.
- **Multi-Expanded Folders**: Expand or collapse as many tag folders as you want, at any level.
- **Note List Under Tags**: Each tag/folder lists all notes directly tagged with it, shown as clickable items with file extension badges.
- **Tag Count Badges**: Each tag displays a rounded badge with the total number of notes under it (including all nested subtags).
- **Beautiful Refresh Button**: Hover over the panel to reveal an animated refresh button in the top right. Click to instantly update the tag tree and note lists.
- **Command Palette Integration**: Open the "Tag Folder Panel" from the command palette for fast access.
- **Native Obsidian Styling**: All UI elements, badges, and animations are styled to match Obsidian’s look and feel.
- **Quick Note Access**: Click any note title to open it immediately.
- **Persistent Tag Openness**: The expanded/collapsed state of tags is saved and restored automatically.
- **Note Preview on Hover**: If enabled in Obsidian's settings, hovering over a note shows a live preview using Obsidian's built-in preview popup.
- **Custom Refresh Button Icon**: The refresh button uses a beautiful, custom SVG icon for improved clarity.

## Installation

1. Download the latest release of this plugin from the [GitHub releases page](https://github.com/YOUR_GITHUB_REPO/releases).
2. Unzip the downloaded file (if zipped).
3. Copy the entire plugin folder (containing `main.js`, `manifest.json`, and `styles.css`) into your vault's `.obsidian/plugins` directory.
4. Open Obsidian, go to **Settings → Community plugins → Installed plugins**, and enable "Tag Folder".

## Build from Source

To build this plugin yourself, you need [Node.js](https://nodejs.org/) and npm installed.

1. Clone or download this repository.
2. Open a terminal in the plugin folder.
3. Run `npm install` to install dependencies.
4. Run `npm run build` to build the plugin.

The compiled files (`main.js`, `manifest.json`, and `styles.css`) will be in the root of the plugin folder, ready to copy into your Obsidian vault's `.obsidian/plugins` directory.

## Usage
1. Open the Tag Folder panel from the sidebar or via the command palette (search "Show Tag Folder Panel").
2. Browse and expand/collapse tags and subtags as you would with folders.
3. Click a tag to expand it and see its subtags and notes.
4. Click a note to open it.
5. Hover over the panel and click the refresh button to update the tag tree.

This plugin is ideal for users who want a beautiful, powerful, tag-based navigation experience that feels native to Obsidian.