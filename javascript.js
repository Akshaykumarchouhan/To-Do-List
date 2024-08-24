document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('new-task');
    const addTaskButton = document.getElementById('add-task');
    const taskList = document.getElementById('task-list');
    const filterButtons = document.querySelectorAll('.filters button');

    let tasks = [];

    addTaskButton.addEventListener('click', () => {
        const taskText = taskInput.value.trim();
        if (taskText) {
            const task = {
                id: Date.now(),
                text: taskText,
                completed: false
            };
            tasks.push(task);
            taskInput.value = '';
            renderTasks();
        }
    });

    taskList.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete')) {
            const taskId = e.target.parentElement.dataset.id;
            tasks = tasks.filter(task => task.id != taskId);
            renderTasks();
        } else if (e.target.classList.contains('edit')) {
            const taskId = e.target.parentElement.dataset.id;
            const newText = prompt('Edit task:', e.target.parentElement.querySelector('.task-text').textContent);
            if (newText) {
                tasks = tasks.map(task => task.id == taskId ? { ...task, text: newText } : task);
                renderTasks();
            }
        } else if (e.target.classList.contains('toggle')) {
            const taskId = e.target.parentElement.dataset.id;
            tasks = tasks.map(task => task.id == taskId ? { ...task, completed: !task.completed } : task);
            renderTasks();
        }
    });

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            renderTasks(button.dataset.filter);
        });
    });

    function renderTasks(filter = 'all') {
        taskList.innerHTML = '';
        const filteredTasks = tasks.filter(task => {
            if (filter === 'completed') return task.completed;
            if (filter === 'pending') return !task.completed;
            return true;
        });
        filteredTasks.forEach(task => {
            const li = document.createElement('li');
            li.dataset.id = task.id;
            li.innerHTML = `
                <span class="task-text ${task.completed ? 'completed' : ''}">${task.text}</span>
                <button class="toggle">${task.completed ? 'Undo' : 'Complete'}</button>
                <button class="edit">Edit</button>
                <button class="delete">Delete</button>
            `;
            taskList.appendChild(li);
        });
    }
});