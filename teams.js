// ============================================================
// TEAMS — Team Boards System
// ============================================================
var userTeams = [];           // [{id, name, code, ownerId, members:[{uid,name,email,avatarUrl}]}]
var activeTeamId = null;      // текущая выбранная команда
var LS_ACTIVE_TEAM = "wf-active-team";
var teamUnsubs = [];          // для отписки от listeners

// ============================================================
// LOAD TEAMS ON AUTH
// ============================================================
var unsubTeamsList = null;

function loadUserTeams(uid) {
  // Initial load (one-time, returns promise for app.js)
  return db.collection("teams").where("memberIds", "array-contains", uid)
    .get().then(function(snap) {
      userTeams = [];
      snap.forEach(function(doc) {
        var d = doc.data();
        d.id = doc.id;
        userTeams.push(d);
      });
      restoreActiveTeam();
      // Start realtime listener after initial load
      listenTeamsList(uid);
    }).catch(function(err) {
      console.warn("Teams load error:", err.message);
      userTeams = [];
      activeTeamId = null;
      listenTeamsList(uid);
    });
}

function restoreActiveTeam() {
  try {
    var saved = localStorage.getItem(LS_ACTIVE_TEAM);
    if (saved && userTeams.some(function(t) { return t.id === saved; })) {
      activeTeamId = saved;
    } else if (userTeams.length) {
      activeTeamId = userTeams[0].id;
    } else {
      activeTeamId = null;
    }
  } catch(e) { activeTeamId = userTeams.length ? userTeams[0].id : null; }
}

function listenTeamsList(uid) {
  if (unsubTeamsList) unsubTeamsList();
  unsubTeamsList = db.collection("teams").where("memberIds", "array-contains", uid)
    .onSnapshot(function(snap) {
      userTeams = [];
      snap.forEach(function(doc) {
        var d = doc.data();
        d.id = doc.id;
        userTeams.push(d);
      });
      // If active team was deleted, switch
      if (activeTeamId && !userTeams.some(function(t) { return t.id === activeTeamId; })) {
        activeTeamId = userTeams.length ? userTeams[0].id : null;
        saveActiveTeam();
        listenTeamTasks();
      }
      // Re-render if on teams or planner page
      if (activeTab === "teams") renderTeamsPage();
      if (activeTab === "planner") renderPlanner();
      renderSidebar();
    }, function(err) {
      console.warn("Teams listener error:", err.message);
    });
}

function saveActiveTeam() {
  try { localStorage.setItem(LS_ACTIVE_TEAM, activeTeamId || ""); } catch(e) {}
}

// ============================================================
// FIRESTORE: TEAM TASKS (scoped to activeTeamId)
// ============================================================
function listenTeamTasks() {
  // Unsub old listeners
  for (var i = 0; i < teamUnsubs.length; i++) { if (teamUnsubs[i]) teamUnsubs[i](); }
  teamUnsubs = [];
  sharedTasks = [];

  if (!activeTeamId) { if (activeTab === "planner") renderPlanner(); return; }

  var unsub = db.collection("teams").doc(activeTeamId).collection("tasks")
    .orderBy("createdAt", "asc")
    .onSnapshot(function(snap) {
      sharedTasks = [];
      snap.forEach(function(doc) {
        var d = doc.data(); d.id = doc.id; d._scope = "shared";
        sharedTasks.push(d);
      });
      if (activeTab === "planner") renderPlanner();
    });
  teamUnsubs.push(unsub);
}

function addTeamTask(task) {
  if (!activeTeamId) return Promise.reject("No team");
  task.teamId = activeTeamId;
  return db.collection("teams").doc(activeTeamId).collection("tasks").add(task);
}

function updateTeamTask(id, data) {
  if (!activeTeamId) return Promise.reject("No team");
  return db.collection("teams").doc(activeTeamId).collection("tasks").doc(id).update(data);
}

function deleteTeamTask(id) {
  if (!activeTeamId) return Promise.reject("No team");
  return db.collection("teams").doc(activeTeamId).collection("tasks").doc(id).delete();
}

// Replace old shared functions
function addSharedTask(task) { return addTeamTask(task); }
function updateSharedTask(id, data) { return updateTeamTask(id, data); }
function deleteSharedTask(id) { return deleteTeamTask(id); }
function listenShared() { listenTeamTasks(); }

// ============================================================
// CREATE TEAM
// ============================================================
function generateTeamCode() {
  var chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  var code = "";
  for (var i = 0; i < 6; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  return code;
}

var _creatingTeam = false;
window.createTeam = function() {
  if (_creatingTeam) return;
  var nameInput = document.getElementById("team-name-input");
  if (!nameInput || !nameInput.value.trim()) { showTeamError("Введите название команды"); return; }
  var teamName = nameInput.value.trim();
  if (!currentUser) return;

  _creatingTeam = true;
  var code = generateTeamCode();
  var uid = currentUser.uid;
  var userName = currentUser.displayName || currentUser.email;
  var avatarUrl = (userProfile && userProfile.avatarUrl) ? userProfile.avatarUrl : "";

  var teamData = {
    name: teamName,
    code: code,
    ownerId: uid,
    memberIds: [uid],
    members: [{
      uid: uid,
      name: userName,
      email: currentUser.email,
      avatarUrl: avatarUrl
    }],
    createdAt: new Date().toISOString()
  };

  db.collection("teams").add(teamData).then(function(docRef) {
    activeTeamId = docRef.id;
    saveActiveTeam();
    listenTeamTasks();
    nameInput.value = "";
    _creatingTeam = false;
  }).catch(function(err) {
    _creatingTeam = false;
    showTeamError("Ошибка: " + err.message);
  });
};

// ============================================================
// JOIN TEAM
// ============================================================
var _joiningTeam = false;
window.joinTeam = function() {
  if (_joiningTeam) return;
  var codeInput = document.getElementById("team-code-input");
  if (!codeInput || !codeInput.value.trim()) { showTeamError("Введите код команды"); return; }
  var code = codeInput.value.trim().toUpperCase();
  if (!currentUser) { showTeamError("Вы не авторизованы"); return; }

  _joiningTeam = true;

  var uid = currentUser.uid;
  var userName = currentUser.displayName || currentUser.email;
  var avatarUrl = (userProfile && userProfile.avatarUrl) ? userProfile.avatarUrl : "";

  // Check if already in this team locally
  var alreadyLocal = userTeams.some(function(t) { return t.code === code; });
  if (alreadyLocal) {
    _joiningTeam = false;
    showTeamError("Вы уже состоите в команде с этим кодом");
    return;
  }

  showTeamError(""); // clear
  db.collection("teams").where("code", "==", code).get().then(function(snap) {
    if (snap.empty) { _joiningTeam = false; showTeamError("Команда с кодом " + code + " не найдена"); return; }
    var doc = snap.docs[0];
    var data = doc.data();
    data.id = doc.id;

    // Check if already member in Firestore
    var ids = data.memberIds || [];
    if (ids.indexOf(uid) >= 0) {
      // Already in Firestore but not locally — add locally
      if (!userTeams.some(function(t) { return t.id === doc.id; })) {
        userTeams.push(data);
        activeTeamId = doc.id;
        saveActiveTeam();
        listenTeamTasks();
        _joiningTeam = false;
        renderTeamsPage();
        renderPlanner();
        return;
      }
      _joiningTeam = false;
      showTeamError("Вы уже в этой команде");
      return;
    }

    // Add member — use arrayUnion for atomic update
    var newMember = { uid: uid, name: userName, email: currentUser.email, avatarUrl: avatarUrl };

    db.collection("teams").doc(doc.id).update({
      members: firebase.firestore.FieldValue.arrayUnion(newMember),
      memberIds: firebase.firestore.FieldValue.arrayUnion(uid)
    }).then(function() {
      activeTeamId = doc.id;
      saveActiveTeam();
      listenTeamTasks();
      _joiningTeam = false;
      codeInput.value = "";
    }).catch(function(err) {
      _joiningTeam = false;
      showTeamError("Не удалось присоединиться: " + err.message);
    });
  }).catch(function(err) {
    _joiningTeam = false;
    showTeamError("Ошибка поиска: " + err.message);
  });
};

// ============================================================
// SWITCH TEAM
// ============================================================
window.switchTeam = function(teamId) {
  activeTeamId = teamId;
  saveActiveTeam();
  listenTeamTasks();
  renderTeamsPage();
  if (activeTab === "planner") renderPlanner();
};

// ============================================================
// LEAVE TEAM
// ============================================================
window.leaveTeam = function(teamId) {
  if (!currentUser) return;
  if (!confirm("Вы уверены, что хотите покинуть команду?")) return;
  var uid = currentUser.uid;
  var team = userTeams.find(function(t) { return t.id === teamId; });
  if (!team) return;

  // Owner can't leave — must delete
  if (team.ownerId === uid) {
    if (!confirm("Вы владелец. Удалить команду для всех?")) return;
    // Delete all tasks first, then team
    db.collection("teams").doc(teamId).collection("tasks").get().then(function(snap) {
      var batch = db.batch();
      snap.forEach(function(doc) { batch.delete(doc.ref); });
      return batch.commit();
    }).then(function() {
      return db.collection("teams").doc(teamId).delete();
    }).then(function() {
      userTeams = userTeams.filter(function(t) { return t.id !== teamId; });
      if (activeTeamId === teamId) {
        activeTeamId = userTeams.length ? userTeams[0].id : null;
        saveActiveTeam();
        listenTeamTasks();
      }
      renderTeamsPage();
      renderPlanner();
    });
    return;
  }

  // Regular member leaves
  var updMembers = (team.members || []).filter(function(m) { return m.uid !== uid; });
  var updIds = (team.memberIds || []).filter(function(id) { return id !== uid; });

  db.collection("teams").doc(teamId).update({
    members: updMembers,
    memberIds: updIds
  }).then(function() {
    userTeams = userTeams.filter(function(t) { return t.id !== teamId; });
    if (activeTeamId === teamId) {
      activeTeamId = userTeams.length ? userTeams[0].id : null;
      saveActiveTeam();
      listenTeamTasks();
    }
    renderTeamsPage();
    renderPlanner();
  });
};

// ============================================================
// KICK MEMBER (owner only)
// ============================================================
window.kickMember = function(teamId, memberUid) {
  if (!currentUser) return;
  var team = userTeams.find(function(t) { return t.id === teamId; });
  if (!team || team.ownerId !== currentUser.uid) return;
  if (memberUid === currentUser.uid) return;
  if (!confirm("Удалить участника из команды?")) return;

  var updMembers = (team.members || []).filter(function(m) { return m.uid !== memberUid; });
  var updIds = (team.memberIds || []).filter(function(id) { return id !== memberUid; });

  db.collection("teams").doc(teamId).update({
    members: updMembers,
    memberIds: updIds
  }).then(function() {
    team.members = updMembers;
    team.memberIds = updIds;
    renderTeamsPage();
  });
};

// ============================================================
// ERROR DISPLAY
// ============================================================
function showTeamError(msg) {
  var el = document.getElementById("team-error");
  if (el) {
    el.textContent = msg;
    el.style.opacity = "1";
    setTimeout(function() { el.style.opacity = "0"; }, 3000);
  }
}

// ============================================================
// RENDER TEAMS PAGE
// ============================================================
var memberOnlineStatus = {};

function renderTeamsPage() {
  // Load online status for all team members first
  var allUids = [];
  for (var ti = 0; ti < userTeams.length; ti++) {
    var members = userTeams[ti].members || [];
    for (var mi = 0; mi < members.length; mi++) {
      if (allUids.indexOf(members[mi].uid) < 0) allUids.push(members[mi].uid);
    }
  }
  if (allUids.length > 0) {
    // Fetch in batches of 10 (Firestore 'in' limit)
    var batches = [];
    for (var i = 0; i < allUids.length; i += 10) {
      batches.push(allUids.slice(i, i + 10));
    }
    var promises = batches.map(function(batch) {
      return db.collection("users").where(firebase.firestore.FieldPath.documentId(), "in", batch).get();
    });
    Promise.all(promises).then(function(snaps) {
      memberOnlineStatus = {};
      for (var si = 0; si < snaps.length; si++) {
        snaps[si].forEach(function(doc) {
          var d = doc.data();
          memberOnlineStatus[doc.id] = isUserOnline(d.lastSeen);
        });
      }
      renderTeamsPageInner();
    }).catch(function() { renderTeamsPageInner(); });
  } else {
    renderTeamsPageInner();
  }
}

function renderTeamsPageInner() {
  var T = THEMES[themeId], el = document.getElementById("pnl-teams");
  if (!el) return;
  var uid = currentUser ? currentUser.uid : "";

  var h = '<div style="padding:32px"><div style="max-width:680px;margin:0 auto">';

  // Header
  h += '<h1 style="font-size:28px;font-weight:800;margin-bottom:8px;display:flex;align-items:center;gap:10px;color:' + T.tx + ';letter-spacing:-.02em"><span style="font-size:32px">👥</span> Команды</h1>';
  h += '<p style="font-size:14px;margin-bottom:28px;color:' + T.tm + '">Создайте команду или присоединитесь по коду. Каждая команда — своя доска задач.</p>';

  // Error
  h += '<div id="team-error" style="font-size:13px;color:#ff4757;font-weight:500;min-height:20px;margin-bottom:12px;opacity:0;transition:opacity .3s"></div>';

  // Create / Join row
  h += '<div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:28px">';

  // Create team
  h += '<div style="flex:1;min-width:240px;background:' + T.cbg + ';border:1px solid ' + T.cb + ';border-radius:18px;padding:20px;backdrop-filter:blur(20px)">';
  h += '<h3 style="font-size:14px;font-weight:700;color:' + T.tx + ';margin-bottom:12px">＋ Создать команду</h3>';
  h += '<input class="finp" id="team-name-input" style="border:1px solid ' + T.ibd + ';background:' + T.ib + ';color:' + T.tx + ';margin-bottom:10px" placeholder="Название команды" onkeydown="if(event.key===\'Enter\')createTeam()">';
  h += '<button class="btn-glow" style="width:100%;padding:10px;border-radius:12px;border:none;background:linear-gradient(135deg,' + T.ac + ',' + T.ac + 'cc);color:#fff;font-size:13px;font-weight:700;box-shadow:0 4px 20px ' + T.ag + '" onclick="createTeam()">Создать</button>';
  h += '</div>';

  // Join team
  h += '<div style="flex:1;min-width:240px;background:' + T.cbg + ';border:1px solid ' + T.cb + ';border-radius:18px;padding:20px;backdrop-filter:blur(20px)">';
  h += '<h3 style="font-size:14px;font-weight:700;color:' + T.tx + ';margin-bottom:12px">🔗 Присоединиться</h3>';
  h += '<input class="finp" id="team-code-input" style="border:1px solid ' + T.ibd + ';background:' + T.ib + ';color:' + T.tx + ';margin-bottom:10px;text-transform:uppercase;font-family:\'JetBrains Mono\',monospace;letter-spacing:.1em;text-align:center" placeholder="КОД" maxlength="6" onkeydown="if(event.key===\'Enter\')joinTeam()">';
  h += '<button style="width:100%;padding:10px;border-radius:12px;border:1px solid #2ed573;background:rgba(46,213,115,.12);color:#2ed573;font-size:13px;font-weight:700;cursor:pointer;transition:all .2s" onmouseenter="this.style.background=\'rgba(46,213,115,.2)\'" onmouseleave="this.style.background=\'rgba(46,213,115,.12)\'" onclick="joinTeam()">Присоединиться</button>';
  h += '</div>';
  h += '</div>';

  // Teams list
  if (!userTeams.length) {
    h += '<div style="text-align:center;padding:48px 20px;background:' + T.cbg + ';border:1px solid ' + T.cb + ';border-radius:20px;backdrop-filter:blur(20px)">';
    h += '<div style="font-size:52px;margin-bottom:14px">📋</div>';
    h += '<p style="font-size:15px;font-weight:600;color:' + T.tx + ';margin-bottom:6px">Нет команд</p>';
    h += '<p style="font-size:13px;color:' + T.tm + '">Создайте свою первую команду или попросите коллегу прислать код</p>';
    h += '</div>';
  } else {
    h += '<div style="display:flex;flex-direction:column;gap:14px">';
    for (var i = 0; i < userTeams.length; i++) {
      var team = userTeams[i];
      var isActive = activeTeamId === team.id;
      var isOwner = team.ownerId === uid;
      var members = team.members || [];

      h += '<div style="background:' + (isActive ? T.ab : T.cbg) + ';border:1px solid ' + (isActive ? T.ac + '66' : T.cb) + ';border-radius:20px;padding:22px;backdrop-filter:blur(20px);transition:all .2s;' + (isActive ? 'box-shadow:0 0 20px ' + T.ag : '') + '">';

      // Team header
      h += '<div style="display:flex;align-items:center;gap:12px;margin-bottom:14px;flex-wrap:wrap">';
      h += '<div style="width:44px;height:44px;border-radius:14px;background:linear-gradient(135deg,' + T.ac + ',' + T.ac + '88);display:flex;align-items:center;justify-content:center;font-size:20px;color:#fff;font-weight:800">' + esc(team.name.charAt(0).toUpperCase()) + '</div>';
      h += '<div style="flex:1;min-width:0"><div style="font-size:17px;font-weight:700;color:' + T.tx + '">' + esc(team.name) + '</div>';
      h += '<div style="font-size:11px;color:' + T.tm + ';margin-top:2px">' + members.length + ' участник' + pluralR(members.length) + (isOwner ? ' · Вы владелец' : '') + '</div></div>';

      // Actions
      h += '<div style="display:flex;gap:6px;align-items:center">';
      if (!isActive) {
        h += '<button style="padding:8px 16px;border-radius:10px;border:1px solid ' + T.ac + '66;background:' + T.ab + ';color:' + T.at + ';font-size:12px;font-weight:600;cursor:pointer;transition:all .2s" onclick="switchTeam(\'' + team.id + '\')">Выбрать</button>';
      } else {
        h += '<span style="padding:6px 14px;border-radius:10px;background:' + T.ac + '22;color:' + T.ac + ';font-size:11px;font-weight:700;letter-spacing:.04em">✓ АКТИВНАЯ</span>';
      }
      h += '<button style="padding:8px 14px;border-radius:10px;border:1px solid rgba(255,71,87,.25);background:rgba(255,71,87,.08);color:#ff4757;font-size:11px;font-weight:600;cursor:pointer;transition:all .2s" onmouseenter="this.style.background=\'rgba(255,71,87,.18)\'" onmouseleave="this.style.background=\'rgba(255,71,87,.08)\'" onclick="leaveTeam(\'' + team.id + '\')">' + (isOwner ? '🗑 Удалить' : '🚪 Выйти') + '</button>';
      h += '</div></div>';

      // Invite code
      h += '<div style="display:flex;align-items:center;gap:10px;padding:12px 16px;background:' + T.chb + ';border:1px solid ' + T.cb + ';border-radius:12px;margin-bottom:14px">';
      h += '<span style="font-size:12px;color:' + T.tm + '">Код приглашения:</span>';
      h += '<span style="font-size:16px;font-weight:700;color:' + T.at + ';font-family:\'JetBrains Mono\',monospace;letter-spacing:.12em">' + esc(team.code) + '</span>';
      h += '<button style="padding:4px 10px;border-radius:8px;border:1px solid ' + T.cb + ';background:transparent;color:' + T.tm + ';font-size:11px;cursor:pointer;transition:all .2s" onclick="copyCode(\'' + esc(team.code) + '\')">📋 Копировать</button>';
      h += '</div>';

      // Members
      h += '<div style="display:flex;flex-wrap:wrap;gap:8px">';
      for (var mi = 0; mi < members.length; mi++) {
        var m = members[mi];
        var mIsOwner = m.uid === team.ownerId;
        var mOnline = memberOnlineStatus[m.uid] || false;
        h += '<div style="display:flex;align-items:center;gap:8px;padding:6px 12px 6px 6px;background:' + T.ib + ';border:1px solid ' + T.cb + ';border-radius:30px;backdrop-filter:blur(10px);transition:all .2s">';
        // Avatar with online dot
        h += '<div style="position:relative;flex-shrink:0">';
        h += getUserAvatarHtml(28, m.name, m.avatarUrl);
        if (mOnline) {
          h += '<div style="position:absolute;bottom:-1px;right:-1px;width:10px;height:10px;border-radius:50%;background:#2ed573;border:2px solid ' + T.cbg + ';box-shadow:0 0 6px #2ed573"></div>';
        }
        h += '</div>';
        h += '<span style="font-size:12px;font-weight:500;color:' + T.tx + ';white-space:nowrap">' + esc(m.name || m.email) + '</span>';
        if (mOnline) h += '<span style="font-size:8px;color:#2ed573;font-weight:600">онлайн</span>';
        if (mIsOwner) h += '<span style="font-size:9px;padding:2px 6px;border-radius:6px;background:' + T.ac + '22;color:' + T.ac + ';font-weight:700">👑</span>';
        // Kick button (owner only, not self)
        if (isOwner && m.uid !== uid) {
          h += '<button style="padding:2px 6px;border-radius:6px;border:none;background:rgba(255,71,87,.1);color:#ff4757;font-size:10px;cursor:pointer" onclick="kickMember(\'' + team.id + '\',\'' + m.uid + '\')">✕</button>';
        }
        h += '</div>';
      }
      h += '</div>';

      h += '</div>';
    }
    h += '</div>';
  }

  h += '</div></div>';
  el.innerHTML = h;
}

// ============================================================
// HELPERS
// ============================================================
function pluralR(n) {
  if (n % 10 === 1 && n % 100 !== 11) return '';
  if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) return 'а';
  return 'ов';
}

window.copyCode = function(code) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(code).then(function() {
      showTeamError(""); // clear error
      var el = document.getElementById("team-error");
      if (el) { el.textContent = "✓ Код скопирован!"; el.style.color = "#2ed573"; el.style.opacity = "1"; }
      setTimeout(function() {
        if (el) { el.style.opacity = "0"; el.style.color = "#ff4757"; }
      }, 2000);
    });
  }
};
