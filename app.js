// ============================================================
// FIREBASE INIT
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
var INVITE_CODE = "WORKFLOW2026";

// ============================================================
// THEMES
// ============================================================
var THEMES = {
  midnight:{name:"Полночь",icon:"🌙",app:"linear-gradient(145deg,#0f0f1a,#1a1a2e,#16213e)",hdr:"linear-gradient(135deg,rgba(30,30,60,.95),rgba(25,25,50,.9))",cbg:"rgba(255,255,255,.025)",cb:"rgba(255,255,255,.06)",tx:"#e8e8f0",tm:"rgba(255,255,255,.45)",td:"rgba(255,255,255,.3)",ib:"rgba(255,255,255,.04)",ibd:"rgba(255,255,255,.1)",ac:"#7c5cff",ag:"rgba(124,92,255,.3)",ab:"rgba(124,92,255,.15)",at:"#b8a4ff",chb:"rgba(255,255,255,.05)",chc:"rgba(255,255,255,.08)",ob:"rgba(0,0,0,.65)",fb:"linear-gradient(145deg,#1e1e3a,#1a1a2e)",dbg:"rgba(255,255,255,.02)",dbd:"rgba(255,255,255,.12)",sh:"rgba(0,0,0,.12)",sbg:"rgba(15,15,26,.95)"},
  cream:{name:"Крем",icon:"🍦",app:"linear-gradient(145deg,#fdf6ee,#f5ebe0,#f0e4d4)",hdr:"linear-gradient(135deg,rgba(245,235,224,.97),rgba(240,228,212,.95))",cbg:"rgba(255,255,255,.7)",cb:"rgba(180,160,130,.15)",tx:"#3d2c1e",tm:"rgba(61,44,30,.55)",td:"rgba(61,44,30,.35)",ib:"rgba(255,255,255,.6)",ibd:"rgba(180,160,130,.25)",ac:"#c47f42",ag:"rgba(196,127,66,.25)",ab:"rgba(196,127,66,.12)",at:"#a0632e",chb:"rgba(196,127,66,.08)",chc:"rgba(180,160,130,.15)",ob:"rgba(60,40,20,.45)",fb:"linear-gradient(145deg,#fdf8f2,#f5ebe0)",dbg:"rgba(196,127,66,.04)",dbd:"rgba(180,160,130,.25)",sh:"rgba(120,90,50,.08)",sbg:"rgba(240,228,212,.97)"},
  snow:{name:"Снег",icon:"❄️",app:"linear-gradient(145deg,#fff,#f4f6f9,#eef1f5)",hdr:"linear-gradient(135deg,rgba(255,255,255,.97),rgba(244,246,249,.95))",cbg:"rgba(255,255,255,.85)",cb:"rgba(0,0,0,.06)",tx:"#1a1a2e",tm:"rgba(26,26,46,.5)",td:"rgba(26,26,46,.3)",ib:"rgba(0,0,0,.03)",ibd:"rgba(0,0,0,.08)",ac:"#4a6cf7",ag:"rgba(74,108,247,.2)",ab:"rgba(74,108,247,.08)",at:"#3b5de7",chb:"rgba(0,0,0,.04)",chc:"rgba(0,0,0,.06)",ob:"rgba(0,0,0,.35)",fb:"linear-gradient(145deg,#fff,#f8f9fc)",dbg:"rgba(74,108,247,.03)",dbd:"rgba(0,0,0,.1)",sh:"rgba(0,0,0,.06)",sbg:"rgba(244,246,249,.97)"},
  charcoal:{name:"Уголь",icon:"🖤",app:"linear-gradient(145deg,#1c1c1e,#2c2c2e,#262628)",hdr:"linear-gradient(135deg,rgba(44,44,46,.95),rgba(38,38,40,.95))",cbg:"rgba(255,255,255,.04)",cb:"rgba(255,255,255,.07)",tx:"#e5e5e7",tm:"rgba(229,229,231,.5)",td:"rgba(229,229,231,.3)",ib:"rgba(255,255,255,.06)",ibd:"rgba(255,255,255,.1)",ac:"#ff9f0a",ag:"rgba(255,159,10,.25)",ab:"rgba(255,159,10,.12)",at:"#ffb340",chb:"rgba(255,255,255,.06)",chc:"rgba(255,255,255,.08)",ob:"rgba(0,0,0,.6)",fb:"linear-gradient(145deg,#2c2c2e,#262628)",dbg:"rgba(255,159,10,.04)",dbd:"rgba(255,255,255,.1)",sh:"rgba(0,0,0,.2)",sbg:"rgba(28,28,30,.95)"},
  forest:{name:"Лес",icon:"🌲",app:"linear-gradient(145deg,#0d1f17,#142a1f,#1a3328)",hdr:"linear-gradient(135deg,rgba(20,42,31,.95),rgba(26,51,40,.95))",cbg:"rgba(200,230,210,.04)",cb:"rgba(120,200,150,.1)",tx:"#d4e8dc",tm:"rgba(212,232,220,.5)",td:"rgba(212,232,220,.3)",ib:"rgba(200,230,210,.06)",ibd:"rgba(120,200,150,.15)",ac:"#4caf6a",ag:"rgba(76,175,106,.25)",ab:"rgba(76,175,106,.12)",at:"#6fcf87",chb:"rgba(120,200,150,.08)",chc:"rgba(120,200,150,.12)",ob:"rgba(5,15,10,.65)",fb:"linear-gradient(145deg,#162e22,#1a3328)",dbg:"rgba(76,175,106,.04)",dbd:"rgba(120,200,150,.15)",sh:"rgba(0,0,0,.2)",sbg:"rgba(13,31,23,.95)"},
  rose:{name:"Роза",icon:"🌸",app:"linear-gradient(145deg,#fef5f7,#fce4ec,#f8d7e0)",hdr:"linear-gradient(135deg,rgba(252,228,236,.97),rgba(248,215,224,.95))",cbg:"rgba(255,255,255,.7)",cb:"rgba(200,120,150,.12)",tx:"#4a2030",tm:"rgba(74,32,48,.5)",td:"rgba(74,32,48,.3)",ib:"rgba(255,255,255,.6)",ibd:"rgba(200,120,150,.2)",ac:"#d4537a",ag:"rgba(212,83,122,.2)",ab:"rgba(212,83,122,.1)",at:"#c4446a",chb:"rgba(212,83,122,.06)",chc:"rgba(200,120,150,.12)",ob:"rgba(50,15,25,.4)",fb:"linear-gradient(145deg,#fff8fa,#fce4ec)",dbg:"rgba(212,83,122,.04)",dbd:"rgba(200,120,150,.2)",sh:"rgba(150,60,90,.06)",sbg:"rgba(252,228,236,.97)"},
  ocean:{name:"Океан",icon:"🌊",app:"linear-gradient(145deg,#0a1628,#0f2238,#132d46)",hdr:"linear-gradient(135deg,rgba(15,34,56,.95),rgba(19,45,70,.95))",cbg:"rgba(100,180,255,.04)",cb:"rgba(80,160,240,.12)",tx:"#d0e4f5",tm:"rgba(208,228,245,.5)",td:"rgba(208,228,245,.3)",ib:"rgba(100,180,255,.06)",ibd:"rgba(80,160,240,.18)",ac:"#3b9eff",ag:"rgba(59,158,255,.3)",ab:"rgba(59,158,255,.12)",at:"#6eb8ff",chb:"rgba(80,160,240,.08)",chc:"rgba(80,160,240,.12)",ob:"rgba(5,12,25,.65)",fb:"linear-gradient(145deg,#112a42,#0f2238)",dbg:"rgba(59,158,255,.04)",dbd:"rgba(80,160,240,.2)",sh:"rgba(0,0,0,.2)",sbg:"rgba(10,22,40,.95)"},
  lavender:{name:"Лаванда",icon:"💜",app:"linear-gradient(145deg,#f3eeff,#e8dff5,#ddd3ee)",hdr:"linear-gradient(135deg,rgba(232,223,245,.97),rgba(221,211,238,.95))",cbg:"rgba(255,255,255,.65)",cb:"rgba(150,120,200,.12)",tx:"#2d1f4e",tm:"rgba(45,31,78,.5)",td:"rgba(45,31,78,.3)",ib:"rgba(255,255,255,.55)",ibd:"rgba(150,120,200,.2)",ac:"#8b5cf6",ag:"rgba(139,92,246,.2)",ab:"rgba(139,92,246,.1)",at:"#7c3aed",chb:"rgba(139,92,246,.06)",chc:"rgba(150,120,200,.12)",ob:"rgba(30,15,50,.4)",fb:"linear-gradient(145deg,#f8f4ff,#e8dff5)",dbg:"rgba(139,92,246,.04)",dbd:"rgba(150,120,200,.2)",sh:"rgba(100,60,160,.06)",sbg:"rgba(232,223,245,.97)"}
};
var PRI={urgent:{l:"🔴 Срочно",c:"#ff4757",bg:"rgba(255,71,87,.08)",bd:"rgba(255,71,87,.25)"},high:{l:"🟠 Важно",c:"#ff9f43",bg:"rgba(255,159,67,.08)",bd:"rgba(255,159,67,.25)"},medium:{l:"🟡 Средне",c:"#feca57",bg:"rgba(254,202,87,.08)",bd:"rgba(254,202,87,.25)"},low:{l:"🟢 Не горит",c:"#2ed573",bg:"rgba(46,213,115,.08)",bd:"rgba(46,213,115,.25)"}};
var COLS=[{id:"todo",t:"К выполнению",ic:"📋",em:"Пусто"},{id:"inprogress",t:"В работе",ic:"⚡",em:"Пусто"},{id:"done",t:"Готово",ic:"✅",em:"Пусто"}];
var FI={xlsx:{i:"📊",c:"#2ed573",l:"Excel"},xls:{i:"📊",c:"#2ed573",l:"Excel"},csv:{i:"📊",c:"#2ed573",l:"CSV"},doc:{i:"📝",c:"#54a0ff",l:"Word"},docx:{i:"📝",c:"#54a0ff",l:"Word"},pdf:{i:"📕",c:"#ff4757",l:"PDF"},pptx:{i:"📙",c:"#ff9f43",l:"PPT"},png:{i:"🖼️",c:"#a29bfe",l:"Фото"},jpg:{i:"🖼️",c:"#a29bfe",l:"Фото"},jpeg:{i:"🖼️",c:"#a29bfe",l:"Фото"},zip:{i:"📦",c:"#feca57",l:"Архив"},txt:{i:"📄",c:"#dfe6e9",l:"Текст"}};
function gfi(n){var e=n.split(".").pop().toLowerCase();return FI[e]||{i:"📎",c:"#b2bec3",l:"Файл"};}
function fsz(b){return b<1024?b+" B":b<1048576?(b/1024).toFixed(1)+" KB":(b/1048576).toFixed(1)+" MB";}
function gid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,7);}
function esc(s){var d=document.createElement("div");d.textContent=s;return d.innerHTML;}
function fdt(d){if(!d)return"";var dt=new Date(d),now=new Date(),df=Math.ceil((dt-now)/864e5);if(df<0)return"⚠️ Просрочено";if(df===0)return"⏰ Сегодня";if(df===1)return"📅 Завтра";return"📅 "+dt.toLocaleDateString("ru-RU",{day:"numeric",month:"short"});}
function rdf(fl){return Promise.all(Array.from(fl).map(function(f){return new Promise(function(r){var rd=new FileReader();rd.onload=function(){r({name:f.name,size:f.size,type:f.type,dataUrl:rd.result});};rd.readAsDataURL(f);});}));}
function dlf(f){var a=document.createElement("a");a.href=f.dataUrl;a.download=f.name;document.body.appendChild(a);a.click();document.body.removeChild(a);}
function greet(){var h=new Date().getHours();return h<6?"Доброй ночи":h<12?"Доброе утро":h<18?"Добрый день":"Добрый вечер";}

// ============================================================
// STATE
// ============================================================
var currentUser = null;
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

var LS_PERSONAL = "wf-personal-v5";
var LS_THEME = "wf-theme";

function loadLocal(){
  try{var t=localStorage.getItem(LS_PERSONAL);if(t)personalTasks=JSON.parse(t);}catch(e){}
  try{var t=localStorage.getItem(LS_THEME);if(t&&THEMES[t])themeId=t;}catch(e){}
}
function savePersonal(){try{localStorage.setItem(LS_PERSONAL,JSON.stringify(personalTasks));}catch(e){}}
function saveTheme(){try{localStorage.setItem(LS_THEME,themeId);}catch(e){}}

function getAllTasks(){
  var all=[];
  if(showPersonal){
    for(var i=0;i<personalTasks.length;i++){
      var t=Object.assign({},personalTasks[i]);t._scope="personal";all.push(t);
    }
  }
  if(showShared){
    for(var i=0;i<sharedTasks.length;i++){
      var t=Object.assign({},sharedTasks[i]);t._scope="shared";all.push(t);
    }
  }
  return all;
}

function getFiltered(){
  var all=getAllTasks();
  return all.filter(function(t){
    if(activeFilter!=="all"&&t.priority!==activeFilter)return false;
    if(searchText){
      var q=searchText.toLowerCase();
      var inT=t.title.toLowerCase().indexOf(q)>=0;
      var inD=t.description&&t.description.toLowerCase().indexOf(q)>=0;
      var inF=(t.files||[]).some(function(f){return f.name.toLowerCase().indexOf(q)>=0;});
      if(!inT&&!inD&&!inF)return false;
    }
    return true;
  });
}

function getStats(){
  var all=getAllTasks();
  var s={total:all.length,done:0,over:0,files:0};
  for(var i=0;i<all.length;i++){
    if(all[i].column==="done")s.done++;
    if(all[i].deadline&&new Date(all[i].deadline)<new Date()&&all[i].column!=="done")s.over++;
    s.files+=(all[i].files||[]).length;
  }
  return s;
}

// ============================================================
// FIRESTORE SYNC
// ============================================================
function listenShared(){
  if(unsubFirestore)unsubFirestore();
  unsubFirestore=db.collection("shared-tasks").orderBy("createdAt","asc").onSnapshot(function(snap){
    sharedTasks=[];
    snap.forEach(function(doc){
      var d=doc.data();
      d.id=doc.id;
      d._scope="shared";
      sharedTasks.push(d);
    });
    if(activeTab==="planner")renderPlanner();
  });
}

function addSharedTask(task){
  return db.collection("shared-tasks").add(task);
}
function updateSharedTask(id,data){
  return db.collection("shared-tasks").doc(id).update(data);
}
function deleteSharedTask(id){
  return db.collection("shared-tasks").doc(id).delete();
}

// ============================================================
// AUTH
// ============================================================
function renderAuth(){
  var T=THEMES[themeId];
  document.getElementById("auth-screen").style.background=T.app;
  var card=document.getElementById("auth-card");
  card.style.background=T.fb;
  card.style.border="1px solid "+T.cb;
  card.style.boxShadow="0 24px 64px "+T.sh;

  var h='<span class="auth-logo">⬡</span>';
  h+='<h1 style="color:'+T.tx+'">WorkFlow</h1>';

  if(authMode==="login"){
    h+='<p class="sub" style="color:'+T.tm+'">Войдите в свой аккаунт</p>';
    h+='<input class="auth-input" id="a-email" style="border:1px solid '+T.ibd+';background:'+T.ib+';color:'+T.tx+'" placeholder="Email" type="email">';
    h+='<input class="auth-input" id="a-pass" style="border:1px solid '+T.ibd+';background:'+T.ib+';color:'+T.tx+'" placeholder="Пароль" type="password" onkeydown="if(event.key===\'Enter\')doLogin()">';
    h+='<button class="auth-btn" style="background:linear-gradient(135deg,'+T.ac+','+T.ac+'dd);box-shadow:0 4px 16px '+T.ag+'" onclick="doLogin()">Войти</button>';
    h+='<span class="auth-link" style="color:'+T.at+'" onclick="authMode=\'register\';renderAuth()">Нет аккаунта? Зарегистрироваться</span>';
  } else {
    h+='<p class="sub" style="color:'+T.tm+'">Создайте аккаунт</p>';
    h+='<input class="auth-input" id="a-name" style="border:1px solid '+T.ibd+';background:'+T.ib+';color:'+T.tx+'" placeholder="Ваше имя">';
    h+='<input class="auth-input" id="a-email" style="border:1px solid '+T.ibd+';background:'+T.ib+';color:'+T.tx+'" placeholder="Email" type="email">';
    h+='<input class="auth-input" id="a-pass" style="border:1px solid '+T.ibd+';background:'+T.ib+';color:'+T.tx+'" placeholder="Пароль (мин. 6 символов)" type="password">';
    h+='<input class="auth-input" id="a-code" style="border:1px solid '+T.ibd+';background:'+T.ib+';color:'+T.tx+'" placeholder="Код приглашения" onkeydown="if(event.key===\'Enter\')doRegister()">';
    h+='<button class="auth-btn" style="background:linear-gradient(135deg,'+T.ac+','+T.ac+'dd);box-shadow:0 4px 16px '+T.ag+'" onclick="doRegister()">Зарегистрироваться</button>';
    h+='<span class="auth-link" style="color:'+T.at+'" onclick="authMode=\'login\';renderAuth()">Уже есть аккаунт? Войти</span>';
  }
  h+='<div class="auth-err" id="a-err"></div>';
  card.innerHTML=h;
}

function showAuthError(msg){
  var el=document.getElementById("a-err");
  if(el)el.textContent=msg;
}

window.doLogin=function(){
  var email=(document.getElementById("a-email")||{}).value||"";
  var pass=(document.getElementById("a-pass")||{}).value||"";
  if(!email||!pass){showAuthError("Заполните все поля");return;}
  auth.signInWithEmailAndPassword(email,pass).catch(function(err){
    if(err.code==="auth/user-not-found")showAuthError("Пользователь не найден");
    else if(err.code==="auth/wrong-password"||err.code==="auth/invalid-credential")showAuthError("Неверный пароль");
    else showAuthError("Ошибка: "+err.message);
  });
};

window.doRegister=function(){
  var name=(document.getElementById("a-name")||{}).value||"";
  var email=(document.getElementById("a-email")||{}).value||"";
  var pass=(document.getElementById("a-pass")||{}).value||"";
  var code=(document.getElementById("a-code")||{}).value||"";
  if(!name||!email||!pass||!code){showAuthError("Заполните все поля");return;}
  if(code!==INVITE_CODE){showAuthError("Неверный код приглашения");return;}
  if(pass.length<6){showAuthError("Пароль минимум 6 символов");return;}
  auth.createUserWithEmailAndPassword(email,pass).then(function(cred){
    return cred.user.updateProfile({displayName:name});
  }).catch(function(err){
    if(err.code==="auth/email-already-in-use")showAuthError("Email уже зарегистрирован");
    else showAuthError("Ошибка: "+err.message);
  });
};

window.doLogout=function(){
  auth.signOut();
};

window.doChangePassword=function(){
  var np=(document.getElementById("new-pass")||{}).value||"";
  if(np.length<6){alert("Минимум 6 символов");return;}
  currentUser.updatePassword(np).then(function(){
    alert("Пароль изменён!");
  }).catch(function(err){
    alert("Ошибка: "+err.message+". Попробуйте перезайти и повторить.");
  });
};

// Auth state listener
auth.onAuthStateChanged(function(user){
  if(user){
    currentUser=user;
    document.getElementById("auth-screen").classList.add("hidden");
    document.getElementById("sidebar").style.display="";
    document.getElementById("panels").style.display="";
    loadLocal();
    listenShared();
    render();
  } else {
    currentUser=null;
    if(unsubFirestore){unsubFirestore();unsubFirestore=null;}
    document.getElementById("auth-screen").classList.remove("hidden");
    document.getElementById("sidebar").style.display="none";
    document.getElementById("panels").style.display="none";
    renderAuth();
  }
});

// ============================================================
// TASK ACTIONS
// ============================================================
window.deleteTask=function(id,scope){
  if(scope==="shared"){deleteSharedTask(id);}
  else{personalTasks=personalTasks.filter(function(t){return t.id!==id;});savePersonal();renderPlanner();}
};

window.moveTask=function(id,col,scope){
  if(scope==="shared"){
    var upd={column:col};
    if(col==="done")upd.completedAt=new Date().toISOString();else upd.completedAt=null;
    updateSharedTask(id,upd);
  } else {
    for(var i=0;i<personalTasks.length;i++){
      if(personalTasks[i].id===id){
        personalTasks[i].column=col;
        personalTasks[i].completedAt=col==="done"?new Date().toISOString():null;
        break;
      }
    }
    savePersonal();renderPlanner();
  }
};

window.removeFile=function(id,fi,scope){
  if(scope==="shared"){
    var t=sharedTasks.find(function(x){return x.id===id;});
    if(t&&t.files){var f=t.files.slice();f.splice(fi,1);updateSharedTask(id,{files:f});}
  } else {
    for(var i=0;i<personalTasks.length;i++){
      if(personalTasks[i].id===id&&personalTasks[i].files){personalTasks[i].files.splice(fi,1);break;}
    }
    savePersonal();renderPlanner();
  }
};

window.dlFile=function(id,fi,scope){
  var list=scope==="shared"?sharedTasks:personalTasks;
  var t=list.find(function(x){return x.id===id;});
  if(t&&t.files&&t.files[fi])dlf(t.files[fi]);
};

window.quickAttach=function(id,inp,scope){
  rdf(inp.files).then(function(nf){
    if(scope==="shared"){
      var t=sharedTasks.find(function(x){return x.id===id;});
      if(t){var f=(t.files||[]).concat(nf);updateSharedTask(id,{files:f});}
    } else {
      for(var i=0;i<personalTasks.length;i++){
        if(personalTasks[i].id===id){personalTasks[i].files=(personalTasks[i].files||[]).concat(nf);break;}
      }
      savePersonal();renderPlanner();
    }
  });
  inp.value="";
};

window.showPreview=function(id,fi,scope){
  var list=scope==="shared"?sharedTasks:personalTasks;
  var t=list.find(function(x){return x.id===id;});
  if(t&&t.files&&t.files[fi]){previewingFile=t.files[fi];renderPreviewModal();}
};

// ============================================================
// DRAG & DROP
// ============================================================
var dragInfo=null,dropInfo=null;
window.startDrag=function(id,scope,evt){
  var c=evt.target.closest(".card");if(!c)return;evt.preventDefault();
  var r=c.getBoundingClientRect(),g=c.cloneNode(true);
  g.className="card ghost";g.style.width=r.width+"px";g.style.left=r.left+"px";g.style.top=r.top+"px";
  document.body.appendChild(g);
  dragInfo={id:id,scope:scope,ghost:g,ox:evt.clientX-r.left,oy:evt.clientY-r.top};
  c.classList.add("dragging");
  document.addEventListener("pointermove",onDM);document.addEventListener("pointerup",onDU);
};
function onDM(e){
  if(!dragInfo)return;
  dragInfo.ghost.style.left=(e.clientX-dragInfo.ox)+"px";
  dragInfo.ghost.style.top=(e.clientY-dragInfo.oy)+"px";
  dropInfo=null;
  var cols=document.querySelectorAll(".col");
  for(var i=0;i<cols.length;i++){
    var r=cols[i].getBoundingClientRect();cols[i].classList.remove("dragover");
    if(e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom){
      cols[i].classList.add("dragover");
      dropInfo={col:cols[i].getAttribute("data-col")};
    }
  }
}
function onDU(){
  document.removeEventListener("pointermove",onDM);document.removeEventListener("pointerup",onDU);
  if(!dragInfo)return;
  dragInfo.ghost.remove();
  document.querySelectorAll(".card.dragging").forEach(function(el){el.classList.remove("dragging");});
  document.querySelectorAll(".col.dragover").forEach(function(el){el.classList.remove("dragover");});
  if(dropInfo){
    moveTask(dragInfo.id,dropInfo.col,dragInfo.scope);
  }
  dragInfo=null;dropInfo=null;
}

// ============================================================
// TAB SWITCHING
// ============================================================
window.switchTab=function(tab){
  activeTab=tab;
  var p1=document.getElementById("pnl-planner");
  var p2=document.getElementById("pnl-tools");
  var p3=document.getElementById("pnl-profile");
  p1.className="pnl "+(tab==="planner"?"act":"off-l");
  p2.className="pnl "+(tab==="tools"?"act":"off-r");
  p3.className="pnl "+(tab==="profile"?"act":"off-r");
  renderSidebar();
  if(tab==="profile")renderProfile();
};

window.setFilter=function(f){activeFilter=f;renderPlanner();};
window.setSearch=function(v){searchText=v;renderPlanner();};
window.togglePersonal=function(){showPersonal=!showPersonal;renderPlanner();};
window.toggleShared=function(){showShared=!showShared;renderPlanner();};

// ============================================================
// THEME PICKER
// ============================================================
window.openTP=function(evt){
  evt.stopPropagation();
  var old=document.getElementById("tpbg");if(old){old.remove();return;}
  var T=THEMES[themeId],rect=evt.currentTarget.getBoundingClientRect();
  var bg=document.createElement("div");bg.id="tpbg";bg.className="tp-bg";bg.onclick=function(){bg.remove();};
  var pk=document.createElement("div");pk.className="tp";
  pk.style.cssText="background:"+T.fb+";border:1px solid "+T.cb+";box-shadow:0 16px 48px "+T.sh+";left:"+(rect.right+8)+"px;bottom:"+(window.innerHeight-rect.bottom)+"px";
  pk.onclick=function(ev){ev.stopPropagation();};
  var h='<div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;padding:4px 8px 8px;color:'+T.tm+';border-bottom:1px solid '+T.cb+';margin-bottom:4px">Тема</div>';
  var keys=Object.keys(THEMES);
  for(var i=0;i<keys.length;i++){
    var k=keys[i],tm=THEMES[k],isA=themeId===k;
    h+='<button class="tp-opt" style="color:'+T.tx+';'+(isA?'background:'+T.ab:'')+'" data-t="'+k+'">';
    h+='<span style="font-size:20px">'+tm.icon+'</span><span style="flex:1;text-align:left">'+tm.name+'</span>';
    if(isA)h+='<span style="color:'+T.ac+';font-weight:700">✓</span>';
    h+='</button>';
  }
  pk.innerHTML=h;
  pk.addEventListener("click",function(e){var b=e.target.closest("[data-t]");if(b){themeId=b.getAttribute("data-t");saveTheme();bg.remove();render();}});
  bg.appendChild(pk);document.body.appendChild(bg);
};

// ============================================================
// RENDER SIDEBAR
// ============================================================
function renderSidebar(){
  var T=THEMES[themeId],el=document.getElementById("sidebar");
  el.style.background=T.sbg;el.style.borderRight="1px solid "+T.cb;
  var tabs=[
    {id:"planner",icon:"⬡",tip:"Планировщик"},
    {id:"tools",icon:"🔧",tip:"Инструменты"},
    {id:"profile",icon:"👤",tip:"Профиль"}
  ];
  var h='';
  for(var i=0;i<tabs.length;i++){
    var t=tabs[i],isA=activeTab===t.id;
    h+='<button class="sb '+(isA?'on':'')+'" style="background:'+(isA?T.ab:'transparent')+';color:'+(isA?T.ac:T.td)+';border:1px solid '+(isA?T.ac+'44':'transparent')+'" onclick="switchTab(\''+t.id+'\')">';
    h+=t.icon+'<span class="tip" style="background:'+T.fb+';color:'+T.tx+';border:1px solid '+T.cb+';box-shadow:0 4px 16px '+T.sh+'">'+t.tip+'</span></button>';
  }
  h+='<div style="flex:1"></div>';
  h+='<button class="sb" style="background:'+T.chb+';color:'+T.tx+';border:1px solid '+T.cb+'" onclick="openTP(event)">🎨<span class="tip" style="background:'+T.fb+';color:'+T.tx+';border:1px solid '+T.cb+';box-shadow:0 4px 16px '+T.sh+'">Темы</span></button>';
  h+='<button class="sb" style="background:transparent;color:#ff4757;border:1px solid transparent;margin-top:4px" onclick="doLogout()">🚪<span class="tip" style="background:'+T.fb+';color:#ff4757;border:1px solid '+T.cb+';box-shadow:0 4px 16px '+T.sh+'">Выйти</span></button>';
  el.innerHTML=h;
}

// ============================================================
// RENDER PLANNER
// ============================================================
function renderPlanner(){
  var T=THEMES[themeId],st=getStats(),now=new Date(),ft=getFiltered();
  var el=document.getElementById("pnl-planner");
  var userName=currentUser?currentUser.displayName||currentUser.email:"";
  var h='';
  // Header
  h+='<header style="background:'+T.hdr+';border-bottom:1px solid '+T.cb+';padding:20px 28px;backdrop-filter:blur(20px)">';
  h+='<div style="max-width:1280px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:14px">';
  h+='<div><h1 style="font-size:26px;font-weight:700;display:flex;align-items:center;gap:10px;color:'+T.tx+'"><span style="font-size:30px;color:'+T.ac+'">⬡</span> WorkFlow</h1>';
  h+='<p style="font-size:13px;color:'+T.tm+';margin-top:4px;font-weight:300">'+greet()+', '+esc(userName)+'</p></div>';
  h+='<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">';
  h+=statC(T,st.total,T.tx,"задач")+statC(T,st.done,"#2ed573","готово");
  if(st.files)h+=statC(T,st.files,"#54a0ff","файлов");
  if(st.over)h+='<div style="background:rgba(255,71,87,.12);border-radius:12px;padding:8px 14px;display:flex;flex-direction:column;align-items:center;min-width:56px"><span style="font-size:20px;font-weight:700;font-family:\'JetBrains Mono\',monospace;color:#ff4757">'+st.over+'</span><span style="font-size:10px;text-transform:uppercase;color:'+T.tm+'">просроч.</span></div>';
  if(st.total)h+='<div style="width:100px;height:6px;background:'+T.chc+';border-radius:3px;overflow:hidden"><div style="height:100%;width:'+(st.done/st.total*100)+'%;background:linear-gradient(90deg,'+T.ac+',#2ed573);border-radius:3px;transition:width .5s"></div></div>';
  h+='</div></div></header>';
  // Toolbar
  h+='<div style="max-width:1280px;margin:0 auto;padding:16px 28px;display:flex;gap:10px;align-items:center;flex-wrap:wrap">';
  // Toggles
  h+='<button class="tgl" style="background:'+(showPersonal?T.ab:'transparent')+';border:1px solid '+(showPersonal?T.ac+'66':T.cb)+';color:'+(showPersonal?T.at:T.tm)+'" onclick="togglePersonal()"><span class="dot" style="background:'+(showPersonal?T.ac:T.td)+'"></span>👤 Мои</button>';
  h+='<button class="tgl" style="background:'+(showShared?T.ab:'transparent')+';border:1px solid '+(showShared?T.ac+'66':T.cb)+';color:'+(showShared?T.at:T.tm)+'" onclick="toggleShared()"><span class="dot" style="background:'+(showShared?"#2ed573":T.td)+'"></span>👥 Общие</button>';
  h+='<div style="position:relative;flex:1 1 140px"><span style="position:absolute;left:12px;top:50%;transform:translateY(-50%);font-size:16px;color:'+T.td+'">⌕</span>';
  h+='<input style="width:100%;padding:9px 12px 9px 36px;border-radius:10px;border:1px solid '+T.ibd+';background:'+T.ib+';color:'+T.tx+';font-size:13px;outline:none" placeholder="Поиск…" value="'+esc(searchText)+'" oninput="setSearch(this.value)"></div>';
  // Filters
  var filters=[{id:"all",l:"Все"}];var pk=Object.keys(PRI);for(var i=0;i<pk.length;i++)filters.push({id:pk[i],l:PRI[pk[i]].l});
  h+='<div style="display:flex;gap:5px;flex-wrap:wrap">';
  for(var i=0;i<filters.length;i++){
    var f=filters[i],isA=activeFilter===f.id;
    h+='<button style="padding:6px 12px;border-radius:8px;border:1px solid '+(isA?T.ac+'66':T.cb)+';color:'+(isA?T.at:T.tm)+';background:'+(isA?T.ab:'transparent')+';font-size:11px;cursor:pointer" onclick="setFilter(\''+f.id+'\')">'+f.l+'</button>';
  }
  h+='</div>';
  h+='<button style="padding:9px 20px;border-radius:10px;border:none;background:linear-gradient(135deg,'+T.ac+','+T.ac+'dd);color:#fff;font-size:13px;font-weight:600;box-shadow:0 4px 16px '+T.ag+';cursor:pointer" onclick="openForm()">＋ Новая задача</button>';
  h+='</div>';
  // Board
  h+='<div class="board">';
  for(var ci=0;ci<COLS.length;ci++){
    var col=COLS[ci];var ct=ft.filter(function(t){return t.column===col.id;});
    h+='<div class="col" data-col="'+col.id+'" style="background:'+T.cbg+';border:1px solid '+T.cb+';outline-color:'+T.ac+'">';
    h+='<div style="display:flex;align-items:center;gap:8px;padding:4px 4px 12px;border-bottom:1px solid '+T.cb+';margin-bottom:10px"><span style="font-size:18px">'+col.ic+'</span><span style="font-size:14px;font-weight:600;flex:1;color:'+T.tx+'">'+col.t+'</span><span style="font-size:11px;font-weight:600;background:'+T.chc+';border-radius:6px;padding:2px 7px;font-family:\'JetBrains Mono\',monospace;color:'+T.tx+'">'+ct.length+'</span></div>';
    h+='<div class="col-body">';
    if(!ct.length)h+='<div style="text-align:center;font-size:12px;padding:30px 10px;font-style:italic;color:'+T.td+'">'+col.em+'</div>';
    for(var ti=0;ti<ct.length;ti++)h+=renderCard(T,ct[ti]);
    h+='</div></div>';
  }
  h+='</div>';
  el.innerHTML=h;
}

function statC(T,n,c,l){return '<div style="background:'+T.chb+';border-radius:12px;padding:8px 14px;display:flex;flex-direction:column;align-items:center;min-width:56px"><span style="font-size:20px;font-weight:700;font-family:\'JetBrains Mono\',monospace;color:'+c+'">'+n+'</span><span style="font-size:10px;text-transform:uppercase;letter-spacing:.05em;margin-top:2px;color:'+T.tm+'">'+l+'</span></div>';}

function renderCard(T,task){
  var p=PRI[task.priority]||PRI.medium;var dl=fdt(task.deadline);
  var ov=task.deadline&&new Date(task.deadline)<new Date()&&task.column!=="done";
  var files=task.files||[];var isDone=task.column==="done";
  var sc=task._scope||"personal";
  var scopeColor=sc==="shared"?"#2ed573":"#54a0ff";
  var scopeLabel=sc==="shared"?"👥 Общая":"👤 Личная";
  var authorName=task.authorName||"";

  var h='<div class="card" data-tid="'+task.id+'" style="border-left:3px solid '+p.c+';background:'+p.bg+';border-right:1px solid '+T.cb+';border-top:1px solid '+T.cb+';border-bottom:1px solid '+T.cb+';box-shadow:0 2px 8px '+T.sh+';'+(isDone?'opacity:.55':'')+'">';
  h+='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">';
  h+='<div style="display:flex;align-items:center;gap:5px">';
  h+='<span class="dh" onpointerdown="startDrag(\''+task.id+'\',\''+sc+'\',event)">⠿</span>';
  h+='<span style="font-size:10px;padding:2px 7px;border-radius:5px;font-weight:500;background:'+p.bd+';color:'+p.c+'">'+p.l+'</span>';
  h+='<span class="scope-badge" style="background:'+scopeColor+'22;color:'+scopeColor+'">'+scopeLabel+'</span>';
  h+='</div>';
  h+='<div style="display:flex;gap:3px">';
  h+='<button style="background:none;border:none;color:'+T.td+';font-size:13px;padding:2px 5px;cursor:pointer" onclick="document.getElementById(\'fi-'+task.id+'\').click()">📎</button>';
  h+='<button style="background:none;border:none;color:'+T.td+';font-size:13px;padding:2px 5px;cursor:pointer" onclick="openForm(\''+task.id+'\',\''+sc+'\')">✎</button>';
  h+='<button style="background:none;border:none;color:#ff4757;font-size:13px;padding:2px 5px;cursor:pointer" onclick="deleteTask(\''+task.id+'\',\''+sc+'\')">✕</button>';
  h+='<input type="file" multiple id="fi-'+task.id+'" style="display:none" onchange="quickAttach(\''+task.id+'\',this,\''+sc+'\')">';
  h+='</div></div>';
  h+='<h3 style="font-size:13px;font-weight:600;line-height:1.4;margin-bottom:3px;color:'+T.tx+';'+(isDone?'text-decoration:line-through':'')+'">'+esc(task.title)+'</h3>';
  if(task.description)h+='<p style="font-size:11px;line-height:1.5;margin-bottom:6px;color:'+T.tm+'">'+esc(task.description)+'</p>';
  if(authorName)h+='<div class="author-tag" style="color:'+T.td+';margin-bottom:4px">✍ '+esc(authorName)+'</div>';
  if(files.length){
    h+='<div style="display:flex;flex-direction:column;gap:5px;margin-top:6px;margin-bottom:3px">';
    for(var fi=0;fi<files.length;fi++){
      var f=files[fi],finfo=gfi(f.name);
      h+='<div class="fchip" style="background:'+T.chb+';border:1px solid '+T.cb+'"><div style="width:26px;height:26px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:13px;background:'+finfo.c+'22;color:'+finfo.c+';flex-shrink:0">'+finfo.i+'</div><div style="flex:1;min-width:0;cursor:pointer" onclick="showPreview(\''+task.id+'\','+fi+',\''+sc+'\')"><div style="font-size:11px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:'+T.tx+'">'+esc(f.name)+'</div><div style="font-size:9px;color:'+T.td+'">'+finfo.l+' · '+fsz(f.size)+'</div></div><button style="background:none;border:none;color:'+T.td+';cursor:pointer;font-size:12px;padding:2px 4px" onclick="dlFile(\''+task.id+'\','+fi+',\''+sc+'\')">⬇</button><button style="background:none;border:none;color:rgba(255,71,87,.5);cursor:pointer;font-size:11px;padding:2px 4px" onclick="removeFile(\''+task.id+'\','+fi+',\''+sc+'\')">✕</button></div>';
    }
    h+='</div>';
  }
  h+='<div style="display:flex;justify-content:space-between;align-items:center;margin-top:5px">';
  h+=dl?'<span style="font-size:10px;color:'+(ov?'#ff4757':T.tm)+';font-weight:'+(ov?600:400)+'">'+dl+'</span>':'<span></span>';
  h+='<div style="display:flex;gap:4px">';
  for(var ci=0;ci<COLS.length;ci++){
    if(COLS[ci].id!==task.column)h+='<button style="background:'+T.chb+';border:1px solid '+T.cb+';border-radius:6px;padding:3px 7px;font-size:12px;cursor:pointer" onclick="moveTask(\''+task.id+'\',\''+COLS[ci].id+'\',\''+sc+'\')">'+COLS[ci].ic+'</button>';
  }
  h+='</div></div></div>';
  return h;
}

// ============================================================
// FORM
// ============================================================
window.openForm=function(id,scope){
  if(id){
    var list=scope==="shared"?sharedTasks:personalTasks;
    editingTask=list.find(function(t){return t.id===id;});
    if(editingTask)editingTask._scope=scope;
  } else {
    editingTask=null;
  }
  formPriority=editingTask?editingTask.priority:"medium";
  formFileList=editingTask&&editingTask.files?editingTask.files.slice():[];
  formScope=editingTask?(editingTask._scope||"shared"):"shared";
  renderForm();
};

window.closeForm=function(){var o=document.getElementById("fov");if(o)o.remove();editingTask=null;formFileList=[];};
window.selectPriority=function(p){formPriority=p;var btns=document.querySelectorAll("#fpr [data-p]");for(var i=0;i<btns.length;i++){var k=btns[i].getAttribute("data-p"),c=PRI[k];btns[i].style.background=(k===p)?c.bg:"transparent";btns[i].style.boxShadow=(k===p)?"0 0 0 2px "+c.c:"none";}};
window.setScope=function(s){formScope=s;var btns=document.querySelectorAll("[data-sc]");var T=THEMES[themeId];for(var i=0;i<btns.length;i++){var v=btns[i].getAttribute("data-sc");btns[i].style.background=(v===s)?T.ab:"transparent";btns[i].style.borderColor=(v===s)?T.ac+"66":T.cb;}};
window.formAddFiles=function(fl){rdf(fl).then(function(nf){formFileList=formFileList.concat(nf);updateFF();});};
window.formRmFile=function(i){formFileList.splice(i,1);updateFF();};

function updateFF(){
  var T=THEMES[themeId],el=document.getElementById("ffl");if(!el)return;
  if(!formFileList.length){el.innerHTML="";return;}
  var h='';
  for(var i=0;i<formFileList.length;i++){
    var f=formFileList[i],fi=gfi(f.name);
    h+='<div style="display:flex;align-items:center;gap:8px;padding:7px 9px;border-radius:10px;background:'+T.ib+';border:1px solid '+T.cb+';margin-top:5px"><span style="font-size:16px">'+fi.i+'</span><div style="flex:1;min-width:0"><div style="font-size:12px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:'+T.tx+'">'+esc(f.name)+'</div><div style="font-size:10px;color:'+T.td+'">'+fsz(f.size)+'</div></div><button onclick="formRmFile('+i+')" style="background:none;border:none;color:rgba(255,71,87,.6);cursor:pointer;font-size:13px;padding:2px 5px">✕</button></div>';
  }
  el.innerHTML=h;
}

window.submitForm=function(){
  var ti=document.getElementById("fti");if(!ti||!ti.value.trim())return;
  var title=ti.value.trim();
  var desc=(document.getElementById("fde")||{}).value||"";desc=desc.trim();
  var deadline=(document.getElementById("fdl")||{}).value||null;
  var userName=currentUser?(currentUser.displayName||currentUser.email):"";

  if(editingTask){
    var data={title:title,description:desc,priority:formPriority,deadline:deadline,files:formFileList};
    if(editingTask._scope==="shared"){
      updateSharedTask(editingTask.id,data);
    } else {
      var t=personalTasks.find(function(x){return x.id===editingTask.id;});
      if(t)Object.assign(t,data);
      savePersonal();
    }
  } else {
    var task={title:title,description:desc,priority:formPriority,deadline:deadline,files:formFileList,column:"todo",createdAt:new Date().toISOString(),authorName:userName,authorId:currentUser?currentUser.uid:""};
    if(formScope==="shared"){
      addSharedTask(task);
    } else {
      task.id=gid();
      personalTasks.push(task);
      savePersonal();
    }
  }
  closeForm();
  if(activeTab==="planner")renderPlanner();
};

function renderForm(){
  var T=THEMES[themeId],t=editingTask;
  var ov=document.createElement("div");ov.id="fov";ov.className="overlay";ov.style.background=T.ob;
  ov.onclick=function(e){if(e.target===ov)closeForm();};
  var h='<div class="fcard" style="background:'+T.fb+';border:1px solid '+T.cb+';box-shadow:0 24px 64px '+T.sh+'" onclick="event.stopPropagation()">';
  h+='<h2 style="font-size:20px;font-weight:700;margin-bottom:18px;color:'+T.tx+'">'+(t?"✎ Редактировать":"＋ Новая задача")+'</h2>';

  // Scope selector (only for new tasks)
  if(!t){
    h+='<label class="flbl" style="color:'+T.tm+'">Тип задачи</label>';
    h+='<div style="display:flex;gap:8px;margin-bottom:4px">';
    h+='<button data-sc="shared" style="flex:1;padding:10px;border-radius:10px;border:1px solid '+(formScope==="shared"?T.ac+"66":T.cb)+';background:'+(formScope==="shared"?T.ab:'transparent')+';color:'+T.tx+';font-size:13px;cursor:pointer" onclick="setScope(\'shared\')">👥 Общая</button>';
    h+='<button data-sc="personal" style="flex:1;padding:10px;border-radius:10px;border:1px solid '+(formScope==="personal"?T.ac+"66":T.cb)+';background:'+(formScope==="personal"?T.ab:'transparent')+';color:'+T.tx+';font-size:13px;cursor:pointer" onclick="setScope(\'personal\')">👤 Личная</button>';
    h+='</div>';
  }

  h+='<label class="flbl" style="color:'+T.tm+'">Название*</label>';
  h+='<input class="finp" id="fti" style="border:1px solid '+T.ibd+';background:'+T.ib+';color:'+T.tx+'" value="'+esc(t?t.title:"")+'" placeholder="Что нужно сделать?" onkeydown="if(event.key===\'Enter\')submitForm()">';
  h+='<label class="flbl" style="color:'+T.tm+'">Описание</label>';
  h+='<textarea class="finp" id="fde" style="border:1px solid '+T.ibd+';background:'+T.ib+';color:'+T.tx+';min-height:64px;resize:vertical" placeholder="Детали…">'+esc(t?(t.description||""):"")+'</textarea>';
  h+='<label class="flbl" style="color:'+T.tm+'">Приоритет</label>';
  h+='<div style="display:flex;gap:7px;flex-wrap:wrap" id="fpr">';
  var pkeys=Object.keys(PRI);for(var i=0;i<pkeys.length;i++){var k=pkeys[i],c=PRI[k],isA=formPriority===k;h+='<button data-p="'+k+'" style="padding:6px 12px;border-radius:8px;border:1px solid '+c.c+';color:'+T.tx+';background:'+(isA?c.bg:'transparent')+';font-size:11px;cursor:pointer;'+(isA?'box-shadow:0 0 0 2px '+c.c:'')+'" onclick="selectPriority(\''+k+'\')">'+c.l+'</button>';}
  h+='</div>';
  h+='<label class="flbl" style="color:'+T.tm+'">Дедлайн</label>';
  h+='<input class="finp" id="fdl" type="date" style="border:1px solid '+T.ibd+';background:'+T.ib+';color:'+T.tx+'" value="'+(t?(t.deadline||""):"")+'">';
  h+='<label class="flbl" style="color:'+T.tm+'">Файлы</label>';
  h+='<div style="border:2px dashed '+T.dbd+';border-radius:14px;padding:24px 16px;text-align:center;background:'+T.dbg+';cursor:pointer" onclick="document.getElementById(\'ffin\').click()" ondragover="event.preventDefault()" ondrop="event.preventDefault();formAddFiles(event.dataTransfer.files)">';
  h+='<input type="file" multiple id="ffin" style="display:none" onchange="formAddFiles(this.files);this.value=\'\'">';
  h+='<div style="font-size:32px;margin-bottom:6px">📁</div><div style="font-size:13px;color:'+T.tm+'">Перетащи файлы или нажми</div></div>';
  h+='<div id="ffl"></div>';
  h+='<div style="display:flex;gap:10px;margin-top:24px;justify-content:flex-end">';
  h+='<button style="padding:9px 20px;border-radius:10px;border:1px solid '+T.ibd+';background:transparent;color:'+T.tm+';font-size:13px;cursor:pointer" onclick="closeForm()">Отмена</button>';
  h+='<button style="padding:9px 24px;border-radius:10px;border:none;background:linear-gradient(135deg,'+T.ac+','+T.ac+'dd);color:#fff;font-size:13px;font-weight:600;box-shadow:0 4px 16px '+T.ag+';cursor:pointer" onclick="submitForm()">'+(t?"Сохранить":"Создать")+'</button>';
  h+='</div></div>';
  ov.innerHTML=h;document.body.appendChild(ov);
  if(formFileList.length)setTimeout(updateFF,10);
  setTimeout(function(){var el=document.getElementById("fti");if(el)el.focus();},50);
}

// ============================================================
// PROFILE
// ============================================================
function renderProfile(){
  var T=THEMES[themeId],el=document.getElementById("pnl-profile");
  var name=currentUser?(currentUser.displayName||""):"";
  var email=currentUser?currentUser.email:"";
  var h='<div style="padding:32px"><div style="max-width:500px;margin:0 auto">';
  h+='<h1 style="font-size:26px;font-weight:700;margin-bottom:24px;color:'+T.tx+';display:flex;align-items:center;gap:10px"><span style="font-size:30px">👤</span> Профиль</h1>';
  h+='<div style="background:'+T.cbg+';border:1px solid '+T.cb+';border-radius:16px;padding:24px">';
  h+='<div style="font-size:18px;font-weight:600;color:'+T.tx+';margin-bottom:4px">'+esc(name)+'</div>';
  h+='<div style="font-size:13px;color:'+T.tm+';margin-bottom:20px">'+esc(email)+'</div>';
  h+='<div style="border-top:1px solid '+T.cb+';padding-top:20px">';
  h+='<h3 style="font-size:15px;font-weight:600;color:'+T.tx+';margin-bottom:12px">🔒 Сменить пароль</h3>';
  h+='<input class="finp" id="new-pass" type="password" style="border:1px solid '+T.ibd+';background:'+T.ib+';color:'+T.tx+';margin-bottom:12px" placeholder="Новый пароль (мин. 6 символов)">';
  h+='<button style="padding:10px 24px;border-radius:10px;border:none;background:linear-gradient(135deg,'+T.ac+','+T.ac+'dd);color:#fff;font-size:13px;font-weight:600;cursor:pointer;box-shadow:0 4px 16px '+T.ag+'" onclick="doChangePassword()">Изменить пароль</button>';
  h+='</div></div>';
  h+='<p style="font-size:12px;color:'+T.td+';margin-top:16px;text-align:center">Код приглашения для новых коллег: <strong style="color:'+T.at+'">'+INVITE_CODE+'</strong></p>';
  h+='</div></div>';
  el.innerHTML=h;
}

// ============================================================
// TOOLS
// ============================================================
function renderTools(){
  var T=THEMES[themeId],el=document.getElementById("pnl-tools");
  var h='<div class="tools-page"><div class="tools-inner">';
  h+='<h1 style="font-size:26px;font-weight:700;margin-bottom:8px;display:flex;align-items:center;gap:10px;color:'+T.tx+'"><span style="font-size:30px">🔧</span> Инструменты</h1>';
  h+='<p style="font-size:14px;margin-bottom:28px;font-weight:300;color:'+T.tm+'">Полезные утилиты для работы с текстом</p>';
  h+='<div class="tcard" style="background:'+T.cbg+';border:1px solid '+T.cb+'">';
  h+='<h3 style="font-size:18px;font-weight:600;margin-bottom:6px;display:flex;align-items:center;gap:8px;color:'+T.tx+'">📝 Перенос слов в столбик</h3>';
  h+='<p style="font-size:13px;margin-bottom:16px;color:'+T.tm+'">Разбивает строку на столбик по разделителю. Убирает запятые и лишние пробелы.</p>';
  h+='<div class="topts"><label style="color:'+T.tx+'">Разделитель: <input id="tsep" style="width:80px;padding:7px 10px;border-radius:8px;border:1px solid '+T.ibd+';background:'+T.ib+';color:'+T.tx+';font-size:13px;outline:none;text-align:center" value=" "></label>';
  h+='<label style="color:'+T.tx+'"><input type="checkbox" id="trmc" checked> Убрать запятые</label>';
  h+='<label style="color:'+T.tx+'"><input type="checkbox" id="tcap"> С заглавной</label>';
  h+='<label style="color:'+T.tx+'"><input type="checkbox" id="ttrm" checked> Убрать пробелы</label></div>';
  h+='<div class="trow"><div class="tcol"><label style="color:'+T.tm+';font-size:11px;text-transform:uppercase;letter-spacing:.06em;margin-bottom:5px;display:block">Введите текст</label><textarea class="tta" id="tinp" style="border:1px solid '+T.ibd+';background:'+T.ib+';color:'+T.tx+'" placeholder="Например: яблоко, банан, апельсин"></textarea></div>';
  h+='<div class="tcol"><label style="color:'+T.tm+';font-size:11px;text-transform:uppercase;letter-spacing:.06em;margin-bottom:5px;display:block">Результат</label><textarea class="tta" id="tout" style="border:1px solid '+T.ibd+';background:'+T.ib+';color:'+T.tx+'" readonly placeholder="Результат"></textarea><div id="tcnt" style="font-size:12px;margin-top:6px;color:'+T.td+'"></div></div></div>';
  h+='<div style="display:flex;gap:10px;margin-top:16px;flex-wrap:wrap">';
  h+='<button class="tbtn" style="background:linear-gradient(135deg,'+T.ac+','+T.ac+'dd);box-shadow:0 4px 16px '+T.ag+'" onclick="runTool()">Перенести</button>';
  h+='<button class="tbtn2" style="background:'+T.ab+';color:'+T.at+'" onclick="copyTool()">📋 Скопировать</button>';
  h+='<button class="tbtn2" style="background:'+T.chb+';color:'+T.tm+'" onclick="clearTool()">Очистить</button>';
  h+='<button class="tbtn2" style="background:'+T.chb+';color:'+T.tm+'" onclick="demoTool()">Демо</button>';
  h+='</div></div></div></div>';
  el.innerHTML=h;
}
window.runTool=function(){var inp=document.getElementById("tinp"),sep=document.getElementById("tsep"),rmc=document.getElementById("trmc"),cap=document.getElementById("tcap"),trm=document.getElementById("ttrm");if(!inp)return;var text=inp.value,sv=sep?(sep.value||" "):" ";if(rmc&&rmc.checked)text=text.replace(/,/g," ");var parts=text.split(sv),res=[];for(var i=0;i<parts.length;i++){var s=parts[i].trim();if(!s)continue;if(trm&&trm.checked)s=s.replace(/\s+/g," ").trim();if(cap&&cap.checked)s=s.charAt(0).toUpperCase()+s.slice(1);res.push(s);}var out=document.getElementById("tout"),cnt=document.getElementById("tcnt");if(out)out.value=res.join("\n");if(cnt)cnt.textContent="Строк: "+res.length;};
window.copyTool=function(){var o=document.getElementById("tout");if(o&&o.value)navigator.clipboard.writeText(o.value).catch(function(){o.select();document.execCommand("copy");});};
window.clearTool=function(){var i=document.getElementById("tinp"),o=document.getElementById("tout"),c=document.getElementById("tcnt");if(i)i.value="";if(o)o.value="";if(c)c.textContent="";};
window.demoTool=function(){var i=document.getElementById("tinp");if(i)i.value="яблоко, банан, апельсин, манго, виноград, персик, ананас, киви";runTool();};

// ============================================================
// PREVIEW MODAL
// ============================================================
function renderPreviewModal(){
  if(!previewingFile)return;var T=THEMES[themeId],fi=gfi(previewingFile.name),isImg=previewingFile.type&&previewingFile.type.indexOf("image/")===0;
  var ov=document.createElement("div");ov.id="pvov";ov.className="overlay";ov.style.background=T.ob;
  ov.onclick=function(){ov.remove();previewingFile=null;};
  var h='<div style="background:'+T.fb+';border:1px solid '+T.cb+';box-shadow:0 24px 64px '+T.sh+';border-radius:20px;padding:24px;width:100%;max-width:600px" onclick="event.stopPropagation()">';
  h+='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:12px"><div style="display:flex;align-items:center;gap:10px"><span style="font-size:28px">'+fi.i+'</span><div><div style="font-weight:600;font-size:15px;color:'+T.tx+'">'+esc(previewingFile.name)+'</div><div style="font-size:11px;color:'+T.tm+'">'+fsz(previewingFile.size)+'</div></div></div>';
  h+='<div style="display:flex;gap:8px"><button style="padding:7px 16px;border-radius:8px;border:none;background:'+T.ab+';color:'+T.at+';font-size:12px;font-weight:500;cursor:pointer" onclick="dlf(previewingFile)">⬇ Скачать</button><button style="padding:7px 11px;border-radius:8px;border:1px solid '+T.ibd+';background:transparent;color:'+T.tm+';font-size:15px;cursor:pointer" onclick="document.getElementById(\'pvov\').remove();previewingFile=null">✕</button></div></div>';
  if(isImg)h+='<img src="'+previewingFile.dataUrl+'" style="max-width:100%;max-height:70vh;border-radius:12px">';
  else h+='<div style="text-align:center;padding:36px 20px"><div style="font-size:56px;margin-bottom:14px">'+fi.i+'</div><p style="color:'+T.tm+'">Предпросмотр недоступен</p></div>';
  h+='</div>';ov.innerHTML=h;document.body.appendChild(ov);
}

// ============================================================
// MAIN RENDER
// ============================================================
function render(){
  var T=THEMES[themeId];
  document.body.style.background=T.app;
  document.body.style.color=T.tx;
  renderSidebar();
  renderPlanner();
  renderTools();
}

// ============================================================
// INIT
// ============================================================
loadLocal();
renderAuth();
