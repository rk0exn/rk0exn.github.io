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
        
        // 一括設定用の変数マップ
        const themes = {
            light: {
                '--primary': '#1976d2',
                '--primary-dark': '#1565c0',
                '--primary-light': '#42a5f5',
                '--accent': '#ff4081',
                '--background': '#fafafa',
                '--surface': '#ffffff',
                '--error': '#f44336',
                '--text-primary': 'rgba(0, 0, 0, 0.87)',
                '--text-secondary': 'rgba(0, 0, 0, 0.60)',
                '--text-disabled': 'rgba(0, 0, 0, 0.38)',
                '--divider': 'rgba(0, 0, 0, 0.12)',
                '--shadow-1': '0 2px 4px rgba(0,0,0,0.1)',
                '--shadow-2': '0 4px 8px rgba(0,0,0,0.12)',
                '--shadow-3': '0 8px 16px rgba(0,0,0,0.14)',
                '--tree-bg': '#f5f5f5',
                '--hover-bg': 'rgba(0, 0, 0, 0.04)',
                '--value-default': '#2e7d32',
                '--value-string': '#c62828',
                '--value-number': '#1565c0',
                '--value-boolean': '#6a1b9a',
                '--value-null': '#757575'
            },
            dark: {
                '--primary': '#64b5f6',
                '--primary-dark': '#42a5f5',
                '--primary-light': '#90caf9',
                '--accent': '#ff4081',
                '--background': '#121212',
                '--surface': '#1e1e1e',
                '--error': '#cf6679',
                '--text-primary': 'rgba(255, 255, 255, 0.87)',
                '--text-secondary': 'rgba(255, 255, 255, 0.60)',
                '--text-disabled': 'rgba(255, 255, 255, 0.38)',
                '--divider': 'rgba(255, 255, 255, 0.12)',
                '--shadow-1': '0 2px 4px rgba(0,0,0,0.3)',
                '--shadow-2': '0 4px 8px rgba(0,0,0,0.4)',
                '--shadow-3': '0 8px 16px rgba(0,0,0,0.5)',
                '--tree-bg': '#2a2a2a',
                '--hover-bg': 'rgba(255, 255, 255, 0.08)',
                '--value-default': '#81c784',
                '--value-string': '#ef5350',
                '--value-number': '#64b5f6',
                '--value-boolean': '#ba68c8',
                '--value-null': '#bdbdbd'
            }
        };

        // color-schemeの設定
        root.style.colorScheme = theme;
        
        // CSS変数を一括設定（requestAnimationFrameで最適化）
        requestAnimationFrame(() => {
            const vars = themes[theme];
            for (const [property, value] of Object.entries(vars)) {
                root.style.setProperty(property, value);
            }
        });
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