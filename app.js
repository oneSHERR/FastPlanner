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

    // Load user profile (avatar etc.) then show app
    loadUserProfile(user.uid).then(function() {
      document.getElementById("auth-screen").classList.add("hidden");
      document.getElementById("sidebar").style.display = "";
      document.getElementById("panels").style.display = "";
      authReady = true;
      listenShared();
      render();
    });
  } else {
    currentUser = null;
    userProfile = null;
    authReady = false;
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
  if (!authReady) return; // Prevent rendering before auth is ready
  var T = THEMES[themeId];
  document.body.style.background = T.app;
  document.body.style.color = T.tx;
  renderSidebar();
  renderPlanner();
  renderTools();
}
