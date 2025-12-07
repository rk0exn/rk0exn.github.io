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

        this.overrideSystemTheme(theme);
    }

    overrideSystemTheme(theme) {
        const root = document.documentElement;

        if (theme === 'light') {
            root.style.colorScheme = 'light';
        } else {
            root.style.colorScheme = 'dark';
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