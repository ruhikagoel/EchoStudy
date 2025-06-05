// Task Management
let tasks = [];
let currentTimer = null;
let currentTask = null;
let timerRunning = false;
let categories = new Set(['Math', 'Science', 'English', 'History']);

// Load tasks from localStorage
function loadTasks() {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
        tasks.forEach(task => {
            if (task.category) {
                categories.add(task.category);
            }
        });
        updateCategorySelect();
        renderTasks();
        updateStats();
        renderDueDates();
    }
    initializeTimer();
}

// Save tasks to localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    updateStats();
    renderDueDates();
}

// Update clock
function updateClock() {
    const now = new Date();
    const timeDisplay = document.querySelector('.time');
    timeDisplay.textContent = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit'
    });
}

// Update clock every minute
setInterval(updateClock, 60000);
updateClock();

// Category Management
function updateCategorySelect() {
    const select = document.getElementById('taskCategory');
    select.innerHTML = '<option value="">Select or create new...</option>' +
        Array.from(categories).sort().map(cat => 
            `<option value="${cat}">${cat}</option>`
        ).join('');
}

document.getElementById('toggleCategory').addEventListener('click', () => {
    const select = document.getElementById('taskCategory');
    const input = document.getElementById('newCategory');
    
    if (input.style.display === 'none') {
        select.style.display = 'none';
        input.style.display = 'block';
        input.focus();
    } else {
        select.style.display = 'block';
        input.style.display = 'none';
        select.focus();
    }
});

// Task Management
document.querySelector('.btn-add').addEventListener('click', () => {
    const modal = document.getElementById('addTaskModal');
    modal.style.display = 'flex';
});

// Add Task Form Submit
document.getElementById('addTaskForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('taskTitle').value;
    const categorySelect = document.getElementById('taskCategory');
    const categoryInput = document.getElementById('newCategory');
    const dueDate = document.getElementById('taskDueDate').value;
    
    let category = categorySelect.value;
    if (categoryInput.style.display !== 'none' && categoryInput.value) {
        category = categoryInput.value;
        categories.add(category);
        updateCategorySelect();
    }
    
    const task = {
        id: Date.now(),
        title,
        category,
        dueDate,
        completed: false,
        timeSpent: 0,
        reflections: []
    };
    
    tasks.push(task);
    saveTasks();
    
    // Reset and close form
    e.target.reset();
    categorySelect.style.display = 'block';
    categoryInput.style.display = 'none';
    document.getElementById('addTaskModal').style.display = 'none';
});

// Reset functionality
function resetData() {
    if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
        localStorage.clear();
        tasks = [];
        categories = new Set(['Math', 'Science', 'English', 'History']);
        updateCategorySelect();
        renderTasks();
        updateStats();
        renderDueDates();
    }
}

// Close modal helper
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Filter Management
document.querySelectorAll('.filter').forEach(filter => {
    filter.addEventListener('click', () => {
        document.querySelectorAll('.filter').forEach(f => f.classList.remove('active'));
        filter.classList.add('active');
        
        const filterType = filter.textContent.toLowerCase();
        let filteredTasks = [...tasks];
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const weekEnd = new Date(today);
        weekEnd.setDate(today.getDate() + 7);
        
        if (filterType === 'today') {
            filteredTasks = tasks.filter(task => {
                const taskDate = new Date(task.dueDate);
                taskDate.setHours(0, 0, 0, 0);
                return taskDate.getTime() === today.getTime();
            });
        } else if (filterType === 'this week') {
            filteredTasks = tasks.filter(task => {
                const taskDate = new Date(task.dueDate);
                return taskDate >= today && taskDate <= weekEnd;
            });
        } else if (filterType === 'completed') {
            filteredTasks = tasks.filter(task => task.completed);
        }
        
        renderTasks(filteredTasks);
    });
});

// Timer Functions
function startTimer(taskId) {
    if (timerRunning) {
        stopTimer();
        return;
    }
    
    currentTask = tasks.find(t => t.id === taskId);
    if (!currentTask) return;
    
    timerRunning = true;
    const timerDisplay = document.getElementById('timerDisplay');
    const timerContent = document.querySelector('.timer-content');
    const startTime = Date.now() - (currentTask.timeSpent * 1000 || 0);
    
    timerContent.classList.remove('inactive');
    timerContent.classList.add('active');
    
    currentTimer = setInterval(() => {
        const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
        const minutes = Math.floor(elapsedTime / 60);
        const seconds = elapsedTime % 60;
        timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        
        currentTask.timeSpent = elapsedTime;
        updateStats();
    }, 1000);
    
    document.getElementById('currentTaskName').textContent = currentTask.title;

    // Add tab visibility detection
    document.addEventListener('visibilitychange', handleVisibilityChange);
}

function stopTimer() {
    if (currentTimer) {
        clearInterval(currentTimer);
        currentTimer = null;
        timerRunning = false;
        
        const timerContent = document.querySelector('.timer-content');
        timerContent.classList.remove('active');
        timerContent.classList.add('inactive');
        
        document.getElementById('timerDisplay').textContent = '00:00';
        document.getElementById('currentTaskName').textContent = 'No task selected';
        
        // Remove tab visibility detection
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        
        if (currentTask) {
            showReflectionModal(currentTask.id);
            saveTasks();
        }
    }
}

// Tab visibility handling
function handleVisibilityChange() {
    console.log('Visibility changed:', document.hidden);
    if (document.hidden && timerRunning) {
        console.log('Timer was running, showing notification');
        showTimerNotification();
        pauseTimer();
    }
}

function pauseTimer() {
    if (currentTimer) {
        clearInterval(currentTimer);
        currentTimer = null;
        timerRunning = false;
        saveTasks();
    }
}

function showTimerNotification() {
    console.log('Showing notification');
    const notification = document.createElement('div');
    notification.className = 'timer-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-clock"></i>
            <p>Timer paused! Switching tabs will pause your study session.</p>
            <button class="btn btn-primary" onclick="closeNotification(this)">
                Got it
            </button>
        </div>
    `;
    document.body.appendChild(notification);

    // Remove notification after 5 seconds
    setTimeout(() => {
        closeNotification(notification.querySelector('button'));
    }, 5000);
}

function closeNotification(button) {
    const notification = button.closest('.timer-notification');
    if (notification) {
        notification.classList.add('hiding');
        setTimeout(() => notification.remove(), 300);
    }
}

// Initialize timer state
function initializeTimer() {
    const timerContent = document.querySelector('.timer-content');
    if (!timerRunning) {
        timerContent.classList.add('inactive');
        document.getElementById('currentTaskName').textContent = 'No task selected';
    }
}

// Reflection Modal
function showReflectionModal(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const modal = document.getElementById('reflectionModal');
    modal.dataset.taskId = taskId;
    modal.dataset.currentQuestion = 'focus';
    
    document.getElementById('reflectionQuestions').innerHTML = `
        <h3>Reflection for: ${task.title}</h3>
        <div class="reflection-question" id="focusQuestion">
            <p>Did you maintain focus during this session?</p>
            <div class="reflection-buttons">
                <button class="btn btn-no" onclick="answerReflection(${taskId}, 'focus', false)">No</button>
                <button class="btn btn-yes" onclick="answerReflection(${taskId}, 'focus', true)">Yes</button>
            </div>
        </div>
    `;
    
    modal.style.display = 'flex';
}

function answerReflection(taskId, type, value) {
    const task = tasks.find(t => t.id === taskId);
    const modal = document.getElementById('reflectionModal');
    if (!task) return;
    
    task.reflections.push({
        type,
        value,
        timestamp: new Date().toISOString()
    });
    
    if (type === 'focus') {
        document.getElementById('reflectionQuestions').innerHTML = `
            <h3>Reflection for: ${task.title}</h3>
            <div class="reflection-question">
                <p>Did you complete your planned work?</p>
                <div class="reflection-buttons">
                    <button class="btn btn-no" onclick="answerReflection(${taskId}, 'completion', false)">No</button>
                    <button class="btn btn-yes" onclick="answerReflection(${taskId}, 'completion', true)">Yes</button>
                </div>
            </div>
        `;
        modal.dataset.currentQuestion = 'completion';
    } else if (type === 'completion') {
        task.completed = value;
        modal.style.display = 'none';
        saveTasks();
        renderTasks();
    }
}

// Function to render tasks
function renderTasks(taskList = tasks) {
    const tasksContainer = document.querySelector('.tasks');
    tasksContainer.innerHTML = taskList.map(task => `
        <div class="task-item ${task.completed ? 'completed' : ''}">
            <input type="checkbox" ${task.completed ? 'checked' : ''} 
                   onchange="toggleTaskComplete(${task.id})">
            <span class="task-title">${task.title}</span>
            <span class="task-category">${task.category}</span>
            <span class="task-due-date">${formatDate(task.dueDate)}</span>
            <button class="btn btn-timer" onclick="startTimer(${task.id})" ${task.completed ? 'disabled' : ''}>
                <i class="fas fa-clock"></i>
                Start Timer
            </button>
        </div>
    `).join('');
}

function toggleTaskComplete(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        if (currentTask && currentTask.id === taskId) {
            stopTimer();
        }
        task.completed = !task.completed;
        if (task.completed) {
            showReflectionModal(taskId);
        }
        saveTasks();
    }
}

// Update Stats
function updateStats() {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    // Calculate tasks completed today
    const completedToday = tasks.filter(t => 
        t.completed && t.reflections.some(r => 
            r.timestamp.startsWith(today)
        )
    ).length;
    
    const totalTasks = tasks.length;
    
    // Calculate total time spent today
    const timeSpentToday = tasks.reduce((total, task) => {
        return total + (task.timeSpent || 0);
    }, 0);

    // Calculate focus score
    const focusReflections = tasks.flatMap(t => t.reflections.filter(r => r.type === 'focus'));
    const focusScore = focusReflections.length > 0
        ? Math.round((focusReflections.filter(r => r.value).length / focusReflections.length) * 100)
        : 0;

    // Calculate streak
    const streak = calculateStreak();
    
    // Update stats display
    document.querySelector('[data-stat="tasksCompleted"]').textContent = `${completedToday}/${totalTasks}`;
    document.querySelector('[data-stat="timeSpent"]').textContent = 
        `${Math.floor(timeSpentToday / 60)} minutes`;
    document.querySelector('[data-stat="focusScore"]').textContent = `${focusScore}%`;
    document.querySelector('[data-stat="streak"]').textContent = `${streak} days`;
}

function calculateStreak() {
    const dates = tasks
        .flatMap(t => t.reflections.map(r => r.timestamp.split('T')[0]))
        .sort()
        .reverse();
    
    if (dates.length === 0) return 0;

    let streak = 1;
    let currentDate = new Date(dates[0]);

    for (let i = 1; i < dates.length; i++) {
        const prevDate = new Date(currentDate);
        prevDate.setDate(prevDate.getDate() - 1);
        
        if (dates[i] === prevDate.toISOString().split('T')[0]) {
            streak++;
            currentDate = prevDate;
        } else {
            break;
        }
    }

    return streak;
}

// Due Dates
function renderDueDates() {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    const upcomingTasks = tasks
        .filter(t => {
            if (t.completed) return false;
            const dueDate = new Date(t.dueDate);
            dueDate.setHours(0, 0, 0, 0);
            return dueDate >= now;
        })
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
        .slice(0, 5); // Show only next 5 upcoming tasks
    
    const dueList = document.querySelector('.due-dates-list');
    if (upcomingTasks.length === 0) {
        dueList.innerHTML = '<p class="no-tasks">No upcoming tasks</p>';
        return;
    }
    
    const groupedTasks = {};
    upcomingTasks.forEach(task => {
        const date = formatDate(task.dueDate);
        if (!groupedTasks[date]) {
            groupedTasks[date] = [];
        }
        groupedTasks[date].push(task);
    });
    
    dueList.innerHTML = Object.entries(groupedTasks)
        .map(([date, tasks]) => `
            <div class="upcoming-task-group">
                <div class="upcoming-date">${date}</div>
                ${tasks.map(task => `
                    <div class="upcoming-task">
                        <div class="upcoming-title">${task.title}</div>
                        <div class="upcoming-category">${task.category}</div>
                    </div>
                `).join('')}
            </div>
        `).join('');
}

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
    });
}

// Close modals when clicking outside
window.addEventListener('click', (e) => {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
});

// Initial load
loadTasks(); 