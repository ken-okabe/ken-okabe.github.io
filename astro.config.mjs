// astro.config.mjs
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { generatedTopics } from './starlight-generated-topics.js';

// Change this import from named to default
import starlightSidebarTopics from 'starlight-sidebar-topics';

// Import MathJax plugins
import remarkMath from 'remark-math';
import rehypeMathjax from 'rehype-mathjax';

export default defineConfig({
  // GitHub Pages configuration
  site: 'https://ken-okabe.github.io',
  base: '/eqc-beta/',
  // Existing routing configuration
  routing: {
    prefixDefaultLocale: true,
  },
  integrations: [
    starlight({
      title: 'Experience Quality Coding',
      defaultLocale: 'en',
      locales: {
        en: { label: 'English', lang: 'en' },
        ja: { label: '日本語', lang: 'ja' }, // Label for language picker can be in Japanese
      },
      plugins: [
        // Call the imported plugin as a function
        starlightSidebarTopics(
          generatedTopics,
          {
            // Plugin options here, if any
          }
        ),
      ],
    }),
  ],
  // Global Markdown configuration for Astro
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [
      [rehypeMathjax, {
        // Options for rehype-mathjax can be added here if needed
        // tex: {
        //   packages: {'[+]': ['ams', 'newcommand']},
        // },
        // svg: {
        //   fontCache: 'global',
        // }
      }]
    ],
    // If you were using Shiki for syntax highlighting,
    // its configuration would also be under this markdown object
    // shikiConfig: {
    //   theme: 'dracula',
    //   wrap: true,
    // },
  },
});
