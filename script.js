
const STORAGE_KEY = 'simple_habit_tracker_habits_v2';

let habits = [];

const greetingTextEl = document.getElementById('greetingText');
const completedCountEl = document.getElementById('completedCount');
const totalCountEl = document.getElementById('totalCount');
const habitListEl = document.getElementById('habitList');
const newHabitForm = document.getElementById('newHabitForm');
const habitTitleInput = document.getElementById('habitTitleInput');
const habitDescInput = document.getElementById('habitDescInput');
const nameErrorMsg = document.getElementById('nameErrorMsg');
const tableHeaderRow = document.getElementById('tableHeaderRow');
const tableBody = document.getElementById('tableBody');


function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getTodayKey() {
  return formatDateKey(new Date());
}

function getLast7Days() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d);
  }
  return days;
}

function updateGreeting() {
  const currentHour = new Date().getHours();
  let greeting = 'Hello!';

  if (currentHour >= 5 && currentHour < 12) {
    greeting = 'Good morning!';
  } else if (currentHour >= 12 && currentHour < 18) {
    greeting = 'Good afternoon!';
  } else {
    greeting = 'Good evening!';
  }

  greetingTextEl.textContent = greeting;
}

function loadHabits() {
  const storedData = localStorage.getItem(STORAGE_KEY);
  if (storedData) {
    try {
      habits = JSON.parse(storedData);
    } catch (e) {
      habits = [];
    }
  } else {

    const today = getTodayKey();
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = formatDateKey(yesterday);

    habits = [
      {
        id: 'habit-1',
        title: 'Daily Exercise',
        description: '• 20 pushups\n• 30 squats\n• 15 minutes brisk walk',
        completedDates: [yesterdayKey, today]
      }
    ];
    saveHabits();
  }
}

function saveHabits() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
}

function updateStats() {
  const todayKey = getTodayKey();
  const total = habits.length;
  
  let completedToday = 0;
  for (let i = 0; i < habits.length; i++) {
    if (habits[i].completedDates.includes(todayKey)) {
      completedToday++;
    }
  }

  completedCountEl.textContent = completedToday;
  totalCountEl.textContent = total;
}

function renderHabits() {
  habitListEl.innerHTML = '';
  const todayKey = getTodayKey();

  if (habits.length === 0) {
    habitListEl.innerHTML = `
      <div class="empty-message">
        No habits currently being tracked. Use the "Add a New Habit" box below to add one.
      </div>
    `;
    return;
  }

  habits.forEach(habit => {
    const isDoneToday = habit.completedDates.includes(todayKey);

    const card = document.createElement('div');
    card.className = 'habit-card';

    card.innerHTML = `
      <div class="habit-checkbox-wrapper">
        <input 
          type="checkbox" 
          class="habit-checkbox" 
          data-id="${habit.id}" 
          ${isDoneToday ? 'checked' : ''} 
          title="Mark done for today"
        >
      </div>
      <div class="habit-details">
        <div class="habit-title ${isDoneToday ? 'checked-text' : ''}">
          ${escapeHtml(habit.title)}
        </div>
        ${habit.description ? `<div class="habit-desc">${escapeHtml(habit.description)}</div>` : ''}
      </div>
      <div>
        <button class="btn-delete" data-delete-id="${habit.id}">Delete</button>
      </div>
    `;

    habitListEl.appendChild(card);
  });

  const checkboxes = habitListEl.querySelectorAll('.habit-checkbox');
  checkboxes.forEach(cb => {
    cb.addEventListener('change', function() {
      const habitId = this.getAttribute('data-id');
      toggleHabitDate(habitId, todayKey);
    });
  });

  const deleteButtons = habitListEl.querySelectorAll('.btn-delete');
  deleteButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      const habitId = this.getAttribute('data-delete-id');
      deleteHabit(habitId);
    });
  });
}

function renderConsistencyLog() {
  const last7Days = getLast7Days();
  const todayKey = getTodayKey();

  tableHeaderRow.innerHTML = '';
  
  const habitTh = document.createElement('th');
  habitTh.className = 'habit-col';
  habitTh.textContent = 'Habit';
  tableHeaderRow.appendChild(habitTh);

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  last7Days.forEach(dateObj => {
    const dateKey = formatDateKey(dateObj);
    const isToday = (dateKey === todayKey);
    
    const th = document.createElement('th');
    if (isToday) {
      th.className = 'today-col';
    }

    const dayName = dayNames[dateObj.getDay()];
    const month = monthNames[dateObj.getMonth()];
    const dayNum = dateObj.getDate();

    th.innerHTML = `
      <div>${dayName}</div>
      <div style="font-size: 11px; font-weight: normal;">${month} ${dayNum}</div>
      ${isToday ? '<div style="font-size: 10px; font-weight: bold; color: #F4A228;">(Today)</div>' : ''}
    `;
    tableHeaderRow.appendChild(th);
  });

  const totalTh = document.createElement('th');
  totalTh.textContent = 'Total Ticked';
  tableHeaderRow.appendChild(totalTh);

  tableBody.innerHTML = '';

  if (habits.length === 0) {
    const emptyRow = document.createElement('tr');
    emptyRow.innerHTML = `
      <td colspan="9" style="text-align: center; padding: 16px; color: #475569;">
        No habits to display in consistency log.
      </td>
    `;
    tableBody.appendChild(emptyRow);
    return;
  }

  habits.forEach(habit => {
    const tr = document.createElement('tr');


    const nameTd = document.createElement('td');
    nameTd.className = 'habit-name-cell';
    nameTd.textContent = habit.title;
    tr.appendChild(nameTd);

    let tickedCountIn7Days = 0;

    last7Days.forEach(dateObj => {
      const dateKey = formatDateKey(dateObj);
      const isDone = habit.completedDates.includes(dateKey);
      const isToday = (dateKey === todayKey);

      if (isDone) {
        tickedCountIn7Days++;
      }

      const td = document.createElement('td');
      if (isToday) {
        td.className = 'today-col';
      }

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'table-checkbox';
      checkbox.checked = isDone;
      checkbox.title = `Toggle ${habit.title} on ${dateKey}`;

      checkbox.addEventListener('change', () => {
        toggleHabitDate(habit.id, dateKey);
      });

      td.appendChild(checkbox);
      tr.appendChild(td);
    });

    const totalTd = document.createElement('td');
    totalTd.className = 'total-cell';
    totalTd.textContent = `${tickedCountIn7Days} / 7 days`;
    tr.appendChild(totalTd);

    tableBody.appendChild(tr);
  });
}

function toggleHabitDate(habitId, dateKey) {
  const habit = habits.find(h => h.id === habitId);
  if (!habit) return;

  const dateIndex = habit.completedDates.indexOf(dateKey);
  if (dateIndex > -1) {
    habit.completedDates.splice(dateIndex, 1);
  } else {
    habit.completedDates.push(dateKey);
  }

  saveHabits();
  updateAllViews();
}

function deleteHabit(habitId) {
  const habit = habits.find(h => h.id === habitId);
  const habitTitle = habit ? `"${habit.title}"` : 'this habit';

  const confirmed = confirm(`Are you sure you want to delete ${habitTitle}?`);
  if (!confirmed) return;

  habits = habits.filter(h => h.id !== habitId);
  saveHabits();
  updateAllViews();
}

habitTitleInput.addEventListener('input', function() {
  if (habitTitleInput.value.trim().length > 0) {
    nameErrorMsg.classList.add('hidden');
    habitTitleInput.classList.remove('input-error');
  }
});

newHabitForm.addEventListener('submit', function(event) {
  event.preventDefault();

  const title = habitTitleInput.value.trim();
  const description = habitDescInput.value.trim();

  if (!title) {
    nameErrorMsg.classList.remove('hidden');
    habitTitleInput.classList.add('input-error');
    habitTitleInput.focus();
    return; 
  }

  nameErrorMsg.classList.add('hidden');
  habitTitleInput.classList.remove('input-error');

  const newHabit = {
    id: 'habit-' + Date.now(),
    title: title,
    description: description,
    completedDates: []
  };

  habits.push(newHabit);
  saveHabits();

  habitTitleInput.value = '';
  habitDescInput.value = '';

  updateAllViews();
});

function updateAllViews() {
  updateGreeting();
  updateStats();
  renderHabits();
  renderConsistencyLog();
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function initApp() {
  updateGreeting();
  loadHabits();
  updateAllViews();
}

document.addEventListener('DOMContentLoaded', initApp);
