// ============================================================
// THEMES — 8 glassmorphism-optimized themes
// ============================================================
var THEMES = {
  midnight: {
    name:"Полночь", icon:"🌙",
    app:"linear-gradient(145deg,#0a0a18,#141428,#0f1a30)",
    hdr:"rgba(15,15,35,.75)",
    cbg:"rgba(255,255,255,.03)",
    cb:"rgba(255,255,255,.08)",
    tx:"#eaeaf4",
    tm:"rgba(255,255,255,.5)",
    td:"rgba(255,255,255,.3)",
    ib:"rgba(255,255,255,.04)",
    ibd:"rgba(255,255,255,.12)",
    ac:"#7c5cff",
    ag:"rgba(124,92,255,.35)",
    ab:"rgba(124,92,255,.15)",
    at:"#b8a4ff",
    chb:"rgba(255,255,255,.05)",
    chc:"rgba(255,255,255,.1)",
    ob:"rgba(0,0,0,.7)",
    fb:"rgba(20,20,45,.85)",
    dbg:"rgba(255,255,255,.02)",
    dbd:"rgba(255,255,255,.15)",
    sh:"rgba(0,0,0,.2)",
    sbg:"rgba(10,10,24,.85)"
  },
  cream: {
    name:"Крем", icon:"🍦",
    app:"linear-gradient(145deg,#fdf6ee,#f5ebe0,#f0e4d4)",
    hdr:"rgba(245,235,224,.7)",
    cbg:"rgba(255,255,255,.5)",
    cb:"rgba(180,160,130,.18)",
    tx:"#3d2c1e",
    tm:"rgba(61,44,30,.55)",
    td:"rgba(61,44,30,.35)",
    ib:"rgba(255,255,255,.5)",
    ibd:"rgba(180,160,130,.3)",
    ac:"#c47f42",
    ag:"rgba(196,127,66,.3)",
    ab:"rgba(196,127,66,.12)",
    at:"#a0632e",
    chb:"rgba(196,127,66,.08)",
    chc:"rgba(180,160,130,.18)",
    ob:"rgba(60,40,20,.5)",
    fb:"rgba(250,243,235,.85)",
    dbg:"rgba(196,127,66,.04)",
    dbd:"rgba(180,160,130,.3)",
    sh:"rgba(120,90,50,.1)",
    sbg:"rgba(240,228,212,.85)"
  },
  snow: {
    name:"Снег", icon:"❄️",
    app:"linear-gradient(145deg,#fff,#f4f6f9,#eef1f5)",
    hdr:"rgba(255,255,255,.7)",
    cbg:"rgba(255,255,255,.6)",
    cb:"rgba(0,0,0,.07)",
    tx:"#1a1a2e",
    tm:"rgba(26,26,46,.5)",
    td:"rgba(26,26,46,.3)",
    ib:"rgba(0,0,0,.03)",
    ibd:"rgba(0,0,0,.1)",
    ac:"#4a6cf7",
    ag:"rgba(74,108,247,.25)",
    ab:"rgba(74,108,247,.08)",
    at:"#3b5de7",
    chb:"rgba(0,0,0,.04)",
    chc:"rgba(0,0,0,.07)",
    ob:"rgba(0,0,0,.4)",
    fb:"rgba(255,255,255,.85)",
    dbg:"rgba(74,108,247,.03)",
    dbd:"rgba(0,0,0,.12)",
    sh:"rgba(0,0,0,.08)",
    sbg:"rgba(244,246,249,.85)"
  },
  charcoal: {
    name:"Уголь", icon:"🖤",
    app:"linear-gradient(145deg,#18181a,#252527,#202022)",
    hdr:"rgba(35,35,38,.75)",
    cbg:"rgba(255,255,255,.04)",
    cb:"rgba(255,255,255,.08)",
    tx:"#e5e5e7",
    tm:"rgba(229,229,231,.5)",
    td:"rgba(229,229,231,.3)",
    ib:"rgba(255,255,255,.06)",
    ibd:"rgba(255,255,255,.12)",
    ac:"#ff9f0a",
    ag:"rgba(255,159,10,.3)",
    ab:"rgba(255,159,10,.12)",
    at:"#ffb340",
    chb:"rgba(255,255,255,.06)",
    chc:"rgba(255,255,255,.1)",
    ob:"rgba(0,0,0,.65)",
    fb:"rgba(35,35,38,.85)",
    dbg:"rgba(255,159,10,.04)",
    dbd:"rgba(255,255,255,.12)",
    sh:"rgba(0,0,0,.25)",
    sbg:"rgba(24,24,26,.85)"
  },
  forest: {
    name:"Лес", icon:"🌲",
    app:"linear-gradient(145deg,#0a1a12,#102818,#15301f)",
    hdr:"rgba(16,40,24,.75)",
    cbg:"rgba(200,230,210,.04)",
    cb:"rgba(120,200,150,.12)",
    tx:"#d4e8dc",
    tm:"rgba(212,232,220,.5)",
    td:"rgba(212,232,220,.3)",
    ib:"rgba(200,230,210,.06)",
    ibd:"rgba(120,200,150,.18)",
    ac:"#4caf6a",
    ag:"rgba(76,175,106,.3)",
    ab:"rgba(76,175,106,.12)",
    at:"#6fcf87",
    chb:"rgba(120,200,150,.08)",
    chc:"rgba(120,200,150,.14)",
    ob:"rgba(5,15,10,.7)",
    fb:"rgba(18,38,26,.85)",
    dbg:"rgba(76,175,106,.04)",
    dbd:"rgba(120,200,150,.18)",
    sh:"rgba(0,0,0,.25)",
    sbg:"rgba(10,26,18,.85)"
  },
  rose: {
    name:"Роза", icon:"🌸",
    app:"linear-gradient(145deg,#fef5f7,#fce4ec,#f8d7e0)",
    hdr:"rgba(252,228,236,.7)",
    cbg:"rgba(255,255,255,.5)",
    cb:"rgba(200,120,150,.14)",
    tx:"#4a2030",
    tm:"rgba(74,32,48,.5)",
    td:"rgba(74,32,48,.3)",
    ib:"rgba(255,255,255,.5)",
    ibd:"rgba(200,120,150,.25)",
    ac:"#d4537a",
    ag:"rgba(212,83,122,.25)",
    ab:"rgba(212,83,122,.1)",
    at:"#c4446a",
    chb:"rgba(212,83,122,.06)",
    chc:"rgba(200,120,150,.14)",
    ob:"rgba(50,15,25,.45)",
    fb:"rgba(255,245,248,.85)",
    dbg:"rgba(212,83,122,.04)",
    dbd:"rgba(200,120,150,.25)",
    sh:"rgba(150,60,90,.08)",
    sbg:"rgba(252,228,236,.85)"
  },
  ocean: {
    name:"Океан", icon:"🌊",
    app:"linear-gradient(145deg,#081520,#0d2035,#112a42)",
    hdr:"rgba(13,32,53,.75)",
    cbg:"rgba(100,180,255,.04)",
    cb:"rgba(80,160,240,.14)",
    tx:"#d0e4f5",
    tm:"rgba(208,228,245,.5)",
    td:"rgba(208,228,245,.3)",
    ib:"rgba(100,180,255,.06)",
    ibd:"rgba(80,160,240,.2)",
    ac:"#3b9eff",
    ag:"rgba(59,158,255,.35)",
    ab:"rgba(59,158,255,.12)",
    at:"#6eb8ff",
    chb:"rgba(80,160,240,.08)",
    chc:"rgba(80,160,240,.14)",
    ob:"rgba(5,12,25,.7)",
    fb:"rgba(14,30,50,.85)",
    dbg:"rgba(59,158,255,.04)",
    dbd:"rgba(80,160,240,.22)",
    sh:"rgba(0,0,0,.25)",
    sbg:"rgba(8,21,32,.85)"
  },
  lavender: {
    name:"Лаванда", icon:"💜",
    app:"linear-gradient(145deg,#f3eeff,#e8dff5,#ddd3ee)",
    hdr:"rgba(232,223,245,.7)",
    cbg:"rgba(255,255,255,.45)",
    cb:"rgba(150,120,200,.14)",
    tx:"#2d1f4e",
    tm:"rgba(45,31,78,.5)",
    td:"rgba(45,31,78,.3)",
    ib:"rgba(255,255,255,.45)",
    ibd:"rgba(150,120,200,.25)",
    ac:"#8b5cf6",
    ag:"rgba(139,92,246,.25)",
    ab:"rgba(139,92,246,.1)",
    at:"#7c3aed",
    chb:"rgba(139,92,246,.06)",
    chc:"rgba(150,120,200,.14)",
    ob:"rgba(30,15,50,.45)",
    fb:"rgba(245,240,255,.85)",
    dbg:"rgba(139,92,246,.04)",
    dbd:"rgba(150,120,200,.25)",
    sh:"rgba(100,60,160,.08)",
    sbg:"rgba(232,223,245,.85)"
  }
};

// ============================================================
// PRIORITIES
// ============================================================
var PRI = {
  urgent: {l:"🔴 Срочно",  c:"#ff4757", bg:"rgba(255,71,87,.08)",  bd:"rgba(255,71,87,.25)"},
  high:   {l:"🟠 Важно",   c:"#ff9f43", bg:"rgba(255,159,67,.08)", bd:"rgba(255,159,67,.25)"},
  medium: {l:"🟡 Средне",  c:"#feca57", bg:"rgba(254,202,87,.08)", bd:"rgba(254,202,87,.25)"},
  low:    {l:"🟢 Не горит", c:"#2ed573", bg:"rgba(46,213,115,.08)", bd:"rgba(46,213,115,.25)"}
};

// ============================================================
// COLUMNS
// ============================================================
var COLS = [
  {id:"todo",       t:"К выполнению", ic:"📋", em:"Пусто — добавьте задачу"},
  {id:"inprogress", t:"В работе",     ic:"⚡", em:"Нет активных задач"},
  {id:"done",       t:"Готово",        ic:"✅", em:"Завершённых пока нет"}
];

// ============================================================
// FILE ICONS
// ============================================================
var FI = {
  xlsx:{i:"📊",c:"#2ed573",l:"Excel"}, xls:{i:"📊",c:"#2ed573",l:"Excel"},
  csv:{i:"📊",c:"#2ed573",l:"CSV"},    doc:{i:"📝",c:"#54a0ff",l:"Word"},
  docx:{i:"📝",c:"#54a0ff",l:"Word"},  pdf:{i:"📕",c:"#ff4757",l:"PDF"},
  pptx:{i:"📙",c:"#ff9f43",l:"PPT"},   png:{i:"🖼️",c:"#a29bfe",l:"Фото"},
  jpg:{i:"🖼️",c:"#a29bfe",l:"Фото"},   jpeg:{i:"🖼️",c:"#a29bfe",l:"Фото"},
  zip:{i:"📦",c:"#feca57",l:"Архив"},   txt:{i:"📄",c:"#dfe6e9",l:"Текст"}
};

// ============================================================
// UTILITY FUNCTIONS
// ============================================================
function gfi(n) {
  var e = n.split(".").pop().toLowerCase();
  return FI[e] || {i:"📎", c:"#b2bec3", l:"Файл"};
}

function fsz(b) {
  return b < 1024 ? b + " B" : b < 1048576 ? (b/1024).toFixed(1) + " KB" : (b/1048576).toFixed(1) + " MB";
}

function gid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2,7);
}

function esc(s) {
  var d = document.createElement("div");
  d.textContent = s;
  return d.innerHTML;
}

function fdt(d) {
  if (!d) return "";
  var dt = new Date(d), now = new Date(), df = Math.ceil((dt - now) / 864e5);
  if (df < 0) return "⚠️ Просрочено";
  if (df === 0) return "⏰ Сегодня";
  if (df === 1) return "📅 Завтра";
  return "📅 " + dt.toLocaleDateString("ru-RU", {day:"numeric", month:"short"});
}

function rdf(fl) {
  return Promise.all(Array.from(fl).map(function(f) {
    return new Promise(function(r) {
      var rd = new FileReader();
      rd.onload = function() { r({name:f.name, size:f.size, type:f.type, dataUrl:rd.result}); };
      rd.readAsDataURL(f);
    });
  }));
}

function dlf(f) {
  var a = document.createElement("a");
  a.href = f.dataUrl; a.download = f.name;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
}

function greet() {
  var h = new Date().getHours();
  return h < 6 ? "Доброй ночи" : h < 12 ? "Доброе утро" : h < 18 ? "Добрый день" : "Добрый вечер";
}
