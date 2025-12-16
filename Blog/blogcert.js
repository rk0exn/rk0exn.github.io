const VALID_PASSWORD = 'test0b21';

async function generateHash(text) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-512', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function getSessionID() {
    // ブラウザフィンガープリントベースのセッションID生成
    const nav = navigator;
    const screen = window.screen;
    
    const components = [
        nav.userAgent,
        nav.language,
        screen.width + 'x' + screen.height,
        screen.colorDepth,
        new Date().getTimezoneOffset(),
        !!window.sessionStorage,
        !!window.localStorage
    ];
    
    // シンプルなハッシュ生成
    let hash = 0;
    const str = components.join('|');
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    
    const sessionID = 'SESSION_' + Math.abs(hash).toString(16).toUpperCase().substring(0, 12);
    
    return sessionID;
}

export async function authenticate(sessionID, password) {
    const combined = sessionID + password;
    const hash = await generateHash(combined);
    
    if (password !== VALID_PASSWORD) {
        return false;
    }
    
    const validHash = await generateHash(sessionID + VALID_PASSWORD);
    return hash === validHash;
}

export function setAuthCookie(sessionID, password) {
    const cookieValue = `項目名=${sessionID}、内容=${password}`;
    const expires = new Date();
    expires.setDate(expires.getDate() + 7);
    document.cookie = `blogAuth=${encodeURIComponent(cookieValue)}; expires=${expires.toUTCString()}; path=/; SameSite=Strict`;
}

export function getAuthCookie() {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'blogAuth') {
            const decodedValue = decodeURIComponent(value);
            const parts = decodedValue.match(/項目名=([^、]+)、内容=(.+)/);
            if (parts) {
                return { sessionID: parts[1], password: parts[2] };
            }
        }
    }
    return null;
}

export async function verifyAuth() {
    const auth = getAuthCookie();
    if (!auth) return false;
    return await authenticate(auth.sessionID, auth.password);
}

export function clearAuthCookie() {
    document.cookie = 'blogAuth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
}