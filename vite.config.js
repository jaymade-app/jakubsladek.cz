import { defineConfig } from 'vite'
import viteCompression from 'vite-plugin-compression'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'
import i18nPlugin from './vite-plugin-i18n.js'

export default defineConfig({
  server: {
    port: 3000
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    minify: 'esbuild',
    cssMinify: true,
    sourcemap: process.env.NODE_ENV === 'development',
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      input: {
        main: './index.html'
      },
      output: {
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('gsap')) return 'vendor_gsap';
            return 'vendor';
          }
          if (id.includes('src/modules/animations.js')) {
            return 'animations';
          }
          if (id.includes('src/effects/')) {
            return 'effects';
          }
          return null;
        }
      }
    },
    assetsInlineLimit: 2048,
  },
  optimizeDeps: {
    include: ['gsap'],
  },
  publicDir: 'public',
  plugins: [
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 1024,
      deleteOriginFile: false,
    }),
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 1024,
      deleteOriginFile: false,
    }),
    ViteImageOptimizer({
      exclude: /^(js-|logo)/,
      png: {
        quality: 75,
      },
      jpeg: {
        quality: 75,
        progressive: true,
      },
      jpg: {
        quality: 75,
        progressive: true,
      },
      webp: {
        quality: 75,
        effort: 6,
        nearLossless: false,
      },
      svg: {
        plugins: [
          { name: 'removeViewBox', active: false },
          { name: 'removeEmptyAttrs', active: false },
          { name: 'cleanupIds', active: true },
          { name: 'removeUselessStrokeAndFill', active: true },
        ],
      },
    }),
    i18nPlugin(),
  ],
})