import './styles/main.css';
import './styles/stars.css';
import ThemeManager from './modules/themeManager';
import { showStarField, hideStarField } from './effects/starfield.js';

const themeManager = new ThemeManager();

let animationsManager = null;

function updateStarFieldVisibility() {
    if (document.documentElement.classList.contains('dark')) {
        showStarField();
    } else {
        hideStarField();
    }
}

const loadAnimations = () => {
    if (animationsManager) {
        return Promise.resolve(animationsManager);
    }

    return import('./modules/animations.js').then(module => {
        const AnimationsManager = module.default;
        animationsManager = new AnimationsManager();
        return animationsManager;
    }).catch(error => {
        console.error('Error loading animations module:', error);
        return null;
    });
};

function initializeWhenIdle() {
    const idleCallback = window.requestIdleCallback || ((cb) => setTimeout(cb, 1));

    idleCallback(() => {
        import('./modules/seo.js').then(module => {
            const SEO = module.default;
            new SEO();
        });

        const handleInteraction = () => {
            loadAnimations();
            ['scroll', 'click', 'keydown'].forEach(event => {
                window.removeEventListener(event, handleInteraction);
            });
        };

        ['scroll', 'click', 'keydown'].forEach(event => {
            window.addEventListener(event, handleInteraction, { passive: true });
        });
        setTimeout(handleInteraction, 3000);
    });
}

function initMobileMenu() {
    const btn = document.getElementById('mobileMenuBtn');
    const menu = document.getElementById('mobileMenu');
    if (!btn || !menu) return;

    btn.addEventListener('click', () => {
        menu.classList.toggle('hidden');
    });

    // Close on link click
    menu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            menu.classList.add('hidden');
        });
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onDocumentReady);
} else {
    onDocumentReady();
}

function onDocumentReady() {
    updateStarFieldVisibility();
    document.addEventListener('themeChanged', updateStarFieldVisibility);
    initMobileMenu();
    initializeWhenIdle();
}

window.addEventListener('load', () => {
    document.body.classList.add('page-transition', 'loaded');
});

if ('loading' in HTMLImageElement.prototype) {
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    lazyImages.forEach(img => {
        if (img.dataset.src) {
            img.src = img.dataset.src;
        }
    });
} else {
    import('./utils/lazyload-polyfill.js').catch(error =>
        console.warn('Could not load lazy loading polyfill:', error)
    );
}

window.addEventListener('beforeunload', () => {
    if (animationsManager && typeof animationsManager.cleanup === 'function') {
        animationsManager.cleanup();
    }
});
