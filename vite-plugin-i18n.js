import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { i18nConfig } from './src/i18n/config.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Load translation JSON for a given locale.
 */
function loadTranslations(locale) {
    const filePath = resolve(__dirname, `src/i18n/${locale}.json`);
    return JSON.parse(readFileSync(filePath, 'utf-8'));
}

/**
 * Replace data-i18n="key" → sets element text content.
 * Handles the pattern: <element data-i18n="key">default text</element>
 */
function replaceTextContent(html, translations) {
    return html.replace(
        /(<[^>]+\s)data-i18n="([^"]+)"([^>]*>)([\s\S]*?)(<\/[^>]+>)/g,
        (match, beforeAttr, key, afterAttr, _content, closingTag) => {
            const value = translations[key];
            if (value === undefined) return match;
            return `${beforeAttr}data-i18n="${key}"${afterAttr}${value}${closingTag}`;
        }
    );
}

/**
 * Replace data-i18n-content="key" → sets content="..." attribute (for meta tags).
 */
function replaceContentAttr(html, translations) {
    return html.replace(
        /data-i18n-content="([^"]+)"(\s+)content="([^"]*)"/g,
        (match, key, space, _oldContent) => {
            const value = translations[key];
            if (value === undefined) return match;
            const escaped = value.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
            return `data-i18n-content="${key}"${space}content="${escaped}"`;
        }
    );
}

/**
 * Replace data-i18n-data-text="key" → sets data-text="..." attribute.
 */
function replaceDataTextAttr(html, translations) {
    return html.replace(
        /data-i18n-data-text="([^"]+)"(\s+[\s\S]*?)data-text="([^"]*)"/g,
        (match, key, middle, _oldText) => {
            const value = translations[key];
            if (value === undefined) return match;
            const escaped = value.replace(/"/g, '&quot;');
            return `data-i18n-data-text="${key}"${middle}data-text="${escaped}"`;
        }
    );
}

/**
 * Replace data-i18n-aria-label="key" → sets aria-label="..." attribute.
 */
function replaceAriaLabelAttr(html, translations) {
    return html.replace(
        /data-i18n-aria-label="([^"]+)"([^>]*?)aria-label="([^"]*)"/g,
        (match, key, middle, _oldLabel) => {
            const value = translations[key];
            if (value === undefined) return match;
            const escaped = value.replace(/"/g, '&quot;');
            return `data-i18n-aria-label="${key}"${middle}aria-label="${escaped}"`;
        }
    );
}

/**
 * Replace data-i18n-href="key" → sets href="..." attribute.
 * Handles both orders: href before or after data-i18n-href.
 */
function replaceHrefAttr(html, translations) {
    // Order 1: data-i18n-href comes before href
    html = html.replace(
        /data-i18n-href="([^"]+)"([^>]*?)href="([^"]*)"/g,
        (match, key, middle, _oldHref) => {
            const value = translations[key];
            if (value === undefined) return match;
            return `data-i18n-href="${key}"${middle}href="${value}"`;
        }
    );
    // Order 2: href comes before data-i18n-href
    html = html.replace(
        /href="([^"]*)"([^>]*?)data-i18n-href="([^"]+)"/g,
        (match, oldHref, middle, key) => {
            const value = translations[key];
            if (value === undefined) return match;
            return `href="${value}"${middle}data-i18n-href="${key}"`;
        }
    );
    return html;
}

/**
 * Set <html lang="..."> attribute.
 */
function setHtmlLang(html, locale) {
    const lang = i18nConfig.langMap[locale] || locale;
    return html.replace(/<html\s+lang="[^"]*"/, `<html lang="${lang}"`);
}

/**
 * Set <meta property="og:locale" content="...">
 */
function setOgLocale(html, locale) {
    const ogLocale = i18nConfig.ogLocaleMap[locale] || locale;
    return html.replace(
        /(<meta\s+property="og:locale"\s+content=")[^"]*(")/,
        `$1${ogLocale}$2`
    );
}

/**
 * Update <link rel="canonical"> URL.
 */
function setCanonicalUrl(html, locale) {
    const path = i18nConfig.pathMap[locale];
    const canonicalUrl = `${i18nConfig.domain}${path}/`;
    return html.replace(
        /(<link\s+rel="canonical"\s+href=")[^"]*(")/,
        `$1${canonicalUrl}$2`
    );
}

/**
 * Update og:url and twitter:url meta tags.
 */
function setMetaUrls(html, locale) {
    const path = i18nConfig.pathMap[locale];
    const url = `${i18nConfig.domain}${path}/`;
    html = html.replace(
        /(<meta\s+property="og:url"\s+content=")[^"]*(")/,
        `$1${url}$2`
    );
    html = html.replace(
        /(<meta\s+property="twitter:url"\s+content=")[^"]*(")/,
        `$1${url}$2`
    );
    return html;
}

/**
 * Inject hreflang <link> tags into <head>.
 */
function injectHreflangTags(html) {
    const tags = i18nConfig.locales.map(loc => {
        const path = i18nConfig.pathMap[loc];
        const url = `${i18nConfig.domain}${path}/`;
        const lang = i18nConfig.langMap[loc];
        return `    <link rel="alternate" hreflang="${lang}" href="${url}">`;
    });

    // Add x-default pointing to the default locale
    const defaultPath = i18nConfig.pathMap[i18nConfig.defaultLocale];
    const defaultUrl = `${i18nConfig.domain}${defaultPath}/`;
    tags.push(`    <link rel="alternate" hreflang="x-default" href="${defaultUrl}">`);

    const hreflangBlock = tags.join('\n');

    // Insert before </head>
    return html.replace('</head>', `${hreflangBlock}\n</head>`);
}

/**
 * Inject <script id="i18n-seo-data"> with translated SEO titles.
 */
function injectSeoData(html, translations) {
    const seoData = {
        title_about: translations['seo.title_about'] || '',
        title_projects: translations['seo.title_projects'] || '',
        title_contact: translations['seo.title_contact'] || '',
    };

    const script = `    <script id="i18n-seo-data" type="application/json">${JSON.stringify(seoData)}</script>`;

    // Insert before </head>
    return html.replace('</head>', `${script}\n</head>`);
}

/**
 * Update structured data (JSON-LD) with translated fields.
 */
function updateStructuredData(html, translations) {
    return html.replace(
        /(<script\s+type="application\/ld\+json">)([\s\S]*?)(<\/script>)/,
        (match, openTag, jsonContent, closeTag) => {
            try {
                const data = JSON.parse(jsonContent);

                if (translations['schema.jobTitle']) {
                    data.jobTitle = translations['schema.jobTitle'];
                }
                if (translations['schema.description']) {
                    data.description = translations['schema.description'];
                }
                if (translations['schema.worksFor'] && data.worksFor) {
                    data.worksFor.name = translations['schema.worksFor'];
                }

                return `${openTag}\n    ${JSON.stringify(data, null, 6).split('\n').join('\n    ')}\n    ${closeTag}`;
            } catch {
                return match;
            }
        }
    );
}

/**
 * Remove all data-i18n* attributes from production HTML.
 */
function removeI18nMarkers(html) {
    return html.replace(/\s*data-i18n(?:-[a-z-]+)?="[^"]*"/g, '');
}

/**
 * Generate multilingual sitemap.xml content.
 */
function generateSitemap() {
    const today = new Date().toISOString().split('T')[0];

    const urls = i18nConfig.locales.map(locale => {
        const path = i18nConfig.pathMap[locale];
        const url = `${i18nConfig.domain}${path}/`;
        const isDefault = locale === i18nConfig.defaultLocale;

        const alternates = i18nConfig.locales.map(altLocale => {
            const altPath = i18nConfig.pathMap[altLocale];
            const altUrl = `${i18nConfig.domain}${altPath}/`;
            const altLang = i18nConfig.langMap[altLocale];
            return `    <xhtml:link rel="alternate" hreflang="${altLang}" href="${altUrl}" />`;
        });

        const defaultPath = i18nConfig.pathMap[i18nConfig.defaultLocale];
        const defaultUrl = `${i18nConfig.domain}${defaultPath}/`;
        alternates.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${defaultUrl}" />`);

        return `  <url>
    <loc>${url}</loc>
${alternates.join('\n')}
    <lastmod>${today}</lastmod>
    <priority>${isDefault ? '1.0' : '0.9'}</priority>
  </url>`;
    });

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>
`;
}

/**
 * Process HTML for a specific locale.
 */
function processHtml(html, locale) {
    const translations = loadTranslations(locale);

    // Order matters: replace attributes before text content
    html = replaceContentAttr(html, translations);
    html = replaceDataTextAttr(html, translations);
    html = replaceAriaLabelAttr(html, translations);
    html = replaceHrefAttr(html, translations);
    html = replaceTextContent(html, translations);

    // Set locale-specific metadata
    html = setHtmlLang(html, locale);
    html = setOgLocale(html, locale);
    html = setCanonicalUrl(html, locale);
    html = setMetaUrls(html, locale);

    // Inject SEO helpers
    html = injectHreflangTags(html);
    html = injectSeoData(html, translations);

    // Update structured data
    html = updateStructuredData(html, translations);

    // Clean up markers
    html = removeI18nMarkers(html);

    return html;
}

/**
 * Vite plugin for build-time i18n.
 */
export default function i18nPlugin() {
    return {
        name: 'vite-plugin-i18n',
        enforce: 'post',
        apply: 'build',

        generateBundle(_options, bundle) {
            // Find the HTML asset in the bundle
            const htmlFileName = Object.keys(bundle).find(name => name.endsWith('.html'));
            if (!htmlFileName) return;

            const htmlAsset = bundle[htmlFileName];
            const originalHtml = htmlAsset.source;

            // Process default locale (overwrites the original index.html)
            htmlAsset.source = processHtml(originalHtml, i18nConfig.defaultLocale);

            // Process non-default locales (emit as new files)
            for (const locale of i18nConfig.locales) {
                if (locale === i18nConfig.defaultLocale) continue;

                const processedHtml = processHtml(originalHtml, locale);
                const path = i18nConfig.pathMap[locale].replace(/^\//, '');

                this.emitFile({
                    type: 'asset',
                    fileName: `${path}/index.html`,
                    source: processedHtml,
                });
            }

            // Generate and emit sitemap
            this.emitFile({
                type: 'asset',
                fileName: 'sitemap.xml',
                source: generateSitemap(),
            });
        },
    };
}
