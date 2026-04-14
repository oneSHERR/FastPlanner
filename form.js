// ============================================================
// FORM — Create / Edit Task
// ============================================================
window.openForm = function(id, scope) {
  if (id) {
    var list = scope === "shared" ? sharedTasks : personalTasks;
    editingTask = list.find(function(t) { return t.id === id; });
    if (editingTask) editingTask._scope = scope;
  } else {
    editingTask = null;
  }
  formPriority = editingTask ? editingTask.priority : "medium";
  formFileList = editingTask && editingTask.files ? editingTask.files.slice() : [];
  // Default to shared if user has a team, else personal
  formScope = editingTask ? (editingTask._scope || "shared") : (activeTeamId ? "shared" : "personal");
  renderForm();
};

window.closeForm = function() {
  var o = document.getElementById("fov"); if (o) o.remove();
  editingTask = null; formFileList = [];
};

window.selectPriority = function(p) {
  formPriority = p;
  var btns = document.querySelectorAll("#fpr [data-p]");
  for (var i = 0; i < btns.length; i++) {
    var k = btns[i].getAttribute("data-p"), c = PRI[k];
    btns[i].style.background = (k === p) ? c.bg : "transparent";
    btns[i].style.boxShadow = (k === p) ? "0 0 0 2px " + c.c : "none";
  }
};

window.setScope = function(s) {
  formScope = s;
  var btns = document.querySelectorAll("[data-sc]");
  var T = THEMES[themeId];
  for (var i = 0; i < btns.length; i++) {
    var v = btns[i].getAttribute("data-sc");
    btns[i].style.background = (v === s) ? T.ab : "transparent";
    btns[i].style.borderColor = (v === s) ? T.ac + "66" : T.cb;
  }
};

window.formAddFiles = function(fl) {
  rdf(fl).then(function(nf) { formFileList = formFileList.concat(nf); updateFF(); });
};

window.formRmFile = function(i) { formFileList.splice(i, 1); updateFF(); };

function updateFF() {
  var T = THEMES[themeId], el = document.getElementById("ffl"); if (!el) return;
  if (!formFileList.length) { el.innerHTML = ""; return; }
  var h = '';
  for (var i = 0; i < formFileList.length; i++) {
    var f = formFileList[i], fi = gfi(f.name);
    h += '<div style="display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:12px;background:' + T.ib + ';border:1px solid ' + T.cb + ';margin-top:6px;backdrop-filter:blur(10px);transition:transform .2s" onmouseenter="this.style.transform=\'translateX(3px)\'" onmouseleave="this.style.transform=\'translateX(0)\'">';
    h += '<span style="font-size:16px">' + fi.i + '</span>';
    h += '<div style="flex:1;min-width:0"><div style="font-size:12px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:' + T.tx + '">' + esc(f.name) + '</div><div style="font-size:10px;color:' + T.td + '">' + fsz(f.size) + '</div></div>';
    h += '<button onclick="formRmFile(' + i + ')" class="close-btn" style="background:none;border:none;color:rgba(255,71,87,.5);cursor:pointer;font-size:13px;padding:2px 5px">✕</button></div>';
  }
  el.innerHTML = h;
}

window.submitForm = function() {
  var ti = document.getElementById("fti"); if (!ti || !ti.value.trim()) return;
  var title = ti.value.trim();
  var desc = (document.getElementById("fde") || {}).value || ""; desc = desc.trim();
  var deadline = (document.getElementById("fdl") || {}).value || null;
  var userName = currentUser ? (currentUser.displayName || currentUser.email) : "";

  if (editingTask) {
    var data = {title:title, description:desc, priority:formPriority, deadline:deadline, files:formFileList};
    if (editingTask._scope === "shared") {
      updateSharedTask(editingTask.id, data);
    } else {
      var t = personalTasks.find(function(x) { return x.id === editingTask.id; });
      if (t) Object.assign(t, data);
      savePersonal();
    }
  } else {
    var task = {
      title:title, description:desc, priority:formPriority, deadline:deadline,
      files:formFileList, column:"todo", createdAt:new Date().toISOString(),
      authorName:userName, authorId:currentUser ? currentUser.uid : ""
    };
    if (formScope === "shared") {
      if (!activeTeamId) { alert("Сначала создайте или присоединитесь к команде!"); return; }
      addSharedTask(task);
    } else {
      task.id = gid();
      personalTasks.push(task);
      savePersonal();
    }
  }
  closeForm();
  if (activeTab === "planner") renderPlanner();
};

function renderForm() {
  var T = THEMES[themeId], t = editingTask;
  var hasTeam = !!activeTeamId;
  var ov = document.createElement("div"); ov.id = "fov"; ov.className = "overlay";
  ov.style.background = T.ob;
  ov.onclick = function(e) { if (e.target === ov) closeForm(); };

  var h = '<div class="fcard" style="background:' + T.fb + ';border:1px solid ' + T.cb + '" onclick="event.stopPropagation()">';
  h += '<h2 style="font-size:22px;font-weight:800;margin-bottom:20px;color:' + T.tx + ';letter-spacing:-.02em">' + (t ? "✎ Редактировать" : "＋ Новая задача") + '</h2>';

  // Scope selector (only for new tasks)
  if (!t) {
    h += '<label class="flbl" style="color:' + T.tm + '">Тип задачи</label>';
    h += '<div style="display:flex;gap:8px;margin-bottom:4px">';

    // Team button
    var teamLabel = "👥 Командная";
    if (activeTeamId && userTeams.length) {
      var at = userTeams.find(function(tm) { return tm.id === activeTeamId; });
      if (at) teamLabel = "👥 " + esc(at.name);
    }
    if (hasTeam) {
      h += '<button data-sc="shared" style="flex:1;padding:11px;border-radius:12px;border:1px solid ' + (formScope === "shared" ? T.ac + "66" : T.cb) + ';background:' + (formScope === "shared" ? T.ab : 'transparent') + ';color:' + T.tx + ';font-size:13px;cursor:pointer;backdrop-filter:blur(10px);transition:all .2s;font-weight:500" onclick="setScope(\'shared\')">' + teamLabel + '</button>';
    } else {
      h += '<button style="flex:1;padding:11px;border-radius:12px;border:1px dashed ' + T.cb + ';background:transparent;color:' + T.td + ';font-size:12px;cursor:pointer" onclick="closeForm();switchTab(\'teams\')">👥 Создать команду →</button>';
    }
    h += '<button data-sc="personal" style="flex:1;padding:11px;border-radius:12px;border:1px solid ' + (formScope === "personal" ? T.ac + "66" : T.cb) + ';background:' + (formScope === "personal" ? T.ab : 'transparent') + ';color:' + T.tx + ';font-size:13px;cursor:pointer;backdrop-filter:blur(10px);transition:all .2s;font-weight:500" onclick="setScope(\'personal\')">👤 Личная</button>';
    h += '</div>';
  }

  h += '<label class="flbl" style="color:' + T.tm + '">Название*</label>';
  h += '<input class="finp" id="fti" style="border:1px solid ' + T.ibd + ';background:' + T.ib + ';color:' + T.tx + '" value="' + esc(t ? t.title : "") + '" placeholder="Что нужно сделать?" onkeydown="if(event.key===\'Enter\')submitForm()">';

  h += '<label class="flbl" style="color:' + T.tm + '">Описание</label>';
  h += '<textarea class="finp" id="fde" style="border:1px solid ' + T.ibd + ';background:' + T.ib + ';color:' + T.tx + ';min-height:68px;resize:vertical" placeholder="Детали…">' + esc(t ? (t.description || "") : "") + '</textarea>';

  h += '<label class="flbl" style="color:' + T.tm + '">Приоритет</label>';
  h += '<div style="display:flex;gap:7px;flex-wrap:wrap" id="fpr">';
  var pkeys = Object.keys(PRI);
  for (var i = 0; i < pkeys.length; i++) {
    var k = pkeys[i], c = PRI[k], isA = formPriority === k;
    h += '<button data-p="' + k + '" style="padding:7px 13px;border-radius:10px;border:1px solid ' + c.c + ';color:' + T.tx + ';background:' + (isA ? c.bg : 'transparent') + ';font-size:11px;cursor:pointer;transition:all .2s;letter-spacing:.02em;' + (isA ? 'box-shadow:0 0 0 2px ' + c.c : '') + '" onclick="selectPriority(\'' + k + '\')">' + c.l + '</button>';
  }
  h += '</div>';

  h += '<label class="flbl" style="color:' + T.tm + '">Дедлайн</label>';
  h += '<input class="finp" id="fdl" type="date" style="border:1px solid ' + T.ibd + ';background:' + T.ib + ';color:' + T.tx + '" value="' + (t ? (t.deadline || "") : "") + '">';

  h += '<label class="flbl" style="color:' + T.tm + '">Файлы</label>';
  h += '<div style="border:2px dashed ' + T.dbd + ';border-radius:16px;padding:28px 16px;text-align:center;background:' + T.dbg + ';cursor:pointer;transition:all .2s;backdrop-filter:blur(10px)" onclick="document.getElementById(\'ffin\').click()" ondragover="event.preventDefault();this.style.borderColor=\'' + T.ac + '\'" ondragleave="this.style.borderColor=\'' + T.dbd + '\'" ondrop="event.preventDefault();this.style.borderColor=\'' + T.dbd + '\';formAddFiles(event.dataTransfer.files)">';
  h += '<input type="file" multiple id="ffin" style="display:none" onchange="formAddFiles(this.files);this.value=\'\'">';
  h += '<div style="font-size:36px;margin-bottom:8px">📁</div><div style="font-size:13px;color:' + T.tm + ';letter-spacing:.01em">Перетащите файлы или нажмите</div></div>';

  h += '<div id="ffl"></div>';

  // Buttons
  h += '<div style="display:flex;gap:10px;margin-top:28px;justify-content:flex-end">';
  h += '<button style="padding:10px 22px;border-radius:12px;border:1px solid ' + T.ibd + ';background:transparent;color:' + T.tm + ';font-size:13px;cursor:pointer;transition:all .2s;backdrop-filter:blur(10px);letter-spacing:.02em" onmouseenter="this.style.background=\'' + T.chb + '\'" onmouseleave="this.style.background=\'transparent\'" onclick="closeForm()">Отмена</button>';
  h += '<button class="btn-glow" style="padding:10px 26px;border-radius:12px;border:none;background:linear-gradient(135deg,' + T.ac + ',' + T.ac + 'cc);color:#fff;font-size:13px;font-weight:700;box-shadow:0 4px 20px ' + T.ag + ';cursor:pointer;letter-spacing:.02em" onclick="submitForm()">' + (t ? "Сохранить" : "Создать") + '</button>';
  h += '</div></div>';

  ov.innerHTML = h;
  document.body.appendChild(ov);
  if (formFileList.length) setTimeout(updateFF, 10);
  setTimeout(function() { var el = document.getElementById("fti"); if (el) el.focus(); }, 50);
}
