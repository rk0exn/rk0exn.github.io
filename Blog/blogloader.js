import { decryptContent } from './crypto.js';
import { parseMarkdownMetadata, markdownToHtml } from './markdown-parser.js';

const ENCRYPTION_PASSWORD = 'Dy2b9a!p';
const BLOG_INDEX = [
    { id: 1, title: '最初の投稿', date: '2025-01-15' },
    { id: 2, title: '技術詳細', date: '2025-01-20' },
    { id: 3, title: '今後の展望', date: '2025-02-01' }
];

export async function loadBlogPost(pageId) {
    try {
        const response = await fetch(`blog_${pageId}.md`);
        if (!response.ok) {
            throw new Error(`ページ ${pageId} が見つかりません`);
        }
        
        const encryptedContent = await response.text();
        const decryptedMarkdown = decryptContent(encryptedContent, ENCRYPTION_PASSWORD);
        
        const { metadata, content } = parseMarkdownMetadata(decryptedMarkdown);
        const htmlContent = markdownToHtml(content);
        
        const title = metadata.title || `記事 ${pageId}`;
        const date = metadata.date || new Date().toISOString().split('T')[0];
        
        return `
            <article class="blog-post">
                <header class="post-header">
                    <h2>${title}</h2>
                    <time class="post-date">${date}</time>
                </header>
                <div class="post-content">
                    ${htmlContent}
                </div>
                <nav class="post-navigation">
                    ${pageId > 1 ? `<a href="?page=${pageId - 1}" class="btn-secondary">前の記事</a>` : ''}
                    <a href="blogview.html" class="btn-secondary">一覧に戻る</a>
                    ${BLOG_INDEX.find(p => p.id === pageId + 1) ? `<a href="?page=${pageId + 1}" class="btn-secondary">次の記事</a>` : ''}
                </nav>
            </article>
        `;
    } catch (error) {
        throw new Error(`記事の読み込みに失敗しました: ${error.message}`);
    }
}

export async function loadMainContent() {
    const postList = BLOG_INDEX
        .map(post => `
            <article class="post-preview">
                <h3><a href="?page=${post.id}">${post.title}</a></h3>
                <time class="post-date">${post.date}</time>
                <p>暗号化されたMarkdownコンテンツを動的に読み込んで表示します。</p>
            </article>
        `)
        .join('');
    
    return `
        <div class="main-content">
            <h2>ブログ記事一覧</h2>
            <div class="post-list">
                ${postList}
            </div>
        </div>
    `;
}