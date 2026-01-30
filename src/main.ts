import { Editor, MarkdownView, Notice, Plugin } from 'obsidian';
import { RibbonSnippetsSettingTab } from './settings';

export interface RibbonSnippet {
	id: string;
	name: string;
	icon: string;
	content: string;
	position: 'top' | 'cursor' | 'bottom';
	checkDuplicate: boolean;
}

export interface RibbonSnippetsSettings {
	snippets: RibbonSnippet[];
}

export const DEFAULT_SETTINGS: RibbonSnippetsSettings = {
	snippets: []
};

export default class RibbonSnippetsPlugin extends Plugin {
	settings: RibbonSnippetsSettings;
	private ribbonIcons: HTMLElement[] = [];
	private saveTimer: ReturnType<typeof setTimeout> | null = null;

	async onload() {
		await this.loadSettings();
		this.refreshRibbonIcons();
		this.registerCommands();
		this.addSettingTab(new RibbonSnippetsSettingTab(this.app, this));
	}

	onunload() {
		if (this.saveTimer) clearTimeout(this.saveTimer);
		this.removeRibbonIcons();
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
		// Ensure snippets array exists even if stored data is partial
		if (!Array.isArray(this.settings.snippets)) {
			this.settings.snippets = [];
		}
	}

	/**
	 * Persist settings AND refresh ribbon icons.
	 * Use for structural changes (add/remove/reorder snippets, icon changes).
	 */
	async saveSettings() {
		await this.saveData(this.settings);
		this.refreshRibbonIcons();
	}

	/**
	 * Debounced persist-only save. Does NOT rebuild ribbon icons.
	 * Use for text field edits (name, content) where rapid typing
	 * would cause concurrent refreshRibbonIcons() calls, orphaning
	 * DOM elements due to async race conditions.
	 */
	debouncedSave() {
		if (this.saveTimer) clearTimeout(this.saveTimer);
		this.saveTimer = setTimeout(() => {
			this.saveData(this.settings);
		}, 400);
	}

	// --- Ribbon icon management ---

	private removeRibbonIcons() {
		for (const el of this.ribbonIcons) {
			el.remove();
		}
		this.ribbonIcons = [];
	}

	refreshRibbonIcons() {
		this.removeRibbonIcons();
		for (const snippet of this.settings.snippets) {
			const el = this.addRibbonIcon(
				snippet.icon || 'file-text',
				snippet.name || 'Unnamed snippet',
				() => this.insertSnippetFromRibbon(snippet.id)
			);
			this.ribbonIcons.push(el);
		}
	}

	// --- Command registration ---

	private registerCommands() {
		for (const snippet of this.settings.snippets) {
			this.addCommand({
				id: `insert-snippet-${snippet.id}`,
				name: `Insert: ${snippet.name}`,
				editorCallback: (editor: Editor) => {
					// Look up live settings so edits take effect without reload
					const current = this.settings.snippets.find(s => s.id === snippet.id);
					if (!current) {
						new Notice('Snippet no longer exists. Reload the plugin to update commands.');
						return;
					}
					this.insertSnippetInEditor(editor, current);
				}
			});
		}
	}

	// --- Snippet insertion ---

	private insertSnippetFromRibbon(snippetId: string) {
		const snippet = this.settings.snippets.find(s => s.id === snippetId);
		if (!snippet) return;

		const view = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (!view) {
			new Notice('No active note');
			return;
		}
		this.insertSnippetInEditor(view.editor, snippet);
	}

	private insertSnippetInEditor(editor: Editor, snippet: RibbonSnippet) {
		const content = editor.getValue();

		if (snippet.checkDuplicate) {
			const firstLine = snippet.content.split('\n')[0];
			if (firstLine && content.includes(firstLine)) {
				new Notice(`"${snippet.name}" already exists in this note`);
				return;
			}
		}

		const text = snippet.content.endsWith('\n')
			? snippet.content
			: snippet.content + '\n';

		switch (snippet.position) {
			case 'top': {
				const pos = this.findTopInsertPosition(content);
				editor.replaceRange(text, pos);
				break;
			}
			case 'cursor': {
				editor.replaceSelection(text);
				break;
			}
			case 'bottom': {
				const lastLine = editor.lastLine();
				const lastLineText = editor.getLine(lastLine);
				const prefix = lastLineText.length > 0 ? '\n' : '';
				editor.replaceRange(
					prefix + text,
					{ line: lastLine, ch: lastLineText.length }
				);
				break;
			}
		}

		new Notice(`Inserted "${snippet.name}"`);
	}

	/**
	 * Find the insertion point for "top of note."
	 * If YAML frontmatter exists (starts with ---), insert after the closing ---.
	 */
	private findTopInsertPosition(content: string): { line: number; ch: number } {
		const lines = content.split('\n');
		if (lines[0]?.trim() === '---') {
			for (let i = 1; i < lines.length; i++) {
				if (lines[i].trim() === '---') {
					return { line: i + 1, ch: 0 };
				}
			}
		}
		return { line: 0, ch: 0 };
	}

	// --- Utility ---

	generateId(): string {
		return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
	}
}
