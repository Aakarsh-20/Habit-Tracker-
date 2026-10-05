var greeting = document.getElementById("greeting");
var doneText = document.getElementById("done");
var totalText = document.getElementById("total");
var habitList = document.getElementById("habitList");
var nameInput = document.getElementById("nameInput");
var descInput = document.getElementById("descInput");
var errorText = document.getElementById("error");
var addBtn = document.getElementById("addBtn");
var tableHead = document.getElementById("tableHead");
var tableBody = document.getElementById("tableBody");

var habits = [];

function dateToText(d) {
  var month = d.getMonth() + 1;
  var day = d.getDate();
  if (month < 10) month = "0" + month;
  if (day < 10) day = "0" + day;
  return d.getFullYear() + "-" + month + "-" + day;
}

function today() {
  return dateToText(new Date());
}

function saveHabits() {
  localStorage.setItem("habits", JSON.stringify(habits));
}

function loadHabits() {
  var saved = localStorage.getItem("habits");
  if (saved) {
    habits = JSON.parse(saved);
  }
}

function showGreeting() {
  var hour = new Date().getHours();
  if (hour < 12) {
    greeting.textContent = "Good morning!";
  } else if (hour < 18) {
    greeting.textContent = "Good afternoon!";
  } else {
    greeting.textContent = "Good evening!";
  }
}

function showCounter() {
  var count = 0;
  for (var i = 0; i < habits.length; i++) {
    if (habits[i].dates.includes(today())) {
      count++;
    }
  }
  doneText.textContent = count;
  totalText.textContent = habits.length;
}

// tick or untick a habit on a date
function toggle(index, date) {
  var dates = habits[index].dates;
  var pos = dates.indexOf(date);
  if (pos == -1) {
    dates.push(date);
  } else {
    dates.splice(pos, 1);
  }
  saveHabits();
  showAll();
}

function removeHabit(index) {
  if (confirm("Delete " + habits[index].name + "?")) {
    habits.splice(index, 1);
    saveHabits();
    showAll();
  }
}

function showHabits() {
  habitList.innerHTML = "";

  if (habits.length == 0) {
    habitList.innerHTML = '<div class="empty">No habits yet. Add one below!</div>';
    return;
  }

  for (var i = 0; i < habits.length; i++) {
    var habit = habits[i];
    var isDone = habit.dates.includes(today());

    var card = document.createElement("div");
    card.className = "card";

    var box = document.createElement("input");
    box.type = "checkbox";
    box.checked = isDone;
    box.onchange = makeToggle(i, today());

    var info = document.createElement("div");
    info.className = "info";

    var name = document.createElement("div");
    name.className = "name";
    if (isDone) name.className = "name done";
    name.textContent = habit.name;
    info.appendChild(name);

    if (habit.desc) {
      var desc = document.createElement("div");
      desc.className = "desc";
      desc.textContent = habit.desc;
      info.appendChild(desc);
    }

    var del = document.createElement("button");
    del.textContent = "Delete";
    del.onclick = makeDelete(i);

    card.appendChild(box);
    card.appendChild(info);
    card.appendChild(del);
    habitList.appendChild(card);
  }
}

function makeToggle(index, date) {
  return function () {
    toggle(index, date);
  };
}

function makeDelete(index) {
  return function () {
    removeHabit(index);
  };
}

function showTable() {
  var dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var days = [];

  // last 7 days, oldest first
  for (var i = 6; i >= 0; i--) {
    var d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d);
  }

  var head = "<th>Habit</th>";
  for (var i = 0; i < days.length; i++) {
    var cls = "";
    var label = dayNames[days[i].getDay()] + " " + days[i].getDate();
    if (dateToText(days[i]) == today()) {
      cls = ' class="today"';
      label += " (today)";
    }
    head += "<th" + cls + ">" + label + "</th>";
  }
  head += "<th>Total</th>";
  tableHead.innerHTML = head;

  tableBody.innerHTML = "";

  if (habits.length == 0) {
    tableBody.innerHTML = '<tr><td colspan="9">No habits yet</td></tr>';
    return;
  }

  for (var h = 0; h < habits.length; h++) {
    var row = document.createElement("tr");

    var nameCell = document.createElement("td");
    nameCell.className = "left";
    nameCell.textContent = habits[h].name;
    row.appendChild(nameCell);

    var total = 0;

    for (var i = 0; i < days.length; i++) {
      var date = dateToText(days[i]);
      var cell = document.createElement("td");
      if (date == today()) cell.className = "today";

      var box = document.createElement("input");
      box.type = "checkbox";
      box.checked = habits[h].dates.includes(date);
      if (box.checked) total++;
      box.onchange = makeToggle(h, date);

      cell.appendChild(box);
      row.appendChild(cell);
    }

    var totalCell = document.createElement("td");
    totalCell.textContent = total + " / 7";
    row.appendChild(totalCell);

    tableBody.appendChild(row);
  }
}

function showAll() {
  showGreeting();
  showCounter();
  showHabits();
  showTable();
}

addBtn.onclick = function () {
  var name = nameInput.value.trim();

  if (name == "") {
    errorText.style.display = "block";
    return;
  }

  errorText.style.display = "none";

  habits.push({
    name: name,
    desc: descInput.value.trim(),
    dates: []
  });

  saveHabits();
  nameInput.value = "";
  descInput.value = "";
  showAll();
};

nameInput.oninput = function () {
  errorText.style.display = "none";
};

loadHabits();
showAll();
