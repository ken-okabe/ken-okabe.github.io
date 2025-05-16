// x-generate-docs.js
// Node.js script (ES Module format)
// Processes content for 'en' and 'ja' languages.
// Generates a single sidebar configuration file (starlight-generated-sidebar.js)
// with 'translations' for labels, based on '_book-en' and '_book-ja' content.

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
const PRIMARY_STRUCTURE_LANG = LANG_EN; // Use 'en' structure as the master for sidebar

const CONTENT_OUTPUT_BASE_DIR = path.join(CWD, `src/content/docs`);
const SIDEBAR_CONFIG_FILE_NAME = `starlight-generated-sidebar.js`; // Single output file in CWD

// --- Helper Functions ---
async function getH1TitleFromFile(filePath) {
    if (!await fs.pathExists(filePath)) return null;
    try {
        const content = await fs.readFile(filePath, 'utf-8');
        const tree = unified().use(remarkParse).parse(content);
        const firstH1Node = tree.children.find(node => node.type === 'heading' && node.depth === 1);
        return firstH1Node ? mdastToString(firstH1Node).trim() : null;
    } catch (error) {
        // console.warn(`Warning: Could not parse H1 title from ${filePath}, returning null.`, error.message);
        return null;
    }
}

async function getDescriptionFromFile(filePath) {
    if (!await fs.pathExists(filePath)) return null;
    try {
        const content = await fs.readFile(filePath, 'utf-8');
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
        // console.warn(`Warning: Could not parse description from ${filePath}, returning null.`, error.message);
        return null;
    }
}

async function getSortedDirEntries(dirPath) {
    try {
        if (!await fs.pathExists(dirPath)) {
            return [];
        }
        const entries = await fs.readdir(dirPath);
        return entries.sort();
    } catch (error) {
        if (error.code === 'ENOENT') return [];
        console.error(`Error reading directory ${dirPath}:`, error);
        throw error;
    }
}

async function processAndCopyMarkdownFile(inputFilePath, outputFilePath, langForFrontmatter) {
    const originalContent = await fs.readFile(inputFilePath, 'utf-8');
    const title = await getH1TitleFromFile(inputFilePath); // Title from its own language version

    const description = await getDescriptionFromFile(inputFilePath);
    const frontmatter = {
        title: title || '', // Use H1 or empty string if not found
        description: description || '',
    };

    let contentWithoutH1 = originalContent;
    if (title) { // Only attempt to remove H1 if a title was found
        try {
            const tree = unified().use(remarkParse).parse(originalContent);
            const firstH1Node = tree.children.find(node => node.type === 'heading' && node.depth === 1);
            if (firstH1Node && firstH1Node.position) {
                const startOffset = firstH1Node.position.start.offset;
                const endOffset = firstH1Node.position.end.offset;
                let nextContentStartOffset = endOffset;
                while (nextContentStartOffset < originalContent.length && (originalContent[nextContentStartOffset] === '\n' || originalContent[nextContentStartOffset] === '\r')) {
                    nextContentStartOffset++;
                }
                contentWithoutH1 = originalContent.substring(0, startOffset) + originalContent.substring(nextContentStartOffset);
            } else if (firstH1Node) { // Fallback if position data is not available
                const h1Regex = new RegExp(`^#\\s*${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\s*\\r?\\n)?`, 'm');
                contentWithoutH1 = originalContent.replace(h1Regex, '');
            }
        } catch (error) {
            console.warn(`Warning: Failed to remove H1 from ${inputFilePath}. Content might show duplicate titles. Error: ${error.message}`);
        }
    }
    const newFileContent = matter.stringify(contentWithoutH1, frontmatter);
    await fs.ensureDir(path.dirname(outputFilePath));
    await fs.writeFile(outputFilePath, newFileContent);
}


async function getLabelsForEntry(relativePathFromBookRoot, entryName, isDir) {
    const labels = {};
    // Get English label (primary/fallback)
    const enBookDir = path.join(CWD, `_book-${LANG_EN}`);
    const enItemPath = path.join(enBookDir, relativePathFromBookRoot, entryName);
    let enLabel;
    if (isDir) {
        enLabel = await getH1TitleFromFile(path.join(enItemPath, '_label.md'));
        if (!enLabel) enLabel = entryName; // Fallback to directory name for English
    } else { // is a file
        enLabel = await getH1TitleFromFile(enItemPath);
        if (!enLabel) enLabel = entryName.replace(/\.md$/, ''); // Fallback to filename for English
    }
    labels[LANG_EN] = enLabel;

    // Get Japanese label
    const jaBookDir = path.join(CWD, `_book-${LANG_JA}`);
    const jaItemPath = path.join(jaBookDir, relativePathFromBookRoot, entryName);
    let jaLabel;
    if (isDir) {
        jaLabel = await getH1TitleFromFile(path.join(jaItemPath, '_label.md'));
    } else { // is a file
        jaLabel = await getH1TitleFromFile(jaItemPath);
    }
    if (jaLabel) {
        labels[LANG_JA] = jaLabel;
    }
    // If jaLabel is not found, the 'ja' key will be omitted from translations.
    // Starlight will then fall back to the top-level 'label' (which is the English label).

    return labels; // { en: "English Label", ja: "日本語ラベル" (or undefined) }
}


async function processDirectoryRecursiveForSidebar(currentRelativePathFromBookRoot) {
    const sidebarItems = [];
    const primaryLangScanDir = path.join(CWD, `_book-${PRIMARY_STRUCTURE_LANG}`, currentRelativePathFromBookRoot);
    const entries = await getSortedDirEntries(primaryLangScanDir);

    for (const entryName of entries) {
        if (entryName === '_label.md') {
            continue;
        }

        const itemPathInPrimaryBook = path.join(primaryLangScanDir, entryName);
        // Ensure file/dir actually exists in the primary language structure before proceeding
        if (!await fs.pathExists(itemPathInPrimaryBook)) continue;

        const stat = await fs.stat(itemPathInPrimaryBook);
        const nextRelativePathFromBookRoot = path.join(currentRelativePathFromBookRoot, entryName).replace(/\\/g, '/');

        if (stat.isDirectory()) {
            const allLabels = await getLabelsForEntry(currentRelativePathFromBookRoot, entryName, true);

            if (entryName === 'section-0') {
                const itemsFromSection0 = await processDirectoryRecursiveForSidebar(nextRelativePathFromBookRoot);
                sidebarItems.push(...itemsFromSection0);
            } else {
                const nestedItems = await processDirectoryRecursiveForSidebar(nextRelativePathFromBookRoot);
                if (nestedItems.length > 0) {
                    sidebarItems.push({
                        label: allLabels[PRIMARY_STRUCTURE_LANG], // Fallback label is primary lang's label
                        translations: allLabels,
                        items: nestedItems,
                    });
                }
            }
        } else if (entryName.endsWith('.md')) {
            const allLabels = await getLabelsForEntry(currentRelativePathFromBookRoot, entryName, false);

            sidebarItems.push({
                label: allLabels[PRIMARY_STRUCTURE_LANG],
                translations: allLabels,
                link: nextRelativePathFromBookRoot.replace(/\.md$/, ''),
            });
        }
    }
    return sidebarItems;
}

async function generateSidebarFile(sidebarTree) {
    const sidebarConfigPath = path.join(CWD, SIDEBAR_CONFIG_FILE_NAME);
    const langListForComment = SUPPORTED_LANGS.join(', ');
    const content = `// This file is auto-generated by the x-generate-docs.js script.
// Sidebar structure is based on '${PRIMARY_STRUCTURE_LANG}' content (_book-${PRIMARY_STRUCTURE_LANG}).
// Translations for labels are sourced from _book-${LANG_EN} and _book-${LANG_JA}.
// If a translation is missing for a language, Starlight will use the 'label' field (which is the ${PRIMARY_STRUCTURE_LANG} label).

export const generatedSidebar = ${JSON.stringify(sidebarTree, null, 2)};
`;
    try {
        await fs.writeFile(sidebarConfigPath, content);
        console.log(`Generated ${SIDEBAR_CONFIG_FILE_NAME} successfully with translations for [${langListForComment}].`);
    } catch (error) {
        console.error(`Error writing ${SIDEBAR_CONFIG_FILE_NAME}:`, error);
        throw error;
    }
}

// --- Main Execution ---
async function main() {
    console.log(`Processing content for languages: ${SUPPORTED_LANGS.join(', ')}.`);
    console.log(`Sidebar structure will be based on: ${PRIMARY_STRUCTURE_LANG} (_book-${PRIMARY_STRUCTURE_LANG}).`);
    console.log(`Sidebar configuration output file: ${SIDEBAR_CONFIG_FILE_NAME}`);

    // 1. Process and copy content for all supported languages
    for (const lang of SUPPORTED_LANGS) {
        const langBookDir = path.join(CWD, `_book-${lang}`);
        const langContentOutputDir = path.join(CONTENT_OUTPUT_BASE_DIR, lang);

        if (!await fs.pathExists(langBookDir)) {
            console.warn(`Warning: Input directory for language '${lang}' not found: ${langBookDir}. Skipping content processing for this language.`);
            continue; // Skip if _book-{lang} directory doesn't exist
        }

        if (await fs.pathExists(langContentOutputDir)) {
            console.log(`Cleaning existing content output directory for ${lang}: ${langContentOutputDir}`);
            await fs.remove(langContentOutputDir);
        }
        await fs.ensureDir(langContentOutputDir);

        console.log(`Processing content for ${lang} from ${langBookDir} to ${langContentOutputDir}...`);

        async function copyAndProcessDir(inputDir, outputDir) {
            const entries = await getSortedDirEntries(inputDir);
            for (const entryName of entries) {
                if (entryName === '_label.md') continue;

                const currentInputPath = path.join(inputDir, entryName);
                // Skip if input path doesn't exist (e.g. sparse ja directory)
                if (!await fs.pathExists(currentInputPath)) continue;

                const currentOutputPath = path.join(outputDir, entryName);
                const stat = await fs.stat(currentInputPath);

                if (stat.isDirectory()) {
                    await fs.ensureDir(currentOutputPath);
                    await copyAndProcessDir(currentInputPath, currentOutputPath);
                } else if (entryName.endsWith('.md')) {
                    await processAndCopyMarkdownFile(currentInputPath, currentOutputPath, lang);
                }
            }
        }
        await copyAndProcessDir(langBookDir, langContentOutputDir);
        console.log(`Content for ${lang} processed.`);
    }

    // 2. Build the sidebar structure (once, based on PRIMARY_LANG, with translations)
    console.log(`Building sidebar structure based on ${PRIMARY_STRUCTURE_LANG} and collecting translations...`);
    const primaryBookDirExists = await fs.pathExists(path.join(CWD, `_book-${PRIMARY_STRUCTURE_LANG}`));
    if (!primaryBookDirExists) {
        console.error(`Error: Primary book directory _book-${PRIMARY_STRUCTURE_LANG} not found. Cannot generate sidebar.`);
        process.exit(1);
    }
    const originalGeneratedTree = await processDirectoryRecursiveForSidebar('');

    // 3. Finalize sidebar (add custom root, filter index, set collapsed states)
    const rootLabelEn = await getH1TitleFromFile(path.join(CWD, `_book-${LANG_EN}`, 'index.md')) || "Home";
    const rootLabelJa = await getH1TitleFromFile(path.join(CWD, `_book-${LANG_JA}`, 'index.md'));

    const customRootLinkTranslations = { [LANG_EN]: rootLabelEn };
    if (rootLabelJa) {
        customRootLinkTranslations[LANG_JA] = rootLabelJa;
    }

    const customRootLink = {
        label: rootLabelEn, // Fallback label is English
        translations: customRootLinkTranslations,
        link: "/" // Should resolve to /en/ or site root based on Astro/Starlight config
    };

    let finalSidebarTree = [customRootLink];
    let firstRealGroupProcessed = false;

    for (const item of originalGeneratedTree) {
        // Link for root index.md (if processed from _book-en/index.md) would be "index"
        if (item.link && item.link === "index" && !item.items) {
            // console.log(`Skipping auto-generated root index.md link: Label = "${item.label}", Link = "${item.link}"`);
            continue;
        }

        if (item.items && Array.isArray(item.items) && item.items.length > 0) { // It's a group
            if (!firstRealGroupProcessed) {
                item.collapsed = false;
                firstRealGroupProcessed = true;
            } else {
                item.collapsed = true;
            }
        }
        finalSidebarTree.push(item);
    }

    // 4. Generate the single sidebar file
    await generateSidebarFile(finalSidebarTree);

    console.log(`Multilingual documentation generation finished successfully!`);
}

try {
    await main();
} catch (error) {
    console.error(`Error during documentation generation:`, error.message, error.stack);
    process.exit(1);
}