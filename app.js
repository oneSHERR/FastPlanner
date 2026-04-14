// ============================================================
// APP — Init & Auth State Listener
// ============================================================

// Show loading immediately on page load
loadLocal();
showLoading();

// Auth state listener — handles login/logout transitions
auth.onAuthStateChanged(function(user) {
  if (user) {
    currentUser = user;
    loadLocal();

    // Load user profile + teams, then show app
    Promise.all([
      loadUserProfile(user.uid),
      loadUserTeams(user.uid)
    ]).then(function() {
      document.getElementById("auth-screen").classList.add("hidden");
      document.getElementById("sidebar").style.display = "";
      document.getElementById("panels").style.display = "";
      authReady = true;
      listenShared(); // now listens to active team tasks
      render();
    });
  } else {
    currentUser = null;
    userProfile = null;
    authReady = false;
    userTeams = [];
    activeTeamId = null;
    sharedTasks = [];
    // Unsub team listeners
    for (var i = 0; i < teamUnsubs.length; i++) { if (teamUnsubs[i]) teamUnsubs[i](); }
    teamUnsubs = [];
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
  if (!authReady) return; // Prevent rendering before auth is ready
  var T = THEMES[themeId];
  document.body.style.background = T.app;
  document.body.style.color = T.tx;
  renderSidebar();
  renderPlanner();
  renderTools();
}
