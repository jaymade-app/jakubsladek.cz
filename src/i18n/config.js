/**
 * i18n Configuration for jakubsladek.cz
 * Add new languages by extending the arrays/maps below.
 */

export const i18nConfig = {
    defaultLocale: 'en',
    locales: ['en', 'cs'],

    // URL path prefixes — default locale has no prefix (served at root)
    pathMap: {
        en: '',
        cs: '/cs',
    },

    // <html lang="..."> values
    langMap: {
        en: 'en',
        cs: 'cs',
    },

    // <meta property="og:locale"> values
    ogLocaleMap: {
        en: 'en_US',
        cs: 'cs_CZ',
    },

    // Domain — used for canonical URLs and hreflang
    domain: 'https://jakubsladek.cz',
};
