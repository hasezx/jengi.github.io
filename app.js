const appButtons = document.querySelectorAll("[data-app]");
const appViews = {
  calendar: document.querySelector("#calendar-view"),
  reminders: document.querySelector("#reminders-view"),
  clock: document.querySelector("#clock-view"),
  settings: document.querySelector("#settings-view"),
};

const clockTabs = document.querySelectorAll("[data-clock-tab]");
const clockPanels = {
  timer: document.querySelector("#timer-panel"),
  alarms: document.querySelector("#alarms-panel"),
  world: document.querySelector("#world-panel"),
};

const today = new Date();
let visibleMonth = new Date(today.getFullYear(), today.getMonth(), 1);
let selectedDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

const monthLabel = document.querySelector("#month-label");
const dayGrid = document.querySelector("#day-grid");
const todayLabel = document.querySelector("#today-label");
const agendaDate = document.querySelector("#agenda-date");
const upcomingList = document.querySelector("#upcoming-list");
const calendarForm = document.querySelector("#calendar-form");
const showCalendarForm = document.querySelector("#show-calendar-form");
const cancelCalendarEvent = document.querySelector("#cancel-calendar-event");
const calendarEventTitle = document.querySelector("#calendar-event-title");
const calendarEventDate = document.querySelector("#calendar-event-date");
const calendarEventType = document.querySelector("#calendar-event-type");
const nightMode = document.querySelector("#night-mode");
const backgroundHue = document.querySelector("#background-hue");
const fontColor = document.querySelector("#font-color");
const themeMeta = document.querySelector("meta[name='theme-color']");
const reminderForm = document.querySelector("#reminder-form");
const reminderList = document.querySelector("#reminder-list");
const showReminderForm = document.querySelector("#show-reminder-form");
const cancelReminder = document.querySelector("#cancel-reminder");
const reminderTitle = document.querySelector("#reminder-title");
const reminderDescription = document.querySelector("#reminder-description");
const reminderTime = document.querySelector("#reminder-time");
const reminderAddress = document.querySelector("#reminder-address");
const reminderPriority = document.querySelector("#reminder-priority");
const reminderRepeat = document.querySelector("#reminder-repeat");
const reminderRepeatDays = document.querySelector("#reminder-repeat-days");
const completedList = document.querySelector("#completed-list");
const completedCount = document.querySelector("#completed-count");

const timerDisplay = document.querySelector("#timer-display");
const timerEditor = document.querySelector("#timer-editor");
const timerHours = document.querySelector("#timer-hours");
const timerMinutes = document.querySelector("#timer-minutes");
const timerSecondsInput = document.querySelector("#timer-seconds");
const startTimerButton = document.querySelector("#start-timer");
const presetButtons = document.querySelectorAll("[data-preset-seconds]");
const worldList = document.querySelector("#world-list");
const worldForm = document.querySelector("#world-form");
const showWorldForm = document.querySelector("#show-world-form");
const cancelWorldCity = document.querySelector("#cancel-world-city");
const worldCity = document.querySelector("#world-city");
const worldZone = document.querySelector("#world-zone");
let timerSeconds = 300;
let timerRunning = false;
let timerId = null;
let fontColorTouched = false;
const maxTimerSeconds = 23 * 60 * 60 + 59 * 60 + 59;
let calendarEvents = [];
let completedReminders = [];
let worldClocks = [
  { id: createId(), city: "Chicago", zone: "America/Chicago" },
  { id: createId(), city: "New York", zone: "America/New_York" },
  { id: createId(), city: "London", zone: "Europe/London" },
  { id: createId(), city: "Tokyo", zone: "Asia/Tokyo" },
];
let reminders = [
  {
    id: createId(),
    title: "Morning reset",
    description: "Review the day and pick the first task.",
    time: "",
    address: "",
    priority: "medium",
    repeat: "",
    repeatEveryDays: "",
    done: false,
  },
  {
    id: createId(),
    title: "Focused work",
    description: "Protected block for the most important project.",
    time: "",
    address: "",
    priority: "",
    repeat: "",
    repeatEveryDays: "",
    done: false,
  },
];

const defaultTheme = {
  night: false,
  hue: "0",
  font: "#111111",
  customText: false,
};

function sameDay(first, second) {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

function systemToday() {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function resetCalendarToSystemMonth() {
  const currentDate = systemToday();
  visibleMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  selectedDate = currentDate;
}

function formatDate(date, options) {
  return new Intl.DateTimeFormat(undefined, options).format(date);
}

function formatInputDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function parseDateOnly(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function nthWeekdayOfMonth(year, month, weekday, nth) {
  const date = new Date(year, month, 1);
  const offset = (weekday - date.getDay() + 7) % 7;
  date.setDate(1 + offset + (nth - 1) * 7);
  return date;
}

function lastWeekdayOfMonth(year, month, weekday) {
  const date = new Date(year, month + 1, 0);
  const offset = (date.getDay() - weekday + 7) % 7;
  date.setDate(date.getDate() - offset);
  return date;
}

function builtInFestivities() {
  const year = systemToday().getFullYear();
  const years = [year, year + 1];

  return years.flatMap((targetYear) => [
    { id: `new-year-${targetYear}`, title: "New Year's Day", date: `${targetYear}-01-01`, type: "festivity" },
    { id: `valentine-${targetYear}`, title: "Valentine's Day", date: `${targetYear}-02-14`, type: "festivity" },
    {
      id: `memorial-${targetYear}`,
      title: "Memorial Day",
      date: formatInputDate(lastWeekdayOfMonth(targetYear, 4, 1)),
      type: "festivity",
    },
    { id: `juneteenth-${targetYear}`, title: "Juneteenth", date: `${targetYear}-06-19`, type: "festivity" },
    { id: `independence-${targetYear}`, title: "Independence Day", date: `${targetYear}-07-04`, type: "festivity" },
    {
      id: `labor-${targetYear}`,
      title: "Labor Day",
      date: formatInputDate(nthWeekdayOfMonth(targetYear, 8, 1, 1)),
      type: "festivity",
    },
    {
      id: `thanksgiving-${targetYear}`,
      title: "Thanksgiving",
      date: formatInputDate(nthWeekdayOfMonth(targetYear, 10, 4, 4)),
      type: "festivity",
    },
    { id: `christmas-${targetYear}`, title: "Christmas", date: `${targetYear}-12-25`, type: "festivity" },
  ]);
}

function createId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function markedCalendarDates() {
  const eventDates = [...builtInFestivities(), ...calendarEvents].map((event) => event.date);
  const reminderDates = reminders
    .filter((reminder) => reminder.time && !reminder.done)
    .map((reminder) => reminder.time.slice(0, 10));

  return new Set([...eventDates, ...reminderDates]);
}

function renderCalendar() {
  const currentDate = systemToday();
  const markedDates = markedCalendarDates();
  monthLabel.textContent = formatDate(visibleMonth, { month: "long", year: "numeric" });
  todayLabel.textContent = formatDate(currentDate, { weekday: "long", month: "short", day: "numeric" });
  agendaDate.textContent = formatDate(selectedDate, { month: "short", day: "numeric" });

  dayGrid.innerHTML = "";

  const firstDay = visibleMonth.getDay();
  const gridStart = new Date(visibleMonth);
  gridStart.setDate(visibleMonth.getDate() - firstDay);

  for (let index = 0; index < 42; index += 1) {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);

    const button = document.createElement("button");
    button.type = "button";
    button.className = "day-button";
    button.textContent = date.getDate();
    button.setAttribute("aria-label", formatDate(date, { dateStyle: "full" }));

    if (date.getMonth() !== visibleMonth.getMonth()) {
      button.classList.add("outside");
    }

    if (sameDay(date, currentDate)) {
      button.classList.add("today");
    }

    if (sameDay(date, selectedDate)) {
      button.classList.add("selected");
    }

    if (markedDates.has(formatInputDate(date))) {
      button.classList.add("has-items");
    }

    button.addEventListener("click", () => {
      selectedDate = date;
      if (date.getMonth() !== visibleMonth.getMonth()) {
        visibleMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      }
      renderCalendar();
    });

    dayGrid.append(button);
  }

  renderUpcoming();
}

function switchApp(appName) {
  appButtons.forEach((button) => {
    const isActive = button.dataset.app === appName;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  Object.entries(appViews).forEach(([name, view]) => {
    view.classList.toggle("active", name === appName);
  });

  if (appName === "calendar") {
    resetCalendarToSystemMonth();
    renderCalendar();
  }
}

function saveCalendarEvents() {
  localStorage.setItem("personalHubCalendarEvents", JSON.stringify(calendarEvents));
}

function loadCalendarEvents() {
  try {
    const savedEvents = JSON.parse(localStorage.getItem("personalHubCalendarEvents"));
    if (Array.isArray(savedEvents)) {
      calendarEvents = savedEvents.filter((event) => !["memorial-day", "juneteenth"].includes(event.id));
    }
  } catch {
    saveCalendarEvents();
  }
}

function upcomingItems() {
  const start = systemToday();
  const end = new Date(start);
  end.setMonth(end.getMonth() + 1);

  const eventItems = [...builtInFestivities(), ...calendarEvents].map((event) => ({
    ...event,
    dateObject: parseDateOnly(event.date),
  }));

  const reminderItems = reminders
    .filter((reminder) => reminder.time && !reminder.done)
    .map((reminder) => ({
      id: reminder.id,
      title: reminder.title,
      date: reminder.time.slice(0, 10),
      type: "reminder",
      dateObject: new Date(reminder.time),
    }));

  return [...eventItems, ...reminderItems]
    .filter((item) => item.dateObject >= start && item.dateObject <= end)
    .sort((first, second) => first.dateObject - second.dateObject);
}

function renderUpcoming() {
  upcomingList.innerHTML = "";
  const items = upcomingItems();

  if (items.length === 0) {
    const empty = document.createElement("article");
    empty.className = "event-card";
    empty.innerHTML = "<h3>Nothing coming up</h3><span>Next 30 days</span>";
    upcomingList.append(empty);
    return;
  }

  items.forEach((item) => {
    const card = document.createElement("article");
    card.className = "event-card";
    card.dataset.type = item.type;

    const title = document.createElement("h3");
    title.textContent = item.title;
    const meta = document.createElement("span");
    meta.textContent = `${formatDate(item.dateObject, { month: "short", day: "numeric" })} · ${item.type}`;
    card.append(title, meta);
    upcomingList.append(card);
  });
}

function saveReminders() {
  localStorage.setItem("personalHubReminders", JSON.stringify(reminders));
  localStorage.setItem("personalHubCompletedReminders", JSON.stringify(completedReminders));
  renderUpcoming();
}

function loadReminders() {
  try {
    const savedReminders = JSON.parse(localStorage.getItem("personalHubReminders"));
    if (Array.isArray(savedReminders)) {
      reminders = savedReminders;
    }
    const savedCompleted = JSON.parse(localStorage.getItem("personalHubCompletedReminders"));
    if (Array.isArray(savedCompleted)) {
      completedReminders = savedCompleted;
    }
  } catch {
    saveReminders();
  }
}

function nextReminderTime(reminder) {
  if (!reminder.time || !reminder.repeat) {
    return "";
  }

  const next = new Date(reminder.time);
  if (reminder.repeat === "hourly") {
    next.setHours(next.getHours() + 1);
  } else if (reminder.repeat === "daily") {
    next.setDate(next.getDate() + 1);
  } else if (reminder.repeat === "monthly") {
    next.setMonth(next.getMonth() + 1);
  } else if (reminder.repeat === "yearly") {
    next.setFullYear(next.getFullYear() + 1);
  } else if (reminder.repeat === "custom-days") {
    next.setDate(next.getDate() + Math.max(1, Number.parseInt(reminder.repeatEveryDays, 10) || 1));
  }

  return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}-${String(next.getDate()).padStart(2, "0")}T${String(next.getHours()).padStart(2, "0")}:${String(next.getMinutes()).padStart(2, "0")}`;
}

function repeatLabel(reminder) {
  if (!reminder.repeat) {
    return "";
  }

  if (reminder.repeat === "custom-days") {
    return `Every ${Math.max(1, Number.parseInt(reminder.repeatEveryDays, 10) || 1)} days`;
  }

  return reminder.repeat[0].toUpperCase() + reminder.repeat.slice(1);
}

function pruneCompletedReminders() {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  completedReminders = completedReminders.filter((item) => new Date(item.completedAt) >= weekAgo);
}

function formatReminderTime(value) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function renderReminders() {
  pruneCompletedReminders();
  reminderList.innerHTML = "";

  reminders.filter((reminder) => !reminder.done).forEach((reminder) => {
    const card = document.createElement("article");
    card.className = "reminder-card";
    card.dataset.priority = reminder.priority;

    const check = document.createElement("button");
    check.type = "button";
    check.className = `reminder-check${reminder.done ? " done" : ""}`;
    check.setAttribute("aria-label", `Mark ${reminder.title} ${reminder.done ? "incomplete" : "complete"}`);
    check.addEventListener("click", () => {
      completedReminders.unshift({
        id: createId(),
        title: reminder.title,
        completedAt: new Date().toISOString(),
      });

      const nextTime = nextReminderTime(reminder);
      if (nextTime) {
        reminder.time = nextTime;
      } else {
        reminder.done = true;
      }

      saveReminders();
      renderReminders();
    });

    const copy = document.createElement("div");
    copy.className = "reminder-copy";

    if (reminder.priority) {
      const priority = document.createElement("span");
      priority.className = "priority-label";
      priority.textContent = `${reminder.priority} priority`;
      copy.append(priority);
    }

    const title = document.createElement("h3");
    title.textContent = reminder.title;
    copy.append(title);

    if (reminder.description) {
      const description = document.createElement("p");
      description.textContent = reminder.description;
      copy.append(description);
    }

    const metaParts = [formatReminderTime(reminder.time), reminder.address, repeatLabel(reminder)].filter(Boolean);
    if (metaParts.length > 0) {
      const meta = document.createElement("div");
      meta.className = "reminder-meta";
      metaParts.forEach((part) => {
        const item = document.createElement("span");
        item.textContent = part;
        meta.append(item);
      });
      copy.append(meta);
    }

    card.append(check, copy);
    reminderList.append(card);
  });

  renderCompletedReminders();
}

function renderCompletedReminders() {
  pruneCompletedReminders();
  completedList.innerHTML = "";
  completedCount.textContent = completedReminders.length;

  if (completedReminders.length === 0) {
    const empty = document.createElement("article");
    empty.className = "completed-card";
    empty.innerHTML = "<h3>No checked reminders</h3><span>Last 7 days</span>";
    completedList.append(empty);
    return;
  }

  completedReminders.forEach((reminder) => {
    const card = document.createElement("article");
    card.className = "completed-card";
    const title = document.createElement("h3");
    title.textContent = reminder.title;
    const meta = document.createElement("span");
    meta.textContent = formatDate(new Date(reminder.completedAt), {
      weekday: "short",
      hour: "numeric",
      minute: "2-digit",
    });
    card.append(title, meta);
    completedList.append(card);
  });
}

function switchClockTab(tabName) {
  clockTabs.forEach((tab) => {
    const isActive = tab.dataset.clockTab === tabName;
    tab.classList.toggle("active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });

  Object.entries(clockPanels).forEach(([name, panel]) => {
    panel.classList.toggle("active", name === tabName);
  });
}

function renderTimer() {
  const hours = Math.floor(timerSeconds / 3600);
  const minutes = Math.floor((timerSeconds % 3600) / 60);
  const seconds = timerSeconds % 60;
  timerDisplay.textContent = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  timerHours.value = hours;
  timerMinutes.value = minutes;
  timerSecondsInput.value = seconds;
}

function stopTimer() {
  timerRunning = false;
  startTimerButton.textContent = "Start";
  window.clearInterval(timerId);
  timerId = null;
}

function startTimer() {
  if (timerSeconds <= 0) {
    timerSeconds = 300;
  }

  timerRunning = true;
  startTimerButton.textContent = "Pause";
  timerId = window.setInterval(() => {
    timerSeconds = Math.max(0, timerSeconds - 1);
    renderTimer();

    if (timerSeconds === 0) {
      stopTimer();
    }
  }, 1000);
}

function clampTimerPart(value, max) {
  const number = Number.parseInt(value, 10);
  if (Number.isNaN(number)) {
    return 0;
  }

  return Math.min(Math.max(number, 0), max);
}

function updateTimerFromInputs() {
  const hours = clampTimerPart(timerHours.value, 23);
  const minutes = clampTimerPart(timerMinutes.value, 59);
  const seconds = clampTimerPart(timerSecondsInput.value, 59);
  timerSeconds = Math.min(hours * 3600 + minutes * 60 + seconds, maxTimerSeconds);
  renderTimer();
}

function updateWorldClocks() {
  renderWorldClocks();
}

function saveWorldClocks() {
  localStorage.setItem("personalHubWorldClocks", JSON.stringify(worldClocks));
}

function loadWorldClocks() {
  try {
    const savedClocks = JSON.parse(localStorage.getItem("personalHubWorldClocks"));
    if (Array.isArray(savedClocks)) {
      worldClocks = savedClocks;
    }
  } catch {
    saveWorldClocks();
  }
}

function zoneParts(date, zone) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: zone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  return Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
}

function zoneDateKey(date, zone) {
  const parts = zoneParts(date, zone);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function zoneOffsetMinutes(zone, date = new Date()) {
  const parts = zoneParts(date, zone);
  const utcMs = Date.UTC(parts.year, Number(parts.month) - 1, parts.day, parts.hour, parts.minute);
  return Math.round((utcMs - date.getTime()) / 60000);
}

function relativeDayLabel(zone) {
  const now = new Date();
  const localKey = zoneDateKey(now, Intl.DateTimeFormat().resolvedOptions().timeZone);
  const zoneKey = zoneDateKey(now, zone);

  if (zoneKey === localKey) {
    return "Today";
  }

  return zoneKey > localKey ? "Tomorrow" : "Yesterday";
}

function offsetLabel(zone) {
  const localZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const difference = zoneOffsetMinutes(zone) - zoneOffsetMinutes(localZone);

  if (difference === 0) {
    return "same time";
  }

  const absolute = Math.abs(difference);
  const hours = Math.floor(absolute / 60);
  const minutes = absolute % 60;
  const amount = minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`;
  return `${amount} ${difference > 0 ? "ahead" : "behind"}`;
}

function renderWorldClocks() {
  worldList.innerHTML = "";

  worldClocks.forEach((clock) => {
    const item = document.createElement("article");
    item.className = "world-item";
    item.dataset.id = clock.id;

    const deleteButton = document.createElement("button");
    deleteButton.className = "world-delete";
    deleteButton.type = "button";
    deleteButton.setAttribute("aria-label", `Delete ${clock.city}`);
    deleteButton.addEventListener("click", () => {
      worldClocks = worldClocks.filter((savedClock) => savedClock.id !== clock.id);
      saveWorldClocks();
      renderWorldClocks();
    });

    const row = document.createElement("div");
    row.className = "world-row";
    const cityBlock = document.createElement("div");
    const cityName = document.createElement("strong");
    cityName.textContent = clock.city;
    const cityMeta = document.createElement("span");
    cityMeta.textContent = `${relativeDayLabel(clock.zone)} · ${offsetLabel(clock.zone)}`;
    cityBlock.append(cityName, cityMeta);

    const timeBlock = document.createElement("div");
    const time = document.createElement("time");
    time.textContent = new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      minute: "2-digit",
      timeZone: clock.zone,
    }).format(new Date());
    const zone = document.createElement("span");
    zone.textContent = clock.zone.replace("_", " ");
    timeBlock.append(time, zone);
    row.append(cityBlock, timeBlock);

    let startX = 0;
    row.addEventListener("pointerdown", (event) => {
      startX = event.clientX;
    });
    row.addEventListener("pointerup", (event) => {
      const moved = event.clientX - startX;
      item.classList.toggle("revealed", moved < -35);
      if (moved > 35) {
        item.classList.remove("revealed");
      }
    });

    item.append(deleteButton, row);
    worldList.append(item);
  });
}

function applyTheme(settings) {
  document.body.dataset.theme = settings.night ? "night" : "day";
  document.documentElement.style.setProperty("--bg-hue", settings.hue);
  document.documentElement.style.setProperty("--custom-text", settings.font);
  themeMeta.setAttribute("content", settings.night ? "#050505" : "#ffffff");
}

function readStoredTheme() {
  try {
    return { ...defaultTheme, ...JSON.parse(localStorage.getItem("personalHubTheme")) };
  } catch {
    return defaultTheme;
  }
}

function saveTheme(settings) {
  localStorage.setItem("personalHubTheme", JSON.stringify(settings));
}

function currentThemeSettings() {
  return {
    night: nightMode.checked,
    hue: backgroundHue.value,
    font: fontColor.value,
    customText: fontColorTouched,
  };
}

function updateThemeFromControls() {
  const settings = currentThemeSettings();
  applyTheme(settings);
  saveTheme(settings);
}

function setupThemeControls() {
  const storedTheme = readStoredTheme();
  nightMode.checked = storedTheme.night;
  backgroundHue.value = storedTheme.hue;
  fontColor.value = storedTheme.font;
  fontColorTouched = storedTheme.customText;
  applyTheme(storedTheme);

  nightMode.addEventListener("change", () => {
    if (!fontColorTouched) {
      fontColor.value = nightMode.checked ? "#ffffff" : "#111111";
    }
    updateThemeFromControls();
  });

  backgroundHue.addEventListener("input", updateThemeFromControls);
  fontColor.addEventListener("input", () => {
    fontColorTouched = true;
    updateThemeFromControls();
  });
}

appButtons.forEach((button) => {
  button.addEventListener("click", () => switchApp(button.dataset.app));
});

clockTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tab.classList.add("pressed");
    window.setTimeout(() => tab.classList.remove("pressed"), 140);
    switchClockTab(tab.dataset.clockTab);
  });
});

showCalendarForm.addEventListener("click", () => {
  calendarForm.classList.add("open");
  calendarEventDate.value = formatInputDate(selectedDate);
  calendarEventTitle.focus();
});

cancelCalendarEvent.addEventListener("click", () => {
  calendarForm.reset();
  calendarForm.classList.remove("open");
});

calendarForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = calendarEventTitle.value.trim();
  if (!title) {
    calendarEventTitle.focus();
    return;
  }

  calendarEvents.push({
    id: createId(),
    title,
    date: calendarEventDate.value,
    type: calendarEventType.value,
  });
  saveCalendarEvents();
  renderCalendar();
  calendarForm.reset();
  calendarForm.classList.remove("open");
});

showReminderForm.addEventListener("click", () => {
  reminderForm.classList.add("open");
  if (!reminderTime.value) {
    const currentDate = systemToday();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const day = String(currentDate.getDate()).padStart(2, "0");
    reminderTime.value = `${year}-${month}-${day}T00:00`;
  }
  reminderTitle.focus();
});

showWorldForm.addEventListener("click", () => {
  worldForm.classList.add("open");
  worldCity.value = worldZone.options[worldZone.selectedIndex].textContent;
  worldCity.focus();
  worldCity.select();
});

cancelWorldCity.addEventListener("click", () => {
  worldForm.reset();
  worldForm.classList.remove("open");
});

worldZone.addEventListener("change", () => {
  if (!worldCity.value.trim()) {
    worldCity.value = worldZone.options[worldZone.selectedIndex].textContent;
  }
});

worldForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const city = worldCity.value.trim();
  if (!city) {
    worldCity.focus();
    return;
  }

  worldClocks.push({
    id: createId(),
    city,
    zone: worldZone.value,
  });
  saveWorldClocks();
  renderWorldClocks();
  worldForm.reset();
  worldForm.classList.remove("open");
});

reminderRepeat.addEventListener("change", () => {
  const usesCustomDays = reminderRepeat.value === "custom-days";
  reminderRepeatDays.disabled = !usesCustomDays;
  if (usesCustomDays && !reminderRepeatDays.value) {
    reminderRepeatDays.value = 1;
  }
});

cancelReminder.addEventListener("click", () => {
  reminderForm.reset();
  reminderRepeatDays.disabled = true;
  reminderForm.classList.remove("open");
});

reminderForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = reminderTitle.value.trim();
  if (!title) {
    reminderTitle.focus();
    return;
  }

  reminders.unshift({
    id: createId(),
    title,
    description: reminderDescription.value.trim(),
    time: reminderTime.value,
    address: reminderAddress.value.trim(),
    priority: reminderPriority.value,
    repeat: reminderRepeat.value,
    repeatEveryDays: reminderRepeat.value === "custom-days" ? reminderRepeatDays.value : "",
    done: false,
  });
  saveReminders();
  renderReminders();
  reminderForm.reset();
  reminderRepeatDays.disabled = true;
  reminderForm.classList.remove("open");
});

document.querySelector("#prev-month").addEventListener("click", () => {
  visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1);
  renderCalendar();
});

document.querySelector("#next-month").addEventListener("click", () => {
  visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1);
  renderCalendar();
});

document.querySelector("#minus-minute").addEventListener("click", () => {
  timerSeconds = Math.max(0, timerSeconds - 60);
  renderTimer();
});

document.querySelector("#plus-minute").addEventListener("click", () => {
  timerSeconds = Math.min(maxTimerSeconds, timerSeconds + 60);
  renderTimer();
});

document.querySelector("#reset-timer").addEventListener("click", () => {
  stopTimer();
  timerSeconds = 300;
  renderTimer();
});

startTimerButton.addEventListener("click", () => {
  if (timerRunning) {
    stopTimer();
  } else {
    startTimer();
  }
});

timerDisplay.addEventListener("click", () => {
  timerEditor.hidden = !timerEditor.hidden;
  if (!timerEditor.hidden) {
    timerMinutes.focus();
  }
});

[timerHours, timerMinutes, timerSecondsInput].forEach((input) => {
  input.addEventListener("input", updateTimerFromInputs);
  input.addEventListener("wheel", (event) => {
    event.preventDefault();
    const max = input === timerHours ? 23 : 59;
    const current = clampTimerPart(input.value, max);
    input.value = event.deltaY < 0 ? Math.min(max, current + 1) : Math.max(0, current - 1);
    updateTimerFromInputs();
  });
});

presetButtons.forEach((button) => {
  button.addEventListener("click", () => {
    stopTimer();
    timerSeconds = Number.parseInt(button.dataset.presetSeconds, 10);
    renderTimer();
  });
});

setupThemeControls();
loadCalendarEvents();
loadReminders();
loadWorldClocks();
renderReminders();
resetCalendarToSystemMonth();
renderCalendar();
renderTimer();
renderWorldClocks();
window.setInterval(updateWorldClocks, 15000);
