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
// DRAG & DROP — columns + reorder within column
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

  // Remove all indicators
  document.querySelectorAll(".col").forEach(function(col) { col.classList.remove("dragover"); });
  document.querySelectorAll(".drop-line").forEach(function(el) { el.remove(); });

  var cols = document.querySelectorAll(".col");
  for (var i = 0; i < cols.length; i++) {
    var r = cols[i].getBoundingClientRect();
    if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) {
      cols[i].classList.add("dragover");
      var colId = cols[i].getAttribute("data-col");
      var cards = cols[i].querySelectorAll(".card:not(.dragging):not(.ghost)");
      var insertBefore = null;
      var insertIdx = cards.length;

      for (var ci = 0; ci < cards.length; ci++) {
        var cr = cards[ci].getBoundingClientRect();
        var mid = cr.top + cr.height / 2;
        if (e.clientY < mid) {
          insertBefore = cards[ci];
          insertIdx = ci;
          break;
        }
      }

      // Show drop indicator line
      var line = document.createElement("div");
      line.className = "drop-line";
      var colBody = cols[i].querySelector(".col-body");
      if (colBody) {
        if (insertBefore) {
          colBody.insertBefore(line, insertBefore);
        } else {
          colBody.appendChild(line);
        }
      }

      dropInfo = {col: colId, insertIdx: insertIdx};
      break;
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
  document.querySelectorAll(".drop-line").forEach(function(el) { el.remove(); });

  if (dropInfo) {
    reorderTask(dragInfo.id, dropInfo.col, dropInfo.insertIdx, dragInfo.scope);
  }
  dragInfo = null; dropInfo = null;
}

// ============================================================
// REORDER — move task to column at specific position
// ============================================================
function reorderTask(taskId, targetCol, insertIdx, scope) {
  if (scope === "shared") {
    // For shared: update column + sortOrder
    var colTasks = sharedTasks.filter(function(t) { return t.column === targetCol && t.id !== taskId; });
    colTasks.sort(function(a, b) { return (a.sortOrder || 0) - (b.sortOrder || 0); });

    var newOrder;
    if (colTasks.length === 0) {
      newOrder = 1000;
    } else if (insertIdx === 0) {
      newOrder = (colTasks[0].sortOrder || 0) - 1000;
    } else if (insertIdx >= colTasks.length) {
      newOrder = (colTasks[colTasks.length - 1].sortOrder || 0) + 1000;
    } else {
      var prev = colTasks[insertIdx - 1].sortOrder || 0;
      var next = colTasks[insertIdx].sortOrder || 0;
      newOrder = (prev + next) / 2;
    }

    var upd = {column: targetCol, sortOrder: newOrder};
    if (targetCol === "done") upd.completedAt = new Date().toISOString(); else upd.completedAt = null;
    updateSharedTask(taskId, upd);

  } else {
    // For personal: physically reorder array
    var taskIdx = -1;
    for (var i = 0; i < personalTasks.length; i++) {
      if (personalTasks[i].id === taskId) { taskIdx = i; break; }
    }
    if (taskIdx < 0) return;

    var task = personalTasks[taskIdx];
    task.column = targetCol;
    task.completedAt = targetCol === "done" ? new Date().toISOString() : null;

    // Remove from array
    personalTasks.splice(taskIdx, 1);

    // Find personal tasks in target column (in current order)
    var colTaskIndices = [];
    for (var i = 0; i < personalTasks.length; i++) {
      if (personalTasks[i].column === targetCol) colTaskIndices.push(i);
    }

    // Insert at position
    if (insertIdx >= colTaskIndices.length || colTaskIndices.length === 0) {
      personalTasks.push(task);
    } else {
      var globalIdx = colTaskIndices[insertIdx];
      personalTasks.splice(globalIdx, 0, task);
    }

    savePersonal(); renderPlanner();
  }
}
