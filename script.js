document.addEventListener('DOMContentLoaded', () => {
    // Clock
    const clockElement = document.getElementById('clock');
    const updateClock = () => {
        const now = new Date();
        let hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        hours = hours.toString().padStart(2, '0');
        clockElement.textContent = `${hours}:${minutes}:${seconds} ${ampm}`;
    };
    setInterval(updateClock, 1000);
    updateClock();

    // Theme
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    const applyTheme = (theme) => {
        if (theme === 'dark') {
            body.classList.add('dark-mode');
            themeToggle.checked = true;
        } else {
            body.classList.remove('dark-mode');
            themeToggle.checked = false;
        }
    };
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        applyTheme(savedTheme);
    }
    themeToggle.addEventListener('change', () => {
        const theme = themeToggle.checked ? 'dark' : 'light';
        localStorage.setItem('theme', theme);
        applyTheme(theme);
    });

    // To-Do
    const newTaskInput = document.querySelector('.new-task-input');
    const addTaskBtn = document.querySelector('.add-task-btn');
    const taskList = document.querySelector('.task-list');

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let draggedItemIndex = null;

    const saveTasks = () => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    };

    const renderTasks = () => {
        taskList.innerHTML = '';
        tasks.forEach((task, index) => {
            const taskItem = document.createElement('li');
            taskItem.classList.add('task-item');
            taskItem.dataset.index = index;
            taskItem.draggable = true;

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.classList.add('task-checkbox');
            checkbox.checked = task.completed;

            const taskNameSpan = document.createElement('span');
            taskNameSpan.classList.add('task-name');
            if (task.completed) {
                taskNameSpan.classList.add('completed');
            }
            taskNameSpan.textContent = task.name;

            const deleteBtn = document.createElement('button');
            deleteBtn.classList.add('delete-btn');
            deleteBtn.innerHTML = '🗑️';

            taskItem.appendChild(checkbox);
            taskItem.appendChild(taskNameSpan);
            taskItem.appendChild(deleteBtn);

            taskList.appendChild(taskItem);
        });
    };

    const addTask = () => {
        const taskName = newTaskInput.value.trim();
        if (taskName) {
            tasks.push({ name: taskName, completed: false });
            saveTasks();
            renderTasks();
            newTaskInput.value = '';
        }
    };

    const deleteTask = (index) => {
        tasks.splice(index, 1);
        saveTasks();
        renderTasks();
    };

    const toggleTaskCompletion = (index) => {
        tasks[index].completed = !tasks[index].completed;
        saveTasks();
        renderTasks();
    };

    addTaskBtn.addEventListener('click', addTask);
    newTaskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    taskList.addEventListener('click', (e) => {
        const taskItem = e.target.closest('.task-item');
        if (taskItem) {
            const index = parseInt(taskItem.dataset.index, 10);
            if (e.target.classList.contains('delete-btn')) {
                deleteTask(index);
            } else if (e.target.classList.contains('task-checkbox')) {
                toggleTaskCompletion(index);
            }
        }
    });

    taskList.addEventListener('dragstart', (e) => {
        draggedItemIndex = parseInt(e.target.dataset.index, 10);
        e.target.classList.add('dragging');
    });

    taskList.addEventListener('dragend', (e) => {
        e.target.classList.remove('dragging');
        draggedItemIndex = null;
    });

    taskList.addEventListener('dragover', (e) => {
        e.preventDefault();
        const afterElement = getDragAfterElement(taskList, e.clientY);
        const dragging = document.querySelector('.dragging');
        if (afterElement == null) {
            taskList.appendChild(dragging);
        } else {
            taskList.insertBefore(dragging, afterElement);
        }
    });

    taskList.addEventListener('drop', (e) => {
        e.preventDefault();
        const newIndex = Array.from(taskList.children).indexOf(document.querySelector('.dragging'));
        const [draggedItem] = tasks.splice(draggedItemIndex, 1);
        tasks.splice(newIndex, 0, draggedItem);
        saveTasks();
        renderTasks();
    });

    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.task-item:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    renderTasks();
});
