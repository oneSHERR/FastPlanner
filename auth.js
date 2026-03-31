// ============================================================
// STATE
// ============================================================
var currentUser = null;
var userProfile = null;
var personalTasks = [];
var sharedTasks = [];
var themeId = "midnight";
var activeFilter = "all";
var searchText = "";
var activeTab = "planner";
var showPersonal = true;
var showShared = true;
var editingTask = null;
var previewingFile = null;
var formPriority = "medium";
var formFileList = [];
var formScope = "shared";
var authMode = "login";
var unsubFirestore = null;
var authReady = false;

var LS_PERSONAL = "wf-personal-v5";
var LS_THEME = "wf-theme";

function loadLocal() {
  try { var t = localStorage.getItem(LS_PERSONAL); if (t) personalTasks = JSON.parse(t); } catch(e) {}
  try { var t = localStorage.getItem(LS_THEME); if (t && THEMES[t]) themeId = t; } catch(e) {}
}
function savePersonal() { try { localStorage.setItem(LS_PERSONAL, JSON.stringify(personalTasks)); } catch(e) {} }
function saveTheme() { try { localStorage.setItem(LS_THEME, themeId); } catch(e) {} }

function getAllTasks() {
  var all = [];
  if (showPersonal) for (var i = 0; i < personalTasks.length; i++) { var t = Object.assign({}, personalTasks[i]); t._scope = "personal"; all.push(t); }
  if (showShared) for (var i = 0; i < sharedTasks.length; i++) { var t = Object.assign({}, sharedTasks[i]); t._scope = "shared"; all.push(t); }
  return all;
}
function getFiltered() {
  return getAllTasks().filter(function(t) {
    if (activeFilter !== "all" && t.priority !== activeFilter) return false;
    if (searchText) {
      var q = searchText.toLowerCase();
      if (t.title.toLowerCase().indexOf(q) < 0 && !(t.description && t.description.toLowerCase().indexOf(q) >= 0) && !(t.files || []).some(function(f) { return f.name.toLowerCase().indexOf(q) >= 0; })) return false;
    }
    return true;
  });
}
function getStats() {
  var all = getAllTasks(), s = {total:all.length, done:0, over:0, files:0};
  for (var i = 0; i < all.length; i++) {
    if (all[i].column === "done") s.done++;
    if (all[i].deadline && new Date(all[i].deadline) < new Date() && all[i].column !== "done") s.over++;
    s.files += (all[i].files || []).length;
  }
  return s;
}

// ============================================================
// USER PROFILE (Firestore — avatars)
// ============================================================
function loadUserProfile(uid) {
  return db.collection("users").doc(uid).get().then(function(doc) {
    if (doc.exists) {
      userProfile = doc.data();
    } else {
      userProfile = { displayName: currentUser.displayName || '', email: currentUser.email || '', avatarUrl: '', createdAt: new Date().toISOString() };
      db.collection("users").doc(uid).set(userProfile);
    }
  }).catch(function() {
    userProfile = { displayName: currentUser.displayName || '', email: currentUser.email || '', avatarUrl: '' };
  });
}

function saveUserAvatar(dataUrl) {
  if (!currentUser) return;
  userProfile = userProfile || {};
  userProfile.avatarUrl = dataUrl;
  db.collection("users").doc(currentUser.uid).set({avatarUrl: dataUrl}, {merge: true}).then(function() {
    renderProfile();
    renderSidebar();
  }).catch(function(err) { alert("Ошибка: " + err.message); });
}

function getUserAvatarHtml(size, name, avatarUrl) {
  var br = Math.round(size * 0.28);
  if (avatarUrl) return '<img src="' + avatarUrl + '" style="width:' + size + 'px;height:' + size + 'px;border-radius:' + br + 'px;object-fit:cover;flex-shrink:0">';
  var T = THEMES[themeId], letter = name ? name.charAt(0).toUpperCase() : '?', fs = Math.round(size * 0.42);
  return '<div style="width:' + size + 'px;height:' + size + 'px;border-radius:' + br + 'px;background:linear-gradient(135deg,' + T.ac + ',' + T.ac + '88);display:flex;align-items:center;justify-content:center;font-size:' + fs + 'px;font-weight:700;color:#fff;box-shadow:0 4px 16px ' + T.ag + ';flex-shrink:0">' + letter + '</div>';
}

// ============================================================
// FIRESTORE SYNC
// ============================================================
function listenShared() {
  if (unsubFirestore) unsubFirestore();
  unsubFirestore = db.collection("shared-tasks").orderBy("createdAt","asc").onSnapshot(function(snap) {
    sharedTasks = [];
    snap.forEach(function(doc) { var d = doc.data(); d.id = doc.id; d._scope = "shared"; sharedTasks.push(d); });
    if (activeTab === "planner") renderPlanner();
  });
}
function addSharedTask(task) { return db.collection("shared-tasks").add(task); }
function updateSharedTask(id, data) { return db.collection("shared-tasks").doc(id).update(data); }
function deleteSharedTask(id) { return db.collection("shared-tasks").doc(id).delete(); }

// ============================================================
// LOADING SCREEN
// ============================================================
function showLoading() {
  var T = THEMES[themeId], el = document.getElementById("auth-screen");
  el.style.background = T.app; el.classList.remove("hidden");
  var card = document.getElementById("auth-card");
  card.style.background = T.fb; card.style.border = "1px solid " + T.cb; card.style.boxShadow = "0 32px 80px " + T.sh;
  card.innerHTML = '<span class="auth-logo" style="animation:pulse 1.5s ease-in-out infinite">⬡</span><h1 style="color:' + T.tx + '">WorkFlow</h1><p class="sub" style="color:' + T.tm + '">Загрузка...</p><div style="width:120px;height:3px;margin:16px auto 0;border-radius:2px;overflow:hidden;background:' + T.chc + '"><div class="progress-fill" style="width:60%;background:' + T.ac + '"></div></div>';
}

// ============================================================
// AUTH RENDER
// ============================================================
function renderAuth() {
  var T = THEMES[themeId];
  document.getElementById("auth-screen").style.background = T.app;
  var card = document.getElementById("auth-card");
  card.style.background = T.fb; card.style.border = "1px solid " + T.cb; card.style.boxShadow = "0 32px 80px " + T.sh;
  var h = '<span class="auth-logo">⬡</span><h1 style="color:' + T.tx + '">WorkFlow</h1>';
  if (authMode === "login") {
    h += '<p class="sub" style="color:' + T.tm + '">Войдите в свой аккаунт</p>';
    h += '<input class="auth-input" id="a-email" style="border:1px solid ' + T.ibd + ';background:' + T.ib + ';color:' + T.tx + '" placeholder="Email" type="email">';
    h += '<input class="auth-input" id="a-pass" style="border:1px solid ' + T.ibd + ';background:' + T.ib + ';color:' + T.tx + '" placeholder="Пароль" type="password" onkeydown="if(event.key===\'Enter\')doLogin()">';
    h += '<button class="auth-btn btn-glow" style="background:linear-gradient(135deg,' + T.ac + ',' + T.ac + 'cc);box-shadow:0 4px 20px ' + T.ag + '" onclick="doLogin()">Войти</button>';
    h += '<span class="auth-link" style="color:' + T.at + '" onclick="authMode=\'register\';renderAuth()">Нет аккаунта? Зарегистрироваться</span>';
  } else {
    h += '<p class="sub" style="color:' + T.tm + '">Создайте аккаунт</p>';
    h += '<input class="auth-input" id="a-name" style="border:1px solid ' + T.ibd + ';background:' + T.ib + ';color:' + T.tx + '" placeholder="Ваше имя">';
    h += '<input class="auth-input" id="a-email" style="border:1px solid ' + T.ibd + ';background:' + T.ib + ';color:' + T.tx + '" placeholder="Email" type="email">';
    h += '<input class="auth-input" id="a-pass" style="border:1px solid ' + T.ibd + ';background:' + T.ib + ';color:' + T.tx + '" placeholder="Пароль (мин. 6 символов)" type="password">';
    h += '<input class="auth-input" id="a-code" style="border:1px solid ' + T.ibd + ';background:' + T.ib + ';color:' + T.tx + '" placeholder="Код приглашения" onkeydown="if(event.key===\'Enter\')doRegister()">';
    h += '<button class="auth-btn btn-glow" style="background:linear-gradient(135deg,' + T.ac + ',' + T.ac + 'cc);box-shadow:0 4px 20px ' + T.ag + '" onclick="doRegister()">Зарегистрироваться</button>';
    h += '<span class="auth-link" style="color:' + T.at + '" onclick="authMode=\'login\';renderAuth()">Уже есть аккаунт? Войти</span>';
  }
  h += '<div class="auth-err" id="a-err"></div>';
  card.innerHTML = h;
}

function showAuthError(msg) { var el = document.getElementById("a-err"); if (el) el.textContent = msg; }

window.doLogin = function() {
  var email = (document.getElementById("a-email") || {}).value || "";
  var pass = (document.getElementById("a-pass") || {}).value || "";
  if (!email || !pass) { showAuthError("Заполните все поля"); return; }
  auth.signInWithEmailAndPassword(email, pass).catch(function(err) {
    if (err.code === "auth/user-not-found") showAuthError("Пользователь не найден");
    else if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") showAuthError("Неверный пароль");
    else showAuthError("Ошибка: " + err.message);
  });
};
window.doRegister = function() {
  var name = (document.getElementById("a-name") || {}).value || "";
  var email = (document.getElementById("a-email") || {}).value || "";
  var pass = (document.getElementById("a-pass") || {}).value || "";
  var code = (document.getElementById("a-code") || {}).value || "";
  if (!name || !email || !pass || !code) { showAuthError("Заполните все поля"); return; }
  if (code !== INVITE_CODE) { showAuthError("Неверный код приглашения"); return; }
  if (pass.length < 6) { showAuthError("Пароль минимум 6 символов"); return; }
  auth.createUserWithEmailAndPassword(email, pass).then(function(cred) {
    return cred.user.updateProfile({displayName: name});
  }).catch(function(err) {
    if (err.code === "auth/email-already-in-use") showAuthError("Email уже зарегистрирован");
    else showAuthError("Ошибка: " + err.message);
  });
};
window.doLogout = function() { auth.signOut(); };
window.doChangePassword = function() {
  var np = (document.getElementById("new-pass") || {}).value || "";
  if (np.length < 6) { alert("Минимум 6 символов"); return; }
  currentUser.updatePassword(np).then(function() { alert("Пароль изменён!"); }).catch(function(err) { alert("Ошибка: " + err.message + ". Попробуйте перезайти."); });
};
