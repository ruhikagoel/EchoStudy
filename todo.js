// let assignments = [];
// let currentAssignment = null;
// let timer = null;
// let secondsWorked = 0;
// let completedToday = 0;

// const assignmentList = document.getElementById('assignmentList');
// const dueDateList = document.getElementById('dueDateList');
// const categoryList = document.getElementById('categoryList');
// const currentTask = document.getElementById('currentTask');
// const timeWorking = document.getElementById('timeWorking');
// const completedTodayDisplay = document.getElementById('completedToday');
// const totalTasks = document.getElementById('totalTasks');
// const reflectionModal = document.getElementById('reflectionModal');

// document.getElementById('addAssignmentBtn').addEventListener('click', addAssignment);

// function addAssignment() {
//   const name = document.getElementById('assignmentName').value;
//   const dueDate = document.getElementById('assignmentDueDate').value;
//   const category = document.getElementById('assignmentCategory').value;

//   if (name && dueDate && category) {
//     const assignment = { name, dueDate, category };
//     assignments.push(assignment);
//     renderAssignments();
//     document.getElementById('assignmentName').value = '';
//     document.getElementById('assignmentDueDate').value = '';
//     document.getElementById('assignmentCategory').value = '';
//   }
// }

// function renderAssignments() {
//   assignmentList.innerHTML = '';
//   dueDateList.innerHTML = '';
//   categoryList.innerHTML = '';

//   assignments.forEach((assignment, index) => {
//     const li = document.createElement('li');
//     li.textContent = assignment.name;
//     li.addEventListener('click', () => startWorking(index));
//     assignmentList.appendChild(li);

//     const dueLi = document.createElement('li');
//     dueLi.textContent = assignment.dueDate;
//     dueDateList.appendChild(dueLi);

//     const catLi = document.createElement('li');
//     catLi.textContent = assignment.category;
//     categoryList.appendChild(catLi);
//   });

//   totalTasks.textContent = assignments.length;
// }

// function startWorking(index) {
//   if (timer) {
//     clearInterval(timer);
//   }

//   currentAssignment = assignments[index];
//   secondsWorked = 0;
//   currentTask.textContent = currentAssignment.name;

//   timer = setInterval(() => {
//     secondsWorked++;
//     timeWorking.textContent = `${Math.floor(secondsWorked/60)} min`;
//   }, 1000);

//   // After 5 seconds for demo purposes: finish automatically
//   // setTimeout(finishAssignment, 10000);  // uncomment if you want auto-finish for demo
// }

// function finishAssignment() {
//   if (timer) {
//     clearInterval(timer);
//   }
//   if (!currentAssignment) return;

//   reflectionModal.style.display = 'flex';
// }

// document.getElementById('yesBtn').addEventListener('click', () => {
//   completeCurrentAssignment();
// });

// document.getElementById('noBtn').addEventListener('click', () => {
//   completeCurrentAssignment();
// });

// function completeCurrentAssignment() {
//   if (currentAssignment) {
//     assignments = assignments.filter(a => a !== currentAssignment);
//     completedToday++;
//     renderAssignments();
//     currentTask.textContent = 'None';
//     timeWorking.textContent = '0 min';
//     completedTodayDisplay.textContent = completedToday;
//     currentAssignment = null;
//   }
//   reflectionModal.style.display = 'none';
// }


// let assignments = [];

// function addAssignment() {
//     const name = document.getElementById('assignmentName').value;
//     const subject = document.getElementById('assignmentSubject').value;
//     const dueDate = document.getElementById('assignmentDueDate').value;
//     if (!name || !subject || !dueDate) return;

//     const assignment = { name, subject, dueDate };
//     assignments.push(assignment);
//     renderAssignments();

//     document.getElementById('assignmentName').value = '';
//     document.getElementById('assignmentSubject').value = '';
//     document.getElementById('assignmentDueDate').value = '';
// }

// function renderAssignments() {
//     const list = document.getElementById('assignmentList');
//     list.innerHTML = '';
//     assignments.forEach((assignment, index) => {
//         const item = document.createElement('li');
//         item.className = 'assignment-item';

//         const info = document.createElement('div');
//         info.className = 'assignment-info';
//         info.innerHTML = `<strong>${assignment.name}</strong> <span>${assignment.subject} — Due: ${assignment.dueDate}</span>`;

//         const finishBtn = document.createElement('button');
//         finishBtn.innerText = 'Finish';
//         finishBtn.onclick = () => finishAssignment(index);

//         item.appendChild(info);
//         item.appendChild(finishBtn);
//         list.appendChild(item);
//     });
// }

// function finishAssignment(index) {
//     assignments.splice(index, 1);
//     renderAssignments();
//     openModal();
// }

// function openModal() {
//     document.getElementById('reflectionModal').style.display = 'block';
// }

// function closeModal() {
//     document.getElementById('reflectionModal').style.display = 'none';
// }

// function submitReflection() {
//     const reflection = document.getElementById('reflectionText').value;
//     console.log('Reflection submitted:', reflection);
//     closeModal();
//     document.getElementById('reflectionText').value = '';
// }

document.addEventListener('DOMContentLoaded', () => {
    const assignments = [];
    let currentIndex = null;
    let timerInterval = null;
    let seconds = 0;
  
    const todoBody = document.getElementById('todo-body');
    const stats = {
      currentTask: document.getElementById('current-task'),
      timeToday: document.getElementById('time-today'),
      completedToday: document.getElementById('completed-today'),
      totalTasks: document.getElementById('total-tasks')
    };
  
    // Open/close modals
    function toggleModal(id, show) {
      document.getElementById(id).classList.toggle('hidden', !show);
    }
  
    document.getElementById('addBtn').onclick = () => toggleModal('modal-add', true);
    document.querySelectorAll('.close-btn').forEach(b =>
      b.onclick = () => toggleModal(b.closest('.modal').id, false)
    );
  
    // Add assignment
    document.getElementById('save-add').onclick = () => {
      const name = document.getElementById('inp-name').value;
      const due = document.getElementById('inp-date').value;
      const cat = document.getElementById('inp-cat').value;
      if (!name || !due || !cat) return;
      assignments.push({ name, due, cat, time: 0 });
      render();
      toggleModal('modal-add', false);
    };
  
    // Start/finish actions
    function startTimer(i) {
      if (timerInterval) clearInterval(timerInterval);
      currentIndex = i;
      seconds = 0;
      stats.currentTask.textContent = assignments[i].name;
      timerInterval = setInterval(() => {
        seconds++;
        assignments[i].time = seconds;
        render();
      }, 1000);
    }
  
    function finish(i) {
      if (i !== currentIndex) return;
      clearInterval(timerInterval);
      toggleModal('modal-reflect', true);
    }
  
    document.getElementById('ref-yes').onclick = () => {
      assignments.splice(currentIndex, 1);
      stats.completedToday.textContent = +stats.completedToday.textContent + 1;
      resetStats();
      render();
      toggleModal('modal-reflect', false);
    };
    document.getElementById('ref-no').onclick = () => toggleModal('modal-reflect', false);
  
    function resetStats() {
      stats.currentTask.textContent = 'None';
      stats.timeToday.textContent = '0m';
      currentIndex = null;
    }
  
    // Render table & stats
    function render() {
      todoBody.innerHTML = '';
      assignments.forEach((a, i) => {
        const tr = document.createElement('tr');
        ['name', 'due', 'cat', 'time'].forEach((prop, j) => {
          const td = document.createElement('td');
          td.textContent = prop === 'time' ? Math.floor(a.time/60) + 'm' : a[prop];
          tr.appendChild(td);
        });
        const actionTd = document.createElement('td');
        const startBtn = document.createElement('button'); startBtn.textContent = 'Start';
        startBtn.onclick = () => startTimer(i);
        const finishBtn = document.createElement('button'); finishBtn.textContent = 'Finish';
        finishBtn.onclick = () => finish(i);
        actionTd.append(startBtn, finishBtn);
        tr.appendChild(actionTd);
        todoBody.appendChild(tr);
      });
      stats.totalTasks.textContent = assignments.length;
    }
  });
  