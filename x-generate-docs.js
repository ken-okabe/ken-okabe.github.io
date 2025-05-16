// x-generate-docs.js
// Node.js script (ES Module format)
// Run with: TARGET_LANG=en node x-generate-docs.js  OR  TARGET_LANG=ja node x-generate-docs.js
//
// Ensure "type": "module" is in your package.json or rename this file to x-generate-docs.mjs
//
// Required npm packages:
// npm install fs-extra gray-matter unified remark-parse mdast-util-to-string

import fs from 'fs-extra';
import path from 'path';
import matter from 'gray-matter'; // Default import
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import { toString as mdastToString } from 'mdast-util-to-string';

// --- Configuration ---
const CWD = process.cwd();

const TARGET_LANG = process.env.TARGET_LANG || 'en';

const INPUT_DIR_NAME = `_book-${TARGET_LANG}`;
const OUTPUT_DIR_NAME = `src/content/docs/${TARGET_LANG}`;
const SIDEBAR_CONFIG_FILE_NAME = `astro.sidebar.${TARGET_LANG}.ts`;

const INPUT_BASE_DIR = path.join(CWD, INPUT_DIR_NAME);
const OUTPUT_BASE_DIR = path.join(CWD, OUTPUT_DIR_NAME);

// --- Helper Functions ---
function getH1Title(content) {
    try {
        const tree = unified().use(remarkParse).parse(content);
        const firstH1Node = tree.children.find(node => node.type === 'heading' && node.depth === 1);
        return firstH1Node ? mdastToString(firstH1Node).trim() : null;
    } catch (error) {
        console.warn("Warning: Could not parse H1 title from Markdown, returning null.", error.message);
        return null;
    }
}

function getDescription(content) {
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
        console.warn("Warning: Could not parse description from Markdown, returning null.", error.message);
        return null;
    }
}

async function getSortedDirEntries(dirPath) {
    try {
        const entries = await fs.readdir(dirPath);
        return entries.sort();
    } catch (error) {
        console.error(`Error reading directory ${dirPath}:`, error);
        throw error;
    }
}

async function getGroupLabel(dirPath) {
    const labelFilePath = path.join(dirPath, '_label.md');
    if (!await fs.pathExists(labelFilePath)) {
        throw new Error(`_label.md not found in directory: ${dirPath}`);
    }
    const content = await fs.readFile(labelFilePath, 'utf-8');
    const labelTitle = getH1Title(content);
    if (!labelTitle) {
        throw new Error(`H1 title not found in _label.md: ${labelFilePath}`);
    }
    return labelTitle;
}

async function processMarkdownFile(inputFilePath, outputFilePath) {
    const originalContent = await fs.readFile(inputFilePath, 'utf-8');
    const title = getH1Title(originalContent);
    if (!title) {
        throw new Error(`H1 title not found in markdown file: ${inputFilePath}`);
    }
    const description = getDescription(originalContent);
    const frontmatter = {
        title: title,
        description: description || '',
    };
    let contentWithoutH1 = originalContent;
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
        // Error during H1 removal
    }
    const newFileContent = matter.stringify(contentWithoutH1, frontmatter);
    await fs.ensureDir(path.dirname(outputFilePath));
    await fs.writeFile(outputFilePath, newFileContent);
}

async function processDirectoryRecursive(currentInputDir, currentOutputDir, relativePath) {
    const sidebarItems = [];
    const entries = await getSortedDirEntries(currentInputDir);

    for (const entryName of entries) {
        if (entryName === '_label.md') {
            continue;
        }

        const inputEntryPath = path.join(currentInputDir, entryName);
        const outputEntryPath = path.join(currentOutputDir, entryName);
        let currentRelativePath = path.join(relativePath, entryName);
        currentRelativePath = currentRelativePath.replace(/\\/g, '/');

        const stat = await fs.stat(inputEntryPath);

        if (stat.isDirectory()) {
            if (entryName === 'section-0') {
                await fs.ensureDir(outputEntryPath);
                const itemsFromSection0 = await processDirectoryRecursive(inputEntryPath, outputEntryPath, currentRelativePath);
                sidebarItems.push(...itemsFromSection0);
            } else {
                const groupLabel = await getGroupLabel(inputEntryPath);
                await fs.ensureDir(outputEntryPath);
                const nestedItems = await processDirectoryRecursive(inputEntryPath, outputEntryPath, currentRelativePath);
                if (nestedItems.length > 0) {
                    sidebarItems.push({
                        label: groupLabel,
                        items: nestedItems,
                        // `collapsed` state will be set in main() for top-level groups
                    });
                }
            }
        } else if (entryName.endsWith('.md')) {
            await processMarkdownFile(inputEntryPath, outputEntryPath);
            const processedFileContent = await fs.readFile(outputEntryPath, 'utf-8');
            const { data: fmData } = matter(processedFileContent);
            sidebarItems.push({
                label: fmData.title,
                link: currentRelativePath.replace(/\.md$/, ''),
            });
        }
    }
    return sidebarItems;
}

async function generateSidebarFile(sidebarTree) {
    const sidebarConfigPath = path.join(CWD, SIDEBAR_CONFIG_FILE_NAME);
    const content = `// This file is auto-generated by the x-generate-docs.js script for language "${TARGET_LANG}".
// Do not edit this file directly. Your changes will be overwritten.

const sidebar = ${JSON.stringify(sidebarTree, null, 2)};

export default sidebar;
`;
    try {
        await fs.writeFile(sidebarConfigPath, content);
        console.log(`Generated ${SIDEBAR_CONFIG_FILE_NAME} successfully for language: ${TARGET_LANG}.`);
    } catch (error) {
        console.error(`Error writing ${SIDEBAR_CONFIG_FILE_NAME}:`, error);
        throw error;
    }
}

// --- Main Execution ---
async function main() {
    console.log(`Starting documentation generation for language: ${TARGET_LANG}...`);
    console.log(`Input directory: ${INPUT_BASE_DIR}`);
    console.log(`Output directory: ${OUTPUT_BASE_DIR}`);
    console.log(`Sidebar config file: ${SIDEBAR_CONFIG_FILE_NAME}`);

    if (!await fs.pathExists(INPUT_BASE_DIR)) {
        console.error(`Error: Input directory not found: ${INPUT_BASE_DIR}`);
        console.error(`Please ensure the source directory for language "${TARGET_LANG}" exists.`);
        process.exit(1);
    }

    if (await fs.pathExists(OUTPUT_BASE_DIR)) {
        console.log(`Cleaning existing language output directory: ${OUTPUT_BASE_DIR}`);
        await fs.remove(OUTPUT_BASE_DIR);
    }
    await fs.ensureDir(OUTPUT_BASE_DIR);

    console.log('Processing input files and building sidebar structure...');
    const originalGeneratedTree = await processDirectoryRecursive(INPUT_BASE_DIR, OUTPUT_BASE_DIR, '');

    const customRootLink = {
        "label": "Experience Quality Code",
        "link": "/"
    };

    let finalSidebarTree = [customRootLink];
    let firstRealGroupProcessed = false; // Flag to track if the first actual group has been processed

    for (const item of originalGeneratedTree) {
        // Skip the auto-generated root index.md link
        if (item.link && item.link === "index" && !item.items) {
            console.log(`Skipping auto-generated root index.md link: Label = "${item.label}", Link = "${item.link}"`);
            continue; // Skip this item
        }

        // Check if the current item is a group (has 'items' property and it's an array with content)
        if (item.items && Array.isArray(item.items) && item.items.length > 0) {
            if (!firstRealGroupProcessed) {
                // This is the first "real" group (after the custom link and skipped index link)
                item.collapsed = false; // Set this group to be open by default
                firstRealGroupProcessed = true;
            } else {
                // All subsequent groups will be collapsed by default
                item.collapsed = true;
            }
        }
        finalSidebarTree.push(item);
    }

    await generateSidebarFile(finalSidebarTree);

    console.log(`Documentation generation for language "${TARGET_LANG}" finished successfully!`);
}

try {
    await main();
} catch (error) {
    console.error(`Error during documentation generation for language "${TARGET_LANG}":`, error.message);
    process.exit(1);
}