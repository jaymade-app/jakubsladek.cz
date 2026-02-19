// Theme management module

class ThemeManager {
    constructor() {
        this.toggleButtons = [
            document.getElementById('themeToggle'),
            document.getElementById('mobileThemeToggle'),
        ].filter(Boolean);

        this.boundToggleTheme = this.toggleTheme.bind(this);

        this.init();
    }

    init() {
        this.setInitialTheme();

        this.toggleButtons.forEach(btn => {
            btn.addEventListener('click', this.boundToggleTheme);
        });

        document.documentElement.classList.add('theme-transition');
    }

    _updateIcons(isDark) {
        this.toggleButtons.forEach(btn => {
            const light = btn.querySelector('.theme-toggle-light');
            const dark = btn.querySelector('.theme-toggle-dark');
            if (!light || !dark) return;

            if (isDark) {
                light.classList.add('hidden');
                dark.classList.remove('hidden');
            } else {
                dark.classList.add('hidden');
                light.classList.remove('hidden');
            }
        });
    }

    setInitialTheme() {
        const isDarkMode = localStorage.theme === 'dark' ||
            (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);

        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        this._updateIcons(isDarkMode);
    }

    toggleTheme() {
        const isDark = document.documentElement.classList.toggle('dark');
        localStorage.theme = isDark ? 'dark' : 'light';

        this._updateIcons(isDark);

        document.dispatchEvent(new CustomEvent('themeChanged', { detail: { isDark } }));
    }

    cleanup() {
        this.toggleButtons.forEach(btn => {
            btn.removeEventListener('click', this.boundToggleTheme);
        });
    }
}

export default ThemeManager;