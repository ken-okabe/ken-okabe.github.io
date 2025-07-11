// x-generate-docs.js
// Node.js script (ES Module format)
// Processes multilingual content from a single '_site' directory.
// Markdown files are expected to use :::lang-en / :::lang-ja blocks.
// Generates language-specific content in 'src/content/docs' and a unified sidebar configuration.

import fs from 'fs-extra';
import path from 'path';
import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import { toString as mdastToString } from 'mdast-util-to-string';

// --- Configuration ---
const CWD = process.cwd();

const LANG_EN = 'en';
const LANG_JA = 'ja';
const SUPPORTED_LANGS = [LANG_EN, LANG_JA];

const INPUT_BASE_DIR = path.join(CWD, '_site');
const CONTENT_OUTPUT_BASE_DIR = path.join(CWD, 'src/content/docs');
const SIDEBAR_CONFIG_FILE_NAME = 'starlight-generated-topics.js';

// --- Utility Functions ---
function stripNumericPrefix(name) {
    return name.replace(/^\d+-/, '');
}

async function getSortedDirEntries(dirPath) {
    if (!await fs.pathExists(dirPath)) return [];
    const entries = await fs.readdir(dirPath);
    return entries.sort();
}

// --- Core Parsing and Content Helpers ---

/**
 * Parses a string to find the H1 title.
 * @param {string} content - The markdown content string.
 * @returns {string|null} The H1 title text.
 */
function getH1FromString(content) {
    if (!content) return null;
    try {
        const tree = unified().use(remarkParse).parse(content);
        const firstH1Node = tree.children.find(node => node.type === 'heading' && node.depth === 1);
        return firstH1Node ? mdastToString(firstH1Node).trim() : null;
    } catch (error) {
        return null;
    }
}

/**
 * Parses a string to find the first paragraph after the H1.
 * @param {string} content - The markdown content string.
 * @returns {string|null} The description text.
 */
function getDescriptionFromString(content) {
    if (!content) return null;
    try {
        const tree = unified().use(remarkParse).parse(content);
        let h1Found = false;
        for (const node of tree.children) {
            if (node.type === 'heading' && node.depth === 1) {
                h1Found = true;
                continue;
            }
            if (h1Found && node.type === 'paragraph') {
                return mdastToString(node).trim().replace(/\n/g, ' ');
            }
        }
        return null;
    } catch (error) {
        return null;
    }
}

/**
 * Parses a file's content to extract language-specific blocks.
 * @param {string} fileContent - The full content of the file.
 * @param {string} filePath - The path to the file for error reporting.
 * @returns {{en: string|null, ja: string|null}}
 */
function parseMultiLangContent(fileContent, filePath) {
    const langBlockRegex = /:::lang-(en|ja)\s*\n([\s\S]*?):::/g;
    const parsedContent = { en: null, ja: null };
    let contentOutsideBlocks = fileContent;

    for (const match of fileContent.matchAll(langBlockRegex)) {
        const lang = match[1];
        const content = match[2].trim();
        if (lang === LANG_EN) parsedContent.en = content;
        if (lang === LANG_JA) parsedContent.ja = content;
        contentOutsideBlocks = contentOutsideBlocks.replace(match[0], '');
    }

    if (contentOutsideBlocks.trim() !== '') {
        throw new Error(`Error: Content found outside of language blocks in ${filePath}`);
    }

    return parsedContent;
}

/**
 * Applies fallback logic to language content.
 * @param {{en: string|null, ja: string|null}} parsedContent
 * @param {string} filePath - For error reporting.
 * @returns {{en: string, ja: string}}
 */
function resolveContentWithFallback(parsedContent, filePath) {
    const { en, ja } = parsedContent;
    if (en && ja) return { en, ja };
    if (en) return { en, ja: en };
    if (ja) return { en: ja, ja };
    throw new Error(`Error: No language blocks found in ${filePath}`);
}

// --- Sidebar Generation Helpers ---

async function getLabelsForTranslations(dirPath) {
    const labelFilePath = path.join(dirPath, '_label.md');
    if (!await fs.pathExists(labelFilePath)) {
        throw new Error(`Error: Missing _label.md for directory ${dirPath}`);
    }
    const fileContent = await fs.readFile(labelFilePath, 'utf-8');
    const { data: commonFrontmatter } = matter(fileContent);
    const parsedContent = parseMultiLangContent(matter(fileContent).content, labelFilePath);

    const rawLabels = {
        en: getH1FromString(parsedContent.en),
        ja: getH1FromString(parsedContent.ja),
    };

    if (!rawLabels.en && !rawLabels.ja) {
        throw new Error(`Error: No H1 title found in any language block in ${labelFilePath}`);
    }

    return resolveContentWithFallback(rawLabels, labelFilePath);
}


async function generateSidebarItemsForSection(sectionDirName, currentRelativePath) {
    const sidebarItems = [];
    const scanDir = path.join(INPUT_BASE_DIR, sectionDirName, currentRelativePath);
    const entries = await getSortedDirEntries(scanDir);

    for (const entryName of entries) {
        const itemPath = path.join(scanDir, entryName);
        const stat = await fs.stat(itemPath);
        const nextRelativePath = path.join(currentRelativePath, entryName).replace(/\\/g, '/');

        // Skip label files and the topic's root index file
        if (entryName === '_label.md' || (currentRelativePath === '' && entryName === 'index.md')) {
            continue;
        }

        if (stat.isDirectory()) {
             if (entryName === 'section-0') {
                const itemsFromSection0 = await generateSidebarItemsForSection(sectionDirName, nextRelativePath);
                sidebarItems.push(...itemsFromSection0);
            } else {
                const translations = await getLabelsForTranslations(itemPath);
                const nestedItems = await generateSidebarItemsForSection(sectionDirName, nextRelativePath);
                if (nestedItems.length > 0) {
                     sidebarItems.push({
                        label: "FALLBACK",
                        translations,
                        items: nestedItems,
                    });
                }
            }
        } else if (entryName.endsWith('.md')) {
            const fileContent = await fs.readFile(itemPath, 'utf-8');
            const parsedContent = parseMultiLangContent(matter(fileContent).content, itemPath);
            const rawLabels = {
                en: getH1FromString(parsedContent.en),
                ja: getH1FromString(parsedContent.ja)
            };
            const translations = resolveContentWithFallback(rawLabels, itemPath);
            const link = path.join(stripNumericPrefix(sectionDirName), nextRelativePath).replace(/\\/g, '/').replace(/\.md$/, '');
            
            sidebarItems.push({
                label: "FALLBACK",
                translations,
                link,
            });
        }
    }
    return sidebarItems;
}

async function generateSidebarFile(topicsArray) {
    const sidebarConfigPath = path.join(CWD, SIDEBAR_CONFIG_FILE_NAME);
    const content = `// This file is auto-generated by the x-generate-docs.js script.
export const generatedTopics = ${JSON.stringify(topicsArray, null, 2)};
`;
    await fs.writeFile(sidebarConfigPath, content);
    console.log(`Generated ${SIDEBAR_CONFIG_FILE_NAME} successfully.`);
}

// --- Main Execution ---

async function main() {
    console.log("Starting documentation generation...");
    
    // 1. Clean and prepare output directories
    await fs.emptyDir(CONTENT_OUTPUT_BASE_DIR);
    console.log("Cleaned output directories.");

    // 2. Process all markdown files
    const allFiles = [];
    async function findMdFiles(dir) {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                await findMdFiles(fullPath);
            } else if (entry.isFile() && entry.name.endsWith('.md') && entry.name !== '_label.md') {
                allFiles.push(fullPath);
            }
        }
    }
    await findMdFiles(INPUT_BASE_DIR);

    for (const filePath of allFiles) {
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const { data: commonFrontmatter, content: rawContent } = matter(fileContent);

        const parsedLangContent = parseMultiLangContent(rawContent, filePath);
        const finalLangContent = resolveContentWithFallback(parsedLangContent, filePath);
        
        for (const lang of SUPPORTED_LANGS) {
            const content = finalLangContent[lang];
            const title = getH1FromString(content);
            const description = getDescriptionFromString(content);

            if (!title) {
                console.warn(`Warning: No H1 title found for lang '${lang}' in ${filePath}. Skipping frontmatter title.`);
            }

            // Remove H1 from content
            const contentWithoutH1 = content.replace(/^#\s.*$/m, '').trim();
            
            const langFrontmatter = {
                title: title || '',
                description: description || '',
            };

            const finalFrontmatter = { ...commonFrontmatter, ...langFrontmatter };
            const newFileContent = matter.stringify(contentWithoutH1, finalFrontmatter);

            const relativePath = path.relative(INPUT_BASE_DIR, filePath);
            const strippedPath = stripNumericPrefix(relativePath);
            const outputFilePath = path.join(CONTENT_OUTPUT_BASE_DIR, lang, strippedPath);

            await fs.ensureDir(path.dirname(outputFilePath));
            await fs.writeFile(outputFilePath, newFileContent);
        }
    }
    console.log(`Processed ${allFiles.length} content files for ${SUPPORTED_LANGS.length} languages.`);

    // 3. Generate Sidebar Configuration
    console.log("Building sidebar configuration...");
    const topicsArray = [];
    const topLevelEntries = await getSortedDirEntries(INPUT_BASE_DIR);

    for (const entryName of topLevelEntries) {
        const entryPath = path.join(INPUT_BASE_DIR, entryName);
        const stat = await fs.stat(entryPath);
        if (!stat.isDirectory()) continue;

        const sectionName = entryName;
        const indexMdPath = path.join(entryPath, 'index.md');
        
        if (!await fs.pathExists(indexMdPath)) {
            console.warn(`Warning: Topic directory ${sectionName} is missing index.md. Skipping.`);
            continue;
        }

        // Get topic labels, icon, and badge from the topic's index.md
        const indexMdContent = await fs.readFile(indexMdPath, 'utf-8');
        const { data: indexFrontmatter, content: indexRawContent } = matter(indexMdContent);
        const parsedIndexContent = parseMultiLangContent(indexRawContent, indexMdPath);
        const topicTitles = {
            en: getH1FromString(parsedIndexContent.en),
            ja: getH1FromString(parsedIndexContent.ja),
        };
        const topicTranslations = resolveContentWithFallback(topicTitles, indexMdPath);
        
        // Generate sidebar items for the topic
        let sectionItems = await generateSidebarItemsForSection(sectionName, '');
        let firstRealGroupInSectionProcessed = false;
        sectionItems = sectionItems.map(item => {
            if (item.items && Array.isArray(item.items)) {
                item.collapsed = firstRealGroupInSectionProcessed;
                firstRealGroupInSectionProcessed = true;
            }
            return item;
        });

        const topicObject = {
            label: topicTranslations,
            link: `/${stripNumericPrefix(sectionName)}/`,
            items: sectionItems,
        };
        if (indexFrontmatter.icon) topicObject.icon = indexFrontmatter.icon;
        if (indexFrontmatter.badge) topicObject.badge = indexFrontmatter.badge;

        topicsArray.push(topicObject);
    }
    
    await generateSidebarFile(topicsArray);
    console.log("Multilingual documentation generation finished successfully!");
}

(async () => {
    try {
        await main();
    } catch (error) {
        console.error(`\n🛑 FATAL ERROR: ${error.message}`);
        process.exit(1);
    }
})();