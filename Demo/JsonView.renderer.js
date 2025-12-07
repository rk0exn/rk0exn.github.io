import { JSONParser } from './JsonView.parser.js';

export class TreeRenderer {
    constructor() {
        this.parser = new JSONParser();
    }

    render(container, data, rootKey = 'root') {
        container.innerHTML = '';
        const rootNode = this.createTreeNode(rootKey, data, true, false);
        container.appendChild(rootNode);
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
            icon.textContent = 'expand_more';
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

            if (Array.isArray(value)) {
                value.forEach((item, index) => {
                    const childNode = this.createTreeNode(`[${index}]`, item);
                    childrenDiv.appendChild(childNode);
                });
            } else {
                Object.entries(value).forEach(([k, v]) => {
                    const childNode = this.createTreeNode(k, v);
                    childrenDiv.appendChild(childNode);
                });
            }

            const closingBracket = document.createElement('div');
            closingBracket.className = 'tree-item';
            closingBracket.style.marginLeft = '0';
            const closeBracketSpan = document.createElement('span');
            closeBracketSpan.className = 'bracket';
            closeBracketSpan.textContent = Array.isArray(value) ? ']' : '}';
            closingBracket.appendChild(closeBracketSpan);
            childrenDiv.appendChild(closingBracket);

            nodeWrapper.appendChild(itemDiv);
            nodeWrapper.appendChild(childrenDiv);

            itemDiv.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleNode(toggleIcon, childrenDiv);
            });

        } else {
            const valueSpan = document.createElement('span');
            valueSpan.className = `value ${type}`;
            valueSpan.textContent = this.formatValue(value, type);
            
            itemDiv.appendChild(valueSpan);
            nodeWrapper.appendChild(itemDiv);
        }

        return nodeWrapper;
    }

    toggleNode(toggleIcon, childrenDiv) {
        const isExpanded = childrenDiv.classList.contains('expanded');
        
        if (isExpanded) {
            childrenDiv.classList.remove('expanded');
            toggleIcon.classList.remove('expanded');
            toggleIcon.classList.add('collapsed');
        } else {
            childrenDiv.classList.add('expanded');
            toggleIcon.classList.remove('collapsed');
            toggleIcon.classList.add('expanded');
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