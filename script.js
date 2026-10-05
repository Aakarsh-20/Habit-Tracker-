var KEY = 'simple_habit_tracker_habits';
var habits = [];

var greetingText = document.getElementById('greetingText');
var completedCount = document.getElementById('completedCount');
var totalCount = document.getElementById('totalCount');
var habitList = document.getElementById('habitList');
var newHabitForm = document.getElementById('newHabitForm');
var titleInput = document.getElementById('habitTitleInput');
var descInput = document.getElementById('habitDescInput');
var nameError = document.getElementById('nameErrorMsg');
var tableHeaderRow = document.getElementById('tableHeaderRow');
var tableBody = document.getElementById('tableBody');

var dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function makeKey(date) {
  var month = date.getMonth() + 1;
  var day = date.getDate();
  if (month < 10) month = '0' + month;
  if (day < 10) day = '0' + day;
  return date.getFullYear() + '-' + month + '-' + day;
}

function todayKey() {
  return makeKey(new Date());
}

function getLast7Days() {
  var days = [];
  for (var i = 6; i >= 0; i--) {
    var d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d);
  }
  return days;
}

function saveHabits() {
  localStorage.setItem(KEY, JSON.stringify(habits));
}

function loadHabits() {
  var saved = localStorage.getItem(KEY);

  if (saved) {
    try {
      habits = JSON.parse(saved);
    } catch (e) {
      habits = [];
    }
    return;
  }

  var yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  habits = [
    {
      id: 'habit-1',
      title: 'Daily Exercise',
      description: '• 20 pushups\n• 30 squats\n• 15 minutes brisk walk',
      completedDates: [makeKey(yesterday), todayKey()]
    }
  ];
  saveHabits();
}

function showGreeting() {
  var hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    greetingText.textContent = 'Good morning!';
  } else if (hour >= 12 && hour < 18) {
    greetingText.textContent = 'Good afternoon!';
  } else {
    greetingText.textContent = 'Good evening!';
  }
}

function showStats() {
  var today = todayKey();
  var done = 0;

  for (var i = 0; i < habits.length; i++) {
    if (habits[i].completedDates.indexOf(today) !== -1) {
      done++;
    }
  }

  completedCount.textContent = done;
  totalCount.textContent = habits.length;
}

function showHabits() {
  var today = todayKey();
  habitList.innerHTML = '';

  if (habits.length === 0) {
    habitList.innerHTML =
      '<div class="empty-message">' +
      'No habits currently being tracked. Use the "Add a New Habit" box below to add one.' +
      '</div>';
    return;
  }

  for (var i = 0; i < habits.length; i++) {
    addCard(habits[i], today);
  }
}

function addCard(habit, today) {
  var doneToday = habit.completedDates.indexOf(today) !== -1;

  var card = document.createElement('div');
  card.className = 'habit-card';

  card.innerHTML =
    '<div class="habit-checkbox-wrapper">' +
      '<input type="checkbox" class="habit-checkbox" title="Mark done for today">' +
    '</div>' +
    '<div class="habit-details">' +
      '<div class="habit-title"></div>' +
    '</div>' +
    '<div>' +
      '<button class="btn-delete">Delete</button>' +
    '</div>';

  var checkbox = card.querySelector('.habit-checkbox');
  var title = card.querySelector('.habit-title');
  var details = card.querySelector('.habit-details');
  var deleteBtn = card.querySelector('.btn-delete');

  checkbox.checked = doneToday;
  title.textContent = habit.title;
  if (doneToday) {
    title.className = 'habit-title checked-text';
  }

  if (habit.description) {
    var desc = document.createElement('div');
    desc.className = 'habit-desc';
    desc.textContent = habit.description;
    details.appendChild(desc);
  }

  checkbox.addEventListener('change', function () {
    toggleDate(habit.id, today);
  });

  deleteBtn.addEventListener('click', function () {
    deleteHabit(habit.id);
  });

  habitList.appendChild(card);
}

function showTable() {
  var days = getLast7Days();
  var today = todayKey();

  tableHeaderRow.innerHTML = '';

  var habitTh = document.createElement('th');
  habitTh.className = 'habit-col';
  habitTh.textContent = 'Habit';
  tableHeaderRow.appendChild(habitTh);

  for (var i = 0; i < days.length; i++) {
    var date = days[i];
    var isToday = makeKey(date) === today;

    var th = document.createElement('th');
    if (isToday) th.className = 'today-col';

    th.innerHTML =
      '<div>' + dayNames[date.getDay()] + '</div>' +
      '<div style="font-size: 11px; font-weight: normal;">' + monthNames[date.getMonth()] + ' ' + date.getDate() + '</div>';

    if (isToday) {
      th.innerHTML += '<div style="font-size: 10px; font-weight: bold; color: #F4A228;">(Today)</div>';
    }

    tableHeaderRow.appendChild(th);
  }

  var totalTh = document.createElement('th');
  totalTh.textContent = 'Total Ticked';
  tableHeaderRow.appendChild(totalTh);

  tableBody.innerHTML = '';

  if (habits.length === 0) {
    tableBody.innerHTML =
      '<tr><td colspan="9" style="text-align: center; padding: 16px; color: #475569;">' +
      'No habits to display in consistency log.' +
      '</td></tr>';
    return;
  }

  for (var h = 0; h < habits.length; h++) {
    addTableRow(habits[h], days, today);
  }
}

function addTableRow(habit, days, today) {
  var row = document.createElement('tr');

  var nameCell = document.createElement('td');
  nameCell.className = 'habit-name-cell';
  nameCell.textContent = habit.title;
  row.appendChild(nameCell);

  var ticked = 0;

  for (var i = 0; i < days.length; i++) {
    var key = makeKey(days[i]);
    var isDone = habit.completedDates.indexOf(key) !== -1;
    if (isDone) ticked++;

    var cell = document.createElement('td');
    if (key === today) cell.className = 'today-col';

    var box = document.createElement('input');
    box.type = 'checkbox';
    box.className = 'table-checkbox';
    box.checked = isDone;
    box.title = 'Toggle ' + habit.title + ' on ' + key;
    box.addEventListener('change', makeToggleHandler(habit.id, key));

    cell.appendChild(box);
    row.appendChild(cell);
  }

  var totalCell = document.createElement('td');
  totalCell.className = 'total-cell';
  totalCell.textContent = ticked + ' / 7 days';
  row.appendChild(totalCell);

  tableBody.appendChild(row);
}

function makeToggleHandler(id, key) {
  return function () {
    toggleDate(id, key);
  };
}

function findHabit(id) {
  for (var i = 0; i < habits.length; i++) {
    if (habits[i].id === id) return habits[i];
  }
  return null;
}

function toggleDate(id, key) {
  var habit = findHabit(id);
  if (!habit) return;

  var pos = habit.completedDates.indexOf(key);
  if (pos !== -1) {
    habit.completedDates.splice(pos, 1);
  } else {
    habit.completedDates.push(key);
  }

  saveHabits();
  showEverything();
}

function deleteHabit(id) {
  var habit = findHabit(id);
  var name = habit ? '"' + habit.title + '"' : 'this habit';

  if (!confirm('Are you sure you want to delete ' + name + '?')) return;

  var kept = [];
  for (var i = 0; i < habits.length; i++) {
    if (habits[i].id !== id) kept.push(habits[i]);
  }
  habits = kept;

  saveHabits();
  showEverything();
}

titleInput.addEventListener('input', function () {
  if (titleInput.value.trim().length > 0) {
    nameError.classList.add('hidden');
    titleInput.classList.remove('input-error');
  }
});

newHabitForm.addEventListener('submit', function (event) {
  event.preventDefault();

  var title = titleInput.value.trim();
  var description = descInput.value.trim();

  if (title === '') {
    nameError.classList.remove('hidden');
    titleInput.classList.add('input-error');
    titleInput.focus();
    return;
  }

  nameError.classList.add('hidden');
  titleInput.classList.remove('input-error');

  habits.push({
    id: 'habit-' + Date.now(),
    title: title,
    description: description,
    completedDates: []
  });
  saveHabits();

  titleInput.value = '';
  descInput.value = '';

  showEverything();
});

function showEverything() {
  showGreeting();
  showStats();
  showHabits();
  showTable();
}

document.addEventListener('DOMContentLoaded', function () {
  loadHabits();
  showEverything();
});
