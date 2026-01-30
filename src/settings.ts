import { App, PluginSettingTab, Setting, setIcon } from 'obsidian';
import RibbonSnippetsPlugin, { RibbonSnippet } from './main';

export class RibbonSnippetsSettingTab extends PluginSettingTab {
	plugin: RibbonSnippetsPlugin;

	constructor(app: App, plugin: RibbonSnippetsPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();
		containerEl.addClass('ribbon-snippets-settings');

		containerEl.createEl('h2', { text: 'Ribbon Snippets' });
		containerEl.createEl('p', {
			text: 'Define text blocks and assign each to a ribbon button. Each snippet gets its own ribbon icon and command palette entry.',
			cls: 'setting-item-description'
		});

		// Add snippet button
		new Setting(containerEl)
			.addButton(btn => btn
				.setButtonText('+ New snippet')
				.setCta()
				.onClick(async () => {
					this.plugin.settings.snippets.push({
						id: this.plugin.generateId(),
						name: 'New Snippet',
						icon: 'file-text',
						content: '',
						position: 'top',
						checkDuplicate: false
					});
					await this.plugin.saveSettings();
					this.display();
				}));

		if (this.plugin.settings.snippets.length === 0) {
			containerEl.createEl('p', {
				text: 'No snippets configured. Click "+ New snippet" to get started.',
				cls: 'ribbon-snippets-empty'
			});
			return;
		}

		// Render each snippet
		const snippets = this.plugin.settings.snippets;
		for (let i = 0; i < snippets.length; i++) {
			this.renderSnippet(containerEl, snippets[i], i, snippets.length);
		}

	}

	private renderSnippet(
		containerEl: HTMLElement,
		snippet: RibbonSnippet,
		index: number,
		total: number
	): void {
		const wrapper = containerEl.createDiv({ cls: 'ribbon-snippet-item' });

		// --- Header row with icon preview and name ---
		const header = wrapper.createDiv({ cls: 'ribbon-snippet-header' });
		const iconEl = header.createSpan({ cls: 'ribbon-snippet-header-icon' });
		this.setIconSafe(iconEl, snippet.icon);
		header.createSpan({ text: snippet.name, cls: 'ribbon-snippet-header-name' });

		// --- Name ---
		new Setting(wrapper)
			.setName('Name')
			.setDesc('Tooltip for the ribbon button and command palette label')
			.addText(text => text
				.setPlaceholder('My Snippet')
				.setValue(snippet.name)
				.onChange((value) => {
					snippet.name = value;
					this.plugin.debouncedSave();
				}));

		// --- Icon with live preview ---
		const iconSetting = new Setting(wrapper)
			.setName('Icon')
			.setDesc('Lucide icon name (e.g. list-checks, star, bookmark, file-text)')
			.addText(text => text
				.setPlaceholder('file-text')
				.setValue(snippet.icon)
				.onChange((value) => {
					snippet.icon = value;
					this.plugin.debouncedSave();
					this.setIconSafe(previewEl, value);
				}));

		const previewEl = iconSetting.controlEl.createDiv({ cls: 'ribbon-snippet-icon-preview' });
		this.setIconSafe(previewEl, snippet.icon);

		// --- Insert position ---
		new Setting(wrapper)
			.setName('Insert position')
			.setDesc('Where in the note to place the snippet')
			.addDropdown(dd => dd
				.addOption('top', 'Top of note (after frontmatter)')
				.addOption('cursor', 'At cursor position')
				.addOption('bottom', 'Bottom of note')
				.setValue(snippet.position)
				.onChange(async (value) => {
					snippet.position = value as 'top' | 'cursor' | 'bottom';
					await this.plugin.saveSettings();
				}));

		// --- Duplicate check ---
		new Setting(wrapper)
			.setName('Prevent duplicates')
			.setDesc('Skip insertion if the first line already appears in the note')
			.addToggle(toggle => toggle
				.setValue(snippet.checkDuplicate)
				.onChange(async (value) => {
					snippet.checkDuplicate = value;
					await this.plugin.saveSettings();
				}));

		// --- Content ---
		new Setting(wrapper)
			.setName('Content')
			.setDesc('The text or markup to insert (supports markdown, code blocks, etc.)')
			.addTextArea(ta => {
				ta.setValue(snippet.content)
					.setPlaceholder('## My heading\nSome content...')
					.onChange((value) => {
						snippet.content = value;
						this.plugin.debouncedSave();
					});
				ta.inputEl.rows = 10;
				ta.inputEl.addClass('ribbon-snippet-textarea');
			});

		// --- Actions: reorder and delete ---
		const actions = new Setting(wrapper).setClass('ribbon-snippet-actions');

		actions.addButton(btn => {
			btn.setIcon('arrow-up')
				.setTooltip('Move up')
				.setDisabled(index === 0)
				.onClick(async () => {
					const arr = this.plugin.settings.snippets;
					[arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
					await this.plugin.saveSettings();
					this.display();
				});
			if (index === 0) btn.buttonEl.addClass('ribbon-snippet-btn-disabled');
		});

		actions.addButton(btn => {
			btn.setIcon('arrow-down')
				.setTooltip('Move down')
				.setDisabled(index === total - 1)
				.onClick(async () => {
					const arr = this.plugin.settings.snippets;
					[arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
					await this.plugin.saveSettings();
					this.display();
				});
			if (index === total - 1) btn.buttonEl.addClass('ribbon-snippet-btn-disabled');
		});

		actions.addButton(btn => btn
			.setIcon('trash-2')
			.setTooltip('Delete snippet')
			.setWarning()
			.onClick(async () => {
				this.plugin.settings.snippets.splice(index, 1);
				await this.plugin.saveSettings();
				this.display();
			}));
	}

	private setIconSafe(el: HTMLElement, iconName: string): void {
		el.empty();
		if (!iconName) {
			el.setText('—');
			return;
		}
		try {
			setIcon(el, iconName);
		} catch {
			el.setText('?');
		}
	}
}
