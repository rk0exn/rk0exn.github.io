export class ThemeManager {
    constructor() {
        this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        this.currentTheme = this.getInitialTheme();
        this.applyTheme(this.currentTheme);
        this.setupMediaQueryListener();
    }

    getInitialTheme() {
        const savedTheme = this.getCookie('theme');

        if (savedTheme) {
            return savedTheme;
        }

        const theme = this.mediaQuery.matches ? 'dark' : 'light';
        this.setCookie('theme', theme, 365);

        return theme;
    }

    setupMediaQueryListener() {
        this.mediaQuery.addEventListener('change', (e) => {
            const savedTheme = this.getCookie('theme');
            if (!savedTheme) {
                const newTheme = e.matches ? 'dark' : 'light';
                this.applyTheme(newTheme);
            }
        });
    }

    applyTheme(theme) {
        const metaColorScheme = document.querySelector('meta[name="color-scheme"]');
        if (metaColorScheme) {
            metaColorScheme.setAttribute('content', theme);
        }

        this.currentTheme = theme;
        this.updateThemeIcon(theme);
        this.setCookie('theme', theme, 365);

        // テーマに応じたCSS変数を適用
        this.applyThemeVariables(theme);
    }

    applyThemeVariables(theme) {
        const root = document.documentElement;
        
        if (theme === 'light') {
            root.style.colorScheme = 'light';
            // ライトモードの変数を設定
            root.style.setProperty('--primary', '#1976d2');
            root.style.setProperty('--primary-dark', '#1565c0');
            root.style.setProperty('--primary-light', '#42a5f5');
            root.style.setProperty('--accent', '#ff4081');
            root.style.setProperty('--background', '#fafafa');
            root.style.setProperty('--surface', '#ffffff');
            root.style.setProperty('--error', '#f44336');
            root.style.setProperty('--text-primary', 'rgba(0, 0, 0, 0.87)');
            root.style.setProperty('--text-secondary', 'rgba(0, 0, 0, 0.60)');
            root.style.setProperty('--text-disabled', 'rgba(0, 0, 0, 0.38)');
            root.style.setProperty('--divider', 'rgba(0, 0, 0, 0.12)');
            root.style.setProperty('--shadow-1', '0 2px 4px rgba(0,0,0,0.1)');
            root.style.setProperty('--shadow-2', '0 4px 8px rgba(0,0,0,0.12)');
            root.style.setProperty('--shadow-3', '0 8px 16px rgba(0,0,0,0.14)');
            root.style.setProperty('--tree-bg', '#f5f5f5');
            root.style.setProperty('--hover-bg', 'rgba(0, 0, 0, 0.04)');
            root.style.setProperty('--value-default', '#2e7d32');
            root.style.setProperty('--value-string', '#c62828');
            root.style.setProperty('--value-number', '#1565c0');
            root.style.setProperty('--value-boolean', '#6a1b9a');
            root.style.setProperty('--value-null', '#757575');
        } else {
            root.style.colorScheme = 'dark';
            // ダークモードの変数を設定（コントラスト改善版）
            root.style.setProperty('--primary', '#64b5f6');  // より明るく変更
            root.style.setProperty('--primary-dark', '#42a5f5');
            root.style.setProperty('--primary-light', '#90caf9');
            root.style.setProperty('--accent', '#ff4081');
            root.style.setProperty('--background', '#121212');
            root.style.setProperty('--surface', '#1e1e1e');
            root.style.setProperty('--error', '#cf6679');
            root.style.setProperty('--text-primary', 'rgba(255, 255, 255, 0.87)');
            root.style.setProperty('--text-secondary', 'rgba(255, 255, 255, 0.60)');
            root.style.setProperty('--text-disabled', 'rgba(255, 255, 255, 0.38)');
            root.style.setProperty('--divider', 'rgba(255, 255, 255, 0.12)');
            root.style.setProperty('--shadow-1', '0 2px 4px rgba(0,0,0,0.3)');
            root.style.setProperty('--shadow-2', '0 4px 8px rgba(0,0,0,0.4)');
            root.style.setProperty('--shadow-3', '0 8px 16px rgba(0,0,0,0.5)');
            root.style.setProperty('--tree-bg', '#2a2a2a');
            root.style.setProperty('--hover-bg', 'rgba(255, 255, 255, 0.08)');
            root.style.setProperty('--value-default', '#81c784');
            root.style.setProperty('--value-string', '#ef5350');
            root.style.setProperty('--value-number', '#64b5f6');
            root.style.setProperty('--value-boolean', '#ba68c8');
            root.style.setProperty('--value-null', '#bdbdbd');
        }
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
    }

    updateThemeIcon(theme) {
        const icon = document.querySelector('#themeToggle .material-icons');
        if (icon) {
            icon.textContent = theme === 'light' ? 'dark_mode' : 'light_mode';
        }
    }

    setCookie(name, value, days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = `expires=${date.toUTCString()}`;
        document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax`;
    }

    getCookie(name) {
        const nameEQ = `${name}=`;
        const cookies = document.cookie.split(';');

        for (let cookie of cookies) {
            cookie = cookie.trim();
            if (cookie.indexOf(nameEQ) === 0) {
                return cookie.substring(nameEQ.length);
            }
        }

        return null;
    }

    getTheme() {
        return this.currentTheme;
    }
}