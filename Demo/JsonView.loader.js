export class FileLoader {
    constructor() {
        this.cache = new Map();
    }

    async loadFromFile(file) {
        return new Promise((resolve, reject) => {
            if (!file.type.includes('json') && !file.name.endsWith('.json')) {
                reject(new Error('JSONファイルを選択してください'));
                return;
            }

            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const content = e.target.result;
                    resolve(content);
                } catch (error) {
                    reject(new Error('ファイルの読み込みに失敗しました'));
                }
            };

            reader.onerror = () => {
                reject(new Error('ファイルの読み込み中にエラーが発生しました'));
            };

            reader.readAsText(file);
        });
    }

    async loadFromUrl(url) {
        const cachedData = this.cache.get(url);

        if (cachedData && this.isCacheValid(cachedData.timestamp)) {
            return {
                content: cachedData.content,
                url: url,
                timestamp: cachedData.timestamp,
                size: cachedData.size,
                fromCache: true
            };
        }

        try {
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
            }

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                console.warn('Content-Type is not application/json, attempting to parse anyway');
            }

            const content = await response.text();
            const timestamp = new Date().toLocaleString('ja-JP');
            const size = new Blob([content]).size;

            const cacheData = {
                content: content,
                timestamp: timestamp,
                size: size
            };

            this.cache.set(url, cacheData);

            return {
                content: content,
                url: url,
                timestamp: timestamp,
                size: size,
                fromCache: false
            };

        } catch (error) {
            if (error.name === 'TypeError') {
                throw new Error('ネットワークエラー: URLにアクセスできません (CORS制限の可能性があります)');
            }
            throw error;
        }
    }

    isCacheValid(timestamp, maxAgeMinutes = 30) {
        const cacheTime = new Date(timestamp).getTime();
        const now = Date.now();
        const ageMinutes = (now - cacheTime) / (1000 * 60);

        return ageMinutes < maxAgeMinutes;
    }

    clearCache(url = null) {
        if (url) {
            this.cache.delete(url);
        } else {
            this.cache.clear();
        }
    }

    getCacheInfo() {
        const info = [];
        this.cache.forEach((value, key) => {
            info.push({
                url: key,
                timestamp: value.timestamp,
                size: value.size
            });
        });
        return info;
    }
}