# 🌟 The Ultimate Professional To-Do List 🌟

Welcome to the **Ultimate Professional To-Do List**! 🚀 A beautifully polished, highly accessible, fully installable, and 100% offline-capable Progressive Web Application (PWA). 

Built entirely with **Vanilla HTML, CSS, and JavaScript**—zero frameworks, zero build steps, and absolute zero bloat! 🪶✨

---

## ✨ Spectacular Features ✨

### 📱 Progressive Web App (PWA) Magic
*   **Install Everywhere**: Install this app directly to your home screen or desktop like a native application! 📲💻
*   **Fully Offline Capable**: Journey into a tunnel? Lose your Wi-Fi? No problem! The integrated Service Worker (`sw.js`) vigorously caches all necessary assets so you can manage tasks seamlessly without an internet connection. 🌐🚫

### 🧠 Robust Data Architecture
*   **Advanced Task Model**: Tasks aren't just strings; they are structured objects containing:
    *   🆔 Unique Identifiers
    *   ⏱️ Timestamps (`createdAt`, `updatedAt`)
    *   📅 Due Dates
    *   🔥 Priority Levels (Low, Normal, High)
    *   🏷️ Multi-Tagging Support
*   **Bulletproof Local Storage**: Your data is locked in tightly using `localStorage` (`todo.tasks.v2`). 🔒
*   **Smart Migrations**: Seamlessly upgrades old dataset formats automatically so you never lose a task during an update. 🔄

### 🎨 Next-Level User Experience (UX)
*   **Dynamic Theming**: Swap between a sleek **Light Mode** ☀️ and a stunning **Dark Mode** 🌙 with a single click. The app remembers your preference!
*   **Inline Editing**: Spot a typo? Just click the task text and fix it instantly right there in the list! ✏️
*   **Granular Filtering**: Quickly effortlessly sift through your list using tabs: **All**, **Active**, **Completed**, **Due Today**, and **Overdue**. 🔍
*   **Supreme Sorting Combinations**: Sort chronologically, by priority, by status, or by upcoming due date! 🧮
*   **Custom Drag & Drop**: Physically grab your tasks and drop them exactly where you want them for ultimate custom organization. 🫳📦

### ⏪ The "Oops!" Button
*   **History Undo Stack**: Accidentally deleted your most important task? Checked the wrong box by mistake? Relax. Just click **Undo** or press <kbd>Ctrl</kbd> + <kbd>Z</kbd> to bring it right back! ♻️

### 🔔 Native Notifications
*   **Stay Alert**: Opt-in to receive native browser notification reminders precisely when your tasks are due! ⏰ (Requires browser permission).

---

## ⌨️ Absolute Accessibility & Keyboard Mastery ⌨️

This application scores a flawless **WCAG AA** contrast compliance. It utilizes robust semantic tags, invisible `aria-live` regions for screen readers, and full focus-tracking outlines! 🧑‍🦯

**Navigate Like a Pro (Global Shortcuts):**
*   <kbd>n</kbd> : Instantly jump to the "New Task" input. 📝
*   <kbd>/</kbd> : Zip over to the Search bar. 🕵️‍♂️
*   <kbd>Ctrl</kbd> + <kbd>Enter</kbd> : Add your new task from anywhere in the form. 🚀
*   <kbd>Ctrl</kbd> + <kbd>z</kbd> : Whoops! Undo your last action. ↩️
*   <kbd>?</kbd> : Toggle the graphical keyboard shortcuts overlay. 🗺️

**Task List Navigation (Once Focused):**
*   <kbd>↑</kbd> / <kbd>↓</kbd> (Up/Down Arrows) : Glide smoothly between tasks. 🏂
*   <kbd>Space</kbd> or <kbd>Enter</kbd> : Check / Uncheck the current task. ✅
*   <kbd>e</kbd> : Edit the current task title inline. ✍️
*   <kbd>Delete</kbd> or <kbd>Backspace</kbd> : Obliterate the current task. 💥
*   <kbd>Alt</kbd> + <kbd>↑</kbd> / <kbd>↓</kbd> : Pick up and physically **drag** the task up or down via the keyboard! 🪄 (Only works in "Custom" sort state).
*   <kbd>Escape</kbd> : Cancel an edit or close a dialog immediately. 🚪

---

## 🛠️ How to Run Locally 🛠️

Because this is a pure Vanilla project, getting started is practically instantaneous. ⚡

1.  **Clone or Download** this repository to your machine. 📥
2.  **Why a Server?** Progressive Web Apps (PWAs) and Service Workers *require* a secure context (like `localhost` or `HTTPS`) to initialize correctly. Simply double-clicking the `index.html` file (`file://`) will work for basic features, but will block offline capabilities! 🛑
3.  **Boot it up!** Use any basic static server in your project directory:
    *   🐍 **Python**: `python -m http.server 8000`
    *   🟢 **Node.js**: `npx serve .`
    *   💻 **VS Code**: Right-click `index.html` -> Select **"Open with Live Server"**
4.  Navigate your favorite web browser perfectly to `http://localhost:8000` 🌐 

---
*Built with ❤️ and ☕ to demonstrate advanced, modern client-side architecture without the heavy lifting of massive frameworks.*
