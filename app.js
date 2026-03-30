// ============================================================
// APP — Init & Auth State Listener
// ============================================================

// Auth state listener
auth.onAuthStateChanged(function(user) {
  if (user) {
    currentUser = user;
    document.getElementById("auth-screen").classList.add("hidden");
    document.getElementById("sidebar").style.display = "";
    document.getElementById("panels").style.display = "";
    loadLocal();
    listenShared();
    render();
  } else {
    currentUser = null;
    if (unsubFirestore) { unsubFirestore(); unsubFirestore = null; }
    document.getElementById("auth-screen").classList.remove("hidden");
    document.getElementById("sidebar").style.display = "none";
    document.getElementById("panels").style.display = "none";
    renderAuth();
  }
});

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
loadLocal();
renderAuth();
