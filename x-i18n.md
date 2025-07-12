**【Final Draft: Specifications for Bulk Translation by AI Agent (Revised v6)】**

1.  **Objective:** To translate English Markdown files within the `_site-en` directory into Japanese and synchronize them to the `_site-ja` directory via Git. The AI agent will utilize a high-quality available model (e.g., Gemini Pro/Flash) for translation.
    
2.  **Target Languages:** English (en) to Japanese (ja).
    
3.  **Translation Unit:** `.md` files under the `_site-en` directory.
    
4.  **Basic Trigger:** Manual execution by the user.
    
5.  **Execution Environment:**
    
    -   Git CLI must be available.
    -   Authentication credentials for the AI agent to use the translation model (e.g., Gemini Pro/Flash via Vertex AI) must be configured.

**5.bis. Process Initiation and Strict Order of Operations**

**5.bis.1. Trigger for Translation Process:**
Any user instruction that implies the initiation of translation for any part of the `_site-en` content (e.g., "Translate everything," "Translate unit X," "Update Japanese translations for Y") will trigger the *entire* translation process defined in this document.

**5.bis.2. Absolute Starting Point:**
Regardless of the specificity of the user's translation request, the AI agent **must always begin execution from Step 1 (Prerequisite): Finalize and Commit `_site-en` State**. No other section related to translation execution (e.g., identifying specific files for translation, performing translation, committing to `_site-ja`) shall precede the successful completion of this initial step.

**5.bis.3. User Confirmation for Process Start:**
Upon receiving a trigger instruction (as per 5.bis.1), the AI agent will first confirm with the user: "Understood. As per the defined process, I will start by checking for uncommitted changes in the `_site-en` directory as outlined in Step 1. Is that okay?"

**Step 1 (Prerequisite): Finalize and Commit `_site-en` State**

6.1. AI Agent Checks for Uncommitted Changes in `_site-en`: Before proceeding, the AI agent will execute `git status --porcelain -- _site-en` to detect any uncommitted local changes (additions, modifications, deletions) to files within the `_site-en` directory. The AI agent will consider all changes within `_site-en` reported by this command for this step.

### 6.2. Handling Uncommitted Changes in `_site-en` (AI Agent Responsibility)

#### 6.2.1. Notification, Proposed Commit Message (in English), and User Confirmation

If uncommitted changes are detected within `_site-en` (as per step 6.1), the AI agent will:

-   List the detected changes within `_site-en` to the user.
-   Generate a concise and informative commit message **in English** summarizing these changes to files in `_site-en` (e.g., "docs(site-en): Update Unit 0 title").
-   Present the proposed English commit message and the list of changes in `_site-en` to the user for approval.

#### 6.2.2. AI Agent Commits Changes in `_site-en`

Upon receiving user approval, the AI agent will stage all detected changes within the `_site-en` directory and commit them using the AI-generated (and user-approved) English commit message.

#### 6.2.3. No Changes or Post-Commit

If no uncommitted changes were initially detected within `_site-en`, or after the AI agent has committed the changes as per step 6.2.2, the `_site-en` directory is considered finalized for the current translation batch.

### 6.3. Establishing the Source Commit ID

Following the finalization of `_site-en` (as per step 6.2.3), the AI agent will retrieve the current HEAD commit ID of the repository. This commit ID, reflecting the committed state of `_site-en`, will be used as the `<current_site_en_commit_id>` referenced in Step 2 (specifically for the `_site-ja` commit message) of this document.

**Step 2: Perform Basic Translation and Synchronization to `_site-ja`**

**2.1. Identify Target Files for Translation and Stale Japanese Files**

**2.1.1. Determine User's Translation Scope:**
The AI agent first clarifies the user's desired scope for this translation batch:
    *   **A. Specific Scope:** User requests translation for a specific subset (e.g., "Translate unit-0," "Translate file X.md"). The AI identifies the relevant `.md` files within `_site-en` based on this directive.
    *   **B. General Scope:** User makes a general request (e.g., "Synchronize translations," "Translate everything"). The AI considers all `.md` files within the entire `_site-en` directory.
    *   The AI will confirm the list of English files falling into this initial scope with the user if the scope is broad or ambiguous.

**2.1.2. Default Behavior: Identify Changed or New English Files for Translation:**
Unless the user explicitly requests a "force re-translation" for the specified scope (see 2.1.3), the AI agent identifies files to translate as follows:

*   **2.1.2.1. Retrieve Last `_site-en` Sync Point:**
        *   The AI agent will search the Git log for the SHA of the most recent commit whose message matches the pattern `feat(i18n): sync ja with en@<commit_id>`. The `<commit_id>` part of this message is `<last_synced_en_commit_id>`.
        *   If no such commit is found in the history:
            *   The AI will inform the user: "No previous synchronization commit `feat(i18n): sync ja with en@...` was found. This might be the first translation run."
            *   It will then propose to treat all English files in the current scope (2.1.1) that have an existing Japanese counterpart in `_site-ja` as requiring translation.
            *   English files in scope (2.1.1) without a Japanese counterpart are automatically considered "new" and marked for translation.
            *   The AI will ask for user confirmation before proceeding with this "first run" approach.

    *   **2.1.2.2. Identify Files based on Changes or Newness:**
        *   For each English `.md` file within the user-defined scope (2.1.1):
            *   **New File:** If a corresponding Japanese file does *not* exist in `_site-ja` (e.g., `_site-en/path/to/file.md` exists, but `_site-ja/path/to/file.md` does not), it is marked for translation.
            *   **Changed File:** If a corresponding Japanese file *does* exist in `_site-ja`, AND a `<last_synced_en_commit_id>` was successfully retrieved (and it's not a "first run" scenario):
                *   The AI executes `git diff --name-only <last_synced_en_commit_id> <current_site_en_commit_id> -- <path_to_en_file>`. 
                *   If the English file is listed in the output of this diff, it means the English source has changed since that last recorded synchronization point, and it is marked for translation.
            *   **Unchanged File:** If an English file is not new and not identified as changed by the diff, it is *not* marked for translation by default.

**2.1.3. Explicit Re-translation Request (Force Mode):**
    *   If the user explicitly requests a "force re-translate" for the scope defined in 2.1.1 (e.g., "force re-translate unit-0," "re-translate file X.md even if unchanged"), then all English files within that specified scope are marked for translation. This overrides the changed/new file detection in 2.1.2.
    *   The AI agent will confirm: "Understood. You've requested a force re-translation for [scope]. I will mark all English files in this scope for translation, regardless of changes or existing Japanese versions. Is this correct?"

**2.1.4. Identify Stale Japanese Files for Deletion:**
    *   Concurrently, the AI agent will examine the `_site-ja` directory within the scope corresponding to the user's request (2.1.1).
    *   Any `.md` file found in `_site-ja/[scope]` that does *not* have a corresponding `.md` file in `_site-en/[scope]` (at `<current_site_en_commit_id>`) is considered a stale Japanese file.
    *   These stale Japanese files are marked for deletion from `_site-ja`.

**2.1.5. User Confirmation of Planned Actions:**
    *   The AI agent will present a consolidated summary to the user:
        *   List of English files marked for translation (new, changed, or force-translated).
        *   List of Japanese files marked for deletion from `_site-ja` (stale files).
    *   The AI will ask for user approval: "Based on the above, I plan to translate X English files and delete Y Japanese files. Shall I proceed?"
    *   If no files are to be translated and no files are to be deleted, the AI will inform the user: "No changes requiring translation or cleanup were found for the specified scope." The process for this batch may conclude here.

**(Subsequent parts of Step 2, e.g., actual translation, file writing, and the final commit to `_site-ja` as previously defined in 7.6, will follow. The original 7.1-7.5 details for the translation process itself should be integrated here.)**

- (Former 7.1. to 7.5. content regarding the translation mechanics, handling frontmatter, code blocks etc., should be placed here, renumbered appropriately under Step 2, e.g., as 2.2, 2.3 etc.)

- **Commit (to `_site-ja`):** (This would be a sub-section like 2.X)
    - The AI agent will use the `<current_site_en_commit_id>` established in Step 1.3.
    - Stage all changes made directly within the `_site-ja` directory (saving translated files, deleting existing files marked in 2.1.4, directory operations) and commit with the message `feat(i18n): sync ja with en@<current_site_en_commit_id>`. This commit message must be in English.

**8. Basic Exclusion/Priority Rules:** (Content remains the same as Revised v3, ensure numbering matches if sub-sections under Step 2 are renumbered)

- 8.1. `translate: false` Flag: ...
- 8.2. Frontmatter: ...
- 8.3. Code Blocks: ...

**9. Error Handling:** (Content remains the same as Revised v3, ensure numbering matches if sub-sections under Step 2 are renumbered)

----------

**Note on Operational Scope for Git Operations (Revised):**

Unless explicitly instructed by the user for unrelated tasks, all automated Git operations (status checking, staging, committing) performed by the AI agent under this translation specification are **strictly confined to files residing directly within the `_site-en` and `_site-ja` directories.** The AI agent will not operate on any files or directories outside of these two specific paths as part of the defined translation and synchronization process.