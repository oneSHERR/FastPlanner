// ============================================================
// TASK ACTIONS
// ============================================================
window.deleteTask = function(id, scope) {
  if (scope === "shared") { deleteSharedTask(id); }
  else {
    personalTasks = personalTasks.filter(function(t) { return t.id !== id; });
    savePersonal(); renderPlanner();
  }
};

window.moveTask = function(id, col, scope) {
  if (scope === "shared") {
    var upd = {column: col};
    if (col === "done") upd.completedAt = new Date().toISOString(); else upd.completedAt = null;
    updateSharedTask(id, upd);
  } else {
    for (var i = 0; i < personalTasks.length; i++) {
      if (personalTasks[i].id === id) {
        personalTasks[i].column = col;
        personalTasks[i].completedAt = col === "done" ? new Date().toISOString() : null;
        break;
      }
    }
    savePersonal(); renderPlanner();
  }
};

window.removeFile = function(id, fi, scope) {
  if (scope === "shared") {
    var t = sharedTasks.find(function(x) { return x.id === id; });
    if (t && t.files) { var f = t.files.slice(); f.splice(fi, 1); updateSharedTask(id, {files: f}); }
  } else {
    for (var i = 0; i < personalTasks.length; i++) {
      if (personalTasks[i].id === id && personalTasks[i].files) { personalTasks[i].files.splice(fi, 1); break; }
    }
    savePersonal(); renderPlanner();
  }
};

window.dlFile = function(id, fi, scope) {
  var list = scope === "shared" ? sharedTasks : personalTasks;
  var t = list.find(function(x) { return x.id === id; });
  if (t && t.files && t.files[fi]) dlf(t.files[fi]);
};

window.quickAttach = function(id, inp, scope) {
  rdf(inp.files).then(function(nf) {
    if (scope === "shared") {
      var t = sharedTasks.find(function(x) { return x.id === id; });
      if (t) { var f = (t.files || []).concat(nf); updateSharedTask(id, {files: f}); }
    } else {
      for (var i = 0; i < personalTasks.length; i++) {
        if (personalTasks[i].id === id) { personalTasks[i].files = (personalTasks[i].files || []).concat(nf); break; }
      }
      savePersonal(); renderPlanner();
    }
  });
  inp.value = "";
};

window.showPreview = function(id, fi, scope) {
  var list = scope === "shared" ? sharedTasks : personalTasks;
  var t = list.find(function(x) { return x.id === id; });
  if (t && t.files && t.files[fi]) { previewingFile = t.files[fi]; renderPreviewModal(); }
};

// ============================================================
// DRAG & DROP
// ============================================================
var dragInfo = null, dropInfo = null;

window.startDrag = function(id, scope, evt) {
  var c = evt.target.closest(".card"); if (!c) return; evt.preventDefault();
  var r = c.getBoundingClientRect(), g = c.cloneNode(true);
  g.className = "card ghost";
  g.style.width = r.width + "px";
  g.style.left = r.left + "px";
  g.style.top = r.top + "px";
  document.body.appendChild(g);
  dragInfo = {id:id, scope:scope, ghost:g, ox:evt.clientX - r.left, oy:evt.clientY - r.top};
  c.classList.add("dragging");
  document.addEventListener("pointermove", onDM);
  document.addEventListener("pointerup", onDU);
};

function onDM(e) {
  if (!dragInfo) return;
  dragInfo.ghost.style.left = (e.clientX - dragInfo.ox) + "px";
  dragInfo.ghost.style.top = (e.clientY - dragInfo.oy) + "px";
  dropInfo = null;
  var cols = document.querySelectorAll(".col");
  for (var i = 0; i < cols.length; i++) {
    var r = cols[i].getBoundingClientRect();
    cols[i].classList.remove("dragover");
    if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) {
      cols[i].classList.add("dragover");
      dropInfo = {col: cols[i].getAttribute("data-col")};
    }
  }
}

function onDU() {
  document.removeEventListener("pointermove", onDM);
  document.removeEventListener("pointerup", onDU);
  if (!dragInfo) return;
  dragInfo.ghost.remove();
  document.querySelectorAll(".card.dragging").forEach(function(el) { el.classList.remove("dragging"); });
  document.querySelectorAll(".col.dragover").forEach(function(el) { el.classList.remove("dragover"); });
  if (dropInfo) moveTask(dragInfo.id, dropInfo.col, dragInfo.scope);
  dragInfo = null; dropInfo = null;
}
