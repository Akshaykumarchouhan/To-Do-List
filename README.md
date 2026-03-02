# Professional To-Do List Application

A polished, accessible, installable, and fully offline-capable Progressive Web Application (PWA) built with pure vanilla HTML, CSS, and JavaScript. Zero frameworks, zero build step.

## Features

- **Progressive Web App (PWA)**: Installable to your homescreen. The Service Worker (`sw.js`) caches all assets, making the app fully functional offline.
- **Robust Information Architecture**: Tasks are managed via a rigid data schema including identifiers, timestamps, flexible priority levels, due dates, tags, and completion states. 
- **Persisted Data & Seamless Migration**: Data is reliably stored in `localStorage` (`todo.tasks.v2`). A migration hook is included for automatic upgrading of any older dataset.
- **Advanced UX & Editing**:
  - Edit task titles inline on focus.
  - Multi-condition tagging and search filtering.
  - Granular dynamic routing to filter by **Active**, **Completed**, **Due Today**, and **Overdue**.
  - Advanced multi-level sorting combinations (Chronological, Priority, Status, Due date).
- **Undo History Stack**: Accidentally deleted a task? Checked the wrong box? Just click **Undo** (or press <kbd>Ctrl</kbd> + <kbd>Z</kbd>).
- **Drag & Drop Reordering**: Touch/Mouse pointer drag-and-drop combined with a full accessible keyboard fallback structure.
- **Notifications**: Optional native browser notifications to alert you precisely when your tasks are due.
- **Light & Dark Themes**: Fully reactive design system built on CSS Variables. Remembers your configured system preference.
- **Focus & Performance**: Deeply optimized DOM updates rendering only what changed and fragment batching arrays.

## How to run locally

Since there is absolutely no build step or package dependencies, running it is incredibly simple:

1. Clone or download this repository.
2. Since PWA Service Workers require a secure context (HTTPS) or `localhost` to initialize properly, you cannot just open `index.html` via `file://` to test offline capability.
3. Serve it using *any* basic static server. 
   - Using Python: `python -m http.server 8000`
   - Using Node: `npx serve .`
   - Using VSCode: Right-click `index.html` -> "Open with Live Server"
4. Navigate to `http://localhost:8000` in your web browser. 

 *(Note: The application will still function if you double-click `index.html`, but the Service Worker and Install features may be restricted by the browser.)*

## Keyboard Shortcuts & Accessibility

This app achieves standard WCAG AA contrast compliance and utilizes semantic HTML structuring, `aria-live` announcer regions, and full keyboard-focusable native inputs. 

Global Shortcuts:
- <kbd>n</kbd> : Focus the "new task" title input.
- <kbd>/</kbd> : Focus the search input.
- <kbd>Ctrl</kbd> + <kbd>Enter</kbd> : Submit the "new task" form from anywhere.
- <kbd>Ctrl</kbd> + <kbd>z</kbd> : Undo your last modifying action.
- <kbd>?</kbd> : Show / hide the graphical keyboard shortcuts overlay dialog.

Task List Focus Navigation:
Once you navigate into the task list (via <kbd>Tab</kbd>), you can use the keyboard exclusively:
- <kbd>↑</kbd> / <kbd>↓</kbd> Arrow keys : Navigate between tasks in the current sorted view.
- <kbd>Space</kbd> or <kbd>Enter</kbd> : Toggle the completion checkbox.
- <kbd>e</kbd> : Jump to inline editing the currently focused task title.
- <kbd>Delete</kbd> or <kbd>Backspace</kbd> : Delete the currently focused task.
- <kbd>Alt</kbd> + <kbd>↑</kbd> / <kbd>↓</kbd> : Physically drag-and-drop the current task up or down in the absolute task list (Only works during "Custom" sort state).
- <kbd>Escape</kbd> : Cancel an inline edit or close dialog overlays.

---
Built purely for demonstration of advanced client-side architecture.
