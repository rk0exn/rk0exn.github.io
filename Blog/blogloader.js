import { decryptContent } from './crypto.js';
import { parseMarkdownMetadata, markdownToHtml } from './markdown-parser.js';

const ENCRYPTION_PASSWORD = 'Dy2b9a!p';

// 動的に記事一覧を生成
async function loadBlogIndex() {
    const posts = [];
    let pageId = 1;
    
    // blog_{id}.mdファイルの存在を確認
    while (pageId <= 10) { // 最大10件まで確認
        try {
            const response = await fetch(`blog_${pageId}.md`);
            if (response.ok) {
                const encryptedContent = await response.text();
                const decryptedMarkdown = decryptContent(encryptedContent, ENCRYPTION_PASSWORD);
                const { metadata } = parseMarkdownMetadata(decryptedMarkdown);
                
                posts.push({
                    id: pageId,
                    title: metadata.title || `記事 ${pageId}`,
                    date: metadata.date || new Date().toISOString().split('T')[0]
                });
            } else {
                break; // ファイルが存在しない場合は終了
            }
        } catch (error) {
            break; // エラーが発生した場合は終了
        }
        pageId++;
    }
    
    return posts;
}

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
        
        // 動的に記事一覧を取得してナビゲーションを生成
        const blogIndex = await loadBlogIndex();
        
        // 前の記事の存在確認
        const hasPrevious = pageId > 1 && (await checkBlogExists(pageId - 1));
        
        // 次の記事の存在確認
        const hasNext = await checkBlogExists(pageId + 1);
        
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
                    ${hasPrevious ? `<a href="?page=${pageId - 1}" class="btn-secondary">前のブログへ</a>` : '<span></span>'}
                    <a href="blogview.html" class="btn-secondary">一覧に戻る</a>
                    ${hasNext ? `<a href="?page=${pageId + 1}" class="btn-secondary">次のブログへ</a>` : '<span></span>'}
                </nav>
            </article>
        `;
    } catch (error) {
        throw new Error(`記事の読み込みに失敗しました: ${error.message}`);
    }
}

/**
 * 指定されたブログ記事が存在するかチェック
 * @param {number} pageId - チェックするページID
 * @returns {Promise<boolean>} 存在する場合true
 */
async function checkBlogExists(pageId) {
    try {
        const response = await fetch(`blog_${pageId}.md`, { method: 'HEAD' });
        if (response.ok) {
            return true;
        }
        // HEADメソッドが使えない場合はGETで試行
        const getResponse = await fetch(`blog_${pageId}.md`);
        return getResponse.ok;
    } catch (error) {
        return false;
    }
}

export async function loadMainContent() {
    const blogIndex = await loadBlogIndex();
    
    if (blogIndex.length === 0) {
        return `
            <div class="main-content">
                <h2>ブログ記事一覧</h2>
                <p>現在、記事がありません。</p>
            </div>
        `;
    }
    
    const postList = blogIndex
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