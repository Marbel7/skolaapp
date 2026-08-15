# SkolaApp – Agent Instructions

## Role
You are the coding agent for SkolaApp. Your job is to maintain and improve the existing application without breaking working functionality.

## Project priorities
1. Functional correctness first.
2. Preserve existing data and persistence behavior.
3. Preserve mobile usability; the primary test viewport is iPhone-sized.
4. Keep the UI professional, clear, light, and slightly playful — never cluttered.
5. Prefer small, targeted changes over broad rewrites.

## Before changing code
- Inspect the existing implementation and identify the real cause of the issue.
- Search for all code paths related to the affected feature before editing it.
- Check whether the behavior is shared between Dashboard and the dedicated section.
- Do not add another workaround script if the underlying implementation can be fixed cleanly.
- Do not remove existing Firebase/localStorage behavior unless explicitly requested.

## Tasks and Notes UX
- Tasks and Notes are parallel dashboard modules and should use consistent accordion behavior.
- Both modules should be compact when collapsed and show their content when expanded.
- The collapsed state must still show useful summary information (for example, completed/total and remaining count).
- Expanding Tasks must reveal the actual task list.
- Task checkboxes must remain interactive and completed tasks must remain visibly completed/struck through.
- Adding a task by typing and submitting must work reliably.
- Adding a task by voice must continue to work.
- Notes should follow the same expand/collapse interaction pattern as Tasks.
- Do not hide essential actions behind an accordion in a way that prevents normal use.

## Dashboard order
Preferred order on the main dashboard:
1. Tasks
2. Notes
3. Quick links

Do not duplicate information unnecessarily (for example, avoid showing the date twice in prominent cards).

## Bottom navigation / capture bar
- The bottom navigation and central Capture control must stay visually inside the same fixed bottom surface.
- Icons and labels must not drift outside the white navigation surface.
- The bar must respect iPhone safe-area insets and browser viewport behavior.
- Do not allow page content to be hidden behind the fixed navigation without appropriate bottom spacing.

## Visual language
- Use the existing visual system and purple accent rather than introducing a new design language.
- Avoid excessive cards, gradients, shadows, decorative elements, or emojis.
- Typography should feel professional and readable.
- Interactions should be obvious without visual clutter.
- Small moments of personality are welcome, but the app should still feel like a polished productivity/school tool.

## Data safety
- Never delete or reset user tasks, notes, links, or other stored data as part of a UI fix.
- Do not change storage keys or data schemas without checking migration/compatibility implications.
- Preserve existing Firebase synchronization and local fallback behavior.

## Testing / verification
After a functional change, verify at minimum:
- Task creation by typing.
- Task creation by voice if the feature is touched.
- Task checkbox completion/uncompletion.
- Task accordion open/close.
- Notes accordion open/close.
- Existing notes remain visible and searchable.
- Dashboard summary counts update after changes.
- Mobile layout does not place controls behind the fixed bottom navigation.
- No duplicate event listeners or competing render logic are introduced.

## Change discipline
- Prefer editing the source of truth rather than stacking compatibility patches.
- Keep changes focused on the requested problem.
- Do not redesign unrelated sections.
- Before finalizing, review the diff for accidental UI/data regressions.
- Summarize what changed, what was tested, and any remaining uncertainty.
