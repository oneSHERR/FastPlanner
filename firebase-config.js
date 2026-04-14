// ============================================================
// FIREBASE CONFIG
// ============================================================
firebase.initializeApp({
  apiKey: "AIzaSyAUSXth1a3tKLDdzm5VdavrpeyBqxhsV04",
  authDomain: "workflow-planner-3c6cb.firebaseapp.com",
  projectId: "workflow-planner-3c6cb",
  storageBucket: "workflow-planner-3c6cb.firebasestorage.app",
  messagingSenderId: "419873947487",
  appId: "1:419873947487:web:1ec3f54ed5e3a2ef2e40ea"
});

var auth = firebase.auth();
var db = firebase.firestore();
// Team-based access — no global invite code needed
