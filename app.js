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
      startPresence(); // online status
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
    stopPresence();
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

// ============================================================
// PRESENCE — Online Status
// ============================================================
var presenceInterval = null;

function startPresence() {
  if (!currentUser) return;
  updatePresence();
  // Update every 60 seconds
  presenceInterval = setInterval(updatePresence, 60000);
  // Update on visibility change
  document.addEventListener("visibilitychange", function() {
    if (!document.hidden && currentUser) updatePresence();
  });
  // Mark offline on beforeunload
  window.addEventListener("beforeunload", function() {
    if (currentUser) {
      // Use sendBeacon for reliability
      navigator.sendBeacon && navigator.sendBeacon("about:blank");
      // Set lastSeen to past so it shows offline quickly
      db.collection("users").doc(currentUser.uid).set({
        lastSeen: new Date(Date.now() - 120000).toISOString(),
        online: false
      }, {merge: true});
    }
  });
}

function updatePresence() {
  if (!currentUser) return;
  db.collection("users").doc(currentUser.uid).set({
    lastSeen: new Date().toISOString(),
    online: true
  }, {merge: true}).catch(function() {});
}

function stopPresence() {
  if (presenceInterval) { clearInterval(presenceInterval); presenceInterval = null; }
}

// Check if a user is online (seen in last 2 minutes)
function isUserOnline(lastSeen) {
  if (!lastSeen) return false;
  var diff = Date.now() - new Date(lastSeen).getTime();
  return diff < 120000; // 2 minutes
}
