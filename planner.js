// ============================================================
// RENDER PLANNER
// ============================================================
function renderPlanner() {
  var T = THEMES[themeId], st = getStats(), ft = getFiltered();
  var el = document.getElementById("pnl-planner");
  var userName = currentUser ? currentUser.displayName || currentUser.email : "";
  var h = '';

  // Header — glassmorphism
  h += '<header class="planner-header" style="background:' + T.hdr + ';border-bottom:1px solid ' + T.cb + ';padding:22px 28px;backdrop-filter:blur(30px) saturate(1.5);-webkit-backdrop-filter:blur(30px) saturate(1.5)">';
  h += '<div style="max-width:1320px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px">';
  h += '<div><h1 class="planner-title" style="font-size:28px;font-weight:800;display:flex;align-items:center;gap:10px;color:' + T.tx + ';letter-spacing:-.02em"><span style="font-size:32px;color:' + T.ac + ';filter:drop-shadow(0 2px 8px ' + T.ag + ')">⬡</span> WorkFlow</h1>';
  h += '<p style="font-size:13px;color:' + T.tm + ';margin-top:5px;font-weight:400;letter-spacing:.01em">' + greet() + ', ' + esc(userName) + '</p></div>';

  // Stats
  h += '<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">';
  h += statC(T, st.total, T.tx, "задач") + statC(T, st.done, "#2ed573", "готово");
  if (st.files) h += statC(T, st.files, "#54a0ff", "файлов");
  if (st.over) h += '<div style="background:rgba(255,71,87,.1);backdrop-filter:blur(10px);border:1px solid rgba(255,71,87,.2);border-radius:14px;padding:8px 14px;display:flex;flex-direction:column;align-items:center;min-width:56px"><span style="font-size:20px;font-weight:700;font-family:\'JetBrains Mono\',monospace;color:#ff4757">' + st.over + '</span><span style="font-size:10px;text-transform:uppercase;letter-spacing:.05em;color:' + T.tm + '">просроч.</span></div>';

  // Progress bar with shimmer
  if (st.total) {
    var pct = (st.done / st.total * 100);
    h += '<div class="progress-bar" style="width:110px;background:' + T.chc + '">';
    h += '<div class="progress-fill" style="width:' + pct + '%;background:linear-gradient(90deg,' + T.ac + ',#2ed573)"></div>';
    h += '</div>';
  }
  h += '</div></div></header>';

  // Toolbar
  h += '<div class="planner-toolbar" style="max-width:1320px;margin:0 auto;padding:18px 28px;display:flex;gap:10px;align-items:center;flex-wrap:wrap">';

  // Toggles
  h += '<button class="tgl" style="background:' + (showPersonal ? T.ab : 'transparent') + ';border:1px solid ' + (showPersonal ? T.ac + '66' : T.cb) + ';color:' + (showPersonal ? T.at : T.tm) + '" onclick="togglePersonal()"><span class="dot" style="background:' + (showPersonal ? T.ac : T.td) + ';' + (showPersonal ? 'box-shadow:0 0 8px ' + T.ac : '') + '"></span>👤 Мои</button>';

  // Team toggle — show team name
  var teamLabel = "👥 Командные";
  if (activeTeamId && userTeams.length) {
    var at = userTeams.find(function(t) { return t.id === activeTeamId; });
    if (at) teamLabel = "👥 " + esc(at.name);
  }
  h += '<button class="tgl" style="background:' + (showShared ? T.ab : 'transparent') + ';border:1px solid ' + (showShared ? T.ac + '66' : T.cb) + ';color:' + (showShared ? T.at : T.tm) + '" onclick="toggleShared()"><span class="dot" style="background:' + (showShared ? "#2ed573" : T.td) + ';' + (showShared ? 'box-shadow:0 0 8px #2ed573' : '') + '"></span>' + teamLabel + '</button>';

  // Team switcher (if multiple teams) — styled buttons
  if (userTeams.length > 1) {
    h += '<div style="display:flex;gap:4px;padding:3px;border-radius:12px;background:' + T.chb + ';border:1px solid ' + T.cb + ';backdrop-filter:blur(10px)">';
    for (var ti = 0; ti < userTeams.length; ti++) {
      var tm = userTeams[ti];
      var isSel = tm.id === activeTeamId;
      h += '<button style="padding:6px 14px;border-radius:9px;border:none;font-size:11px;font-weight:' + (isSel ? '700' : '500') + ';cursor:pointer;transition:all .2s;letter-spacing:.02em;white-space:nowrap;';
      h += 'background:' + (isSel ? T.ab : 'transparent') + ';';
      h += 'color:' + (isSel ? T.at : T.tm) + ';';
      if (isSel) h += 'box-shadow:0 2px 8px ' + T.ag + ';';
      h += '" onclick="switchTeam(\'' + tm.id + '\')">' + esc(tm.name) + '</button>';
    }
    h += '</div>';
  }

  // No team warning
  if (!activeTeamId && userTeams.length === 0) {
    h += '<button style="padding:7px 14px;border-radius:10px;border:1px dashed ' + T.ac + '66;color:' + T.at + ';background:transparent;font-size:12px;cursor:pointer;transition:all .2s" onclick="switchTab(\'teams\')">＋ Создать команду</button>';
  }

  // Search
  h += '<div style="position:relative;flex:1 1 150px"><span style="position:absolute;left:13px;top:50%;transform:translateY(-50%);font-size:16px;color:' + T.td + '">⌕</span>';
  h += '<input style="width:100%;padding:10px 14px 10px 38px;border-radius:12px;border:1px solid ' + T.ibd + ';background:' + T.ib + ';color:' + T.tx + ';font-size:13px;outline:none;backdrop-filter:blur(10px);transition:border-color .3s,box-shadow .3s" placeholder="Поиск…" value="' + esc(searchText) + '" oninput="setSearch(this.value)" onfocus="this.style.boxShadow=\'0 0 0 3px ' + T.ag + '\';this.style.borderColor=\'' + T.ac + '44\'" onblur="this.style.boxShadow=\'none\';this.style.borderColor=\'' + T.ibd + '\'">';
  h += '</div>';

  // Filters
  var filters = [{id:"all", l:"Все"}]; var pk = Object.keys(PRI);
  for (var i = 0; i < pk.length; i++) filters.push({id:pk[i], l:PRI[pk[i]].l});
  h += '<div style="display:flex;gap:5px;flex-wrap:wrap">';
  for (var i = 0; i < filters.length; i++) {
    var f = filters[i], isA = activeFilter === f.id;
    h += '<button style="padding:7px 13px;border-radius:10px;border:1px solid ' + (isA ? T.ac + '66' : T.cb) + ';color:' + (isA ? T.at : T.tm) + ';background:' + (isA ? T.ab : 'transparent') + ';font-size:11px;cursor:pointer;backdrop-filter:blur(8px);transition:all .2s ease;letter-spacing:.02em" onclick="setFilter(\'' + f.id + '\')">' + f.l + '</button>';
  }
  h += '</div>';

  // New task button
  h += '<button class="btn-glow" style="padding:10px 22px;border-radius:12px;border:none;background:linear-gradient(135deg,' + T.ac + ',' + T.ac + 'cc);color:#fff;font-size:13px;font-weight:700;box-shadow:0 4px 20px ' + T.ag + ';cursor:pointer;letter-spacing:.02em" onclick="openForm()">＋ Новая задача</button>';
  h += '</div>';

  // Board columns
  h += '<div class="board">';
  for (var ci = 0; ci < COLS.length; ci++) {
    var col = COLS[ci];
    var ct = ft.filter(function(t) { return t.column === col.id; });
    // Sort: shared tasks by sortOrder, personal by array order
    ct.sort(function(a, b) { return (a.sortOrder || 0) - (b.sortOrder || 0); });
    h += '<div class="col" data-col="' + col.id + '" style="background:' + T.cbg + ';border:1px solid ' + T.cb + ';outline-color:' + T.ac + '">';
    h += '<div style="display:flex;align-items:center;gap:8px;padding:4px 4px 14px;border-bottom:1px solid ' + T.cb + ';margin-bottom:12px">';
    h += '<span style="font-size:18px">' + col.ic + '</span>';
    h += '<span style="font-size:14px;font-weight:600;flex:1;color:' + T.tx + ';letter-spacing:.01em">' + col.t + '</span>';
    h += '<span style="font-size:11px;font-weight:600;background:' + T.chc + ';border-radius:8px;padding:3px 8px;font-family:\'JetBrains Mono\',monospace;color:' + T.tx + '">' + ct.length + '</span></div>';
    h += '<div class="col-body">';
    if (!ct.length) h += '<div style="text-align:center;font-size:12px;padding:36px 10px;font-style:italic;color:' + T.td + ';letter-spacing:.02em">' + col.em + '</div>';
    for (var ti = 0; ti < ct.length; ti++) h += renderCard(T, ct[ti]);
    h += '</div></div>';
  }
  h += '</div>';
  el.innerHTML = h;
}

// ============================================================
// STAT CARD
// ============================================================
function statC(T, n, c, l) {
  return '<div style="background:' + T.chb + ';backdrop-filter:blur(10px);border:1px solid ' + T.cb + ';border-radius:14px;padding:8px 14px;display:flex;flex-direction:column;align-items:center;min-width:56px;transition:transform .2s;cursor:default" onmouseenter="this.style.transform=\'translateY(-2px)\'" onmouseleave="this.style.transform=\'translateY(0)\'">' +
    '<span style="font-size:20px;font-weight:700;font-family:\'JetBrains Mono\',monospace;color:' + c + '">' + n + '</span>' +
    '<span style="font-size:10px;text-transform:uppercase;letter-spacing:.06em;margin-top:2px;color:' + T.tm + '">' + l + '</span></div>';
}

// ============================================================
// RENDER CARD
// ============================================================
function renderCard(T, task) {
  var p = PRI[task.priority] || PRI.medium;
  var dl = fdt(task.deadline);
  var ov = task.deadline && new Date(task.deadline) < new Date() && task.column !== "done";
  var files = task.files || [];
  var isDone = task.column === "done";
  var sc = task._scope || "personal";
  var scopeColor = sc === "shared" ? "#2ed573" : "#54a0ff";
  var scopeTeamName = "";
  if (sc === "shared" && activeTeamId && userTeams.length) {
    var _at = userTeams.find(function(t) { return t.id === activeTeamId; });
    if (_at) scopeTeamName = _at.name;
  }
  var scopeLabel = sc === "shared" ? "👥 " + esc(scopeTeamName || "Команда") : "👤 Личная";
  var authorName = task.authorName || "";

  var h = '<div class="card" data-tid="' + task.id + '" style="border-left:3px solid ' + p.c + ';background:' + p.bg + ';border-right:1px solid ' + T.cb + ';border-top:1px solid ' + T.cb + ';border-bottom:1px solid ' + T.cb + ';' + (isDone ? 'opacity:.5' : '') + '">';

  // Top row
  h += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:7px">';
  h += '<div style="display:flex;align-items:center;gap:5px">';
  h += '<span class="dh" onpointerdown="startDrag(\'' + task.id + '\',\'' + sc + '\',event)">⠿</span>';
  h += '<span style="font-size:10px;padding:3px 8px;border-radius:6px;font-weight:500;background:' + p.bd + ';color:' + p.c + ';letter-spacing:.03em">' + p.l + '</span>';
  h += '<span class="scope-badge" style="background:' + scopeColor + '18;color:' + scopeColor + '">' + scopeLabel + '</span>';
  h += '</div>';

  // Action buttons
  h += '<div style="display:flex;gap:3px">';
  h += '<button style="background:none;border:none;color:' + T.td + ';font-size:13px;padding:2px 5px;cursor:pointer;transition:transform .15s" onmouseenter="this.style.transform=\'scale(1.2)\'" onmouseleave="this.style.transform=\'scale(1)\'" onclick="document.getElementById(\'fi-' + task.id + '\').click()">📎</button>';
  h += '<button style="background:none;border:none;color:' + T.td + ';font-size:13px;padding:2px 5px;cursor:pointer;transition:transform .15s" onmouseenter="this.style.transform=\'scale(1.2)\'" onmouseleave="this.style.transform=\'scale(1)\'" onclick="openForm(\'' + task.id + '\',\'' + sc + '\')">✎</button>';
  h += '<button class="close-btn" style="background:none;border:none;color:#ff475788;font-size:13px;padding:2px 5px;cursor:pointer" onclick="deleteTask(\'' + task.id + '\',\'' + sc + '\')">✕</button>';
  h += '<input type="file" multiple id="fi-' + task.id + '" style="display:none" onchange="quickAttach(\'' + task.id + '\',this,\'' + sc + '\')">';
  h += '</div></div>';

  // Title & description
  h += '<h3 style="font-size:13px;font-weight:600;line-height:1.5;margin-bottom:3px;color:' + T.tx + ';letter-spacing:.01em;' + (isDone ? 'text-decoration:line-through' : '') + '">' + esc(task.title) + '</h3>';
  if (task.description) h += '<p style="font-size:11px;line-height:1.6;margin-bottom:6px;color:' + T.tm + ';letter-spacing:.01em">' + esc(task.description) + '</p>';
  if (authorName) h += '<div class="author-tag" style="color:' + T.td + ';margin-bottom:4px">✍ ' + esc(authorName) + '</div>';

  // Files
  if (files.length) {
    h += '<div style="display:flex;flex-direction:column;gap:5px;margin-top:6px;margin-bottom:3px">';
    for (var fi = 0; fi < files.length; fi++) {
      var f = files[fi], finfo = gfi(f.name);
      h += '<div class="fchip" style="background:' + T.chb + ';border:1px solid ' + T.cb + '">';
      h += '<div style="width:26px;height:26px;border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:13px;background:' + finfo.c + '18;color:' + finfo.c + ';flex-shrink:0">' + finfo.i + '</div>';
      h += '<div style="flex:1;min-width:0;cursor:pointer" onclick="showPreview(\'' + task.id + '\',' + fi + ',\'' + sc + '\')">';
      h += '<div style="font-size:11px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:' + T.tx + '">' + esc(f.name) + '</div>';
      h += '<div style="font-size:9px;color:' + T.td + '">' + finfo.l + ' · ' + fsz(f.size) + '</div></div>';
      h += '<button style="background:none;border:none;color:' + T.td + ';cursor:pointer;font-size:12px;padding:2px 4px;transition:transform .15s" onmouseenter="this.style.transform=\'scale(1.15)\'" onmouseleave="this.style.transform=\'scale(1)\'" onclick="dlFile(\'' + task.id + '\',' + fi + ',\'' + sc + '\')">⬇</button>';
      h += '<button style="background:none;border:none;color:rgba(255,71,87,.4);cursor:pointer;font-size:11px;padding:2px 4px;transition:color .15s" onmouseenter="this.style.color=\'#ff4757\'" onmouseleave="this.style.color=\'rgba(255,71,87,.4)\'" onclick="removeFile(\'' + task.id + '\',' + fi + ',\'' + sc + '\')">✕</button></div>';
    }
    h += '</div>';
  }

  // Footer — deadline + move buttons
  var dlTomorrow = task.deadline && !isDone && (function() {
    var dt = new Date(task.deadline), now = new Date();
    var df = Math.ceil((dt - now) / 864e5);
    return df === 1;
  })();
  h += '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px">';
  if (dlTomorrow) {
    h += '<span style="font-size:10px;color:#ff9f43;font-weight:700;letter-spacing:.02em;animation:pulse 2s infinite;background:rgba(255,159,67,.12);padding:2px 8px;border-radius:6px">⚠️ Завтра дедлайн!</span>';
  } else {
    h += dl ? '<span style="font-size:10px;color:' + (ov ? '#ff4757' : T.tm) + ';font-weight:' + (ov ? 600 : 400) + ';letter-spacing:.02em;' + (ov ? 'animation:pulse 2s infinite' : '') + '">' + dl + '</span>' : '<span></span>';
  }
  h += '<div style="display:flex;gap:4px">';
  for (var ci = 0; ci < COLS.length; ci++) {
    if (COLS[ci].id !== task.column) {
      h += '<button style="background:' + T.chb + ';border:1px solid ' + T.cb + ';border-radius:8px;padding:3px 8px;font-size:12px;cursor:pointer;backdrop-filter:blur(8px);transition:all .2s ease" onmouseenter="this.style.transform=\'translateY(-2px)\';this.style.boxShadow=\'0 4px 12px ' + T.sh + '\'" onmouseleave="this.style.transform=\'translateY(0)\';this.style.boxShadow=\'none\'" onclick="moveTask(\'' + task.id + '\',\'' + COLS[ci].id + '\',\'' + sc + '\')">' + COLS[ci].ic + '</button>';
    }
  }
  h += '</div></div>';

  // Comments section
  var comments = task.comments || [];
  var commentCount = comments.length;
  h += '<div style="margin-top:8px;border-top:1px solid ' + T.cb + ';padding-top:8px">';
  // Toggle comments button
  h += '<button style="background:none;border:none;color:' + T.tm + ';font-size:11px;cursor:pointer;padding:2px 0;display:flex;align-items:center;gap:4px;transition:color .2s" onmouseenter="this.style.color=\'' + T.at + '\'" onmouseleave="this.style.color=\'' + T.tm + '\'" onclick="toggleComments(\'' + task.id + '\')">';
  h += '💬 ' + (commentCount ? commentCount + ' комментари' + commentPlural(commentCount) : 'Комментировать');
  h += '</button>';

  // Comments body (collapsed by default)
  h += '<div id="comments-' + task.id + '" style="display:none;margin-top:8px">';

  // Existing comments
  for (var cmi = 0; cmi < comments.length; cmi++) {
    var cm = comments[cmi];
    var cmTime = cm.createdAt ? new Date(cm.createdAt).toLocaleString("ru-RU", {day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"}) : "";
    h += '<div style="display:flex;gap:8px;margin-bottom:8px;padding:6px 8px;border-radius:10px;background:' + T.chb + '">';
    h += '<div style="flex-shrink:0;margin-top:2px">' + getUserAvatarHtml(22, cm.authorName, cm.authorAvatar || "") + '</div>';
    h += '<div style="flex:1;min-width:0">';
    h += '<div style="display:flex;align-items:center;gap:6px;margin-bottom:2px">';
    h += '<span style="font-size:10px;font-weight:700;color:' + T.tx + '">' + esc(cm.authorName || "?") + '</span>';
    h += '<span style="font-size:9px;color:' + T.td + '">' + cmTime + '</span>';
    // Delete own comments
    if (currentUser && cm.authorId === currentUser.uid) {
      h += '<button style="background:none;border:none;color:rgba(255,71,87,.3);font-size:10px;cursor:pointer;padding:0 2px;margin-left:auto" onclick="deleteComment(\'' + task.id + '\',' + cmi + ',\'' + sc + '\')">✕</button>';
    }
    h += '</div>';
    h += '<div style="font-size:11px;line-height:1.5;color:' + T.tm + ';word-break:break-word">' + esc(cm.text) + '</div>';
    h += '</div></div>';
  }

  // New comment input
  h += '<div style="display:flex;gap:6px;align-items:center">';
  h += '<input id="cminp-' + task.id + '" style="flex:1;padding:7px 10px;border-radius:10px;border:1px solid ' + T.ibd + ';background:' + T.ib + ';color:' + T.tx + ';font-size:11px;outline:none" placeholder="Написать…" onkeydown="if(event.key===\'Enter\')addComment(\'' + task.id + '\',\'' + sc + '\')">';
  h += '<button style="padding:6px 12px;border-radius:8px;border:none;background:' + T.ab + ';color:' + T.at + ';font-size:11px;font-weight:600;cursor:pointer;white-space:nowrap;transition:all .2s" onclick="addComment(\'' + task.id + '\',\'' + sc + '\')">→</button>';
  h += '</div></div></div>';

  h += '</div>';
  return h;
}

// ============================================================
// COMMENTS
// ============================================================
function commentPlural(n) {
  if (n % 10 === 1 && n % 100 !== 11) return 'й';
  if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) return 'я';
  return 'ев';
}

window.toggleComments = function(taskId) {
  var el = document.getElementById("comments-" + taskId);
  if (!el) return;
  if (el.style.display === "none") {
    el.style.display = "block";
    var inp = document.getElementById("cminp-" + taskId);
    if (inp) setTimeout(function() { inp.focus(); }, 50);
  } else {
    el.style.display = "none";
  }
};

window.addComment = function(taskId, scope) {
  var inp = document.getElementById("cminp-" + taskId);
  if (!inp || !inp.value.trim()) return;
  var text = inp.value.trim();
  var userName = currentUser ? (currentUser.displayName || currentUser.email) : "?";
  var avatarUrl = (userProfile && userProfile.avatarUrl) ? userProfile.avatarUrl : "";

  var comment = {
    text: text,
    authorId: currentUser ? currentUser.uid : "",
    authorName: userName,
    authorAvatar: avatarUrl,
    createdAt: new Date().toISOString()
  };

  if (scope === "shared") {
    var task = sharedTasks.find(function(t) { return t.id === taskId; });
    if (task) {
      var comments = (task.comments || []).concat([comment]);
      updateSharedTask(taskId, {comments: comments});
    }
  } else {
    for (var i = 0; i < personalTasks.length; i++) {
      if (personalTasks[i].id === taskId) {
        if (!personalTasks[i].comments) personalTasks[i].comments = [];
        personalTasks[i].comments.push(comment);
        break;
      }
    }
    savePersonal(); renderPlanner();
  }
  inp.value = "";
};

window.deleteComment = function(taskId, idx, scope) {
  if (scope === "shared") {
    var task = sharedTasks.find(function(t) { return t.id === taskId; });
    if (task && task.comments) {
      var comments = task.comments.slice();
      comments.splice(idx, 1);
      updateSharedTask(taskId, {comments: comments});
    }
  } else {
    for (var i = 0; i < personalTasks.length; i++) {
      if (personalTasks[i].id === taskId && personalTasks[i].comments) {
        personalTasks[i].comments.splice(idx, 1);
        break;
      }
    }
    savePersonal(); renderPlanner();
  }
};

// ============================================================
// DEADLINE PUSH NOTIFICATIONS
// ============================================================
var notificationsChecked = false;

function checkDeadlineNotifications() {
  if (notificationsChecked) return;
  notificationsChecked = true;

  if (!("Notification" in window)) return;
  if (Notification.permission === "default") {
    Notification.requestPermission();
  }
  if (Notification.permission !== "granted") return;

  var all = getAllTasks();
  var now = new Date();
  for (var i = 0; i < all.length; i++) {
    var t = all[i];
    if (!t.deadline || t.column === "done") continue;
    var dt = new Date(t.deadline);
    var df = Math.ceil((dt - now) / 864e5);
    if (df === 1) {
      new Notification("⚠️ Завтра дедлайн!", {
        body: t.title,
        icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⬡</text></svg>"
      });
    } else if (df === 0) {
      new Notification("🔥 Дедлайн сегодня!", {
        body: t.title,
        icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⬡</text></svg>"
      });
    }
  }
}

// Check notifications when planner renders
var _origRenderPlanner = renderPlanner;
renderPlanner = function() {
  _origRenderPlanner();
  checkDeadlineNotifications();
};
