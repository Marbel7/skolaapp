# SkolaApp – Agent Instructions

## Role
You are the coding agent for SkolaApp. Maintain and improve the existing application without breaking working functionality. Treat these instructions as persistent project rules.

## Non-negotiable priorities
1. Functional correctness first.
2. Preserve existing user data and persistence behavior.
3. Preserve Firebase synchronization and localStorage fallback.
4. Preserve mobile usability; iPhone-sized viewport is the primary target.
5. Prefer small, targeted changes over broad rewrites.
6. Never claim a fix is complete unless the affected behavior has been verified in the real application, not only in an isolated/mock DOM test.

## Before changing code
- Inspect the current implementation and identify the real cause of the issue.
- Search all code paths, listeners, loaders, and render functions related to the affected feature before editing.
- Check whether the behavior is shared between Dashboard and the dedicated section.
- Check for duplicate scripts, duplicate event listeners, competing render logic, and mobile overrides.
- Prefer fixing the source of truth over adding another workaround script.
- Do not remove existing Firebase/localStorage behavior unless explicitly requested.
- Do not silently reset, migrate, or regenerate user data.

## Tasks and Notes UX
Tasks and Notes are parallel dashboard modules and must use consistent accordion behavior.

### Tasks
- Collapsed by default on the main dashboard.
- Collapsed state shows useful summary information, including completed/total and remaining count.
- Expanding the Tasks card reveals the actual task list.
- The expanded task list is scrollable inside its module, like the Notes list; it must not make the whole dashboard unnecessarily long.
- Every visible task checkbox must be directly clickable and must complete/uncomplete the task.
- Task deletion control must be directly clickable and must actually delete the task after the intended confirmation/action.
- Adding a task by typing and submitting must immediately create and render the task.
- Adding a task by voice must continue to work.
- Adding a task must update the task list and all relevant summary counts consistently.
- The accordion toggle must not intercept clicks intended for checkboxes, delete controls, the add button, inputs, or other task controls.

### Notes
- Notes must follow the same expand/collapse interaction pattern as Tasks.
- Collapsed state shows note count and a useful preview/summary.
- Expanding Notes reveals the stored notes in a scrollable list.
- Existing notes must remain visible, searchable, and deletable.
- Note creation, saving, draft behavior, filtering, grouping, and deletion must continue to work.
- Note controls must not be broken by accordion event handling.

## Dashboard order
Preferred main-dashboard order:
1. Tasks
2. Notes
3. Quick links

Do not duplicate prominent information unnecessarily.

## Bottom navigation / Capture bar
- Bottom navigation and the central Capture control must stay visually inside the same fixed bottom surface.
- Icons and labels must not drift outside the white navigation surface.
- Respect iPhone safe-area insets and browser viewport behavior.
- Provide enough page bottom spacing so content and controls are not hidden behind the fixed navigation.
- Do not redesign the navigation while fixing unrelated functionality.

## Visual language
- Use the existing visual system and purple accent.
- Keep the UI professional, clear, light, and slightly playful.
- Avoid unnecessary cards, gradients, shadows, decorative elements, or emojis.
- Do not introduce a new design language for a functional fix.
- Interactions should be obvious without visual clutter.

## Data safety
- Never delete or reset user tasks, notes, links, or other stored data as part of a UI fix.
- Do not change storage keys or data schemas without checking compatibility and migration implications.
- Preserve existing Firebase synchronization and local fallback behavior.
- Do not use destructive cleanup code merely to make a test pass.

## Testing / verification
For every functional change, test the real application at an iPhone-sized viewport whenever possible.

At minimum, verify the affected flows and then verify related regressions:
- Task creation by typing.
- Task creation by voice if touched.
- Task checkbox completion and uncompletion.
- Task deletion.
- Task accordion open/close.
- Scrolling inside the expanded task list.
- Notes accordion open/close.
- Scrolling inside the expanded notes list.
- Note creation and deletion if notes are touched.
- Existing notes remain visible and searchable.
- Dashboard summary counts update after changes.
- Mobile controls are not hidden behind the fixed bottom navigation.
- No duplicate event listeners or competing render logic were introduced.

An isolated DOM/unit test is useful but is NOT sufficient evidence for a UI interaction fix. If real-browser verification is unavailable, explicitly state that limitation instead of claiming the feature is verified.

## Change discipline
- Edit the source of truth whenever possible.
- Keep changes focused on the requested problem.
- Do not redesign unrelated sections.
- Do not stack compatibility patches unless there is a documented reason.
- Before finalizing, review the complete diff for accidental UI/data regressions.
- Keep commits focused and descriptive.
- Summarize what changed, what was tested, and any remaining uncertainty.
