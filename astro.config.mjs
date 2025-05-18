// astro.config.mjs
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { generatedTopics } from './starlight-generated-topics.js'; // Your generated topics

// Change this import from named to default
import starlightSidebarTopics from 'starlight-sidebar-topics'; // Use default import

export default defineConfig({
    routing: {
        prefixDefaultLocale: true,
    },
    integrations: [
        starlight({
            title: 'Experience Quality Coding',
            defaultLocale: 'en',
            locales: {
                en: { label: 'English', lang: 'en' },
                ja: { label: '日本語', lang: 'ja' },
            },
        
            plugins: [
                // Call the imported plugin as a function
                starlightSidebarTopics( // This line (52 in your error log) expects starlightSidebarTopics to be a function
                    generatedTopics,
                    {
                        // Plugin options here, if any
                    }
                ),
            ],
        }),
    ],
});