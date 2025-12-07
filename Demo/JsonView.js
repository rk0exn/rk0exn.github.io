import { JSONParser } from './JsonView.parser.js';
import { TreeRenderer } from './JsonView.renderer.js';
import { FileLoader } from './JsonView.loader.js';
import { ThemeManager } from './JsonView.theme.js';

class JSONTreeViewer {
    constructor() {
        this.parser = new JSONParser();
        this.renderer = new TreeRenderer();
        this.loader = new FileLoader();
        this.themeManager = new ThemeManager();
        this.currentData = null;

        this.initElements();
        this.bindEvents();
    }

    initElements() {
        this.tabButtons = document.querySelectorAll('.tab-button');
        this.tabContents = document.querySelectorAll('.tab-content');

        this.fileInput = document.getElementById('fileInput');
        this.selectFileBtn = document.getElementById('selectFileBtn');
        this.fileName = document.getElementById('fileName');

        this.urlInput = document.getElementById('urlInput');
        this.loadUrlBtn = document.getElementById('loadUrlBtn');
        this.cacheInfo = document.getElementById('cacheInfo');

        this.jsonInput = document.getElementById('jsonInput');

        this.parseBtn = document.getElementById('parseBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.sampleBtn = document.getElementById('sampleBtn');
        this.expandAllBtn = document.getElementById('expandAllBtn');
        this.collapseAllBtn = document.getElementById('collapseAllBtn');
        this.treeView = document.getElementById('treeView');

        this.themeToggle = document.getElementById('themeToggle');
        this.snackbar = document.getElementById('snackbar');
        this.progressBar = document.getElementById('progressBar');
    }

    bindEvents() {
        this.tabButtons.forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
        });

        this.selectFileBtn.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));

        this.loadUrlBtn.addEventListener('click', () => this.handleUrlLoad());

        this.parseBtn.addEventListener('click', () => this.parseJSON());
        this.clearBtn.addEventListener('click', () => this.clear());
        this.sampleBtn.addEventListener('click', () => this.loadSample());
        this.expandAllBtn.addEventListener('click', () => this.expandAll());
        this.collapseAllBtn.addEventListener('click', () => this.collapseAll());

        this.themeToggle.addEventListener('click', () => this.themeManager.toggleTheme());

        this.jsonInput.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                this.parseJSON();
            }
        });
    }

    switchTab(tabName) {
        this.tabButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        this.tabContents.forEach(content => {
            content.classList.toggle('active', content.dataset.content === tabName);
        });
    }

    async handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        this.fileName.textContent = file.name;
        this.showProgress(true);

        try {
            const content = await this.loader.loadFromFile(file);
            this.jsonInput.value = content;
            this.showSnackbar('ファイルを読み込みました');
            await this.parseJSON();
        } catch (error) {
            this.showSnackbar(`エラー: ${error.message}`, 'error');
        } finally {
            this.showProgress(false);
        }
    }

    async handleUrlLoad() {
        const url = this.urlInput.value.trim();

        if (!url) {
            this.showSnackbar('URLを入力してください', 'error');
            return;
        }

        this.loadUrlBtn.disabled = true;
        this.showProgress(true);

        try {
            const result = await this.loader.loadFromUrl(url);
            this.jsonInput.value = result.content;

            this.cacheInfo.classList.add('active');
            this.cacheInfo.innerHTML = `
                <strong>キャッシュ情報:</strong><br>
                URL: ${result.url}<br>
                読み込み日時: ${result.timestamp}<br>
                サイズ: ${result.size} bytes
            `;

            this.showSnackbar('URLから読み込みました');
            await this.parseJSON();
        } catch (error) {
            this.showSnackbar(`エラー: ${error.message}`, 'error');
        } finally {
            this.loadUrlBtn.disabled = false;
            this.showProgress(false);
        }
    }

    parseJSON() {
        const input = this.jsonInput.value.trim();

        if (!input) {
            this.showSnackbar('JSONデータを入力してください', 'error');
            return;
        }

        this.showProgress(true);

        setTimeout(() => {
            try {
                this.currentData = this.parser.parse(input);
                this.renderer.render(this.treeView, this.currentData);
                this.showSnackbar('解析完了');
            } catch (error) {
                this.showSnackbar(`解析エラー: ${error.message}`, 'error');
            } finally {
                this.showProgress(false);
            }
        }, 50);
    }

    clear() {
        this.jsonInput.value = '';
        this.urlInput.value = '';
        this.fileName.textContent = 'ファイルが選択されていません';
        this.fileInput.value = '';
        this.cacheInfo.classList.remove('active');
        this.treeView.innerHTML = '';
        this.currentData = null;
        this.showSnackbar('クリアしました');
    }

    loadSample() {
        const sample = {
            name: "Sample Object",
            version: 1.0,
            active: true,
            tags: ["json", "tree", "viewer"],
            metadata: {
                author: "Developer",
                created: "2024-01-01",
                nested: {
                    deep: {
                        value: "Deep nested value"
                    }
                }
            },
            items: [
                { id: 1, name: "Item 1", price: 100 },
                { id: 2, name: "Item 2", price: 200 },
                { id: 3, name: "Item 3", price: null }
            ],
            empty: null
        };

        this.jsonInput.value = JSON.stringify(sample, null, 2);
        this.switchTab('manual');
        setTimeout(() => this.parseJSON(), 100);
    }

    expandAll() {
        const nodes = this.treeView.querySelectorAll('.children');
        const icons = this.treeView.querySelectorAll('.toggle-icon');

        nodes.forEach(node => node.classList.add('expanded'));
        icons.forEach(icon => {
            if (!icon.classList.contains('leaf')) {
                icon.classList.remove('collapsed');
                icon.classList.add('expanded');
                const materialIcon = icon.querySelector('.material-icons');
                if (materialIcon) {
                    materialIcon.textContent = 'expand_more';
                }
            }
        });
    }

    collapseAll() {
        const nodes = this.treeView.querySelectorAll('.children');
        const icons = this.treeView.querySelectorAll('.toggle-icon');

        nodes.forEach(node => node.classList.remove('expanded'));
        icons.forEach(icon => {
            if (!icon.classList.contains('leaf')) {
                icon.classList.remove('expanded');
                icon.classList.add('collapsed');
                const materialIcon = icon.querySelector('.material-icons');
                if (materialIcon) {
                    materialIcon.textContent = 'chevron_right';
                }
            }
        });
    }

    showSnackbar(message, type = 'info') {
        this.snackbar.textContent = message;
        this.snackbar.className = `snackbar ${type}`;
        this.snackbar.classList.add('show');

        setTimeout(() => {
            this.snackbar.classList.remove('show');
        }, 3000);
    }

    showProgress(show) {
        if (show) {
            this.progressBar.classList.add('active');
        } else {
            this.progressBar.classList.remove('active');
        }
    }
}

new JSONTreeViewer();