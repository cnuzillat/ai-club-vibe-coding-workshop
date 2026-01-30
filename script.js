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

            const taskMeta = document.createElement('div');
            taskMeta.classList.add('task-meta');

            const prioritySelect = document.createElement('select');
            prioritySelect.classList.add('priority-select');
            prioritySelect.innerHTML = `
                <option value="none">None</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
            `;
            prioritySelect.value = task.priority || 'none'; // Set current priority

            const dueDateDisplay = document.createElement('span');
            dueDateDisplay.classList.add('due-date-display');
            if (task.dueDate) {
                // Fix: Parse the date as local time to avoid timezone issues
                dueDateDisplay.textContent = `Due: ${new Date(task.dueDate + 'T00:00:00').toLocaleDateString()}`;
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const taskDueDate = new Date(task.dueDate + 'T00:00:00'); // Fix: Parse as local time for comparison
                taskDueDate.setHours(0, 0, 0, 0);

                if (taskDueDate < today && !task.completed) {
                    taskItem.classList.add('overdue');
                }
            }

            const setDueDateBtn = document.createElement('button');
            setDueDateBtn.classList.add('set-due-date-btn');
            setDueDateBtn.innerHTML = '🗓️'; // Calendar icon

            const deleteBtn = document.createElement('button');
            deleteBtn.classList.add('delete-btn');
            deleteBtn.innerHTML = '🗑️';

            taskMeta.appendChild(prioritySelect); // Add priority select
            taskMeta.appendChild(dueDateDisplay);
            taskMeta.appendChild(setDueDateBtn);

            taskItem.appendChild(checkbox);
            taskItem.appendChild(taskNameSpan);
            taskItem.appendChild(taskMeta); // Add task meta div
            taskItem.appendChild(deleteBtn);

            // Add priority class to task item for styling
            if (task.priority && task.priority !== 'none') {
                taskItem.classList.add(`priority-${task.priority}`);
            }

            taskList.appendChild(taskItem);
        });
    };

    const addTask = () => {
        const taskName = newTaskInput.value.trim();
        if (taskName) {
            tasks.push({ name: taskName, completed: false, dueDate: null, priority: 'none' }); // Initialize dueDate and priority
            saveTasks();
            renderTasks();
            newTaskInput.value = '';
        }
    };

    const editTask = (index, newName) => {
        if (newName.trim() === '') {
            // If new name is empty, delete the task
            deleteTask(index);
        } else {
            tasks[index].name = newName.trim();
            saveTasks();
            renderTasks();
        }
    };

    const editDueDate = (index, newDate) => {
        tasks[index].dueDate = newDate;
        saveTasks();
        renderTasks();
    };

    const editPriority = (index, newPriority) => {
        tasks[index].priority = newPriority;
        saveTasks();
        renderTasks();
    };

    const deleteTask = (index) => {
        tasks.splice(index, 1);
        saveTasks();
        renderTasks();
    };

    const clearCompletedTasks = () => {
        tasks = tasks.filter(task => !task.completed);
        saveTasks();
        renderTasks();
    };

    const toggleTaskCompletion = (index, event) => {
        tasks[index].completed = !tasks[index].completed;
        if (tasks[index].completed) {
            // Trigger celebration if task is marked complete
            triggerCelebration(event.clientX, event.clientY);
        }
        saveTasks();
        renderTasks();
    };

    const triggerCelebration = (x, y) => {
        const confettiColors = ['#ffc107', '#2196f3', '#4caf50', '#e91e63', '#9c27b0'];
        for (let i = 0; i < 30; i++) {
            const confetti = document.createElement('div');
            confetti.classList.add('confetti');
            confetti.style.backgroundColor = confettiColors[Math.floor(Math.random() * confettiColors.length)];
            confetti.style.left = `${x}px`;
            confetti.style.top = `${y}px`;
            confetti.style.transform = `translate(-50%, -50%) rotate(${Math.random() * 360}deg)`;
            document.body.appendChild(confetti);

            const size = Math.random() * 10 + 5; // 5-15px
            const duration = Math.random() * 1.5 + 1; // 1-2.5 seconds
            const delay = Math.random() * 0.5;
            const translateX = (Math.random() - 0.5) * 500; // -250 to 250px
            const translateY = (Math.random() - 0.5) * 500; // -250 to 250px
            const rotation = Math.random() * 1000;

            confetti.animate([
                { transform: `translate(-50%, -50%) rotate(0deg)`, opacity: 1, width: `${size}px`, height: `${size}px` },
                { transform: `translate(${translateX}px, ${translateY}px) rotate(${rotation}deg)`, opacity: 0 }
            ], {
                duration: duration * 1000,
                easing: 'ease-out',
                delay: delay * 1000,
                fill: 'forwards'
            });

            confetti.addEventListener('animationend', () => {
                confetti.remove();
            });
        }
    };

    addTaskBtn.addEventListener('click', addTask);
    newTaskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    const clearCompletedBtn = document.getElementById('clear-completed-btn');
    clearCompletedBtn.addEventListener('click', clearCompletedTasks);

    taskList.addEventListener('click', (e) => {
        const taskItem = e.target.closest('.task-item');
        if (taskItem) {
            const index = parseInt(taskItem.dataset.index, 10);
            if (e.target.classList.contains('delete-btn')) {
                deleteTask(index);
            } else if (e.target.classList.contains('task-checkbox')) {
                toggleTaskCompletion(index, e); // Pass the event object
            } else if (e.target.classList.contains('set-due-date-btn')) {
                const dueDateDisplay = taskItem.querySelector('.due-date-display');
                const setDueDateBtn = e.target;
                const originalDueDate = tasks[index].dueDate;

                const dateInput = document.createElement('input');
                dateInput.type = 'date';
                dateInput.classList.add('due-date-input');
                if (originalDueDate) {
                    dateInput.value = originalDueDate;
                }

                dueDateDisplay.replaceWith(dateInput);
                setDueDateBtn.remove(); // Remove the button

                dateInput.focus();

                const saveDueDateChanges = () => {
                    editDueDate(index, dateInput.value);
                };

                dateInput.addEventListener('change', saveDueDateChanges);
                dateInput.addEventListener('blur', () => {
                    // Re-render to show display or original date if blur without change
                    renderTasks();
                });
            }
        }
    });

    // Handle priority changes
    taskList.addEventListener('change', (e) => {
        if (e.target.classList.contains('priority-select')) {
            const taskItem = e.target.closest('.task-item');
            const index = parseInt(taskItem.dataset.index, 10);
            editPriority(index, e.target.value);
        }
    });

    // Initialize due dates and priorities for existing tasks if they don't have one
    tasks = tasks.map(task => {
        if (task.dueDate === undefined) {
            task.dueDate = null;
        }
        if (task.priority === undefined) {
            task.priority = 'none'; // Initialize priority for old tasks
        }
        return task;
    });

    taskList.addEventListener('dblclick', (e) => {
        const taskItem = e.target.closest('.task-item');
        if (taskItem && e.target.classList.contains('task-name')) {
            const index = parseInt(taskItem.dataset.index, 10);
            const taskNameSpan = e.target;
            const originalTaskName = tasks[index].name;

            const editInput = document.createElement('input');
            editInput.type = 'text';
            editInput.classList.add('edit-task-input');
            editInput.value = originalTaskName;

            taskNameSpan.replaceWith(editInput);
            editInput.focus();
            editInput.select();

            const saveChanges = () => {
                editTask(index, editInput.value);
            };

            editInput.addEventListener('blur', saveChanges);
            editInput.addEventListener('keypress', (keyEvent) => {
                if (keyEvent.key === 'Enter') {
                    editInput.removeEventListener('blur', saveChanges); // Prevent blur from firing twice
                    saveChanges();
                }
            });
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

    // Pomodoro Timer
    const WORK_DURATION = 25 * 60; // 25 minutes
    const SHORT_BREAK_DURATION = 5 * 60; // 5 minutes
    const LONG_BREAK_DURATION = 15 * 60; // 15 minutes
    const NUM_WORK_SESSIONS_BEFORE_LONG_BREAK = 4;

    let currentMode = 'work';
    let timeLeft = WORK_DURATION;
    let timerInterval;
    let isPaused = true;
    let workSessionsCompleted = 0;

    const timerDisplay = document.getElementById('timer-display');
    const timerState = document.getElementById('timer-state');
    const startBtn = document.getElementById('start-timer');
    const pauseBtn = document.getElementById('pause-timer');
    const resetBtn = document.getElementById('reset-timer');
    const skipBtn = document.getElementById('skip-timer');

    const updateTimerDisplay = () => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        timerState.textContent = currentMode.charAt(0).toUpperCase() + currentMode.slice(1);
        document.title = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} - ${currentMode.toUpperCase()}`;
    };

    const switchMode = () => {
        if (currentMode === 'work') {
            workSessionsCompleted++;
            if (workSessionsCompleted % NUM_WORK_SESSIONS_BEFORE_LONG_BREAK === 0) {
                currentMode = 'long break';
                timeLeft = LONG_BREAK_DURATION;
            } else {
                currentMode = 'short break';
                timeLeft = SHORT_BREAK_DURATION;
            }
        } else {
            currentMode = 'work';
            timeLeft = WORK_DURATION;
        }
        isPaused = true;
        clearInterval(timerInterval);
        updateTimerDisplay();
    };

    const startTimer = () => {
        isPaused = false;
        timerInterval = setInterval(() => {
            timeLeft--;
            updateTimerDisplay();
            if (timeLeft <= 0) {
                switchMode();
                // Play a sound
            }
        }, 1000);
    };

    const pauseTimer = () => {
        isPaused = true;
        clearInterval(timerInterval);
    };

    const resetTimer = () => {
        pauseTimer();
        if (currentMode === 'work') {
            timeLeft = WORK_DURATION;
        } else if (currentMode === 'short break') {
            timeLeft = SHORT_BREAK_DURATION;
        } else {
            timeLeft = LONG_BREAK_DURATION;
        }
        updateTimerDisplay();
    };

    const skipTimer = () => {
        switchMode();
    };

    startBtn.addEventListener('click', startTimer);
    pauseBtn.addEventListener('click', pauseTimer);
    resetBtn.addEventListener('click', resetTimer);
    skipBtn.addEventListener('click', skipTimer);

    updateTimerDisplay(); // Initial display
});

