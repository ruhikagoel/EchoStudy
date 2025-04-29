document.addEventListener('DOMContentLoaded', () => {
    const assignmentList = document.getElementById('assignment-list');
    const addAssignmentButton = document.getElementById('add-assignment-button');
    const assignmentModal = document.getElementById('assignment-modal');
    const saveAssignmentButton = document.getElementById('save-assignment-button');
    const cancelAssignmentButton = document.getElementById('cancel-assignment-button');
    const modalOverlay = document.getElementById('modal-overlay');
    const assignmentNameInput = document.getElementById('assignment-name');
    const dueDateInput = document.getElementById('due-date');
    const subjectInput = document.getElementById('subject');

    const completionModal = document.getElementById('completion-modal');
    const completeYesButton = document.getElementById('complete-yes-button');
    const completeNoButton = document.getElementById('complete-no-button');

    const reflectionModal = document.getElementById('reflection-modal');
    const reflectionQuestionsDiv = document.getElementById('reflection-questions');
    const submitReflectionButton = document.getElementById('submit-reflection-button');

    const currentlyWorkingOnDisplay = document.getElementById('current-task-display');
    const timerDisplay = document.getElementById('timer-display');
    const completedTodayCountDisplay = document.getElementById('completed-today-count');
    const totalTasksCountDisplay = document.getElementById('total-tasks-count');

    const openReflectionHistoryButton = document.getElementById('open-reflection-history-button');
    const reflectionHistorySection = document.getElementById('reflection-history-section');
    const reflectionList = document.getElementById('reflection-list');
    const closeReflectionButton = document.getElementById('close-reflection-button');

    let assignments = loadAssignments();
    let currentAssignment = loadCurrentAssignment(); // Load current assignment state
    let timerInterval;
    let startTime = loadStartTime(); // Load start time
    if (currentAssignment && startTime) {
        startTimerFromLoad();
    }
    let studyLog = loadStudyLog();
    let reflectionHistory = loadReflectionHistory();
    let reflectionQuestions = [
        "What did you feel you worked on with the most focus?",
        "When did you get distracted?"
        // Add more questions here
    ];

    renderAssignments();
    renderReflectionHistory();
    updateBigNumbers();

    function loadAssignments() {
        const storedAssignments = localStorage.getItem('assignments');
        return storedAssignments ? JSON.parse(storedAssignments) : [];
    }

    function saveAssignments() {
        localStorage.setItem('assignments', JSON.stringify(assignments));
        updateBigNumbers();
    }

    function loadCurrentAssignment() {
        const storedAssignment = localStorage.getItem('currentAssignment');
        return storedAssignment ? JSON.parse(storedAssignment) : null;
    }

    function saveCurrentAssignment(assignment) {
        localStorage.setItem('currentAssignment', JSON.stringify(assignment));
    }

    function clearCurrentAssignment() {
        localStorage.removeItem('currentAssignment');
    }

    function loadStartTime() {
        const storedTime = localStorage.getItem('startTime');
        return storedTime ? parseInt(storedTime) : null;
    }

    function saveStartTime(time) {
        localStorage.setItem('startTime', time);
    }

    function clearStartTime() {
        localStorage.removeItem('startTime');
    }

    function loadStudyLog() {
        const storedLog = localStorage.getItem('studyLog');
        return storedLog ? JSON.parse(storedLog) : {};
    }

    function saveStudyLog() {
        localStorage.setItem('studyLog', JSON.stringify(studyLog));
    }

    function loadReflectionHistory() {
        const storedHistory = localStorage.getItem('reflectionHistory');
        return storedHistory ? JSON.parse(storedHistory) : [];
    }

    function saveReflectionHistory() {
        localStorage.setItem('reflectionHistory', JSON.stringify(reflectionHistory));
    }

    function updateBigNumbers() {
        totalTasksCountDisplay.textContent = assignments.length + reflectionHistory.length;
        completedTodayCountDisplay.textContent = reflectionHistory.filter(task => isToday(new Date(task.completedDate))).length;
        currentlyWorkingOnDisplay.textContent = currentAssignment ? currentAssignment.name : 'None';
    }

    function isToday(date) {
        const today = new Date();
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
    }

    function renderAssignments() {
        // assignmentList.innerHTML = `
        //     <li class="list-header" style = "margin-top: 0; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 10px; color: #777;">
        //         <div class="header-item">TO-DO LIST</div>
        //         <div class="header-item">DATE DUE</div>
        //         <div class="header-item">CATEGORY</div>
        //         <div class="header-item"></div>
        //     </li>
        // `;
        assignments.forEach((assignment, index) => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <div class="assignment-name">${assignment.name}</div>
                <div>${assignment.dueDate}</div>
                <div>${assignment.subject}</div>
                <div class="assignment-actions">
                    <button class="start-button" data-index="${index}">${currentAssignment?.index === index ? 'Working...' : 'Start'}</button>
                    <button class="complete-button" data-index="${index}">Complete</button>
                </div>
            `;
            assignmentList.appendChild(listItem);
        });

        // Add event listeners to the newly created start and complete buttons
        addStartButtonListeners();
        addCompleteButtonListeners();
    }

    function showModal(modal) {
        modal.style.display = 'block';
        modalOverlay.style.display = 'flex';
    }

    function closeModal(modal) {
        modal.style.display = 'none';
        modalOverlay.style.display = 'none';
    }

    // Event listener for adding a new assignment
    addAssignmentButton.addEventListener('click', () => {
        showModal(assignmentModal);
    });

    // Event listener for canceling the add assignment modal
    cancelAssignmentButton.addEventListener('click', () => {
        closeModal(assignmentModal);
        assignmentNameInput.value = '';
        dueDateInput.value = '';
        subjectInput.value = '';
    });

    // Event listener for saving a new assignment
    saveAssignmentButton.addEventListener('click', () => {
        const name = assignmentNameInput.value.trim();
        const dueDate = dueDateInput.value;
        const subject = subjectInput.value.trim();

        if (name && dueDate && subject) {
            const newAssignment = { name, dueDate, subject, completed: false };
            assignments.push(newAssignment);
            saveAssignments();
            renderAssignments();
            closeModal(assignmentModal);
            assignmentNameInput.value = '';
            dueDateInput.value = '';
            subjectInput.value = '';
        } else {
            alert('Please fill in all the fields.');
        }
    });

    function addStartButtonListeners() {
        const startButtons = document.querySelectorAll('.start-button');
        startButtons.forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.dataset.index);
                startAssignmentTimer(index);
            });
        });
    }

    function startAssignmentTimer(index) {
        // If another assignment was being worked on, stop its timer
        if (currentAssignment && currentAssignment.index !== index) {
            clearInterval(timerInterval);
        }

        currentAssignment = {...assignments[index], index: index};
        saveCurrentAssignment(currentAssignment);
        currentlyWorkingOnDisplay.textContent = currentAssignment.name;
        startTime = new Date().getTime();
        saveStartTime(startTime);
        updateTimerDisplay();
        timerInterval = setInterval(updateTimerDisplay, 1000);

        renderAssignments(); // Re-render to update button state
        console.log(`Timer started for: ${currentAssignment.name}`);
    }

    function startTimerFromLoad() {
        currentlyWorkingOnDisplay.textContent = currentAssignment.name;
        updateTimerDisplay();
        timerInterval = setInterval(updateTimerDisplay, 1000);
        renderAssignments(); // Ensure the button shows "Working..."
    }

    function stopTimer() {
        clearInterval(timerInterval);
        startTime = null;
        clearStartTime();
        timerDisplay.textContent = '00:00:00';
    }

    function updateTimerDisplay() {
        if (startTime) {
            const currentTime = new Date().getTime();
            const elapsedTime = currentTime - startTime;
            const seconds = Math.floor((elapsedTime / 1000) % 60);
            const minutes = Math.floor((elapsedTime / (1000 * 60)) % 60);
            const hours = Math.floor(elapsedTime / (1000 * 60 * 60));
            timerDisplay.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        } else {
            timerDisplay.textContent = '00:00:00';
        }
    }

    function addCompleteButtonListeners() {
        const completeButtons = document.querySelectorAll('.complete-button');
        completeButtons.forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.dataset.index);
                showCompletionModal(index);
            });
        });
    }

    function showCompletionModal(index) {
        const assignmentToComplete = assignments[index];
        completionModal.dataset.assignmentIndex = index;
        showModal(completionModal);
    }

    completeYesButton.addEventListener('click', () => {
        const index = parseInt(completionModal.dataset.assignmentIndex);
        closeModal(completionModal);
        showReflectionModal(index);
    });

    completeNoButton.addEventListener('click', () => {
        closeModal(completionModal);
    });

    function showReflectionModal(assignmentIndex) {
        reflectionQuestionsDiv.innerHTML = '';
        reflectionQuestions.forEach((question, index) => {
            const label = document.createElement('label');
            label.textContent = `${index + 1}. ${question}`;
            const yesRadio = createRadioButton(`reflection-${assignmentIndex}-${index}`, 'Yes');
            const noRadio = createRadioButton(`reflection-${assignmentIndex}-${index}`, 'No');
            reflectionQuestionsDiv.appendChild(label);
            reflectionQuestionsDiv.appendChild(yesRadio);
            reflectionQuestionsDiv.appendChild(document.createTextNode(' Yes '));
            reflectionQuestionsDiv.appendChild(noRadio);
            reflectionQuestionsDiv.appendChild(document.createTextNode(' No '));
            reflectionQuestionsDiv.appendChild(document.createElement('br'));
        });
        reflectionModal.dataset.assignmentIndex = assignmentIndex;
        showModal(reflectionModal);
    }

    function createRadioButton(name, value) {
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = name;
        radio.value = value;
        return radio;
    }

    submitReflectionButton.addEventListener('click', () => {
        const assignmentIndex = parseInt(reflectionModal.dataset.assignmentIndex);
        const answers = [];
        reflectionQuestions.forEach((_, index) => {
            const selectedAnswer = document.querySelector(`input[name="reflection-${assignmentIndex}-${index}"]:checked`);
            answers.push(selectedAnswer ? selectedAnswer.value : null);
        });

        const completedAssignment = assignments.splice(assignmentIndex, 1)[0]; // Remove from array
        completedAssignment.reflection = answers;
        completedAssignment.completedDate = new Date().toISOString();
        reflectionHistory.push(completedAssignment);

        stopTimer(); // Stop the timer when the assignment is completed
        clearCurrentAssignment();

        saveAssignments();
        saveReflectionHistory();
        renderAssignments();
        renderReflectionHistory();
        closeModal(reflectionModal);
        updateBigNumbers();
    });

    openReflectionHistoryButton.addEventListener('click', () => {
        reflectionHistorySection.style.display = 'block';
    });

    closeReflectionButton.addEventListener('click', () => {
        reflectionHistorySection.style.display = 'none';
    });

    function renderReflectionHistory() {
        reflectionList.innerHTML = '';
        reflectionHistory.forEach(item => {
            const listItem = document.createElement('li');
            const completedDate = new Date(item.completedDate);
            const timestamp = completedDate.toLocaleString();
            let reflectionText = `<strong>${item.name}</strong> (Completed: ${timestamp}):<br>`;
            if (item.reflection) {
                item.reflection.forEach((answer, index) => {
                    reflectionText += `- ${reflectionQuestions[index]}: ${answer || 'No Answer'}<br>`;
                });
            } else {
                reflectionText += `- No reflection recorded.<br>`;
            }
            listItem.innerHTML = reflectionText;
            reflectionList.appendChild(listItem);
        });
    }
});