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

function loadInsights() {
    console.log('Loading insights...');
    const insights = JSON.parse(localStorage.getItem('studyInsights') || '{}');
    console.log('Retrieved insights:', insights);

    // Check if insights sections exist
    const focusSection = document.querySelector('.focus-insights');
    const recapSection = document.querySelector('.weekly-recap');
    const alertsSection = document.querySelector('.procrastination-alerts');

    console.log('Found sections:', {
        focusSection: !!focusSection,
        recapSection: !!recapSection,
        alertsSection: !!alertsSection
    });

    // Check if we have any focus data
    const hasFocusData = insights.focusByHour && Object.keys(insights.focusByHour).length > 0;
    console.log('Has focus data:', hasFocusData);

    if (!hasFocusData) {
        console.log('No focus data found, showing empty state');
        showEmptyState();
        return;
    }

    // Render Focus Insights
    renderFocusInsights(insights);
    
    // Render Weekly Recap
    renderWeeklyRecap(insights);
    
    // Render Procrastination Alerts
    renderProcrastinationAlerts(insights);
}

function showEmptyState() {
    const sections = ['.focus-insights', '.weekly-recap', '.procrastination-alerts'];
    sections.forEach(selector => {
        const section = document.querySelector(selector);
        if (section) {
            section.innerHTML = `
                <h2>${selector.substring(1).split('-').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}</h2>
                <div class="empty-state">
                    <i class="fas fa-chart-line"></i>
                    <p>Complete some tasks to see your insights!</p>
                </div>
            `;
        }
    });
}

function renderFocusInsights(insights) {
    const focusSection = document.querySelector('.focus-insights');
    if (!focusSection) return;
    
    // Find peak productivity hours
    const hourlyFocus = Object.entries(insights.focusByHour).map(([hour, data]) => ({
        hour: parseInt(hour),
        score: (data.focused / data.total) * 100
    })).sort((a, b) => b.score - a.score);

    const bestHours = hourlyFocus.slice(0, 3);
    
    // Find strongest subjects
    const subjectFocus = Object.entries(insights.focusBySubject).map(([subject, data]) => ({
        subject,
        score: (data.focused / data.total) * 100,
        timeSpent: Math.round(data.timeSpent / 60) // Convert to minutes
    })).sort((a, b) => b.score - a.score);

    const bestSubjects = subjectFocus.slice(0, 3);

    focusSection.innerHTML = `
        <h2>Focus Insights</h2>
        <div class="insights-grid">
            <div class="insight-card">
                <h3>Peak Productivity Hours</h3>
                <div class="peak-hours">
                    ${bestHours.map(hour => `
                        <div class="peak-hour">
                            <div class="hour-score">${Math.round(hour.score)}%</div>
                            <div class="hour-time">${formatHour(hour.hour)}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="insight-card">
                <h3>Strongest Subjects</h3>
                <div class="subject-list">
                    ${bestSubjects.map(subject => `
                        <div class="subject-item">
                            <div class="subject-name">${subject.subject}</div>
                            <div class="subject-stats">
                                <span class="focus-score">${Math.round(subject.score)}% focus</span>
                                <span class="time-spent">${subject.timeSpent} mins</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

function renderWeeklyRecap(insights) {
    const recapSection = document.querySelector('.weekly-recap');
    if (!recapSection) return;
    
    // Calculate weekly stats
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    
    const weeklyTasks = tasks.filter(task => {
        const taskDate = new Date(task.reflections[0]?.timestamp);
        return taskDate >= weekStart;
    });

    const totalTasks = weeklyTasks.length;
    const completedTasks = weeklyTasks.filter(t => t.completed).length;
    const totalTime = weeklyTasks.reduce((sum, task) => sum + (task.timeSpent || 0), 0);
    
    // Find most productive day
    const tasksByDay = {};
    weeklyTasks.forEach(task => {
        const day = new Date(task.reflections[0].timestamp).toLocaleDateString('en-US', { weekday: 'long' });
        if (!tasksByDay[day]) tasksByDay[day] = 0;
        tasksByDay[day]++;
    });

    const mostProductiveDay = Object.entries(tasksByDay)
        .sort((a, b) => b[1] - a[1])[0];

    recapSection.innerHTML = `
        <h2>Weekly Recap</h2>
        <div class="recap-grid">
            <div class="recap-card">
                <div class="recap-stat">
                    <h3>Tasks Completed</h3>
                    <div class="stat-value">${completedTasks}/${totalTasks}</div>
                    <div class="completion-rate">
                        ${totalTasks ? Math.round((completedTasks/totalTasks) * 100) : 0}% completion rate
                    </div>
                </div>
            </div>
            <div class="recap-card">
                <div class="recap-stat">
                    <h3>Total Study Time</h3>
                    <div class="stat-value">${Math.round(totalTime/60)} mins</div>
                </div>
            </div>
            <div class="recap-card">
                <div class="recap-stat">
                    <h3>Most Productive Day</h3>
                    <div class="stat-value">${mostProductiveDay ? mostProductiveDay[0] : 'N/A'}</div>
                    <div class="task-count">
                        ${mostProductiveDay ? `${mostProductiveDay[1]} tasks completed` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderProcrastinationAlerts(insights) {
    const alertsSection = document.querySelector('.procrastination-alerts');
    if (!alertsSection) return;
    
    // Calculate average delay by subject
    const delayedSubjects = Object.entries(insights.taskDelays)
        .map(([subject, data]) => ({
            subject,
            avgDelay: Math.round(data.total / data.count)
        }))
        .filter(subject => subject.avgDelay > 0)
        .sort((a, b) => b.avgDelay - a.avgDelay);

    // Find upcoming tasks that might be at risk
    const now = new Date();
    const upcomingTasks = tasks.filter(task => {
        if (task.completed) return false;
        const dueDate = new Date(task.dueDate);
        return dueDate >= now;
    });

    const riskTasks = upcomingTasks.filter(task => {
        const matchingSubject = delayedSubjects.find(s => s.subject === task.category);
        return matchingSubject && matchingSubject.avgDelay > 2; // More than 2 days average delay
    });

    alertsSection.innerHTML = `
        <h2>Procrastination Detection</h2>
        <div class="alerts-grid">
            <div class="alert-card">
                <h3>Subjects Needing Attention</h3>
                <div class="subject-delays">
                    ${delayedSubjects.length ? delayedSubjects.map(subject => `
                        <div class="delay-item">
                            <div class="delay-subject">${subject.subject}</div>
                            <div class="delay-value">
                                Average delay: ${subject.avgDelay} days
                            </div>
                        </div>
                    `).join('') : '<p class="no-data">No delayed subjects found</p>'}
                </div>
            </div>
            <div class="alert-card">
                <h3>Tasks at Risk</h3>
                <div class="risk-tasks">
                    ${riskTasks.length ? riskTasks.map(task => `
                        <div class="risk-task">
                            <div class="task-name">${task.title}</div>
                            <div class="task-due">Due: ${formatDate(task.dueDate)}</div>
                        </div>
                    `).join('') : '<p class="no-data">No tasks at risk</p>'}
                </div>
            </div>
        </div>
    `;
}

function formatHour(hour) {
    return new Date(2020, 0, 1, hour).toLocaleTimeString('en-US', {
        hour: 'numeric',
        hour12: true
    });
}

// Make sure both data and insights are loaded
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    loadInsights();
}); 