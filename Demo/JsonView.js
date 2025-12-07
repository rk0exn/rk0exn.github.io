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
        this.focusedItem = null;

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

        // ツリービューのキーボード操作
        document.addEventListener('keydown', (e) => this.handleTreeKeyboard(e));
    }

    handleTreeKeyboard(e) {
        // ツリービューにフォーカスがない、または入力フィールドにフォーカスがある場合は無視
        if (!this.currentData || 
            document.activeElement.tagName === 'INPUT' || 
            document.activeElement.tagName === 'TEXTAREA') {
            return;
        }

        // 表示されている項目のみを取得
        const items = this.getVisibleItems();
        if (items.length === 0) return;

        // 初回フォーカス
        if (!this.focusedItem && (e.key === 'ArrowDown' || e.key === 'ArrowUp' || 
            e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
            e.preventDefault();
            this.setFocus(items[0]);
            return;
        }

        if (!this.focusedItem) return;

        const currentIndex = items.indexOf(this.focusedItem);
        if (currentIndex === -1) return;

        switch(e.key) {
            case 'ArrowDown':
                e.preventDefault();
                this.moveFocusDown(items, currentIndex);
                break;
            
            case 'ArrowUp':
                e.preventDefault();
                this.moveFocusUp(items, currentIndex);
                break;
            
            case 'ArrowRight':
                e.preventDefault();
                this.expandFocused();
                break;
            
            case 'ArrowLeft':
                e.preventDefault();
                this.collapseFocused();
                break;
        }
    }

    getVisibleItems() {
        const items = [];
        const allItems = this.treeView.querySelectorAll('.tree-item');
        
        allItems.forEach(item => {
            // 項目が表示されているかチェック
            let node = item.parentElement;
            let isVisible = true;
            
            while (node && node !== this.treeView) {
                if (node.classList.contains('children') && !node.classList.contains('expanded')) {
                    isVisible = false;
                    break;
                }
                node = node.parentElement;
            }
            
            if (isVisible) {
                items.push(item);
            }
        });
        
        return items;
    }

    setFocus(item) {
        if (this.focusedItem) {
            this.focusedItem.classList.remove('focused');
        }
        this.focusedItem = item;
        item.classList.add('focused');
        item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }

    moveFocusDown(items, currentIndex) {
        if (currentIndex < items.length - 1) {
            this.setFocus(items[currentIndex + 1]);
        }
    }

    moveFocusUp(items, currentIndex) {
        if (currentIndex > 0) {
            this.setFocus(items[currentIndex - 1]);
        }
    }

    expandFocused() {
        if (!this.focusedItem) return;

        const toggleIcon = this.focusedItem.querySelector('.toggle-icon');
        if (!toggleIcon || toggleIcon.classList.contains('leaf')) return;

        const nodeWrapper = this.focusedItem.closest('.tree-node');
        const childrenDiv = nodeWrapper.querySelector('.children');
        
        if (childrenDiv && !childrenDiv.classList.contains('expanded')) {
            this.renderer.toggleNode(toggleIcon, childrenDiv);
            // 展開後に可視項目リストが更新されるため、フォーカスを維持
            setTimeout(() => {
                if (this.focusedItem) {
                    this.focusedItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
                }
            }, 0);
        }
    }

    collapseFocused() {
        if (!this.focusedItem) return;

        const toggleIcon = this.focusedItem.querySelector('.toggle-icon');
        const nodeWrapper = this.focusedItem.closest('.tree-node');
        const childrenDiv = nodeWrapper.querySelector('.children');

        // 展開可能で現在展開されている場合は折りたたむ
        if (toggleIcon && !toggleIcon.classList.contains('leaf') && 
            childrenDiv && childrenDiv.classList.contains('expanded')) {
            this.renderer.toggleNode(toggleIcon, childrenDiv);
        } else {
            // 折りたためない、または既に折りたたまれている場合は親に移動
            this.moveToParent();
        }
    }

    moveToParent() {
        if (!this.focusedItem) return;

        const currentNode = this.focusedItem.closest('.tree-node');
        const parentChildren = currentNode.parentElement;
        
        // 親の.childrenを探す
        if (parentChildren && parentChildren.classList.contains('children')) {
            const parentNode = parentChildren.previousElementSibling;
            if (parentNode && parentNode.classList.contains('tree-item')) {
                this.setFocus(parentNode);
            }
        }
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
                this.focusedItem = null; // フォーカスをリセット
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
        this.focusedItem = null;
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