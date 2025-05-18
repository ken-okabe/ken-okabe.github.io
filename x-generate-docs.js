// x-generate-docs.js
// Node.js script (ES Module format)
// Processes content for 'en' and 'ja' from '_site-en' and '_site-ja'.
// Generates a single topics configuration file (starlight-generated-topics.js).
// Topic labels are {en: "...", ja: "..."}, potentially with 'icon' and 'badge' properties.
// Item labels within topics are "FALLBACK" with a 'translations' object.

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
const PRIMARY_STRUCTURE_LANG = LANG_EN;

const CONTENT_OUTPUT_BASE_DIR = path.join(CWD, `src/content/docs`);
const SIDEBAR_CONFIG_FILE_NAME = `starlight-generated-topics.js`;

function stripNumericPrefix(name) {
    return name.replace(/^\d+-/, '');
}

// --- Helper Functions ---
async function getH1TitleFromFile(filePath) {
    if (!await fs.pathExists(filePath)) return null;
    try {
        const content = await fs.readFile(filePath, 'utf-8');
        const tree = unified().use(remarkParse).parse(content);
        const firstH1Node = tree.children.find(node => node.type === 'heading' && node.depth === 1);
        return firstH1Node ? mdastToString(firstH1Node).trim() : null;
    } catch (error) { return null; }
}

// MODIFIED Helper Function to get a specific key's value from original frontmatter
async function getFrontmatterValue(filePath, key) {
    if (!await fs.pathExists(filePath)) {
        return null;
    }
    try {
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const { data } = matter(fileContent); // Extracts frontmatter
        if (data && typeof data[key] === 'string' && data[key].trim() !== '') {
            return data[key].trim();
        }
        return null; // No such key or key's value is empty/not a string
    } catch (error) {
        console.warn(`Warning: Could not read or parse frontmatter from ${filePath} for key '${key}'. Error: ${error.message}`);
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
    } catch (error) { return null; }
}

async function getSortedDirEntries(dirPath) {
    try {
        if (!await fs.pathExists(dirPath)) return [];
        const entries = await fs.readdir(dirPath);
        return entries.sort();
    } catch (error) {
        if (error.code === 'ENOENT') return [];
        console.error(`Error reading directory ${dirPath}:`, error);
        throw error;
    }
}

async function processAndCopyMarkdownFile(inputFilePath, outputFilePath, langForFrontmatter) {
    if (!await fs.pathExists(inputFilePath)) return;
    const originalContent = await fs.readFile(inputFilePath, 'utf-8');
    const title = await getH1TitleFromFile(inputFilePath);
    const description = await getDescriptionFromFile(inputFilePath);
    const frontmatter = { title: title || '', description: description || '' };
    let contentWithoutH1 = originalContent;
    if (title) {
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
            } else if (firstH1Node) {
                const h1Regex = new RegExp(`^#\\s*${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\s*\\r?\\n)?`, 'm');
                contentWithoutH1 = originalContent.replace(h1Regex, '');
            }
        } catch (error) {
            console.warn(`Warning: Failed to remove H1 from ${inputFilePath}. Error: ${error.message}`);
        }
    }
    const newFileContent = matter.stringify(contentWithoutH1, frontmatter);
    await fs.ensureDir(path.dirname(outputFilePath));
    await fs.writeFile(outputFilePath, newFileContent);
}

async function getLabelsForTranslations(itemPathRelativeToSiteLangRoot, isDirLabelFile) {
    const translations = {};
    for (const lang of SUPPORTED_LANGS) {
        const langSiteDir = path.join(CWD, `_site-${lang}`);
        let actualFilePath;
        if (isDirLabelFile) {
            actualFilePath = path.join(langSiteDir, itemPathRelativeToSiteLangRoot, '_label.md');
        } else {
            actualFilePath = path.join(langSiteDir, itemPathRelativeToSiteLangRoot);
        }

        const label = await getH1TitleFromFile(actualFilePath);
        if (label) {
            translations[lang] = label;
        }
    }
    return translations;
}

async function generateSidebarItemsForSection(sectionDirName, currentRelativePathWithinSection) {
    const sidebarItems = [];
    const primaryLangSectionScanDir = path.join(CWD, `_site-${PRIMARY_STRUCTURE_LANG}`, sectionDirName, currentRelativePathWithinSection);
    const entries = await getSortedDirEntries(primaryLangSectionScanDir);

    for (const entryName of entries) {
        if (entryName === '_label.md' || (currentRelativePathWithinSection === '' && entryName === 'index.md')) {
            continue;
        }

        const itemPathInPrimaryBook = path.join(primaryLangSectionScanDir, entryName);
        if (!await fs.pathExists(itemPathInPrimaryBook)) continue;

        const stat = await fs.stat(itemPathInPrimaryBook);
        const nextRelativePathWithinSection = path.join(currentRelativePathWithinSection, entryName).replace(/\\/g, '/');
        const strippedSectionDirName = stripNumericPrefix(sectionDirName);
        const pathForLink = path.join(strippedSectionDirName, nextRelativePathWithinSection).replace(/\\/g, '/');
        const pathToItemInSpecificSection = path.join(sectionDirName, nextRelativePathWithinSection);


        if (stat.isDirectory()) {
            const translations = await getLabelsForTranslations(pathToItemInSpecificSection, true);

            if (entryName === 'section-0') {
                const itemsFromSection0 = await generateSidebarItemsForSection(sectionDirName, nextRelativePathWithinSection);
                sidebarItems.push(...itemsFromSection0);
            } else {
                const nestedItems = await generateSidebarItemsForSection(sectionDirName, nextRelativePathWithinSection);
                if (nestedItems.length > 0 && Object.keys(translations).length > 0) {
                    sidebarItems.push({
                        label: "FALLBACK",
                        translations: translations,
                        items: nestedItems,
                    });
                } else if (nestedItems.length > 0) {
                    sidebarItems.push({
                        label: "FALLBACK",
                        translations: { [PRIMARY_STRUCTURE_LANG]: entryName },
                        items: nestedItems,
                    });
                }
            }
        } else if (entryName.endsWith('.md')) {
            const translations = await getLabelsForTranslations(pathToItemInSpecificSection, false);
            if (Object.keys(translations).length > 0) {
                sidebarItems.push({
                    label: "FALLBACK",
                    translations: translations,
                    link: pathForLink.replace(/\.md$/, ''),
                });
            } else {
                sidebarItems.push({
                    label: "FALLBACK",
                    translations: { [PRIMARY_STRUCTURE_LANG]: entryName.replace(/\.md$/, '') },
                    link: pathForLink.replace(/\.md$/, ''),
                });
            }
        }
    }
    return sidebarItems;
}

async function generateSidebarFile(topicsArray) {
    const sidebarConfigPath = path.join(CWD, SIDEBAR_CONFIG_FILE_NAME);
    const content = `// This file is auto-generated by the x-generate-docs.js script.
// Contains the 'topics' array for starlight-sidebar-topics plugin.
// Topic labels are objects like { en: "...", ja: "..." }, and may include 'icon' and 'badge' properties.
// Item labels within each topic's sidebar are "FALLBACK", with actual labels in 'translations'.

export const generatedTopics = ${JSON.stringify(topicsArray, null, 2)};
`;
    try {
        await fs.writeFile(sidebarConfigPath, content);
        console.log(`Generated ${SIDEBAR_CONFIG_FILE_NAME} successfully.`);
    } catch (error) {
        console.error(`Error writing ${SIDEBAR_CONFIG_FILE_NAME}:`, error);
        throw error;
    }
}

// --- Main Execution ---
async function main() {
    console.log(`Processing content for languages: ${SUPPORTED_LANGS.join(', ')}.`);
    console.log(`Sidebar structure will be based on: ${PRIMARY_STRUCTURE_LANG} (_site-${PRIMARY_STRUCTURE_LANG}).`);
    console.log(`Sidebar configuration output file: ${SIDEBAR_CONFIG_FILE_NAME}`);

    for (const lang of SUPPORTED_LANGS) {
        const langSiteDir = path.join(CWD, `_site-${lang}`);
        const langContentOutputDir = path.join(CONTENT_OUTPUT_BASE_DIR, lang);
        if (!await fs.pathExists(langSiteDir)) {
            console.warn(`Input directory for lang '${lang}' not found: ${langSiteDir}.`);
            continue;
        }
        if (await fs.pathExists(langContentOutputDir)) {
            await fs.remove(langContentOutputDir);
        }
        await fs.ensureDir(langContentOutputDir);
        console.log(`Processing content for ${lang} from ${langSiteDir} to ${langContentOutputDir}...`);

        const rootIndexInputPath = path.join(langSiteDir, 'index.md');
        if (await fs.pathExists(rootIndexInputPath)) {
            const rootIndexOutputPath = path.join(langContentOutputDir, 'index.md');
            await processAndCopyMarkdownFile(rootIndexInputPath, rootIndexOutputPath, lang);
        }

        const sectionEntriesInLangDir = await getSortedDirEntries(langSiteDir);
        for (const sectionEntryName of sectionEntriesInLangDir) {
            const sectionInputPath = path.join(langSiteDir, sectionEntryName);
            if (!await fs.pathExists(sectionInputPath)) continue;
            const stat = await fs.stat(sectionInputPath);

            if (stat.isDirectory()) {
                const strippedSectionName = stripNumericPrefix(sectionEntryName);
                const sectionContentOutputDir = path.join(langContentOutputDir, strippedSectionName);
                await fs.ensureDir(sectionContentOutputDir);
                async function copyAndProcessDir(inputSubDir, outputSubDir) {
                    const entries = await getSortedDirEntries(inputSubDir);
                    for (const entryName of entries) {
                        const currentInputPath = path.join(inputSubDir, entryName);
                        if (!await fs.pathExists(currentInputPath)) continue;
                        const currentOutputPath = path.join(outputSubDir, entryName);
                        const innerStat = await fs.stat(currentInputPath);
                        if (innerStat.isDirectory()) {
                            await fs.ensureDir(currentOutputPath);
                            await copyAndProcessDir(currentInputPath, currentOutputPath);
                        } else if (entryName.endsWith('.md')) {
                            if (entryName === '_label.md') continue;
                            await processAndCopyMarkdownFile(currentInputPath, currentOutputPath, lang);
                        }
                    }
                }
                await copyAndProcessDir(sectionInputPath, sectionContentOutputDir);
            }
        }
        console.log(`Content for ${lang} processed.`);
    }

    console.log(`Building topics array for sidebar based on ${PRIMARY_STRUCTURE_LANG}...`);
    const topicsArray = [];
    const primarySiteContentDir = path.join(CWD, `_site-${PRIMARY_STRUCTURE_LANG}`);
    const topLevelEntries = await getSortedDirEntries(primarySiteContentDir);
    const sectionDirNames = [];
    for (const entryName of topLevelEntries) {
        if (entryName === 'index.md') continue;
        const entryPath = path.join(primarySiteContentDir, entryName);
        if (await fs.pathExists(entryPath) && (await fs.stat(entryPath)).isDirectory()) {
            sectionDirNames.push(entryName);
        }
    }

    for (const sectionName of sectionDirNames) {
        const topicTranslations = {};
        const sectionEnIndexH1 = await getH1TitleFromFile(path.join(CWD, `_site-${LANG_EN}`, sectionName, 'index.md'));
        topicTranslations[LANG_EN] = sectionEnIndexH1 || stripNumericPrefix(sectionName);

        const sectionJaIndexH1 = await getH1TitleFromFile(path.join(CWD, `_site-${LANG_JA}`, sectionName, 'index.md'));
        if (sectionJaIndexH1) {
            topicTranslations[LANG_JA] = sectionJaIndexH1;
        }

        // Get icon and badge values from original frontmatter of the section's index.md for the PRIMARY_STRUCTURE_LANG
        const originalIndexMdPath = path.join(CWD, `_site-${PRIMARY_STRUCTURE_LANG}`, sectionName, 'index.md');

        const iconFromFM = await getFrontmatterValue(originalIndexMdPath, 'icon');
        const iconValue = iconFromFM || "warning"; // Default to "warning"

        const badgeFromFM = await getFrontmatterValue(originalIndexMdPath, 'badge');
        // badgeValue will be the string if found, otherwise null

        let sectionItems = await generateSidebarItemsForSection(sectionName, '');
        let firstRealGroupInSectionProcessed = false;
        sectionItems = sectionItems.map(item => {
            const newItem = { ...item };
            if (newItem.items && Array.isArray(newItem.items) && newItem.items.length > 0) {
                if (!firstRealGroupInSectionProcessed) {
                    newItem.collapsed = false;
                    firstRealGroupInSectionProcessed = true;
                } else {
                    newItem.collapsed = true;
                }
            }
            return newItem;
        });

        const topicObject = {
            label: topicTranslations,
            link: `/${stripNumericPrefix(sectionName)}/`,
            icon: iconValue,
            items: sectionItems,
        };

        if (badgeFromFM) { // Add badge property only if a value was found
            topicObject.badge = badgeFromFM;
        }

        topicsArray.push(topicObject);
    }
    await generateSidebarFile(topicsArray);
    console.log(`Multilingual documentation generation finished successfully!`);
}

try {
    await main();
} catch (error) {
    console.error(`Error during documentation generation:`, error.message, error.stack);
    process.exit(1);
}