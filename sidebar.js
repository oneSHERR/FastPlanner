// ============================================================
// TAB SWITCHING
// ============================================================
window.switchTab = function(tab) {
  activeTab = tab;
  var p1 = document.getElementById("pnl-planner");
  var p2 = document.getElementById("pnl-tools");
  var p3 = document.getElementById("pnl-profile");
  p1.className = "pnl " + (tab === "planner" ? "act" : "off-l");
  p2.className = "pnl " + (tab === "tools" ? "act" : "off-r");
  p3.className = "pnl " + (tab === "profile" ? "act" : "off-r");
  renderSidebar();
  if (tab === "profile") renderProfile();
};

window.setFilter = function(f) { activeFilter = f; renderPlanner(); };
window.setSearch = function(v) { searchText = v; renderPlanner(); };
window.togglePersonal = function() { showPersonal = !showPersonal; renderPlanner(); };
window.toggleShared = function() { showShared = !showShared; renderPlanner(); };

// ============================================================
// THEME PICKER
// ============================================================
window.openTP = function(evt) {
  evt.stopPropagation();
  var old = document.getElementById("tpbg"); if (old) { old.remove(); return; }
  var T = THEMES[themeId], rect = evt.currentTarget.getBoundingClientRect();
  var bg = document.createElement("div"); bg.id = "tpbg"; bg.className = "tp-bg";
  bg.onclick = function() { bg.remove(); };
  var pk = document.createElement("div"); pk.className = "tp";
  pk.style.cssText = "background:" + T.fb + ";border:1px solid " + T.cb + ";left:" + (rect.right + 10) + "px;bottom:" + (window.innerHeight - rect.bottom) + "px";
  pk.onclick = function(ev) { ev.stopPropagation(); };

  var h = '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;padding:5px 10px 10px;color:' + T.tm + ';border-bottom:1px solid ' + T.cb + ';margin-bottom:6px">Тема оформления</div>';
  var keys = Object.keys(THEMES);
  for (var i = 0; i < keys.length; i++) {
    var k = keys[i], tm = THEMES[k], isA = themeId === k;
    h += '<button class="tp-opt" style="color:' + T.tx + ';' + (isA ? 'background:' + T.ab : '') + '" data-t="' + k + '">';
    h += '<span style="font-size:20px">' + tm.icon + '</span><span style="flex:1;text-align:left;font-weight:' + (isA ? 600 : 400) + '">' + tm.name + '</span>';
    if (isA) h += '<span style="color:' + T.ac + ';font-weight:700;font-size:15px">✓</span>';
    h += '</button>';
  }
  pk.innerHTML = h;
  pk.addEventListener("click", function(e) {
    var b = e.target.closest("[data-t]");
    if (b) { themeId = b.getAttribute("data-t"); saveTheme(); bg.remove(); render(); }
  });
  bg.appendChild(pk); document.body.appendChild(bg);
};

// ============================================================
// RENDER SIDEBAR
// ============================================================
function renderSidebar() {
  var T = THEMES[themeId], el = document.getElementById("sidebar");
  el.style.background = T.sbg;

  var tabs = [
    {id:"planner", icon:"⬡",  tip:"Планировщик"},
    {id:"tools",   icon:"🔧", tip:"Инструменты"},
    {id:"profile", icon:"👤", tip:"Профиль"}
  ];

  var h = '';
  for (var i = 0; i < tabs.length; i++) {
    var t = tabs[i], isA = activeTab === t.id;
    h += '<button class="sb ' + (isA ? 'on' : '') + '" style="background:' + (isA ? T.ab : 'transparent') + ';color:' + (isA ? T.ac : T.td) + ';border:1px solid ' + (isA ? T.ac + '44' : 'transparent') + ';' + (isA ? 'box-shadow:0 0 12px ' + T.ag : '') + '" onclick="switchTab(\'' + t.id + '\')">';
    h += t.icon + '<span class="tip" style="background:' + T.fb + ';color:' + T.tx + ';border:1px solid ' + T.cb + '">' + t.tip + '</span></button>';
  }

  h += '<div style="flex:1"></div>';

  // Theme button
  h += '<button class="sb" style="background:' + T.chb + ';color:' + T.tx + ';border:1px solid ' + T.cb + '" onclick="openTP(event)">🎨<span class="tip" style="background:' + T.fb + ';color:' + T.tx + ';border:1px solid ' + T.cb + '">Темы</span></button>';

  // Logout button
  h += '<button class="sb" style="background:transparent;color:#ff4757;border:1px solid transparent;margin-top:4px" onclick="doLogout()">🚪<span class="tip" style="background:' + T.fb + ';color:#ff4757;border:1px solid ' + T.cb + '">Выйти</span></button>';

  el.innerHTML = h;
}
