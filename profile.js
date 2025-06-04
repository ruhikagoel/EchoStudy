// Load tasks and reflections from localStorage
let tasks = [];
let studyHistory = [];

function loadData() {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
        processTasksData();
    }
}

function processTasksData() {
    // Calculate total study time
    const totalMinutes = tasks.reduce((total, task) => total + (task.timeSpent || 0), 0);
    const totalHours = Math.floor(totalMinutes / 3600);
    document.querySelector('[data-stat="totalTime"]').textContent = `${totalHours} hours`;

    // Calculate total completed tasks
    const completedTasks = tasks.filter(t => t.completed).length;
    document.querySelector('[data-stat="totalTasks"]').textContent = completedTasks;

    // Calculate average focus score
    const focusReflections = tasks.flatMap(t => t.reflections.filter(r => r.type === 'focus'));
    const focusScore = focusReflections.length > 0
        ? Math.round((focusReflections.filter(r => r.value).length / focusReflections.length) * 100)
        : 0;
    document.querySelector('[data-stat="avgFocus"]').textContent = `${focusScore}%`;

    // Calculate study streak
    const streak = calculateStreak();
    document.querySelector('[data-stat="streak"]').textContent = `${streak} days`;

    // Render study history
    renderStudyHistory();
    renderReflections();
    renderCategoryAnalysis();
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

function renderStudyHistory() {
    const historyList = document.querySelector('.history-list');
    const groupedTasks = groupTasksByDate();

    historyList.innerHTML = Object.entries(groupedTasks)
        .sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA))
        .map(([date, tasks]) => `
            <div class="history-day">
                <h3>${formatDate(date)}</h3>
                ${tasks.map(task => `
                    <div class="history-item">
                        <span class="history-title">${task.title}</span>
                        <span class="history-category">${task.category}</span>
                        <span class="history-time">${Math.floor(task.timeSpent / 60)} min</span>
                    </div>
                `).join('')}
            </div>
        `).join('');
}

function renderReflections() {
    const reflectionList = document.querySelector('.reflection-list');
    
    // Get all reflections and group them by task and timestamp
    const groupedReflections = {};
    tasks.forEach(task => {
        task.reflections.forEach(reflection => {
            const timestamp = reflection.timestamp.split('T')[0]; // Get just the date part
            const key = `${task.id}-${timestamp}`;
            
            if (!groupedReflections[key]) {
                groupedReflections[key] = {
                    taskId: task.id,
                    taskTitle: task.title,
                    taskCategory: task.category,
                    timestamp: timestamp,
                    focus: null,
                    completion: null,
                    isLatestAttempt: true // We'll update this later
                };
            }
            
            if (reflection.type === 'focus') {
                groupedReflections[key].focus = reflection.value;
            } else if (reflection.type === 'completion') {
                groupedReflections[key].completion = reflection.value;
            }
        });
    });

    // Mark older attempts for the same task
    Object.values(groupedReflections).forEach(current => {
        Object.values(groupedReflections).forEach(other => {
            if (current.taskId === other.taskId && 
                current.timestamp < other.timestamp) {
                current.isLatestAttempt = false;
            }
        });
    });

    // Convert grouped reflections to array and sort by date
    const recentReflections = Object.values(groupedReflections)
        .filter(r => r.focus !== null) // Show all attempts that at least started
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 10); // Show only last 10 reflections

    reflectionList.innerHTML = recentReflections.map(reflection => `
        <div class="reflection-item ${reflection.isLatestAttempt ? '' : 'previous-attempt'}">
            <div class="reflection-header">
                <div class="reflection-title">
                    <span class="reflection-task">${reflection.taskTitle}</span>
                    ${!reflection.isLatestAttempt ? '<span class="attempt-badge">Previous Attempt</span>' : ''}
                </div>
                <span class="reflection-date">${formatDate(reflection.timestamp)}</span>
            </div>
            <div class="reflection-content">
                <p>Focus: <span class="${reflection.focus ? 'positive' : 'negative'}">${reflection.focus ? 'Maintained' : 'Lost'}</span></p>
                <p>Completion: 
                    ${reflection.completion !== null 
                        ? `<span class="${reflection.completion ? 'positive' : 'negative'}">${reflection.completion ? 'Completed' : 'Incomplete'}</span>`
                        : '<span class="neutral">Session Ended Early</span>'
                    }
                </p>
            </div>
        </div>
    `).join('');

    if (recentReflections.length === 0) {
        reflectionList.innerHTML = '<p class="no-reflections">No reflections yet</p>';
    }
}

function renderCategoryAnalysis() {
    const categoryStats = document.querySelector('.category-stats');
    const categories = {};

    tasks.forEach(task => {
        if (!categories[task.category]) {
            categories[task.category] = {
                totalTime: 0,
                completedTasks: 0,
                totalTasks: 0
            };
        }

        categories[task.category].totalTime += task.timeSpent || 0;
        categories[task.category].totalTasks++;
        if (task.completed) {
            categories[task.category].completedTasks++;
        }
    });

    categoryStats.innerHTML = Object.entries(categories)
        .map(([category, stats]) => `
            <div class="category-stat-item">
                <h3>${category}</h3>
                <div class="category-stat-details">
                    <p>Time: ${Math.floor(stats.totalTime / 60)} min</p>
                    <p>Tasks: ${stats.completedTasks}/${stats.totalTasks}</p>
                </div>
            </div>
        `).join('');
}

function groupTasksByDate() {
    const grouped = {};
    tasks.forEach(task => {
        task.reflections.forEach(reflection => {
            const date = reflection.timestamp.split('T')[0];
            if (!grouped[date]) {
                grouped[date] = [];
            }
            if (!grouped[date].find(t => t.id === task.id)) {
                grouped[date].push(task);
            }
        });
    });
    return grouped;
}

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
    });
}

// Handle history filters
document.querySelectorAll('.history-filters button').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.history-filters button').forEach(b => b.classList.remove('active'));
        button.classList.add('active');
        renderStudyHistory(); // TODO: Add filter logic
    });
});

// Initial load
loadData(); 