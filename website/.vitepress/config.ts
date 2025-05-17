import { defineConfig } from 'vitepress'
import llmstxt from 'vitepress-plugin-llms'

export default defineConfig({
  lang: 'en-US',
  title: 'ast-grep',
  description: 'Not actual site.',
  head: [
  ],
  outDir: './dist',
  // appearance: false,
  lastUpdated: true,
  vite: {
    plugins: [llmstxt()],
    build: {
      target: 'es2020',
    },
    optimizeDeps: {
      esbuildOptions: {
        target: 'es2020',
      },
    },
  },
  themeConfig: {
    logo: 'logo.svg',
    nav: [
      { text: 'Playground', link: '/playground.html' },
    ],
    socialLinks: [
    ],
    sidebar: {
      '/': [
        {
          text: 'Contributing',
          items: [
            { text: 'Guide', link: '/contributing/how-to.html' },
            { text: 'Development', link: '/contributing/development.html' },
            { text: 'Add New Language', link: '/contributing/add-lang.html' },
          ],
          collapsed: true,
        },
        {
          text: 'Links',
          items: [
            { text: 'Playground', link: '/playground.html' },
          ],
          collapsed: true,
        },
      ],
    },
    footer: {
      message: 'Made with ❤️  with Rust',
      copyright: 'Copyright © 2022-present Herrington Darkholme',
    },
    search: {
      provider: 'local',
    },
  },
  sitemap: {
    hostname: 'https://radha-ai-products.github.io/',
  },
})