**【Final Draft: Specifications for Bulk Translation by AI Agent (Revised v4)】**

1.  **Objective:** To translate English Markdown files within the  `_site-en`  directory into Japanese and synchronize them to the  `_site-ja`  directory via Git. The AI agent will utilize a high-quality available model (e.g., Gemini Pro/Flash) for translation.
2.  **Target Languages:** English (en) to Japanese (ja).
3.  **Translation Unit:** `.md` files under the  `_site-en`  directory.
4.  **Basic Trigger:** Manual execution by the user.
5.  **Execution Environment:**
    *   Git CLI must be available.
    *   Authentication credentials for the AI agent to use the translation model (e.g., Gemini Pro/Flash via Vertex AI) must be configured.

**6. Prerequisite: Finalizing and Committing Source Document State (`_site-en`)**
    **6.1. AI Agent Checks for Uncommitted Changes *within `_site-en`*:** Before proceeding, the AI agent will execute the command `git status --porcelain -- _site-en` to check the Git status *specifically for uncommitted local changes (additions, modifications, deletions) to files residing directly within the `_site-en` directory itself.* The AI agent will only consider changes reported by this command for this step.
    **6.2. Handling Uncommitted Changes *within `_site-en`* (AI Agent Responsibility):**
        *   **6.2.1. Notification, Proposed Commit Message (in English), and User Confirmation:** If uncommitted changes are detected *directly within `_site-en`* (as per step 6.1), the AI agent will:
            *   List the detected changes *within `_site-en`* to the user.
            *   Generate a concise and informative commit message **in English** summarizing these changes *to `_site-en` files* (e.g., "docs(site-en): Update Unit 0 title").
            *   Present the proposed English commit message and the list of *`_site-en` file changes* to the user for approval.
        *   **6.2.2. AI Agent Commits Changes *within `_site-en`*:** Upon receiving user approval, the AI agent will stage all detected changes *residing directly within the `_site-en` directory* and commit them using the AI-generated (and user-approved) English commit message.
        *   **6.2.3. No Changes or Post-Commit:** If no uncommitted changes were initially detected *within `_site-en`*, or after the AI agent has committed the changes as per step 6.2.2, the `_site-en` directory is considered finalized for the current translation batch.
    **6.3. Establishing the Source Commit ID:** Once the `_site-en` directory is confirmed to be in a committed state, the AI agent will retrieve the current HEAD commit ID of the repository. This commit ID (reflecting the state of `_site-en`) will then be used as the `<current_site_en_commit_id>` referenced in Section 7.6 for the `_site-ja` commit message.

**7. Basic Translation Process:** (Renumbered)
    *   *(7.1. to 7.5. remain largely the same)*
    *   **7.6. Commit (to `_site-ja`):**
        *   The AI agent will use the `<current_site_en_commit_id>` established in Step 6.3.
        *   Stage all changes made *directly within the `_site-ja` directory* (saving translated files, deleting existing files, directory operations) and commit with the message `feat(i18n): sync ja with en@<current_site_en_commit_id>`. This commit message **must be in English.**

**8. Basic Exclusion/Priority Rules:** (Renumbered) *(Content remains the same as Revised v3)*
    *   **8.1.  `translate: false`  Flag:** ...
    *   **8.2. Frontmatter:** ...
    *   **8.3. Code Blocks:** ...

**9. Error Handling:** (Renumbered) *(Content remains the same as Revised v3)*

**Note on Operational Scope for Git Operations (Revised):**
Unless explicitly instructed by the user for unrelated tasks, all automated Git operations (status checking, staging, committing) performed by the AI agent under this translation specification are **strictly confined to files residing directly within the `_site-en` and `_site-ja` directories.** The AI agent will not operate on any files or directories outside of these two specific paths as part of the defined translation and synchronization process.
---