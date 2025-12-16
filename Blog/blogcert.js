const VALID_PASSWORD = 'test0b21';

async function generateHash(text) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-512', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function authenticate(ssid, password) {
    const combined = ssid + password;
    const hash = await generateHash(combined);
    
    if (password !== VALID_PASSWORD) {
        return false;
    }
    
    const validHash = await generateHash(ssid + VALID_PASSWORD);
    return hash === validHash;
}

export function setAuthCookie(ssid, password) {
    const cookieValue = `項目名=${ssid}、内容=${password}`;
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
                return { ssid: parts[1], password: parts[2] };
            }
        }
    }
    return null;
}

export async function verifyAuth() {
    const auth = getAuthCookie();
    if (!auth) return false;
    return await authenticate(auth.ssid, auth.password);
}

export function clearAuthCookie() {
    document.cookie = 'blogAuth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
}