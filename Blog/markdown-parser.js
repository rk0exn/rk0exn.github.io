export function parseMarkdownMetadata(markdown) {
    const metadataRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
    const match = markdown.match(metadataRegex);
    
    if (match) {
        const metadataText = match[1];
        const content = match[2];
        const metadata = {};
        
        metadataText.split('\n').forEach(line => {
            const [key, ...valueParts] = line.split(':');
            if (key && valueParts.length > 0) {
                metadata[key.trim()] = valueParts.join(':').trim();
            }
        });
        
        return { metadata, content };
    }
    
    return { metadata: {}, content: markdown };
}

export function markdownToHtml(markdown) {
    if (typeof marked !== 'undefined') {
        return marked.parse(markdown);
    }
    
    let html = markdown;
    
    // テーブルの変換（拡張機能）
    html = convertMarkdownTables(html);
    
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
    
    html = html.replace(/^- (.*$)/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
    
    html = html.replace(/\n\n/g, '</p><p>');
    html = '<p>' + html + '</p>';
    html = html.replace(/<p><\/p>/g, '');
    html = html.replace(/<p>(<h[1-6]>)/g, '$1');
    html = html.replace(/(<\/h[1-6]>)<\/p>/g, '$1');
    html = html.replace(/<p>(<ul>)/g, '$1');
    html = html.replace(/(<\/ul>)<\/p>/g, '$1');
    html = html.replace(/<p>(<table>)/g, '$1');
    html = html.replace(/(<\/table>)<\/p>/g, '$1');
    
    return html;
}

/**
 * Markdownテーブルを<table>タグに変換
 * @param {string} markdown - Markdownテキスト
 * @returns {string} テーブルが変換されたHTML
 */
function convertMarkdownTables(markdown) {
    const lines = markdown.split('\n');
    let result = [];
    let i = 0;
    
    while (i < lines.length) {
        const line = lines[i];
        
        // テーブルの開始を検出（|で始まる行）
        if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
            const tableLines = [];
            let j = i;
            
            // テーブル全体を収集
            while (j < lines.length && lines[j].trim().startsWith('|') && lines[j].trim().endsWith('|')) {
                tableLines.push(lines[j]);
                j++;
            }
            
            // テーブルが2行以上ある場合（ヘッダー + 区切り行 + データ）
            if (tableLines.length >= 2) {
                const tableHtml = parseMarkdownTable(tableLines);
                result.push(tableHtml);
                i = j;
                continue;
            }
        }
        
        result.push(line);
        i++;
    }
    
    return result.join('\n');
}

/**
 * テーブル行を解析してHTMLに変換
 * @param {string[]} tableLines - テーブルの行配列
 * @returns {string} HTMLテーブル
 */
function parseMarkdownTable(tableLines) {
    if (tableLines.length < 2) return tableLines.join('\n');
    
    // ヘッダー行を解析
    const headerCells = parseTableRow(tableLines[0]);
    
    // 区切り行を解析（アライメント情報を取得）
    const separatorLine = tableLines[1].trim();
    const alignments = parseTableAlignment(separatorLine);
    
    // データ行を解析
    const dataRows = tableLines.slice(2).map(line => parseTableRow(line));
    
    // HTMLテーブルを構築
    let html = '<table>\n';
    
    // ヘッダー
    html += '  <thead>\n    <tr>\n';
    headerCells.forEach((cell, idx) => {
        const align = alignments[idx] || 'left';
        html += `      <th style="text-align: ${align}">${cell.trim()}</th>\n`;
    });
    html += '    </tr>\n  </thead>\n';
    
    // ボディ
    if (dataRows.length > 0) {
        html += '  <tbody>\n';
        dataRows.forEach(row => {
            html += '    <tr>\n';
            row.forEach((cell, idx) => {
                const align = alignments[idx] || 'left';
                html += `      <td style="text-align: ${align}">${cell.trim()}</td>\n`;
            });
            html += '    </tr>\n';
        });
        html += '  </tbody>\n';
    }
    
    html += '</table>';
    
    return html;
}

/**
 * テーブル行をセルに分割
 * @param {string} row - テーブル行
 * @returns {string[]} セルの配列
 */
function parseTableRow(row) {
    // 両端の|を削除して分割
    const trimmed = row.trim();
    const content = trimmed.substring(1, trimmed.length - 1);
    return content.split('|').map(cell => cell.trim());
}

/**
 * 区切り行からアライメント情報を取得
 * @param {string} separatorLine - 区切り行（例: |---|:---:|---:|）
 * @returns {string[]} アライメント配列（'left', 'center', 'right'）
 */
function parseTableAlignment(separatorLine) {
    const cells = parseTableRow(separatorLine);
    
    return cells.map(cell => {
        const trimmed = cell.trim();
        const startsWithColon = trimmed.startsWith(':');
        const endsWithColon = trimmed.endsWith(':');
        
        if (startsWithColon && endsWithColon) {
            return 'center';
        } else if (endsWithColon) {
            return 'right';
        } else {
            return 'left';
        }
    });
}