(function () {
    'use strict';

    // ==========================================
    // MODULE 1: Storage & State Management
    // ==========================================
    const STORAGE_KEY = 'todo.tasks.v2';
    const THEME_KEY = 'todo.theme';
    let tasks = [];
    let historyStack = [];

    // UI State
    let currentFilter = 'all'; // all, active, completed, dueToday, overdue
    let currentSort = 'custom'; // custom, createdAt-desc, dueDate-asc, priority-desc, etc.
    let searchQuery = '';

    // Initialize Storage with Migration from v1
    function initStorage() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                tasks = JSON.parse(stored);
            } else {
                // Migration hook: look for v1 data
                const v1Key = 'tasks';
                const v1Data = localStorage.getItem(v1Key);
                if (v1Data) {
                    const parsed = JSON.parse(v1Data);
                    tasks = parsed.map(t => ({
                        id: t.id || Date.now().toString(),
                        title: t.text || 'Imported Task',
                        completed: t.completed || false,
                        createdAt: t.createdAt || new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        dueDate: '',
                        priority: 'normal',
                        tags: []
                    }));
                    saveTasks(false); // save as v2
                }
            }
        } catch (e) {
            console.warn('Storage read failed. Running in-memory mode.', e);
            tasks = [];
        }
    }

    function saveTasks(recordHistory = true) {
        if (recordHistory) {
            historyStack.push(JSON.stringify(tasks));
            if (historyStack.length > 50) historyStack.shift();
            DOM.undoBtn.disabled = false;
        }
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
        } catch (e) {
            console.warn('Storage write failed.', e);
        }
        renderTasks();
    }

    function undo() {
        if (historyStack.length === 0) return;
        try {
            const prevState = historyStack.pop();
            tasks = JSON.parse(prevState);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
            if (historyStack.length === 0) DOM.undoBtn.disabled = true;
            renderTasks();
            announce('Action undone.');
        } catch (e) {
            console.error('Undo failed', e);
        }
    }

    // ==========================================
    // MODULE 2: Notification System
    // ==========================================
    let notificationsEnabled = false;

    async function toggleNotifications() {
        if (!("Notification" in window)) {
            alert("This browser does not support desktop notification");
            return;
        }
        if (Notification.permission === "granted") {
            notificationsEnabled = true;
            announce('Notifications enabled.');
            checkDueTasks();
        } else if (Notification.permission !== "denied") {
            const permission = await Notification.requestPermission();
            if (permission === "granted") {
                notificationsEnabled = true;
                announce('Notifications enabled.');
                checkDueTasks();
            }
        }
    }

    function checkDueTasks() {
        if (!notificationsEnabled) return;
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];

        const dueToday = tasks.filter(t => !t.completed && t.dueDate === todayStr);
        if (dueToday.length > 0) {
            new Notification("To-Do List Reminders", {
                body: `You have ${dueToday.length} task(s) due today!`,
                icon: 'icons/icon-192.svg'
            });
        }
    }

    // ==========================================
    // MODULE 3: View & Core DOM Elements
    // ==========================================
    const DOM = {
        themeToggle: document.getElementById('theme-toggle'),
        notifyToggle: document.getElementById('notify-toggle'),
        helpBtn: document.getElementById('help-btn'),
        dateDisplay: document.getElementById('date-display'),
        announcer: document.getElementById('announcer'),

        addTaskForm: document.getElementById('add-task-form'),
        titleInput: document.getElementById('new-task-title'),
        dateInput: document.getElementById('new-task-date'),
        priorityInput: document.getElementById('new-task-priority'),
        tagsInput: document.getElementById('new-task-tags'),

        searchInput: document.getElementById('search-input'),
        sortSelect: document.getElementById('sort-select'),
        filterToggles: document.querySelectorAll('.tab-btn'),

        undoBtn: document.getElementById('undo-btn'),
        markAllBtn: document.getElementById('mark-all-btn'),
        clearCompletedBtn: document.getElementById('clear-completed-btn'),

        taskList: document.getElementById('task-list'),
        emptyState: document.getElementById('empty-state'),

        statTotal: document.getElementById('stat-total'),
        statActive: document.getElementById('stat-active'),
        statCompleted: document.getElementById('stat-completed'),

        shortcutsModal: document.getElementById('shortcuts-modal')
    };

    function announce(msg) {
        DOM.announcer.textContent = msg;
        // clear after read
        setTimeout(() => DOM.announcer.textContent = '', 3000);
    }

    function setDate() {
        const options = { weekday: 'long', month: 'short', day: 'numeric' };
        DOM.dateDisplay.textContent = new Date().toLocaleDateString(undefined, options);
    }

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(THEME_KEY, theme);
    }

    function parseTags(str) {
        return str.split(',').map(s => s.trim().toLowerCase()).filter(s => s.length > 0);
    }

    function isDueToday(dateStr) {
        if (!dateStr) return false;
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        return dateStr === todayStr;
    }

    function isOverdue(dateStr) {
        if (!dateStr) return false;
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const due = new Date(dateStr);
        due.setHours(0, 0, 0, 0);
        return due < now;
    }

    function getFilteredAndSortedTasks() {
        let result = [...tasks];

        // 1. Search (Title & Tags)
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(t =>
                t.title.toLowerCase().includes(query) ||
                t.tags.some(tag => tag.includes(query))
            );
        }

        // 2. Filter tabs
        if (currentFilter === 'active') {
            result = result.filter(t => !t.completed);
        } else if (currentFilter === 'completed') {
            result = result.filter(t => t.completed);
        } else if (currentFilter === 'dueToday') {
            result = result.filter(t => !t.completed && isDueToday(t.dueDate));
        } else if (currentFilter === 'overdue') {
            result = result.filter(t => !t.completed && isOverdue(t.dueDate));
        }

        // 3. Sort
        if (currentSort !== 'custom') {
            result.sort((a, b) => {
                const [field, dir] = currentSort.split('-');
                const mod = dir === 'asc' ? 1 : -1;

                if (field === 'createdAt') {
                    return (new Date(a.createdAt) - new Date(b.createdAt)) * mod;
                }
                if (field === 'dueDate') {
                    // Empty dates go to bottom
                    if (!a.dueDate) return 1;
                    if (!b.dueDate) return -1;
                    return (new Date(a.dueDate) - new Date(b.dueDate)) * mod;
                }
                if (field === 'priority') {
                    // High=3, Normal=2, Low=1
                    const pVal = p => p === 'high' ? 3 : p === 'normal' ? 2 : 1;
                    return (pVal(a.priority) - pVal(b.priority)) * mod;
                }
                if (field === 'status') {
                    // Active (false) first
                    return (a.completed === b.completed ? 0 : a.completed ? 1 : -1) * mod;
                }
                return 0;
            });
        }

        return result;
    }

    function renderTasks() {
        const filtered = getFilteredAndSortedTasks();
        const fragment = document.createDocumentFragment();

        filtered.forEach((task, index) => {
            const li = document.createElement('li');
            li.className = `task-item priority-${task.priority} ${task.completed ? 'completed' : ''} ${!task.completed && isOverdue(task.dueDate) ? 'overdue' : ''}`;
            li.dataset.index = tasks.findIndex(t => t.id === task.id); // original index
            li.dataset.id = task.id;
            li.draggable = currentSort === 'custom' && !searchQuery; // Only allow DND in custom sort and no search
            li.tabIndex = 0; // make focusable for kb nav

            // Meta row construction
            let metaHtml = '';
            if (task.dueDate) {
                metaHtml += `<span class="due-date-display" title="Due Date"><svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg> ${task.dueDate}</span>`;
            }
            if (task.tags && task.tags.length > 0) {
                metaHtml += task.tags.map(tag => `<span class="tag-chip">#${tag}</span>`).join('');
            }

            li.innerHTML = `
                ${li.draggable ? `<div class="drag-handle" aria-hidden="true" title="Drag to reorder"><svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg></div>` : ''}
                
                <label class="checkbox-container" aria-label="${task.completed ? 'Mark as active' : 'Mark as complete'}">
                    <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} tabindex="-1">
                    <span class="checkbox-visual"></span>
                </label>
                
                <div class="task-content">
                    <input type="text" class="inline-edit-input title-input" value="${escapeHTML(task.title)}" aria-label="Task title (editable)" ${task.completed ? 'readonly tabindex="-1"' : 'tabindex="-1"'}>
                    ${metaHtml ? `<div class="task-meta">${metaHtml}</div>` : ''}
                </div>
                
                <div class="task-actions">
                    <button class="action-btn delete btn-delete" aria-label="Delete task" tabindex="-1">
                        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                </div>
            `;
            fragment.appendChild(li);
        });

        DOM.taskList.innerHTML = '';
        DOM.taskList.appendChild(fragment);

        updateCounts();
    }

    function updateCounts() {
        const total = tasks.length;
        const comp = tasks.filter(t => t.completed).length;
        const act = total - comp;

        DOM.statTotal.textContent = total;
        DOM.statActive.textContent = act;
        DOM.statCompleted.textContent = comp;

        if (total === 0 || DOM.taskList.children.length === 0) {
            DOM.emptyState.classList.remove('hidden');
            if (total === 0) {
                DOM.emptyState.querySelector('#empty-title').textContent = 'All caught up!';
                DOM.emptyState.querySelector('#empty-message').textContent = 'You have no tasks taking up space.';
            } else {
                DOM.emptyState.querySelector('#empty-title').textContent = 'No matches found';
                DOM.emptyState.querySelector('#empty-message').textContent = 'Try changing your filters or search query.';
            }
        } else {
            DOM.emptyState.classList.add('hidden');
        }
    }

    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g,
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    }

    // ==========================================
    // MODULE 4: Controllers & Event Listeners
    // ==========================================

    // Add Form Submit
    DOM.addTaskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = DOM.titleInput.value.trim();
        if (!title) return;

        const newTask = {
            id: Date.now().toString(),
            title: title,
            completed: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            dueDate: DOM.dateInput.value || '',
            priority: DOM.priorityInput.value || 'normal',
            tags: parseTags(DOM.tagsInput.value)
        };

        // For custom sort (default), unshift puts it at top
        tasks.unshift(newTask);
        saveTasks();

        DOM.addTaskForm.reset();

        // Reset to normal priority by default
        DOM.priorityInput.value = 'normal';

        // If sorting or filtering hides the task, notify user
        announce(`Task "${title}" added.`);

        // Return focus to input for rapid entry
        DOM.titleInput.focus();
    });

    // Delegate Task List Events
    DOM.taskList.addEventListener('change', (e) => {
        if (e.target.classList.contains('task-checkbox')) {
            const li = e.target.closest('.task-item');
            const taskId = li.dataset.id;
            const task = tasks.find(t => t.id === taskId);

            // push state manually before modifier
            historyStack.push(JSON.stringify(tasks));
            if (historyStack.length > 50) historyStack.shift();
            DOM.undoBtn.disabled = false;

            task.completed = e.target.checked;
            task.updatedAt = new Date().toISOString();

            try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); } catch (err) { }

            announce(`Task marked as ${task.completed ? 'completed' : 'active'}.`);
            // Render to update UI placement if filtered/sorted
            renderTasks();
        }
    });

    // Title Inline Editing (Blur/Enter)
    DOM.taskList.addEventListener('focusout', (e) => {
        if (e.target.classList.contains('title-input')) {
            saveEdit(e.target);
        }
    });
    DOM.taskList.addEventListener('keydown', (e) => {
        if (e.target.classList.contains('title-input')) {
            if (e.key === 'Enter') {
                e.preventDefault();
                e.target.blur(); // will trigger focusout logic
            } else if (e.key === 'Escape') {
                // Cancel edit - restore original
                const taskId = e.target.closest('.task-item').dataset.id;
                const task = tasks.find(t => t.id === taskId);
                e.target.value = task.title;
                e.target.blur();
                e.target.closest('.task-item').focus();
            }
        }
    });

    function saveEdit(inputElem) {
        const li = inputElem.closest('.task-item');
        if (!li) return;
        const taskId = li.dataset.id;
        const task = tasks.find(t => t.id === taskId);
        const newTitle = inputElem.value.trim();

        if (newTitle && newTitle !== task.title && !task.completed) {
            historyStack.push(JSON.stringify(tasks));
            if (historyStack.length > 50) historyStack.shift();
            DOM.undoBtn.disabled = false;

            task.title = newTitle;
            task.updatedAt = new Date().toISOString();
            try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); } catch (err) { }
            announce('Task title updated.');
        } else {
            // Revert if empty
            inputElem.value = task.title;
        }
    }

    DOM.taskList.addEventListener('click', (e) => {
        const deleteBtn = e.target.closest('.btn-delete');
        if (deleteBtn) {
            const li = deleteBtn.closest('.task-item');
            const taskId = li.dataset.id;
            const idx = tasks.findIndex(t => t.id === taskId);

            if (confirm('Delete this task?')) {
                historyStack.push(JSON.stringify(tasks));
                if (historyStack.length > 50) historyStack.shift();
                DOM.undoBtn.disabled = false;

                tasks.splice(idx, 1);
                announce('Task deleted.');

                saveTasks(false); // already saved history
            }
        }
    });

    // Keyboard navigation & Accessibility on Task Item
    DOM.taskList.addEventListener('keydown', (e) => {
        const li = e.target.closest('.task-item');
        // If target is the LI itself (it's focused)
        if (e.target === li) {
            const index = parseInt(li.dataset.index, 10);

            // Space or Enter to toggle checkbox
            if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                const checkbox = li.querySelector('.task-checkbox');
                checkbox.checked = !checkbox.checked;
                checkbox.dispatchEvent(new Event('change', { bubbles: true }));
            }

            // Delete key to delete task
            if (e.key === 'Delete' || e.key === 'Backspace') {
                const delBtn = li.querySelector('.btn-delete');
                delBtn.click();
            }

            // Arrow navigation
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (e.altKey && DOM.sortSelect.value === 'custom' && !searchQuery) {
                    moveTask(index, index + 1);
                } else {
                    const next = li.nextElementSibling;
                    if (next) next.focus();
                }
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (e.altKey && DOM.sortSelect.value === 'custom' && !searchQuery) {
                    moveTask(index, index - 1);
                } else {
                    const prev = li.previousElementSibling;
                    if (prev) prev.focus();
                }
            }

            // Allow Edit transition
            if (e.key === 'e' && !e.ctrlKey) {
                e.preventDefault();
                li.querySelector('.title-input').focus();
            }
        }
    });

    function moveTask(fromIdx, toIdx) {
        if (toIdx < 0 || toIdx >= tasks.length) return;
        historyStack.push(JSON.stringify(tasks));
        DOM.undoBtn.disabled = false;

        const temp = tasks[fromIdx];
        tasks[fromIdx] = tasks[toIdx];
        tasks[toIdx] = temp;

        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); } catch (err) { }
        renderTasks();

        // Restore focus
        setTimeout(() => {
            const focused = DOM.taskList.querySelector(`[data-index="${toIdx}"]`);
            if (focused) focused.focus();
            announce(`Task moved ${toIdx < fromIdx ? 'up' : 'down'}.`);
        }, 0);
    }

    // Filters, Sort & Search
    DOM.filterToggles.forEach(btn => {
        btn.addEventListener('click', () => {
            DOM.filterToggles.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderTasks();
            announce(`Showing ${currentFilter} tasks.`);
        });
    });

    DOM.sortSelect.addEventListener('change', (e) => {
        currentSort = e.target.value;
        renderTasks();
        announce(`Sorted by ${e.target.options[e.target.selectedIndex].text}.`);
    });

    let searchTimeout;
    DOM.searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            searchQuery = e.target.value;
            renderTasks();
        }, 200);
    });

    // Bulk Actions
    DOM.undoBtn.addEventListener('click', undo);

    DOM.markAllBtn.addEventListener('click', () => {
        const hasUncompleted = tasks.some(t => !t.completed);
        if (!hasUncompleted) return; // nothing to do

        saveTasks(true); // Save history
        tasks.forEach(t => t.completed = true);
        saveTasks(false);
        announce('All tasks marked as completed.');
    });

    DOM.clearCompletedBtn.addEventListener('click', () => {
        const completed = tasks.filter(t => t.completed);
        if (completed.length === 0) return;

        if (confirm(`Clear all ${completed.length} completed tasks?`)) {
            saveTasks(true);
            tasks = tasks.filter(t => !t.completed);
            saveTasks(false);
            announce('Completed tasks cleared.');
        }
    });

    // Theme Toggle
    DOM.themeToggle.addEventListener('click', () => {
        const currentThm = document.documentElement.getAttribute('data-theme');
        const newThm = currentThm === 'dark' ? 'light' : 'dark';
        applyTheme(newThm);
        announce(`${newThm} theme enabled.`);
    });

    // Notify Toggle
    DOM.notifyToggle.addEventListener('click', toggleNotifications);

    // Help Dialog
    DOM.helpBtn.addEventListener('click', () => DOM.shortcutsModal.showModal());

    // Global Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
        // Only if we aren't inside an input naturally
        const target = e.target.nodeName.toLowerCase();
        const isInInput = target === 'input' || target === 'textarea' || target === 'select';

        // Modal close with Esc is native, but just in case

        if (!isInInput) {
            if (e.key === 'n') {
                e.preventDefault();
                DOM.titleInput.focus();
            } else if (e.key === '/') {
                e.preventDefault();
                DOM.searchInput.focus();
            } else if (e.key === '?') {
                if (e.shiftKey) { // Shift+?
                    e.preventDefault();
                    if (DOM.shortcutsModal.open) DOM.shortcutsModal.close();
                    else DOM.shortcutsModal.showModal();
                }
            } else if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                e.preventDefault();
                undo();
            }
        }

        // Add task with Ctrl+Enter anywhere
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            if (document.activeElement === DOM.titleInput ||
                document.activeElement === DOM.dateInput ||
                document.activeElement === DOM.tagsInput) {
                // Trigger submit if focus is in add form
                DOM.addTaskForm.dispatchEvent(new Event('submit', { cancelable: true }));
            }
        }
    });

    // ==========================================
    // MODULE 5: Drag and Drop (Pointer)
    // ==========================================
    let dragSourceIndex = -1;

    DOM.taskList.addEventListener('dragstart', (e) => {
        const li = e.target.closest('.task-item');
        if (!li || !li.draggable) return;
        dragSourceIndex = parseInt(li.dataset.index, 10);
        li.classList.add('is-dragging');
        e.dataTransfer.effectAllowed = 'move';
        // Setting data payload, required by Firefox
        e.dataTransfer.setData('text/plain', dragSourceIndex);
    });

    DOM.taskList.addEventListener('dragover', (e) => {
        e.preventDefault(); // necessary to allow dropping
        e.dataTransfer.dropEffect = 'move';
        const li = e.target.closest('.task-item');
        if (li && !li.classList.contains('is-dragging')) {
            li.classList.add('drag-over');
        }
    });

    DOM.taskList.addEventListener('dragleave', (e) => {
        const li = e.target.closest('.task-item');
        if (li) li.classList.remove('drag-over');
    });

    DOM.taskList.addEventListener('dragend', (e) => {
        const li = e.target.closest('.task-item');
        if (li) li.classList.remove('is-dragging');

        // Clean any persistent drag-overs
        DOM.taskList.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
    });

    DOM.taskList.addEventListener('drop', (e) => {
        e.preventDefault();
        const li = e.target.closest('.task-item');
        if (li) li.classList.remove('drag-over');

        if (dragSourceIndex === -1 || !li) return;

        const targetIndex = parseInt(li.dataset.index, 10);
        if (targetIndex !== dragSourceIndex) {
            moveTask(dragSourceIndex, targetIndex);
        }
        dragSourceIndex = -1;
    });

    // ==========================================
    // MODULE 6: Init & PWA Service Worker
    // ==========================================
    function init() {
        initStorage();
        setDate();

        // Load Theme preference
        const savedTheme = localStorage.getItem(THEME_KEY) ||
            (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        applyTheme(savedTheme);

        renderTasks();

        // Register Service Worker
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('./sw.js').then((registration) => {
                    console.log('SW registered: ', registration.scope);
                }).catch((registrationError) => {
                    console.log('SW init fail: ', registrationError);
                });
            });
        }

        // Initial Notification Check
        if ("Notification" in window && Notification.permission === "granted") {
            notificationsEnabled = true;
            checkDueTasks();
        }
    }

    init();

})();