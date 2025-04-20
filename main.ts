import { Plugin, WorkspaceLeaf, TFile, ItemView, Vault, App } from 'obsidian';

const VIEW_TYPE_TAGFOLDER = "tag-folder-view";

export default class TagFolderPlugin extends Plugin {
	async onload() {
		this.registerView(
			VIEW_TYPE_TAGFOLDER,
			(leaf) => new TagFolderView(leaf, this.app)
		);
		this.addRibbonIcon('hashtag', 'Open Tag Folder', () => {
			this.activateView();
		});

		this.addCommand({
			id: 'open-tag-folder-panel',
			name: 'Show Tag Folder Panel',
			callback: () => {
				this.activateView();
			}
		});
	}

	onunload() {
		this.app.workspace.detachLeavesOfType(VIEW_TYPE_TAGFOLDER);
	}

	async activateView() {
		const { workspace } = this.app;
		const leaf = workspace.getRightLeaf(false);
		if (leaf) {
			await leaf.setViewState({
				type: VIEW_TYPE_TAGFOLDER,
				active: true,
			});
			workspace.revealLeaf(
				workspace.getLeavesOfType(VIEW_TYPE_TAGFOLDER)[0]
			);
		}
	}
}

class TagFolderView extends ItemView {
	app: App;
	vault: Vault;
	expandedTags: Set<string> = new Set();

	async saveExpandedTags() {
		const plugin = (this.app as any).plugins.getPlugin('tag-folder');
		if (plugin?.saveData) {
			await plugin.saveData({ expandedTags: Array.from(this.expandedTags) });
		}
	}

	async loadExpandedTags() {
		const plugin = (this.app as any).plugins.getPlugin('tag-folder');
		if (plugin?.loadData) {
			const data = await plugin.loadData();
			if (data?.expandedTags) {
				this.expandedTags = new Set(data.expandedTags);
			}
		}
	}

	constructor(leaf: WorkspaceLeaf, app: App) {
		super(leaf);
		this.app = app;
		this.vault = app.vault;
	}

	getViewType() {
		return VIEW_TYPE_TAGFOLDER;
	}

	getDisplayText() {
		return "Tag Folder";
	}

	async onOpen() {
		await this.loadExpandedTags();
		this.render();
	}

	async onClose() {}

	async render() {
		const container = this.containerEl.children[1] as HTMLElement;
		container.empty();

		// Panel wrapper for hover effect
		const panelWrapper = container.createDiv('tag-folder-panel-wrapper');

		// Refresh button (hidden by default, shown on hover)
		const refreshBtn = panelWrapper.createDiv('tag-folder-refresh-btn');
		refreshBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="svg-icon"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 4v6h-6" /><path d="M1 20v-6h6" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10" /><path d="M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></g></svg>`;
		refreshBtn.onclick = (e) => {
			e.stopPropagation();
			this.render();
		};

		const tagMap = this.getAllTags();
		const tagTree = this.buildTagTree(tagMap);

		const tagList = panelWrapper.createDiv('nav-files-container node-insert-event');
		this.renderTagTree(tagList, tagTree, '');
	}

	// Build a tree structure from flat tag map
	buildTagTree(tagMap: Record<string, TFile[]>) {
		interface TagNode {
			name: string;
			fullName: string;
			children: Record<string, TagNode>;
			files: TFile[];
		}
		const root: Record<string, TagNode> = {};
		for (const tag in tagMap) {
			const parts = tag.replace(/^#/, '').split('/');
			let curr = root;
			let fullName = '';
			for (let i = 0; i < parts.length; i++) {
				const part = parts[i];
				fullName = fullName ? `${fullName}/${part}` : `#${part}`;
				if (!curr[part]) {
					curr[part] = {
						name: part,
						fullName,
						children: {},
						files: []
					};
				}
				if (i === parts.length - 1) {
					curr[part].files = tagMap[tag];
				}
				curr = curr[part].children;
			}
		}
		return root;
	}

	// Recursively render tag tree
	renderTagTree(container: HTMLElement, nodes: Record<string, any>, parentPath: string) {
		Object.values(nodes).sort((a, b) => a.name.localeCompare(b.name, undefined, {sensitivity: 'base'})).forEach(node => {
			const tagItem = container.createDiv('tree-item nav-folder');
			const tagSelf = tagItem.createDiv('tree-item-self nav-folder-title is-clickable mod-collapsible');
			tagSelf.setAttr('data-path', node.fullName);
			tagSelf.setAttr('draggable', 'true');
			tagSelf.setAttr('style', 'margin-inline-start: 0px !important; padding-inline-start: 24px !important;');
			const collapseIcon = tagSelf.createDiv('tree-item-icon collapse-icon');
			collapseIcon.innerHTML = `<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"svg-icon right-triangle\"><path d=\"M3 8L12 17L21 8\"></path></svg>`;
			const tagLabel = tagSelf.createDiv('tree-item-inner nav-folder-title-content');
			tagLabel.setText(node.name);

			// Tag count
			const tagCount = tagSelf.createSpan('tag-folder-count-badge');
			tagCount.setText(`${this.countAllFiles(node)}`);

			tagSelf.onclick = async (evt) => {
				evt.stopPropagation();
				if (this.expandedTags.has(node.fullName)) {
					this.expandedTags.delete(node.fullName);
				} else {
					this.expandedTags.add(node.fullName);
				}
				await this.saveExpandedTags();
				this.render();
			};
			const tagChildren = tagItem.createDiv('tree-item-children nav-folder-children');
			tagChildren.style.display = this.expandedTags.has(node.fullName) ? '' : 'none';
			if (this.expandedTags.has(node.fullName)) {
				// First, render subtags
				this.renderTagTree(tagChildren, node.children, node.fullName);
				// Then, render files directly under this tag
				(node.files || []).forEach((file: TFile) => {
					const noteItem = tagChildren.createDiv('tree-item nav-file');
					const noteSelf = noteItem.createDiv('tree-item-self nav-file-title tappable is-clickable');
					noteSelf.setAttr('data-path', file.path);
					noteSelf.setAttr('draggable', 'true');
					noteSelf.setAttr('style', 'margin-inline-start: -17px !important; padding-inline-start: 41px !important;');
					const noteLabel = noteSelf.createDiv('tree-item-inner nav-file-title-content');
					noteLabel.setText(file.basename);
					const ext = file.extension || (file.path.split('.').pop() ?? '');
					const extDiv = noteSelf.createDiv('nav-file-tag');
					extDiv.setText(ext);
					noteSelf.onclick = (evt) => {
						evt.stopPropagation();
						this.app.workspace.openLinkText(file.path, '', false);
					};

					// Show note preview on hover if enabled in settings
					const showPreview = (this.app as any).internalPlugins?.plugins?.fileExplorer?.instance?.options?.showFilePreview;
					if (showPreview) {
						noteSelf.addEventListener('mouseenter', (e) => {
							// Use Obsidian's built-in preview event
							this.app.workspace.trigger('link-hover', {
								event: e,
								source: 'tag-folder',
								hoverParent: noteSelf,
								linktext: file.path,
								state: {},
							});
						});
					}

				});
			}
		});
	}

	// Recursively count all files under a tag node
	countAllFiles(node: any): number {
		let count = (node.files || []).length;
		for (const child of Object.values(node.children)) {
			count += this.countAllFiles(child);
		}
		return count;
	}

	getAllTags(): Record<string, TFile[]> {
		const tagMap: Record<string, TFile[]> = {};
		const files = this.vault.getMarkdownFiles();
		for (const file of files) {
			const cache = this.app.metadataCache.getFileCache(file);
			if (!cache || !cache.tags) continue;
			for (const tagObj of cache.tags) {
				const tag = tagObj.tag;
				if (!tagMap[tag]) tagMap[tag] = [];
				tagMap[tag].push(file);
			}
		}
		return tagMap;
	}

	renderNoteList(container: HTMLElement, files: TFile[]) {
		let noteList = container.querySelector('.tag-folder-note-list');
		if (noteList) noteList.remove();
		noteList = container.createDiv('tag-folder-note-list');
		if (!noteList) return;
		files.forEach(file => {
			if (!noteList) return;
			const noteEl = noteList.createDiv('tag-folder-note');
			noteEl.setText(file.basename);
			noteEl.onclick = () => {
				this.app.workspace.openLinkText(file.path, '', false);
			};
		});
	}
}
