// astro.config.mjs
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

import { generatedSidebar } from './starlight-generated-sidebar.js';

export default defineConfig({
	integrations: [
		starlight({
			title: 'Experience Quality Code',
			defaultLocale: 'en',
			locales: {
				en: { label: 'English', lang: 'en' },
				ja: { label: '日本語', lang: 'ja' },
			},

			sidebar: generatedSidebar,
		}),
	],
	routing: {
		prefixDefaultLocale: true
	},
});