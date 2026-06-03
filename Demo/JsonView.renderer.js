import { JSONParser } from './JsonView.parser.js';

export class TreeRenderer {
    constructor() {
        this.parser = new JSONParser();
        this.onItemClick = null;
        this.eventListeners = new WeakMap(); // イベントリスナーを追跡
    }

    render(container, data, rootKey = 'root') {
        // 既存のイベントリスナーをクリーンアップ
        this.cleanup(container);
        
        container.innerHTML = '';
        const rootNode = this.createTreeNode(rootKey, data, true, true);
        container.appendChild(rootNode);
    }

    cleanup(container) {
        // WeakMapは自動的にクリーンアップされるが、明示的にクリア
        this.eventListeners = new WeakMap();
    }

    createTreeNode(key, value, isRoot = false, initialExpanded = false) {
        const type = this.parser.getType(value);
        const isExpandable = this.parser.isExpandable(value);
        
        const nodeWrapper = document.createElement('div');
        nodeWrapper.className = 'tree-node';

        const itemDiv = document.createElement('div');
        itemDiv.className = 'tree-item';

        const toggleIcon = document.createElement('span');
        toggleIcon.className = isExpandable ? `toggle-icon ${initialExpanded ? 'expanded' : 'collapsed'}` : 'toggle-icon leaf';
        
        if (isExpandable) {
            const icon = document.createElement('span');
            icon.className = 'material-icons';
            icon.textContent = initialExpanded ? 'expand_more' : 'chevron_right';
            toggleIcon.appendChild(icon);
        }

        const keySpan = document.createElement('span');
        keySpan.className = 'key';
        keySpan.textContent = key;

        const separator = document.createElement('span');
        separator.className = 'separator';
        separator.textContent = ':';

        itemDiv.appendChild(toggleIcon);
        itemDiv.appendChild(keySpan);
        itemDiv.appendChild(separator);

        if (isExpandable) {
            const itemCount = this.parser.getItemCount(value);
            const bracket = document.createElement('span');
            bracket.className = 'bracket';
            bracket.textContent = Array.isArray(value) ? '[' : '{';
            
            const typeInfo = document.createElement('span');
            typeInfo.className = 'type-indicator';
            typeInfo.textContent = `${itemCount} items`;
            
            itemDiv.appendChild(bracket);
            itemDiv.appendChild(typeInfo);

            const childrenDiv = document.createElement('div');
            childrenDiv.className = `children ${initialExpanded ? 'expanded' : ''}`;

            // DocumentFragmentを使用してパフォーマンス向上
            const fragment = document.createDocumentFragment();
            
            if (Array.isArray(value)) {
                value.forEach((item, index) => {
                    const childNode = this.createTreeNode(`[${index}]`, item, false, false);
                    fragment.appendChild(childNode);
                });
            } else {
                Object.entries(value).forEach(([k, v]) => {
                    const childNode = this.createTreeNode(k, v, false, false);
                    fragment.appendChild(childNode);
                });
            }

            const closingBracket = document.createElement('div');
            closingBracket.className = 'tree-item';
            closingBracket.style.marginLeft = '0';
            const closeBracketSpan = document.createElement('span');
            closeBracketSpan.className = 'bracket';
            closeBracketSpan.textContent = Array.isArray(value) ? ']' : '}';
            closingBracket.appendChild(closeBracketSpan);
            fragment.appendChild(closingBracket);
            
            childrenDiv.appendChild(fragment);

            nodeWrapper.appendChild(itemDiv);
            nodeWrapper.appendChild(childrenDiv);

            // イベントリスナーを保存して再利用
            const clickHandler = (e) => {
                e.stopPropagation();
                this.toggleNode(toggleIcon, childrenDiv);
                if (this.onItemClick) {
                    this.onItemClick(itemDiv);
                }
            };
            
            this.eventListeners.set(itemDiv, clickHandler);
            itemDiv.addEventListener('click', clickHandler);

        } else {
            const valueSpan = document.createElement('span');
            valueSpan.className = `value ${type}`;
            valueSpan.textContent = this.formatValue(value, type);
            
            itemDiv.appendChild(valueSpan);
            nodeWrapper.appendChild(itemDiv);
            
            // 葉ノードもクリック可能に
            const clickHandler = (e) => {
                e.stopPropagation();
                if (this.onItemClick) {
                    this.onItemClick(itemDiv);
                }
            };
            
            this.eventListeners.set(itemDiv, clickHandler);
            itemDiv.addEventListener('click', clickHandler);
        }

        return nodeWrapper;
    }

    toggleNode(toggleIcon, childrenDiv) {
        const isExpanded = childrenDiv.classList.contains('expanded');
        const icon = toggleIcon.querySelector('.material-icons');
        
        if (isExpanded) {
            childrenDiv.classList.remove('expanded');
            toggleIcon.classList.remove('expanded');
            toggleIcon.classList.add('collapsed');
            if (icon) {
                icon.textContent = 'chevron_right';
            }
        } else {
            childrenDiv.classList.add('expanded');
            toggleIcon.classList.remove('collapsed');
            toggleIcon.classList.add('expanded');
            if (icon) {
                icon.textContent = 'expand_more';
            }
        }
    }

    formatValue(value, type) {
        switch (type) {
            case 'string':
                return `"${value}"`;
            case 'null':
                return 'null';
            case 'boolean':
                return String(value);
            case 'number':
                return String(value);
            default:
                return String(value);
        }
    }
}