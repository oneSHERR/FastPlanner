// ============================================================
// THEMES
// ============================================================
var THEMES = {
  midnight: { name:"Полночь", icon:"🌙", app:"linear-gradient(145deg,#0f0f1a,#1a1a2e,#16213e)", hdr:"linear-gradient(135deg,rgba(30,30,60,.95),rgba(25,25,50,.9))", cbg:"rgba(255,255,255,.025)", cb:"rgba(255,255,255,.06)", tx:"#e8e8f0", tm:"rgba(255,255,255,.45)", td:"rgba(255,255,255,.3)", ib:"rgba(255,255,255,.04)", ibd:"rgba(255,255,255,.1)", ac:"#7c5cff", ag:"rgba(124,92,255,.3)", ab:"rgba(124,92,255,.15)", at:"#b8a4ff", chb:"rgba(255,255,255,.05)", chc:"rgba(255,255,255,.08)", ob:"rgba(0,0,0,.65)", fb:"linear-gradient(145deg,#1e1e3a,#1a1a2e)", dbg:"rgba(255,255,255,.02)", dbd:"rgba(255,255,255,.12)", sh:"rgba(0,0,0,.12)", sbg:"rgba(15,15,26,.95)" },
  cream: { name:"Крем", icon:"🍦", app:"linear-gradient(145deg,#fdf6ee,#f5ebe0,#f0e4d4)", hdr:"linear-gradient(135deg,rgba(245,235,224,.97),rgba(240,228,212,.95))", cbg:"rgba(255,255,255,.7)", cb:"rgba(180,160,130,.15)", tx:"#3d2c1e", tm:"rgba(61,44,30,.55)", td:"rgba(61,44,30,.35)", ib:"rgba(255,255,255,.6)", ibd:"rgba(180,160,130,.25)", ac:"#c47f42", ag:"rgba(196,127,66,.25)", ab:"rgba(196,127,66,.12)", at:"#a0632e", chb:"rgba(196,127,66,.08)", chc:"rgba(180,160,130,.15)", ob:"rgba(60,40,20,.45)", fb:"linear-gradient(145deg,#fdf8f2,#f5ebe0)", dbg:"rgba(196,127,66,.04)", dbd:"rgba(180,160,130,.25)", sh:"rgba(120,90,50,.08)", sbg:"rgba(240,228,212,.97)" },
  snow: { name:"Снег", icon:"❄️", app:"linear-gradient(145deg,#fff,#f4f6f9,#eef1f5)", hdr:"linear-gradient(135deg,rgba(255,255,255,.97),rgba(244,246,249,.95))", cbg:"rgba(255,255,255,.85)", cb:"rgba(0,0,0,.06)", tx:"#1a1a2e", tm:"rgba(26,26,46,.5)", td:"rgba(26,26,46,.3)", ib:"rgba(0,0,0,.03)", ibd:"rgba(0,0,0,.08)", ac:"#4a6cf7", ag:"rgba(74,108,247,.2)", ab:"rgba(74,108,247,.08)", at:"#3b5de7", chb:"rgba(0,0,0,.04)", chc:"rgba(0,0,0,.06)", ob:"rgba(0,0,0,.35)", fb:"linear-gradient(145deg,#fff,#f8f9fc)", dbg:"rgba(74,108,247,.03)", dbd:"rgba(0,0,0,.1)", sh:"rgba(0,0,0,.06)", sbg:"rgba(244,246,249,.97)" },
  charcoal: { name:"Уголь", icon:"🖤", app:"linear-gradient(145deg,#1c1c1e,#2c2c2e,#262628)", hdr:"linear-gradient(135deg,rgba(44,44,46,.95),rgba(38,38,40,.95))", cbg:"rgba(255,255,255,.04)", cb:"rgba(255,255,255,.07)", tx:"#e5e5e7", tm:"rgba(229,229,231,.5)", td:"rgba(229,229,231,.3)", ib:"rgba(255,255,255,.06)", ibd:"rgba(255,255,255,.1)", ac:"#ff9f0a", ag:"rgba(255,159,10,.25)", ab:"rgba(255,159,10,.12)", at:"#ffb340", chb:"rgba(255,255,255,.06)", chc:"rgba(255,255,255,.08)", ob:"rgba(0,0,0,.6)", fb:"linear-gradient(145deg,#2c2c2e,#262628)", dbg:"rgba(255,159,10,.04)", dbd:"rgba(255,255,255,.1)", sh:"rgba(0,0,0,.2)", sbg:"rgba(28,28,30,.95)" },
  forest: { name:"Лес", icon:"🌲", app:"linear-gradient(145deg,#0d1f17,#142a1f,#1a3328)", hdr:"linear-gradient(135deg,rgba(20,42,31,.95),rgba(26,51,40,.95))", cbg:"rgba(200,230,210,.04)", cb:"rgba(120,200,150,.1)", tx:"#d4e8dc", tm:"rgba(212,232,220,.5)", td:"rgba(212,232,220,.3)", ib:"rgba(200,230,210,.06)", ibd:"rgba(120,200,150,.15)", ac:"#4caf6a", ag:"rgba(76,175,106,.25)", ab:"rgba(76,175,106,.12)", at:"#6fcf87", chb:"rgba(120,200,150,.08)", chc:"rgba(120,200,150,.12)", ob:"rgba(5,15,10,.65)", fb:"linear-gradient(145deg,#162e22,#1a3328)", dbg:"rgba(76,175,106,.04)", dbd:"rgba(120,200,150,.15)", sh:"rgba(0,0,0,.2)", sbg:"rgba(13,31,23,.95)" },
  rose: { name:"Роза", icon:"🌸", app:"linear-gradient(145deg,#fef5f7,#fce4ec,#f8d7e0)", hdr:"linear-gradient(135deg,rgba(252,228,236,.97),rgba(248,215,224,.95))", cbg:"rgba(255,255,255,.7)", cb:"rgba(200,120,150,.12)", tx:"#4a2030", tm:"rgba(74,32,48,.5)", td:"rgba(74,32,48,.3)", ib:"rgba(255,255,255,.6)", ibd:"rgba(200,120,150,.2)", ac:"#d4537a", ag:"rgba(212,83,122,.2)", ab:"rgba(212,83,122,.1)", at:"#c4446a", chb:"rgba(212,83,122,.06)", chc:"rgba(200,120,150,.12)", ob:"rgba(50,15,25,.4)", fb:"linear-gradient(145deg,#fff8fa,#fce4ec)", dbg:"rgba(212,83,122,.04)", dbd:"rgba(200,120,150,.2)", sh:"rgba(150,60,90,.06)", sbg:"rgba(252,228,236,.97)" },
  ocean: { name:"Океан", icon:"🌊", app:"linear-gradient(145deg,#0a1628,#0f2238,#132d46)", hdr:"linear-gradient(135deg,rgba(15,34,56,.95),rgba(19,45,70,.95))", cbg:"rgba(100,180,255,.04)", cb:"rgba(80,160,240,.12)", tx:"#d0e4f5", tm:"rgba(208,228,245,.5)", td:"rgba(208,228,245,.3)", ib:"rgba(100,180,255,.06)", ibd:"rgba(80,160,240,.18)", ac:"#3b9eff", ag:"rgba(59,158,255,.3)", ab:"rgba(59,158,255,.12)", at:"#6eb8ff", chb:"rgba(80,160,240,.08)", chc:"rgba(80,160,240,.12)", ob:"rgba(5,12,25,.65)", fb:"linear-gradient(145deg,#112a42,#0f2238)", dbg:"rgba(59,158,255,.04)", dbd:"rgba(80,160,240,.2)", sh:"rgba(0,0,0,.2)", sbg:"rgba(10,22,40,.95)" },
  lavender: { name:"Лаванда", icon:"💜", app:"linear-gradient(145deg,#f3eeff,#e8dff5,#ddd3ee)", hdr:"linear-gradient(135deg,rgba(232,223,245,.97),rgba(221,211,238,.95))", cbg:"rgba(255,255,255,.65)", cb:"rgba(150,120,200,.12)", tx:"#2d1f4e", tm:"rgba(45,31,78,.5)", td:"rgba(45,31,78,.3)", ib:"rgba(255,255,255,.55)", ibd:"rgba(150,120,200,.2)", ac:"#8b5cf6", ag:"rgba(139,92,246,.2)", ab:"rgba(139,92,246,.1)", at:"#7c3aed", chb:"rgba(139,92,246,.06)", chc:"rgba(150,120,200,.12)", ob:"rgba(30,15,50,.4)", fb:"linear-gradient(145deg,#f8f4ff,#e8dff5)", dbg:"rgba(139,92,246,.04)", dbd:"rgba(150,120,200,.2)", sh:"rgba(100,60,160,.06)", sbg:"rgba(232,223,245,.97)" }
};

var PRI = {
  urgent: { l:"🔴 Срочно", c:"#ff4757", bg:"rgba(255,71,87,.08)", bd:"rgba(255,71,87,.25)" },
  high:   { l:"🟠 Важно",  c:"#ff9f43", bg:"rgba(255,159,67,.08)", bd:"rgba(255,159,67,.25)" },
  medium: { l:"🟡 Средне", c:"#feca57", bg:"rgba(254,202,87,.08)", bd:"rgba(254,202,87,.25)" },
  low:    { l:"🟢 Не горит",c:"#2ed573", bg:"rgba(46,213,115,.08)", bd:"rgba(46,213,115,.25)" }
};

var COLS = [
  { id:"todo", t:"К выполнению", ic:"📋", em:"Перетащи задачу сюда" },
  { id:"inprogress", t:"В работе", ic:"⚡", em:"Начни работу!" },
  { id:"done", t:"Готово", ic:"✅", em:"Пока пусто…" }
];

var FICONS = {
  xlsx:{i:"📊",c:"#2ed573",l:"Excel"}, xls:{i:"📊",c:"#2ed573",l:"Excel"},
  csv:{i:"📊",c:"#2ed573",l:"CSV"}, doc:{i:"📝",c:"#54a0ff",l:"Word"},
  docx:{i:"📝",c:"#54a0ff",l:"Word"}, pdf:{i:"📕",c:"#ff4757",l:"PDF"},
  pptx:{i:"📙",c:"#ff9f43",l:"PPT"}, png:{i:"🖼️",c:"#a29bfe",l:"Фото"},
  jpg:{i:"🖼️",c:"#a29bfe",l:"Фото"}, jpeg:{i:"🖼️",c:"#a29bfe",l:"Фото"},
  zip:{i:"📦",c:"#feca57",l:"Архив"}, txt:{i:"📄",c:"#dfe6e9",l:"Текст"}
};

// ============================================================
// HELPERS
// ============================================================
function gfi(n) { var e = n.split(".").pop().toLowerCase(); return FICONS[e] || {i:"📎",c:"#b2bec3",l:"Файл"}; }
function fsz(b) { return b < 1024 ? b+" B" : b < 1048576 ? (b/1024).toFixed(1)+" KB" : (b/1048576).toFixed(1)+" MB"; }
function gid() { return Date.now().toString(36) + Math.random().toString(36).slice(2,7); }
function esc(s) { var d = document.createElement("div"); d.textContent = s; return d.innerHTML; }

function fdt(d) {
  if (!d) return "";
  var dt = new Date(d), now = new Date(), df = Math.ceil((dt - now) / 864e5);
  if (df < 0) return "⚠️ Просрочено";
  if (df === 0) return "⏰ Сегодня";
  if (df === 1) return "📅 Завтра";
  return "📅 " + dt.toLocaleDateString("ru-RU", {day:"numeric", month:"short"});
}

function rdf(fl) {
  return Promise.all(Array.from(fl).map(function(f) {
    return new Promise(function(res) {
      var rd = new FileReader();
      rd.onload = function() { res({name:f.name, size:f.size, type:f.type, dataUrl:rd.result}); };
      rd.readAsDataURL(f);
    });
  }));
}

function dlf(f) {
  var a = document.createElement("a");
  a.href = f.dataUrl; a.download = f.name;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
}

function greet() {
  var h = new Date().getHours();
  return h < 6 ? "Доброй ночи" : h < 12 ? "Доброе утро" : h < 18 ? "Добрый день" : "Добрый вечер";
}

// ============================================================
// STATE
// ============================================================
var tasks = [];
var themeId = "midnight";
var activeFilter = "all";
var searchText = "";
var activeTab = "planner";
var editingTask = null;
var previewingFile = null;
var formPriority = "medium";
var formFileList = [];

var LS_TASKS = "wf-tasks-v4";
var LS_THEME = "wf-theme";

function loadState() {
  try { var t = localStorage.getItem(LS_TASKS); if (t) tasks = JSON.parse(t); } catch(e) {}
  try { var t = localStorage.getItem(LS_THEME); if (t && THEMES[t]) themeId = t; } catch(e) {}
}

function saveTasks() {
  try { localStorage.setItem(LS_TASKS, JSON.stringify(tasks)); } catch(e) {}
}

function saveTheme() {
  try { localStorage.setItem(LS_THEME, themeId); } catch(e) {}
}

function getStats() {
  var s = { total: tasks.length, done: 0, over: 0, files: 0 };
  for (var i = 0; i < tasks.length; i++) {
    if (tasks[i].column === "done") s.done++;
    if (tasks[i].deadline && new Date(tasks[i].deadline) < new Date() && tasks[i].column !== "done") s.over++;
    s.files += (tasks[i].files || []).length;
  }
  return s;
}

function getFiltered() {
  return tasks.filter(function(t) {
    if (activeFilter !== "all" && t.priority !== activeFilter) return false;
    if (searchText) {
      var q = searchText.toLowerCase();
      var inTitle = t.title.toLowerCase().indexOf(q) >= 0;
      var inDesc = t.description && t.description.toLowerCase().indexOf(q) >= 0;
      var inFiles = (t.files || []).some(function(f) { return f.name.toLowerCase().indexOf(q) >= 0; });
      if (!inTitle && !inDesc && !inFiles) return false;
    }
    return true;
  });
}

// ============================================================
// DRAG & DROP
// ============================================================
var dragInfo = null;
var dropInfo = null;

function startDrag(taskId, evt) {
  var card = evt.target.closest(".card");
  if (!card) return;
  evt.preventDefault();
  var rect = card.getBoundingClientRect();
  var ghost = card.cloneNode(true);
  ghost.className = "card ghost";
  ghost.style.width = rect.width + "px";
  ghost.style.left = rect.left + "px";
  ghost.style.top = rect.top + "px";
  document.body.appendChild(ghost);
  dragInfo = { id: taskId, ghost: ghost, ox: evt.clientX - rect.left, oy: evt.clientY - rect.top };
  card.classList.add("dragging");
  document.addEventListener("pointermove", onDragMove);
  document.addEventListener("pointerup", onDragEnd);
}

function onDragMove(evt) {
  if (!dragInfo) return;
  dragInfo.ghost.style.left = (evt.clientX - dragInfo.ox) + "px";
  dragInfo.ghost.style.top = (evt.clientY - dragInfo.oy) + "px";
  dropInfo = null;

  var cols = document.querySelectorAll(".col");
  for (var i = 0; i < cols.length; i++) {
    var r = cols[i].getBoundingClientRect();
    cols[i].classList.remove("dragover");
    if (evt.clientX >= r.left && evt.clientX <= r.right && evt.clientY >= r.top && evt.clientY <= r.bottom) {
      cols[i].classList.add("dragover");
      var colId = cols[i].getAttribute("data-col");
      var beforeId = null;
      var cards = cols[i].querySelectorAll(".card:not(.dragging)");
      for (var j = 0; j < cards.length; j++) {
        var cr = cards[j].getBoundingClientRect();
        if (evt.clientY < cr.top + cr.height / 2) {
          beforeId = cards[j].getAttribute("data-tid");
          break;
        }
      }
      dropInfo = { col: colId, before: beforeId };
    }
  }

  // Show drop indicators
  var inds = document.querySelectorAll(".drop-ind");
  for (var i = 0; i < inds.length; i++) inds[i].style.opacity = "0";
  if (dropInfo) {
    var T = THEMES[themeId];
    var sel = dropInfo.before
      ? '.drop-ind[data-b="' + dropInfo.before + '"]'
      : '.drop-ind[data-e="' + dropInfo.col + '"]';
    var ind = document.querySelector(sel);
    if (ind) { ind.style.opacity = "1"; ind.style.background = T.ac; }
  }
}

function onDragEnd() {
  document.removeEventListener("pointermove", onDragMove);
  document.removeEventListener("pointerup", onDragEnd);
  if (!dragInfo) return;

  dragInfo.ghost.remove();
  var els = document.querySelectorAll(".card.dragging");
  for (var i = 0; i < els.length; i++) els[i].classList.remove("dragging");
  els = document.querySelectorAll(".col.dragover");
  for (var i = 0; i < els.length; i++) els[i].classList.remove("dragover");

  if (dropInfo) {
    var task = null;
    var taskIdx = -1;
    for (var i = 0; i < tasks.length; i++) {
      if (tasks[i].id === dragInfo.id) { task = tasks[i]; taskIdx = i; break; }
    }
    if (task) {
      tasks.splice(taskIdx, 1);
      task.column = dropInfo.col;
      task.completedAt = dropInfo.col === "done" ? new Date().toISOString() : null;

      if (dropInfo.before) {
        var bi = -1;
        for (var i = 0; i < tasks.length; i++) {
          if (tasks[i].id === dropInfo.before) { bi = i; break; }
        }
        if (bi >= 0) tasks.splice(bi, 0, task);
        else tasks.push(task);
      } else {
        var li = -1;
        for (var i = tasks.length - 1; i >= 0; i--) {
          if (tasks[i].column === dropInfo.col) { li = i; break; }
        }
        tasks.splice(li + 1, 0, task);
      }
      saveTasks();
    }
  }

  dragInfo = null;
  dropInfo = null;
  render();
}

// ============================================================
// TASK ACTIONS (global)
// ============================================================
window.startDrag = startDrag;

window.deleteTask = function(id) {
  tasks = tasks.filter(function(t) { return t.id !== id; });
  saveTasks(); render();
};

window.moveTask = function(id, col) {
  for (var i = 0; i < tasks.length; i++) {
    if (tasks[i].id === id) {
      tasks[i].column = col;
      tasks[i].completedAt = col === "done" ? new Date().toISOString() : null;
      break;
    }
  }
  saveTasks(); render();
};

window.removeFile = function(id, fi) {
  for (var i = 0; i < tasks.length; i++) {
    if (tasks[i].id === id && tasks[i].files) {
      tasks[i].files.splice(fi, 1);
      break;
    }
  }
  saveTasks(); render();
};

window.dlFile = function(id, fi) {
  for (var i = 0; i < tasks.length; i++) {
    if (tasks[i].id === id && tasks[i].files && tasks[i].files[fi]) {
      dlf(tasks[i].files[fi]); break;
    }
  }
};

window.quickAttach = function(id, inp) {
  rdf(inp.files).then(function(nf) {
    for (var i = 0; i < tasks.length; i++) {
      if (tasks[i].id === id) {
        tasks[i].files = (tasks[i].files || []).concat(nf);
        break;
      }
    }
    saveTasks(); render();
  });
  inp.value = "";
};

window.showPreview = function(id, fi) {
  for (var i = 0; i < tasks.length; i++) {
    if (tasks[i].id === id && tasks[i].files && tasks[i].files[fi]) {
      previewingFile = tasks[i].files[fi];
      renderPreview();
      break;
    }
  }
};

// ============================================================
// TAB SWITCH
// ============================================================
window.switchTab = function(tab) {
  activeTab = tab;
  var p1 = document.getElementById("pnl-planner");
  var p2 = document.getElementById("pnl-tools");
  if (tab === "planner") {
    p1.className = "pnl act";
    p2.className = "pnl off-r";
  } else {
    p1.className = "pnl off-l";
    p2.className = "pnl act";
  }
  renderSidebar();
};

// ============================================================
// SEARCH & FILTER (global)
// ============================================================
window.setFilter = function(f) { activeFilter = f; renderPlanner(); };
window.setSearch = function(v) { searchText = v; renderPlanner(); };

// ============================================================
// THEME PICKER
// ============================================================
window.openThemePicker = function(evt) {
  evt.stopPropagation();
  var old = document.getElementById("tpbg");
  if (old) { old.remove(); return; }

  var T = THEMES[themeId];
  var rect = evt.currentTarget.getBoundingClientRect();

  var bg = document.createElement("div");
  bg.id = "tpbg";
  bg.className = "tp-bg";
  bg.onclick = function() { bg.remove(); };

  var pk = document.createElement("div");
  pk.className = "tp";
  pk.style.background = T.fb;
  pk.style.border = "1px solid " + T.cb;
  pk.style.boxShadow = "0 16px 48px " + T.sh;
  pk.style.left = (rect.right + 8) + "px";
  pk.style.bottom = (window.innerHeight - rect.bottom) + "px";
  pk.onclick = function(e) { e.stopPropagation(); };

  var h = '<div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;padding:4px 8px 8px;margin-bottom:4px;color:' + T.tm + ';border-bottom:1px solid ' + T.cb + '">Тема оформления</div>';

  var keys = Object.keys(THEMES);
  for (var i = 0; i < keys.length; i++) {
    var k = keys[i];
    var tm = THEMES[k];
    var isActive = (themeId === k);
    h += '<button class="tp-opt" style="color:' + T.tx + ';' + (isActive ? 'background:' + T.ab : '') + '" data-theme="' + k + '">';
    h += '<span style="font-size:20px">' + tm.icon + '</span>';
    h += '<span style="flex:1;text-align:left">' + tm.name + '</span>';
    if (isActive) h += '<span style="color:' + T.ac + ';font-weight:700">✓</span>';
    h += '</button>';
  }

  pk.innerHTML = h;
  pk.addEventListener("click", function(e) {
    var btn = e.target.closest("[data-theme]");
    if (btn) {
      themeId = btn.getAttribute("data-theme");
      saveTheme();
      bg.remove();
      render();
    }
  });

  bg.appendChild(pk);
  document.body.appendChild(bg);
};

// ============================================================
// RENDER: SIDEBAR
// ============================================================
function renderSidebar() {
  var T = THEMES[themeId];
  var el = document.getElementById("sidebar");
  el.style.background = T.sbg;
  el.style.borderRight = "1px solid " + T.cb;

  var h = '';
  // Planner btn
  var isP = activeTab === "planner";
  h += '<button class="sb ' + (isP ? 'on' : '') + '" style="background:' + (isP ? T.ab : 'transparent') + ';color:' + (isP ? T.ac : T.td) + ';border:1px solid ' + (isP ? T.ac + '44' : 'transparent') + '" onclick="switchTab(\'planner\')">';
  h += '⬡<span class="tip" style="background:' + T.fb + ';color:' + T.tx + ';border:1px solid ' + T.cb + ';box-shadow:0 4px 16px ' + T.sh + '">Планировщик</span></button>';

  // Tools btn
  var isT = activeTab === "tools";
  h += '<button class="sb ' + (isT ? 'on' : '') + '" style="background:' + (isT ? T.ab : 'transparent') + ';color:' + (isT ? T.ac : T.td) + ';border:1px solid ' + (isT ? T.ac + '44' : 'transparent') + '" onclick="switchTab(\'tools\')">';
  h += '🔧<span class="tip" style="background:' + T.fb + ';color:' + T.tx + ';border:1px solid ' + T.cb + ';box-shadow:0 4px 16px ' + T.sh + '">Инструменты</span></button>';

  h += '<div style="flex:1"></div>';

  // Theme btn
  h += '<button class="sb" style="background:' + T.chb + ';color:' + T.tx + ';border:1px solid ' + T.cb + '" onclick="openThemePicker(event)">';
  h += '🎨<span class="tip" style="background:' + T.fb + ';color:' + T.tx + ';border:1px solid ' + T.cb + ';box-shadow:0 4px 16px ' + T.sh + '">Темы</span></button>';

  el.innerHTML = h;
}

// ============================================================
// RENDER: PLANNER
// ============================================================
function renderPlanner() {
  var T = THEMES[themeId];
  var st = getStats();
  var now = new Date();
  var ft = getFiltered();
  var el = document.getElementById("pnl-planner");

  var h = '';

  // Header
  h += '<header style="background:' + T.hdr + ';border-bottom:1px solid ' + T.cb + ';padding:20px 28px;backdrop-filter:blur(20px)">';
  h += '<div style="max-width:1280px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:14px">';
  h += '<div>';
  h += '<h1 style="font-size:26px;font-weight:700;display:flex;align-items:center;gap:10px;color:' + T.tx + '">';
  h += '<span style="font-size:30px;color:' + T.ac + ';filter:drop-shadow(0 0 8px ' + T.ag + ')">⬡</span> WorkFlow</h1>';
  h += '<p style="font-size:13px;color:' + T.tm + ';margin-top:4px;font-weight:300">' + greet() + ' — ' + now.toLocaleDateString("ru-RU", {weekday:"long",day:"numeric",month:"long"}) + '</p>';
  h += '</div>';

  // Stats
  h += '<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">';
  h += statChip(T, st.total, T.tx, "задач");
  h += statChip(T, st.done, "#2ed573", "готово");
  if (st.files) h += statChip(T, st.files, "#54a0ff", "файлов");
  if (st.over) h += '<div style="background:rgba(255,71,87,.12);border-radius:12px;padding:8px 14px;display:flex;flex-direction:column;align-items:center;min-width:56px"><span style="font-size:20px;font-weight:700;font-family:\'JetBrains Mono\',monospace;color:#ff4757">' + st.over + '</span><span style="font-size:10px;text-transform:uppercase;letter-spacing:.05em;margin-top:2px;color:' + T.tm + '">просроч.</span></div>';
  if (st.total) h += '<div style="width:100px;height:6px;background:' + T.chc + ';border-radius:3px;overflow:hidden"><div style="height:100%;width:' + (st.done / st.total * 100) + '%;background:linear-gradient(90deg,' + T.ac + ',#2ed573);border-radius:3px;transition:width .5s"></div></div>';
  h += '</div></div></header>';

  // Toolbar
  h += '<div style="max-width:1280px;margin:0 auto;padding:16px 28px;display:flex;gap:10px;align-items:center;flex-wrap:wrap">';
  h += '<div style="position:relative;flex:1 1 180px"><span style="position:absolute;left:12px;top:50%;transform:translateY(-50%);font-size:16px;color:' + T.td + '">⌕</span>';
  h += '<input style="width:100%;padding:9px 12px 9px 36px;border-radius:10px;border:1px solid ' + T.ibd + ';background:' + T.ib + ';color:' + T.tx + ';font-size:13px;outline:none" placeholder="Поиск…" value="' + esc(searchText) + '" oninput="setSearch(this.value)"></div>';

  // Filters
  h += '<div style="display:flex;gap:5px;flex-wrap:wrap">';
  var filters = [{id:"all",l:"Все"}];
  var pk = Object.keys(PRI);
  for (var i = 0; i < pk.length; i++) filters.push({id: pk[i], l: PRI[pk[i]].l});
  for (var i = 0; i < filters.length; i++) {
    var f = filters[i];
    var isAct = activeFilter === f.id;
    h += '<button style="padding:6px 12px;border-radius:8px;border:1px solid ' + (isAct ? T.ac + '66' : T.cb) + ';color:' + (isAct ? T.at : T.tm) + ';background:' + (isAct ? T.ab : 'transparent') + ';font-size:11px" onclick="setFilter(\'' + f.id + '\')">' + f.l + '</button>';
  }
  h += '</div>';

  h += '<button style="padding:9px 20px;border-radius:10px;border:none;background:linear-gradient(135deg,' + T.ac + ',' + T.ac + 'dd);color:#fff;font-size:13px;font-weight:600;box-shadow:0 4px 16px ' + T.ag + '" onclick="openForm()">＋ Новая задача</button>';
  h += '</div>';

  // Board
  h += '<div class="board">';
  for (var ci = 0; ci < COLS.length; ci++) {
    var col = COLS[ci];
    var colTasks = ft.filter(function(t) { return t.column === col.id; });
    h += '<div class="col" data-col="' + col.id + '" style="background:' + T.cbg + ';border:1px solid ' + T.cb + ';outline-color:' + T.ac + '">';
    h += '<div style="display:flex;align-items:center;gap:8px;padding:4px 4px 12px;border-bottom:1px solid ' + T.cb + ';margin-bottom:10px"><span style="font-size:18px">' + col.ic + '</span><span style="font-size:14px;font-weight:600;flex:1;color:' + T.tx + '">' + col.t + '</span><span style="font-size:11px;font-weight:600;background:' + T.chc + ';border-radius:6px;padding:2px 7px;font-family:\'JetBrains Mono\',monospace;color:' + T.tx + '">' + colTasks.length + '</span></div>';
    h += '<div class="col-body">';
    if (!colTasks.length) {
      h += '<div style="text-align:center;font-size:12px;padding:30px 10px;font-style:italic;color:' + T.td + '">' + col.em + '</div>';
    }
    for (var ti = 0; ti < colTasks.length; ti++) {
      h += renderCard(T, colTasks[ti]);
    }
    h += '<div class="drop-ind" data-e="' + col.id + '" style="opacity:0"></div>';
    h += '</div></div>';
  }
  h += '</div>';

  el.innerHTML = h;
}

function statChip(T, num, color, label) {
  return '<div style="background:' + T.chb + ';border-radius:12px;padding:8px 14px;display:flex;flex-direction:column;align-items:center;min-width:56px"><span style="font-size:20px;font-weight:700;font-family:\'JetBrains Mono\',monospace;color:' + color + '">' + num + '</span><span style="font-size:10px;text-transform:uppercase;letter-spacing:.05em;margin-top:2px;color:' + T.tm + '">' + label + '</span></div>';
}

function renderCard(T, task) {
  var p = PRI[task.priority] || PRI.medium;
  var dl = fdt(task.deadline);
  var ov = task.deadline && new Date(task.deadline) < new Date() && task.column !== "done";
  var files = task.files || [];
  var isDone = task.column === "done";

  var h = '<div class="drop-ind" data-b="' + task.id + '" style="opacity:0"></div>';
  h += '<div class="card" data-tid="' + task.id + '" style="border-left:3px solid ' + p.c + ';background:' + p.bg + ';border-right:1px solid ' + T.cb + ';border-top:1px solid ' + T.cb + ';border-bottom:1px solid ' + T.cb + ';box-shadow:0 2px 8px ' + T.sh + ';' + (isDone ? 'opacity:.55' : '') + '">';

  // Top bar
  h += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">';
  h += '<div style="display:flex;align-items:center;gap:5px">';
  h += '<span class="dh" onpointerdown="startDrag(\'' + task.id + '\',event)">⠿</span>';
  h += '<span style="font-size:10px;padding:2px 7px;border-radius:5px;font-weight:500;background:' + p.bd + ';color:' + p.c + '">' + p.l + '</span>';
  h += '</div>';
  h += '<div style="display:flex;gap:3px">';
  h += '<button style="background:none;border:none;color:' + T.td + ';font-size:13px;padding:2px 5px;cursor:pointer" onclick="document.getElementById(\'fi-' + task.id + '\').click()">📎</button>';
  h += '<button style="background:none;border:none;color:' + T.td + ';font-size:13px;padding:2px 5px;cursor:pointer" onclick="openForm(\'' + task.id + '\')">✎</button>';
  h += '<button style="background:none;border:none;color:#ff4757;font-size:13px;padding:2px 5px;cursor:pointer" onclick="deleteTask(\'' + task.id + '\')">✕</button>';
  h += '<input type="file" multiple id="fi-' + task.id + '" style="display:none" onchange="quickAttach(\'' + task.id + '\',this)">';
  h += '</div></div>';

  // Title & desc
  h += '<h3 style="font-size:13px;font-weight:600;line-height:1.4;margin-bottom:3px;color:' + T.tx + ';' + (isDone ? 'text-decoration:line-through' : '') + '">' + esc(task.title) + '</h3>';
  if (task.description) {
    h += '<p style="font-size:11px;line-height:1.5;margin-bottom:6px;color:' + T.tm + '">' + esc(task.description) + '</p>';
  }

  // Files
  if (files.length) {
    h += '<div style="display:flex;flex-direction:column;gap:5px;margin-top:6px;margin-bottom:3px">';
    for (var fi = 0; fi < files.length; fi++) {
      var f = files[fi];
      var finfo = gfi(f.name);
      h += '<div class="fchip" style="background:' + T.chb + ';border:1px solid ' + T.cb + '">';
      h += '<div style="width:26px;height:26px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:13px;background:' + finfo.c + '22;color:' + finfo.c + ';flex-shrink:0">' + finfo.i + '</div>';
      h += '<div style="flex:1;min-width:0;cursor:pointer" onclick="showPreview(\'' + task.id + '\',' + fi + ')">';
      h += '<div style="font-size:11px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:' + T.tx + '">' + esc(f.name) + '</div>';
      h += '<div style="font-size:9px;color:' + T.td + '">' + finfo.l + ' · ' + fsz(f.size) + '</div>';
      h += '</div>';
      h += '<button style="background:none;border:none;color:' + T.td + ';cursor:pointer;font-size:12px;padding:2px 4px" onclick="dlFile(\'' + task.id + '\',' + fi + ')">⬇</button>';
      h += '<button style="background:none;border:none;color:rgba(255,71,87,.5);cursor:pointer;font-size:11px;padding:2px 4px" onclick="removeFile(\'' + task.id + '\',' + fi + ')">✕</button>';
      h += '</div>';
    }
    h += '</div>';
  }

  // Footer
  h += '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:5px">';
  if (dl) {
    h += '<span style="font-size:10px;color:' + (ov ? '#ff4757' : T.tm) + ';font-weight:' + (ov ? 600 : 400) + '">' + dl + '</span>';
  } else {
    h += '<span></span>';
  }
  h += '<div style="display:flex;gap:4px">';
  for (var ci = 0; ci < COLS.length; ci++) {
    if (COLS[ci].id !== task.column) {
      h += '<button style="background:' + T.chb + ';border:1px solid ' + T.cb + ';border-radius:6px;padding:3px 7px;font-size:12px;cursor:pointer" onclick="moveTask(\'' + task.id + '\',\'' + COLS[ci].id + '\')">' + COLS[ci].ic + '</button>';
    }
  }
  h += '</div></div>';
  h += '</div>';
  return h;
}

// ============================================================
// RENDER: TOOLS
// ============================================================
function renderTools() {
  var T = THEMES[themeId];
  var el = document.getElementById("pnl-tools");

  var h = '<div class="tools-page"><div class="tools-inner">';
  h += '<h1 style="font-size:26px;font-weight:700;margin-bottom:8px;display:flex;align-items:center;gap:10px;color:' + T.tx + '"><span style="font-size:30px">🔧</span> Инструменты</h1>';
  h += '<p style="font-size:14px;margin-bottom:28px;font-weight:300;color:' + T.tm + '">Полезные утилиты для работы с текстом</p>';

  h += '<div class="tcard" style="background:' + T.cbg + ';border:1px solid ' + T.cb + '">';
  h += '<h3 style="font-size:18px;font-weight:600;margin-bottom:6px;display:flex;align-items:center;gap:8px;color:' + T.tx + '">📝 Перенос слов в столбик</h3>';
  h += '<p style="font-size:13px;margin-bottom:16px;color:' + T.tm + '">Разбивает строку на столбик по разделителю. Убирает запятые и лишние пробелы.</p>';

  h += '<div class="topts">';
  h += '<label style="color:' + T.tx + '">Разделитель: <input id="tsep" style="width:80px;padding:7px 10px;border-radius:8px;border:1px solid ' + T.ibd + ';background:' + T.ib + ';color:' + T.tx + ';font-size:13px;outline:none;text-align:center" value=" " placeholder="пробел"></label>';
  h += '<label style="color:' + T.tx + '"><input type="checkbox" id="trmc" checked> Убрать запятые</label>';
  h += '<label style="color:' + T.tx + '"><input type="checkbox" id="tcap"> С заглавной</label>';
  h += '<label style="color:' + T.tx + '"><input type="checkbox" id="ttrm" checked> Убрать лишние пробелы</label>';
  h += '</div>';

  h += '<div class="trow">';
  h += '<div class="tcol"><label style="color:' + T.tm + ';font-size:11px;text-transform:uppercase;letter-spacing:.06em;margin-bottom:5px;display:block">Введите текст</label>';
  h += '<textarea class="tta" id="tinp" style="border:1px solid ' + T.ibd + ';background:' + T.ib + ';color:' + T.tx + '" placeholder="Например: яблоко, банан, апельсин"></textarea></div>';
  h += '<div class="tcol"><label style="color:' + T.tm + ';font-size:11px;text-transform:uppercase;letter-spacing:.06em;margin-bottom:5px;display:block">Результат</label>';
  h += '<textarea class="tta" id="tout" style="border:1px solid ' + T.ibd + ';background:' + T.ib + ';color:' + T.tx + '" readonly placeholder="Здесь появится результат"></textarea>';
  h += '<div id="tcnt" style="font-size:12px;margin-top:6px;color:' + T.td + '"></div></div>';
  h += '</div>';

  h += '<div style="display:flex;gap:10px;margin-top:16px;flex-wrap:wrap">';
  h += '<button class="tbtn" style="background:linear-gradient(135deg,' + T.ac + ',' + T.ac + 'dd);box-shadow:0 4px 16px ' + T.ag + '" onclick="runTool()">Перенести</button>';
  h += '<button class="tbtn2" style="background:' + T.ab + ';color:' + T.at + '" onclick="copyTool()">📋 Скопировать</button>';
  h += '<button class="tbtn2" style="background:' + T.chb + ';color:' + T.tm + '" onclick="clearTool()">Очистить</button>';
  h += '<button class="tbtn2" style="background:' + T.chb + ';color:' + T.tm + '" onclick="demoTool()">Демо</button>';
  h += '</div></div></div></div>';

  el.innerHTML = h;
}

// Tool functions
window.runTool = function() {
  var inp = document.getElementById("tinp");
  var sep = document.getElementById("tsep");
  var rmc = document.getElementById("trmc");
  var cap = document.getElementById("tcap");
  var trm = document.getElementById("ttrm");
  if (!inp) return;

  var text = inp.value;
  var separator = sep ? (sep.value || " ") : " ";
  if (rmc && rmc.checked) text = text.replace(/,/g, " ");

  var parts = text.split(separator);
  var result = [];
  for (var i = 0; i < parts.length; i++) {
    var s = parts[i].trim();
    if (!s) continue;
    if (trm && trm.checked) s = s.replace(/\s+/g, " ").trim();
    if (cap && cap.checked) s = s.charAt(0).toUpperCase() + s.slice(1);
    result.push(s);
  }

  var out = document.getElementById("tout");
  var cnt = document.getElementById("tcnt");
  if (out) out.value = result.join("\n");
  if (cnt) cnt.textContent = "Строк: " + result.length;
};

window.copyTool = function() {
  var o = document.getElementById("tout");
  if (o && o.value) {
    navigator.clipboard.writeText(o.value).catch(function() { o.select(); document.execCommand("copy"); });
  }
};

window.clearTool = function() {
  var i = document.getElementById("tinp"), o = document.getElementById("tout"), c = document.getElementById("tcnt");
  if (i) i.value = "";
  if (o) o.value = "";
  if (c) c.textContent = "";
};

window.demoTool = function() {
  var i = document.getElementById("tinp");
  if (i) i.value = "яблоко, банан, апельсин, манго, виноград, персик, ананас, киви, груша, слива";
  runTool();
};

// ============================================================
// FORM
// ============================================================
window.openForm = function(id) {
  if (id) {
    for (var i = 0; i < tasks.length; i++) {
      if (tasks[i].id === id) { editingTask = tasks[i]; break; }
    }
  } else {
    editingTask = null;
  }
  formPriority = editingTask ? editingTask.priority : "medium";
  formFileList = editingTask && editingTask.files ? editingTask.files.slice() : [];
  renderForm();
};

window.closeForm = function() {
  var o = document.getElementById("fov");
  if (o) o.remove();
  editingTask = null;
  formFileList = [];
};

window.selectPriority = function(p) {
  formPriority = p;
  var btns = document.querySelectorAll("#fpr [data-p]");
  for (var i = 0; i < btns.length; i++) {
    var k = btns[i].getAttribute("data-p");
    var c = PRI[k];
    btns[i].style.background = (k === p) ? c.bg : "transparent";
    btns[i].style.boxShadow = (k === p) ? "0 0 0 2px " + c.c : "none";
  }
};

window.formAddFiles = function(fl) {
  rdf(fl).then(function(nf) {
    formFileList = formFileList.concat(nf);
    updateFormFiles();
  });
};

window.formRemoveFile = function(i) {
  formFileList.splice(i, 1);
  updateFormFiles();
};

function updateFormFiles() {
  var T = THEMES[themeId];
  var el = document.getElementById("ffl");
  if (!el) return;
  if (!formFileList.length) { el.innerHTML = ""; return; }
  var h = '';
  for (var i = 0; i < formFileList.length; i++) {
    var f = formFileList[i];
    var fi = gfi(f.name);
    h += '<div style="display:flex;align-items:center;gap:8px;padding:7px 9px;border-radius:10px;background:' + T.ib + ';border:1px solid ' + T.cb + ';margin-top:5px">';
    h += '<span style="font-size:16px">' + fi.i + '</span>';
    h += '<div style="flex:1;min-width:0"><div style="font-size:12px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:' + T.tx + '">' + esc(f.name) + '</div>';
    h += '<div style="font-size:10px;color:' + T.td + '">' + fsz(f.size) + '</div></div>';
    h += '<button onclick="formRemoveFile(' + i + ')" style="background:none;border:none;color:rgba(255,71,87,.6);cursor:pointer;font-size:13px;padding:2px 5px">✕</button></div>';
  }
  el.innerHTML = h;
}

window.submitForm = function() {
  var ti = document.getElementById("fti");
  if (!ti || !ti.value.trim()) return;
  var title = ti.value.trim();
  var desc = (document.getElementById("fde") || {}).value || "";
  desc = desc.trim();
  var deadline = (document.getElementById("fdl") || {}).value || null;

  if (editingTask) {
    editingTask.title = title;
    editingTask.description = desc;
    editingTask.priority = formPriority;
    editingTask.deadline = deadline;
    editingTask.files = formFileList;
  } else {
    tasks.push({
      id: gid(), title: title, description: desc,
      priority: formPriority, deadline: deadline,
      files: formFileList, column: "todo",
      createdAt: new Date().toISOString()
    });
  }
  saveTasks();
  closeForm();
  render();
};

function renderForm() {
  var T = THEMES[themeId];
  var t = editingTask;

  var ov = document.createElement("div");
  ov.id = "fov";
  ov.className = "overlay";
  ov.style.background = T.ob;
  ov.onclick = function(e) { if (e.target === ov) closeForm(); };

  var h = '<div class="fcard" style="background:' + T.fb + ';border:1px solid ' + T.cb + ';box-shadow:0 24px 64px ' + T.sh + '" onclick="event.stopPropagation()">';
  h += '<h2 style="font-size:20px;font-weight:700;margin-bottom:18px;color:' + T.tx + '">' + (t ? "✎ Редактировать" : "＋ Новая задача") + '</h2>';

  h += '<label class="flbl" style="color:' + T.tm + '">Название*</label>';
  h += '<input class="finp" id="fti" style="border:1px solid ' + T.ibd + ';background:' + T.ib + ';color:' + T.tx + '" value="' + esc(t ? t.title : "") + '" placeholder="Что нужно сделать?" onkeydown="if(event.key===\'Enter\')submitForm()">';

  h += '<label class="flbl" style="color:' + T.tm + '">Описание</label>';
  h += '<textarea class="finp" id="fde" style="border:1px solid ' + T.ibd + ';background:' + T.ib + ';color:' + T.tx + ';min-height:64px;resize:vertical" placeholder="Детали…">' + esc(t ? (t.description || "") : "") + '</textarea>';

  h += '<label class="flbl" style="color:' + T.tm + '">Приоритет</label>';
  h += '<div style="display:flex;gap:7px;flex-wrap:wrap" id="fpr">';
  var pk = Object.keys(PRI);
  for (var i = 0; i < pk.length; i++) {
    var k = pk[i], c = PRI[k], isAct = formPriority === k;
    h += '<button data-p="' + k + '" style="padding:6px 12px;border-radius:8px;border:1px solid ' + c.c + ';color:' + T.tx + ';background:' + (isAct ? c.bg : 'transparent') + ';font-size:11px;cursor:pointer;' + (isAct ? 'box-shadow:0 0 0 2px ' + c.c : '') + '" onclick="selectPriority(\'' + k + '\')">' + c.l + '</button>';
  }
  h += '</div>';

  h += '<label class="flbl" style="color:' + T.tm + '">Дедлайн</label>';
  h += '<input class="finp" id="fdl" type="date" style="border:1px solid ' + T.ibd + ';background:' + T.ib + ';color:' + T.tx + '" value="' + (t ? (t.deadline || "") : "") + '">';

  h += '<label class="flbl" style="color:' + T.tm + '">Файлы</label>';
  h += '<div style="border:2px dashed ' + T.dbd + ';border-radius:14px;padding:24px 16px;text-align:center;background:' + T.dbg + ';cursor:pointer" ';
  h += 'onclick="document.getElementById(\'ffin\').click()" ';
  h += 'ondragover="event.preventDefault()" ';
  h += 'ondrop="event.preventDefault();formAddFiles(event.dataTransfer.files)">';
  h += '<input type="file" multiple id="ffin" style="display:none" onchange="formAddFiles(this.files);this.value=\'\'">';
  h += '<div style="font-size:32px;margin-bottom:6px">📁</div>';
  h += '<div style="font-size:13px;color:' + T.tm + ';font-weight:500">Перетащи файлы или нажми</div>';
  h += '<div style="font-size:11px;color:' + T.td + ';margin-top:4px">Excel, Word, PDF и другие</div>';
  h += '</div>';

  h += '<div id="ffl"></div>';

  h += '<div style="display:flex;gap:10px;margin-top:24px;justify-content:flex-end">';
  h += '<button style="padding:9px 20px;border-radius:10px;border:1px solid ' + T.ibd + ';background:transparent;color:' + T.tm + ';font-size:13px" onclick="closeForm()">Отмена</button>';
  h += '<button style="padding:9px 24px;border-radius:10px;border:none;background:linear-gradient(135deg,' + T.ac + ',' + T.ac + 'dd);color:#fff;font-size:13px;font-weight:600;box-shadow:0 4px 16px ' + T.ag + '" onclick="submitForm()">' + (t ? "Сохранить" : "Создать") + '</button>';
  h += '</div></div>';

  ov.innerHTML = h;
  document.body.appendChild(ov);

  if (formFileList.length) setTimeout(updateFormFiles, 10);
  setTimeout(function() { var el = document.getElementById("fti"); if (el) el.focus(); }, 50);
}

// ============================================================
// PREVIEW
// ============================================================
function renderPreview() {
  if (!previewingFile) return;
  var T = THEMES[themeId];
  var fi = gfi(previewingFile.name);
  var isImg = previewingFile.type && previewingFile.type.indexOf("image/") === 0;

  var ov = document.createElement("div");
  ov.id = "pvov";
  ov.className = "overlay";
  ov.style.background = T.ob;
  ov.onclick = function() { ov.remove(); previewingFile = null; };

  var h = '<div style="background:' + T.fb + ';border:1px solid ' + T.cb + ';box-shadow:0 24px 64px ' + T.sh + ';border-radius:20px;padding:24px;width:100%;max-width:600px" onclick="event.stopPropagation()">';
  h += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:12px">';
  h += '<div style="display:flex;align-items:center;gap:10px"><span style="font-size:28px">' + fi.i + '</span><div><div style="font-weight:600;font-size:15px;color:' + T.tx + '">' + esc(previewingFile.name) + '</div><div style="font-size:11px;color:' + T.tm + '">' + fsz(previewingFile.size) + '</div></div></div>';
  h += '<div style="display:flex;gap:8px">';
  h += '<button style="padding:7px 16px;border-radius:8px;border:none;background:' + T.ab + ';color:' + T.at + ';font-size:12px;font-weight:500;cursor:pointer" onclick="dlf(previewingFile)">⬇ Скачать</button>';
  h += '<button style="padding:7px 11px;border-radius:8px;border:1px solid ' + T.ibd + ';background:transparent;color:' + T.tm + ';font-size:15px;cursor:pointer" onclick="document.getElementById(\'pvov\').remove();previewingFile=null">✕</button>';
  h += '</div></div>';

  if (isImg) {
    h += '<img src="' + previewingFile.dataUrl + '" style="max-width:100%;max-height:70vh;border-radius:12px">';
  } else {
    h += '<div style="text-align:center;padding:36px 20px"><div style="font-size:56px;margin-bottom:14px">' + fi.i + '</div>';
    h += '<p style="color:' + T.tm + ';margin-bottom:14px">Предпросмотр недоступен</p>';
    h += '<button style="padding:7px 16px;border-radius:8px;border:none;background:' + T.ab + ';color:' + T.at + ';font-size:12px;cursor:pointer" onclick="dlf(previewingFile)">⬇ Скачать</button></div>';
  }

  h += '</div>';
  ov.innerHTML = h;
  document.body.appendChild(ov);
}

// ============================================================
// MAIN RENDER
// ============================================================
function render() {
  var T = THEMES[themeId];
  document.body.style.background = T.app;
  document.body.style.color = T.tx;
  renderSidebar();
  renderPlanner();
  renderTools();
}

// ============================================================
// INIT
// ============================================================
loadState();
render();
