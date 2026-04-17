// ============================================================
// SPACE DEFENSE v2.0 — Protect the Base!
// Полностью переработанная версия:
// - Power-ups, combo system, killstreaks
// - Dash, special attack, new enemies
// - Kinematic visuals, screen effects, damage numbers
// - Все баги починены, код оптимизирован
// ============================================================

var dfState = "menu"; // menu | lobby | waiting | playing | shop | gameover | pause
var dfCanvas, dfCtx, dfW, dfH;
var dfLoop = null;
var dfWave = 0, dfScore = 0, dfCoins = 0, dfKills = 0;
var dfBase = null, dfShip = null;
var dfBullets = [], dfEnemies = [], dfParticles = [], dfStars = [];
var dfDrones = [], dfPowerups = [], dfDamageNumbers = [], dfShells = [];
var dfComets = [], dfWarpRings = [];
var dfKeys = {}, dfMouseX = 0, dfMouseY = 0, dfMouseDown = false;
var dfBulletCD = 0, dfInvincible = 0;
var dfShake = 0, dfFlash = 0, dfChromatic = 0, dfZoomPunch = 0;
var dfWaveTimer = 0, dfWaveEnemiesLeft = 0;
var dfHighScores = [];
var unsubDfScores = null;

// Combo & killstreak
var dfCombo = 0, dfComboTimer = 0, dfComboMax = 0;
var dfKillstreakText = "", dfKillstreakTimer = 0;
var dfKillsInWindow = [], dfLastKillTime = 0;

// Special abilities
var dfDashCD = 0, dfDashActive = 0;
var dfSpecialCD = 0;
var dfFrozen = 0; // freeze powerup
var dfMagnet = 0; // magnet powerup
var dfDoubleDamage = 0; // 2x damage powerup
var dfShieldActive = 0; // shield powerup

// ============================================================
// CO-OP STATE
// ============================================================
var dfCoop = false;
var dfIsHost = false;
var dfRoomId = null;
var dfRoomRef = null;
var dfUnsubRoom = null;
var dfPartnerShip = null;
var dfPartnerBullets = [];
var dfPartnerName = "";
var dfMyRole = "";
var dfRoomCode = "";
var dfLobbyInput = "";
var dfLobbyError = "";
var dfLobbyMsg = "";
var dfSyncTimer = 0;
var dfMenuSelection = 0;
var dfCoopMenuSel = 0;
var dfGuestCoins = 0;
var dfGuestUpgrades = null;
var dfProcessedGuestBullets = {}; // FIX: всегда инициализирован

// ============================================================
// UPGRADES
// ============================================================
var dfUpgrades = {
  gunType: 0, gunDmg: 1, fireRate: 1, shipSpeed: 1,
  shipHP: 3, shipMaxHP: 3, shield: 0,
  baseHP: 20, baseMaxHP: 20, baseRegen: 0,
  turrets: 0, drones: 0,
  homing: 0, piercing: 0,
  critChance: 0, // новое: шанс крит. удара
  luckyCoins: 0  // новое: шанс двойных монет
};
var dfTime = 0;

var GUN_NAMES = ["Обычная", "Двойная", "Дробовик", "Лазер", "Ракеты", "Плазма"];
var GUN_COLORS = ["#6ec6ff", "#54a0ff", "#feca57", "#ff4757", "#ff9f43", "#a855f7"];

// ============================================================
// POWER-UP TYPES
// ============================================================
var POWERUP_TYPES = {
  shield: { color: "#6ec6ff", emoji: "🛡", name: "Щит", duration: 480 },
  freeze: { color: "#aaddff", emoji: "❄", name: "Заморозка", duration: 240 },
  magnet: { color: "#feca57", emoji: "🧲", name: "Магнит", duration: 360 },
  bomb: { color: "#ff4757", emoji: "💥", name: "Бомба", duration: 0 },
  double: { color: "#a855f7", emoji: "⚡", name: "x2 урон", duration: 420 },
  heal: { color: "#2ed573", emoji: "❤", name: "Лечение", duration: 0 },
  coin: { color: "#ffd700", emoji: "💰", name: "Монеты", duration: 0 }
};

// ============================================================
// SHOP ITEMS
// ============================================================
function getShopItems() {
  var u = dfUpgrades;
  var items = [
    {id:"gun", name:"Пушка: " + GUN_NAMES[Math.min(u.gunType+1, GUN_NAMES.length-1)], desc:"Следующий тип оружия", cost: 30 + u.gunType * 25, max: u.gunType >= GUN_NAMES.length-1, personal:true, action:function(){ u.gunType = Math.min(u.gunType+1, GUN_NAMES.length-1); }},
    {id:"dmg", name:"Урон +" + (u.gunDmg), desc:"Увеличить урон пуль", cost: 15 + u.gunDmg * 10, max: u.gunDmg >= 10, personal:true, action:function(){ u.gunDmg++; }},
    {id:"rate", name:"Скорострельность", desc:"Быстрее стрельба", cost: 20 + u.fireRate * 15, max: u.fireRate >= 8, personal:true, action:function(){ u.fireRate++; }},
    {id:"speed", name:"Скорость корабля", desc:"Быстрее движение", cost: 15 + u.shipSpeed * 10, max: u.shipSpeed >= 6, personal:true, action:function(){ u.shipSpeed++; }},
    {id:"hp", name:"Здоровье +1", desc:"Доп. жизнь корабля", cost: 25 + u.shipMaxHP * 8, max: u.shipMaxHP >= 10, personal:true, action:function(){ u.shipMaxHP++; u.shipHP = u.shipMaxHP; }},
    {id:"homing", name:"🎯 Наведение ур." + (u.homing+1), desc:"Пули летят к врагам", cost: 35 + u.homing * 30, max: u.homing >= 5, personal:true, action:function(){ u.homing++; }},
    {id:"pierce", name:"⚡ Пробивание ур." + (u.piercing+1), desc:"Пули сквозь врагов", cost: 40 + u.piercing * 35, max: u.piercing >= 4, personal:true, action:function(){ u.piercing++; }},
    {id:"crit", name:"💥 Крит. удар " + (u.critChance*10)+"%", desc:"Шанс двойного урона", cost: 45 + u.critChance * 40, max: u.critChance >= 5, personal:true, action:function(){ u.critChance++; }},
    {id:"lucky", name:"🍀 Удача " + (u.luckyCoins*15)+"%", desc:"Шанс двойных монет", cost: 30 + u.luckyCoins * 25, max: u.luckyCoins >= 4, personal:true, action:function(){ u.luckyCoins++; }},
    {id:"baseHP", name:"Броня базы +5", desc:"Укрепить базу", cost: 20 + u.baseMaxHP * 3, max: u.baseMaxHP >= 80, personal:false, action:function(){ u.baseMaxHP += 5; u.baseHP = u.baseMaxHP; }},
    {id:"regen", name:"Регенерация базы", desc:"Авто-восстановление HP", cost: 40 + u.baseRegen * 30, max: u.baseRegen >= 5, personal:false, action:function(){ u.baseRegen++; }},
    {id:"turret", name:"Турель на базе", desc:"База стреляет сама", cost: 50 + u.turrets * 40, max: u.turrets >= 4, personal:false, action:function(){ u.turrets++; }},
    {id:"drone", name:"Дрон-помощник", desc:"Автоматический союзник", cost: 60 + u.drones * 50, max: u.drones >= 3, personal:false, action:function(){ u.drones++; spawnDrones(); }},
    {id:"heal", name:"❤️ Починить базу", desc:"Полное восстановление", cost: 15, max: u.baseHP >= u.baseMaxHP, personal:false, action:function(){ u.baseHP = u.baseMaxHP; }}
  ];
  return items;
}

// ============================================================
// ROOM CODE
// ============================================================
function generateRoomCode() {
  var chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  var code = "";
  for (var i = 0; i < 6; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  return code;
}

// ============================================================
// CO-OP: CREATE / JOIN / LISTEN
// ============================================================
function coopCreateRoom() {
  if (!currentUser) { dfLobbyError = "Войдите в аккаунт!"; return; }
  dfLobbyMsg = "Создание комнаты...";
  dfLobbyError = "";
  dfRoomCode = generateRoomCode();

  db.collection("defense-rooms").add({
    code: dfRoomCode,
    hostUid: currentUser.uid,
    hostName: currentUser.displayName || currentUser.email || "Хост",
    guestUid: null, guestName: null,
    status: "waiting",
    createdAt: new Date().toISOString(),
    wave: 0, score: 0, kills: 0,
    hostCoins: 0, guestCoins: 0,
    baseHP: 20, baseMaxHP: 20,
    enemies: "[]",
    hostShip: "{}", guestShip: "{}",
    hostBullets: "[]", guestBullets: "[]",
    upgrades: JSON.stringify(dfUpgrades),
    guestUpgrades: JSON.stringify({gunType:0,gunDmg:1,fireRate:1,shipSpeed:1,shipHP:3,shipMaxHP:3,homing:0,piercing:0,critChance:0}),
    waveTimer: 0, waveEnemiesLeft: 0,
    powerups: "[]"
  }).then(function(docRef) {
    dfRoomId = docRef.id;
    dfRoomRef = docRef;
    dfIsHost = true;
    dfMyRole = "host";
    dfCoop = true;
    dfState = "waiting";
    dfLobbyMsg = "";
    listenRoom();
  }).catch(function(err) {
    dfLobbyError = "Ошибка: " + err.message;
    dfLobbyMsg = "";
  });
}

function coopJoinRoom(code) {
  if (!currentUser) { dfLobbyError = "Войдите в аккаунт!"; return; }
  if (!code || code.length < 4) { dfLobbyError = "Введите код комнаты!"; return; }
  dfLobbyMsg = "Поиск комнаты...";
  dfLobbyError = "";

  db.collection("defense-rooms").where("code", "==", code.toUpperCase()).limit(5).get()
    .then(function(snap) {
      if (snap.empty) { dfLobbyError = "Комната " + code + " не найдена"; dfLobbyMsg = ""; return; }

      var found = null;
      snap.forEach(function(doc) {
        var d = doc.data();
        if (d.status === "waiting" && !d.guestUid && d.hostUid !== currentUser.uid) {
          found = {doc: doc, data: d};
        }
      });

      if (!found) {
        var doc0 = snap.docs[0], d0 = doc0.data();
        if (d0.hostUid === currentUser.uid) dfLobbyError = "Нельзя войти в свою комнату!";
        else if (d0.guestUid) dfLobbyError = "Комната уже заполнена!";
        else if (d0.status !== "waiting") dfLobbyError = "Игра уже идёт!";
        else dfLobbyError = "Не удалось подключиться";
        dfLobbyMsg = "";
        return;
      }

      var doc = found.doc, data = found.data;
      dfRoomId = doc.id;
      dfRoomRef = doc.ref;
      dfRoomCode = code.toUpperCase();
      dfIsHost = false;
      dfMyRole = "guest";
      dfCoop = true;
      dfPartnerName = data.hostName || "Хост";

      doc.ref.update({
        guestUid: currentUser.uid,
        guestName: currentUser.displayName || currentUser.email || "Гость"
      }).then(function() {
        dfState = "waiting";
        dfLobbyMsg = "";
        listenRoom();
      });
    }).catch(function(err) {
      dfLobbyError = "Ошибка: " + err.message;
      dfLobbyMsg = "";
    });
}

function listenRoom() {
  if (dfUnsubRoom) dfUnsubRoom();
  if (!dfRoomRef && dfRoomId) dfRoomRef = db.collection("defense-rooms").doc(dfRoomId);
  if (!dfRoomRef) return;

  dfUnsubRoom = dfRoomRef.onSnapshot(function(doc) {
    if (!doc.exists) { coopLeave(); return; }
    var d = doc.data();

    if (dfIsHost) dfPartnerName = d.guestName || "";
    else dfPartnerName = d.hostName || "Хост";

    if (!dfIsHost) {
      if (d.status === "playing" && (dfState === "waiting" || dfState === "shop")) {
        if (dfState === "waiting") initCoopGame(d);
        dfState = "playing";
        dfWave = d.wave || dfWave;
        dfWaveTimer = d.waveTimer || 0;
        dfWaveEnemiesLeft = d.waveEnemiesLeft || 0;
      }
      if (d.status === "shop" && dfState === "playing") dfState = "shop";
      if (d.status === "gameover") dfState = "gameover";

      dfScore = d.score || 0;
      dfCoins = d.guestCoins || 0;
      dfKills = d.kills || 0;
      if (d.baseHP !== undefined) dfUpgrades.baseHP = d.baseHP;
      if (d.baseMaxHP !== undefined) dfUpgrades.baseMaxHP = d.baseMaxHP;
      if (d.upgrades) {
        try {
          var up = JSON.parse(d.upgrades);
          dfUpgrades.baseRegen = up.baseRegen || 0;
          dfUpgrades.turrets = up.turrets || 0;
          dfUpgrades.baseMaxHP = up.baseMaxHP || 20;
          dfUpgrades.drones = up.drones || 0;
        } catch(e){}
      }
      if (d.enemies) { try { dfEnemies = JSON.parse(d.enemies); } catch(e){} }
      if (d.powerups) { try { dfPowerups = JSON.parse(d.powerups); } catch(e){} }
      if (d.hostShip) { try { dfPartnerShip = JSON.parse(d.hostShip); } catch(e){} }
      if (d.hostBullets) { try { dfPartnerBullets = JSON.parse(d.hostBullets); } catch(e){} }
    }

    if (dfIsHost) {
      if (d.guestShip) { try { dfPartnerShip = JSON.parse(d.guestShip); } catch(e){} }
      if (d.guestBullets) { try { dfPartnerBullets = JSON.parse(d.guestBullets); } catch(e){} }
      if (d.guestUpgrades) { try { dfGuestUpgrades = JSON.parse(d.guestUpgrades); } catch(e){} }
      dfGuestCoins = d.guestCoins || 0;
      if (d.upgrades) {
        try {
          var up = JSON.parse(d.upgrades);
          if (up.baseMaxHP > dfUpgrades.baseMaxHP) {
            var diff = up.baseMaxHP - dfUpgrades.baseMaxHP;
            dfUpgrades.baseMaxHP = up.baseMaxHP;
            dfUpgrades.baseHP = Math.min(up.baseMaxHP, dfUpgrades.baseHP + diff);
          }
          if (up.baseRegen > dfUpgrades.baseRegen) dfUpgrades.baseRegen = up.baseRegen;
          if (up.turrets > dfUpgrades.turrets) dfUpgrades.turrets = up.turrets;
          if (up.drones > dfUpgrades.drones) { dfUpgrades.drones = up.drones; spawnDrones(); }
          if (up.baseHP > dfUpgrades.baseHP && up.baseHP === up.baseMaxHP) dfUpgrades.baseHP = up.baseHP;
        } catch(e){}
      }
    }
  });
}

function coopSyncMyState() {
  if (!dfCoop || !dfRoomRef || dfState !== "playing") return;
  dfSyncTimer++;
  if (dfSyncTimer % 3 !== 0) return;

  var shipData = JSON.stringify({
    x: Math.round(dfShip.x), y: Math.round(dfShip.y),
    angle: Math.round(dfShip.angle * 100) / 100,
    thrust: dfShip.thrust, hp: dfUpgrades.shipHP, maxHp: dfUpgrades.shipMaxHP,
    dashing: dfDashActive > 0, shielded: dfShieldActive > 0
  });

  var myBullets = [];
  for (var i = 0; i < dfBullets.length; i++) {
    var b = dfBullets[i];
    if (b.owner === "player") myBullets.push({x:Math.round(b.x),y:Math.round(b.y),vx:Math.round(b.vx*10)/10,vy:Math.round(b.vy*10)/10,type:b.type});
  }
  var bulletData = JSON.stringify(myBullets.slice(0, 25));

  var update = {};
  if (dfIsHost) {
    update.hostShip = shipData;
    update.hostBullets = bulletData;
    if (dfSyncTimer % 6 === 0) {
      var ed = [];
      for (var i = 0; i < dfEnemies.length; i++) {
        var e = dfEnemies[i];
        ed.push({x:Math.round(e.x),y:Math.round(e.y),type:e.type,hp:e.hp,maxHp:e.maxHp,radius:Math.round(e.radius),speed:Math.round(e.speed*100)/100,seed:e.seed,angle:e.angle!==undefined?Math.round(e.angle*100)/100:undefined,stealth:e.stealth,shielded:e.shielded,shieldHP:e.shieldHP});
      }
      update.enemies = JSON.stringify(ed);
      var pd = [];
      for (var i = 0; i < dfPowerups.length; i++) {
        var p = dfPowerups[i];
        pd.push({x:Math.round(p.x),y:Math.round(p.y),vx:Math.round(p.vx*100)/100,vy:Math.round(p.vy*100)/100,type:p.type,life:p.life});
      }
      update.powerups = JSON.stringify(pd);
      update.score = dfScore;
      update.hostCoins = dfCoins;
      update.kills = dfKills;
      update.baseHP = dfUpgrades.baseHP;
      update.baseMaxHP = dfUpgrades.baseMaxHP;
      update.wave = dfWave;
      update.waveTimer = dfWaveTimer;
      update.waveEnemiesLeft = dfWaveEnemiesLeft;
    }
  } else {
    update.guestShip = shipData;
    update.guestBullets = bulletData;
  }
  dfRoomRef.update(update).catch(function(){});
}

function coopStartGame() {
  if (!dfIsHost || !dfRoomRef) return;
  initDefenseGame();
  dfCoop = true;
  dfRoomRef.update({
    status: "playing", wave: dfWave,
    score: 0, coins: 0, kills: 0,
    baseHP: dfUpgrades.baseHP, baseMaxHP: dfUpgrades.baseMaxHP,
    upgrades: JSON.stringify(dfUpgrades)
  }).catch(function(){});
}

function initCoopGame(roomData) {
  dfWave = roomData.wave || 1;
  dfScore = roomData.score || 0;
  dfCoins = roomData.coins || 0;
  dfKills = roomData.kills || 0;
  dfBullets = []; dfParticles = []; dfDrones = []; dfPowerups = []; dfDamageNumbers = []; dfShells = [];
  dfBulletCD = 0; dfInvincible = 120; dfShake = 0; dfFlash = 0;
  dfCombo = 0; dfComboTimer = 0; dfComboMax = 0;
  dfUpgrades = {gunType:0,gunDmg:1,fireRate:1,shipSpeed:1,shipHP:3,shipMaxHP:3,shield:0,baseHP:roomData.baseHP||20,baseMaxHP:roomData.baseMaxHP||20,baseRegen:0,turrets:0,drones:0,homing:0,piercing:0,critChance:0,luckyCoins:0};
  dfBase = {x: dfW/2, y: dfH/2, radius: 34};
  dfShip = {x: dfW/2 + 40, y: dfH/2 - 80, angle: -Math.PI/2, vx:0, vy:0, thrust:false, radius:14};
  initDfStars();
  initComets();
}

function coopLeave() {
  if (dfUnsubRoom) { dfUnsubRoom(); dfUnsubRoom = null; }
  if (dfRoomRef && dfRoomId) {
    if (dfIsHost) dfRoomRef.delete().catch(function(){});
    else dfRoomRef.update({ guestUid: null, guestName: null }).catch(function(){});
  }
  dfCoop = false; dfIsHost = false; dfRoomId = null; dfRoomRef = null;
  dfPartnerShip = null; dfPartnerBullets = []; dfPartnerName = "";
  dfRoomCode = ""; dfLobbyInput = ""; dfLobbyError = ""; dfLobbyMsg = "";
  dfGuestCoins = 0; dfGuestUpgrades = null;
  dfProcessedGuestBullets = {};
  dfState = "menu";
}

function coopNotifyShop() {
  if (!dfCoop || !dfIsHost || !dfRoomRef) return;
  dfRoomRef.update({ status: "shop", upgrades: JSON.stringify(dfUpgrades), hostCoins: dfCoins, guestCoins: dfGuestCoins }).catch(function(){});
}
function coopNotifyNextWave() {
  if (!dfCoop || !dfIsHost || !dfRoomRef) return;
  dfRoomRef.update({ status: "playing", wave: dfWave, upgrades: JSON.stringify(dfUpgrades), hostCoins: dfCoins, guestCoins: dfGuestCoins }).catch(function(){});
}
function coopNotifyGameOver() {
  if (!dfCoop || !dfIsHost || !dfRoomRef) return;
  dfRoomRef.update({ status: "gameover", score: dfScore, wave: dfWave, kills: dfKills }).catch(function(){});
}
function coopSyncShopPurchase() {
  if (!dfCoop || !dfRoomRef) return;
  var u = dfUpgrades;
  if (dfIsHost) {
    dfRoomRef.update({ hostCoins: dfCoins, upgrades: JSON.stringify(u) }).catch(function(){});
  } else {
    dfRoomRef.update({
      guestCoins: dfCoins,
      guestUpgrades: JSON.stringify({gunType:u.gunType,gunDmg:u.gunDmg,fireRate:u.fireRate,shipSpeed:u.shipSpeed,shipHP:u.shipHP,shipMaxHP:u.shipMaxHP,homing:u.homing,piercing:u.piercing,critChance:u.critChance,luckyCoins:u.luckyCoins}),
      upgrades: JSON.stringify(u)
    }).catch(function(){});
  }
}

// ============================================================
// INIT (Solo)
// ============================================================
function initDefenseGame() {
  dfWave = 0; dfScore = 0; dfCoins = 0; dfKills = 0;
  dfBullets = []; dfEnemies = []; dfParticles = []; dfDrones = [];
  dfPowerups = []; dfDamageNumbers = []; dfShells = []; dfWarpRings = [];
  dfBulletCD = 0; dfInvincible = 120; dfShake = 0; dfFlash = 0;
  dfChromatic = 0; dfZoomPunch = 0;
  dfWaveTimer = 0; dfWaveEnemiesLeft = 0; dfTime = 0;
  dfCombo = 0; dfComboTimer = 0; dfComboMax = 0;
  dfKillstreakText = ""; dfKillstreakTimer = 0;
  dfDashCD = 0; dfDashActive = 0; dfSpecialCD = 0;
  dfFrozen = 0; dfMagnet = 0; dfDoubleDamage = 0; dfShieldActive = 0;
  dfProcessedGuestBullets = {};
  dfUpgrades = {gunType:0,gunDmg:1,fireRate:1,shipSpeed:1,shipHP:3,shipMaxHP:3,shield:0,baseHP:20,baseMaxHP:20,baseRegen:0,turrets:0,drones:0,homing:0,piercing:0,critChance:0,luckyCoins:0};
  dfBase = {x: dfW/2, y: dfH/2, radius: 34};
  dfShip = {x: dfW/2, y: dfH/2 - 80, angle: -Math.PI/2, vx:0, vy:0, thrust:false, radius:14};
  initDfStars();
  initComets();
  dfPartnerShip = null; dfPartnerBullets = [];
  dfState = "playing";
  startWave();
}

function initDfStars() {
  dfStars = [];
  for (var i = 0; i < 200; i++) {
    var layer = Math.random();
    dfStars.push({
      x: Math.random()*dfW, y: Math.random()*dfH,
      s: layer < 0.4 ? 0.5+Math.random()*0.5 : (layer < 0.75 ? 1+Math.random()*1 : 2+Math.random()*1.5),
      b: Math.random(),
      speed: layer < 0.4 ? 0.03+Math.random()*0.04 : (layer < 0.75 ? 0.08+Math.random()*0.12 : 0.18+Math.random()*0.2),
      twinkle: Math.random()*Math.PI*2,
      twinkleSpeed: 0.008 + Math.random()*0.04,
      color: Math.random() < 0.8 ? "#fff" : (Math.random() < 0.5 ? "#aac8ff" : "#ffeedd"),
      layer: layer
    });
  }
}

function initComets() {
  dfComets = [];
}

function spawnComet() {
  if (dfComets.length >= 2) return;
  var side = Math.random() < 0.5;
  dfComets.push({
    x: side ? -50 : dfW + 50,
    y: Math.random() * dfH * 0.6,
    vx: (side ? 1 : -1) * (2 + Math.random() * 2),
    vy: 0.5 + Math.random() * 1,
    life: 400,
    trail: []
  });
}

// ============================================================
// WAVES
// ============================================================
function startWave() {
  dfWave++;
  dfWaveTimer = 180;
  var count = 3 + dfWave * 2;
  if (dfCoop) count = Math.floor(count * 1.4);
  if (dfWave % 5 === 0) count += 2;
  dfWaveEnemiesLeft = count;

  // Warp ring для эффектного старта волны
  dfWarpRings.push({x: dfW/2, y: dfH/2, r: 0, maxR: Math.max(dfW, dfH), life: 60, maxLife: 60});
}

function spawnEnemy() {
  if (dfWaveEnemiesLeft <= 0) return;
  dfWaveEnemiesLeft--;
  var side = Math.floor(Math.random() * 4);
  var ex, ey;
  if (side === 0) { ex = -30; ey = Math.random() * dfH; }
  else if (side === 1) { ex = dfW + 30; ey = Math.random() * dfH; }
  else if (side === 2) { ex = Math.random() * dfW; ey = -30; }
  else { ex = Math.random() * dfW; ey = dfH + 30; }

  // Warp эффект появления
  dfParticles.push({x:ex,y:ey,vx:0,vy:0,life:20,maxLife:20,color:"#ff4757",size:8,ring:true});

  var isBoss = (dfWave % 5 === 0 && dfWaveEnemiesLeft === 0);
  var r = Math.random();
  var isShip = !isBoss && dfWave >= 3 && r < 0.25 + dfWave * 0.015;
  var isStealth = !isBoss && !isShip && dfWave >= 4 && r > 0.7 && r < 0.82;
  var isSplitter = !isBoss && !isShip && !isStealth && dfWave >= 5 && r > 0.85 && r < 0.93;
  var isShielded = !isBoss && !isShip && !isStealth && !isSplitter && dfWave >= 6 && r > 0.94;

  if (isBoss) {
    var bossHP = 20 + dfWave * 4;
    if (dfCoop) bossHP = Math.floor(bossHP * 1.5);
    dfEnemies.push({x:ex,y:ey,type:"boss",hp:bossHP,maxHp:bossHP,radius:32+Math.min(dfWave,20),speed:0.4+dfWave*0.01,seed:Math.floor(Math.random()*9999),shootCD:0,coins:25+dfWave*3,angle:0});
  } else if (isShip) {
    var shp = 2+Math.floor(dfWave/3);
    dfEnemies.push({x:ex,y:ey,type:"ship",hp:shp,maxHp:shp,radius:13,speed:0.8+dfWave*0.03,angle:0,seed:Math.floor(Math.random()*9999),shootCD:Math.floor(Math.random()*60),coins:3+Math.floor(dfWave/2)});
  } else if (isStealth) {
    var sthp = 2;
    dfEnemies.push({x:ex,y:ey,type:"stealth",hp:sthp,maxHp:sthp,radius:12,speed:1.2+dfWave*0.03,seed:Math.floor(Math.random()*9999),stealth:true,phaseTimer:0,coins:5+Math.floor(dfWave/3)});
  } else if (isSplitter) {
    var sphp = 3;
    dfEnemies.push({x:ex,y:ey,type:"splitter",hp:sphp,maxHp:sphp,radius:22,speed:0.7+dfWave*0.02,seed:Math.floor(Math.random()*9999),coins:4+Math.floor(dfWave/3),splits:true});
  } else if (isShielded) {
    var shhp = 2+Math.floor(dfWave/4);
    dfEnemies.push({x:ex,y:ey,type:"shielded",hp:shhp,maxHp:shhp,shielded:true,shieldHP:3,radius:17,speed:0.6+dfWave*0.02,seed:Math.floor(Math.random()*9999),coins:6+Math.floor(dfWave/3)});
  } else {
    var sz = Math.random()<0.3?"big":(Math.random()<0.5?"med":"small");
    var radius = sz==="big"?25+Math.random()*10:(sz==="med"?15+Math.random()*5:8+Math.random()*4);
    var hp = sz==="big"?3:(sz==="med"?2:1);
    dfEnemies.push({x:ex,y:ey,type:"asteroid",size:sz,hp:hp,maxHp:hp,radius:radius,speed:0.5+Math.random()*0.5+dfWave*0.02,seed:Math.floor(Math.random()*9999),coins:sz==="big"?3:(sz==="med"?2:1)});
  }
}

function spawnSmallAsteroidsFromSplit(x, y) {
  for (var i = 0; i < 3; i++) {
    var a = (Math.PI*2/3)*i;
    var hp = 1;
    dfEnemies.push({
      x:x+Math.cos(a)*15, y:y+Math.sin(a)*15,
      type:"asteroid", size:"small",
      hp:hp, maxHp:hp, radius:8+Math.random()*3,
      speed:0.8+Math.random()*0.5,
      seed:Math.floor(Math.random()*9999),
      coins:1,
      vx:Math.cos(a)*2, vy:Math.sin(a)*2, splitChild:true
    });
  }
}

// ============================================================
// POWERUPS
// ============================================================
function spawnPowerup(x, y, forceType) {
  var types = ["shield", "freeze", "magnet", "bomb", "double", "heal", "coin"];
  var type = forceType || types[Math.floor(Math.random() * types.length)];
  dfPowerups.push({
    x: x, y: y,
    vx: (Math.random()-0.5)*1.5,
    vy: (Math.random()-0.5)*1.5,
    type: type,
    life: 600,
    spin: 0
  });
}

function applyPowerup(type) {
  var P = POWERUP_TYPES[type];
  if (!P) return;

  if (type === "shield") dfShieldActive = P.duration;
  else if (type === "freeze") dfFrozen = P.duration;
  else if (type === "magnet") dfMagnet = P.duration;
  else if (type === "double") dfDoubleDamage = P.duration;
  else if (type === "bomb") {
    for (var i = dfEnemies.length - 1; i >= 0; i--) {
      var e = dfEnemies[i];
      if (e.type === "boss") { e.hp -= 10; continue; }
      spawnExplosion(e.x, e.y, "#ff4757", 15);
      dfScore += e.type === "ship" ? 25 : 10;
      dfCoins += e.coins || 1;
      dfKills++;
      registerKill();
      dfEnemies.splice(i, 1);
    }
    dfShake = 20; dfFlash = 1;
  }
  else if (type === "heal") {
    dfUpgrades.baseHP = Math.min(dfUpgrades.baseMaxHP, dfUpgrades.baseHP + 5);
    dfUpgrades.shipHP = Math.min(dfUpgrades.shipMaxHP, dfUpgrades.shipHP + 1);
  }
  else if (type === "coin") {
    dfCoins += 10;
    spawnDamageNumber(dfShip.x, dfShip.y, "+10💰", "#ffd700");
  }

  // Подбор — эффект
  spawnExplosion(dfShip.x, dfShip.y, P.color, 8);
  spawnDamageNumber(dfShip.x, dfShip.y - 20, P.emoji + " " + P.name, P.color);
}

// ============================================================
// DRONES
// ============================================================
function spawnDrones() {
  dfDrones = [];
  for (var i = 0; i < dfUpgrades.drones; i++) dfDrones.push({angle:(Math.PI*2/dfUpgrades.drones)*i,dist:55,shootCD:0});
}

// ============================================================
// SHOOTING
// ============================================================
function playerShoot() {
  var u = dfUpgrades, s = dfShip;
  var a = Math.atan2(dfMouseY - s.y, dfMouseX - s.x);
  var spd = 6 + u.fireRate * 0.3;
  var dmg = u.gunDmg;
  if (dfDoubleDamage > 0) dmg *= 2;

  // Muzzle flash
  var mfx = s.x + Math.cos(a)*18, mfy = s.y + Math.sin(a)*18;
  for (var p = 0; p < 5; p++) {
    var pa = a + (Math.random()-0.5)*0.8;
    dfParticles.push({x:mfx,y:mfy,vx:Math.cos(pa)*(1+Math.random()*2),vy:Math.sin(pa)*(1+Math.random()*2),life:8,maxLife:8,color:GUN_COLORS[u.gunType],size:2+Math.random()*2});
  }

  // Shell casing
  if (u.gunType <= 2) {
    dfShells.push({
      x: s.x + Math.cos(a-Math.PI/2)*8,
      y: s.y + Math.sin(a-Math.PI/2)*8,
      vx: Math.cos(a-Math.PI/2)*2 + (Math.random()-0.5),
      vy: Math.sin(a-Math.PI/2)*2 + (Math.random()-0.5) - 1,
      rot: 0, rotSpeed: (Math.random()-0.5)*0.5,
      life: 40
    });
  }

  if (u.gunType === 0) {
    dfBullets.push({x:s.x,y:s.y,vx:Math.cos(a)*spd,vy:Math.sin(a)*spd,life:60,dmg:dmg,owner:"player",type:"normal"});
  } else if (u.gunType === 1) {
    for (var d=-1;d<=1;d+=2){
      var ox=Math.cos(a+Math.PI/2)*d*5,oy=Math.sin(a+Math.PI/2)*d*5;
      dfBullets.push({x:s.x+ox,y:s.y+oy,vx:Math.cos(a)*spd,vy:Math.sin(a)*spd,life:60,dmg:dmg,owner:"player",type:"normal"});
    }
  } else if (u.gunType === 2) {
    for (var i=-2;i<=2;i++){
      var sa=a+i*0.12;
      dfBullets.push({x:s.x,y:s.y,vx:Math.cos(sa)*(spd-1),vy:Math.sin(sa)*(spd-1),life:30,dmg:Math.max(1,dmg-1),owner:"player",type:"normal"});
    }
  } else if (u.gunType === 3) {
    dfBullets.push({x:s.x,y:s.y,vx:Math.cos(a)*spd*1.8,vy:Math.sin(a)*spd*1.8,life:40,dmg:dmg+1,owner:"player",type:"laser"});
  } else if (u.gunType === 4) {
    dfBullets.push({x:s.x,y:s.y,vx:Math.cos(a)*spd*0.8,vy:Math.sin(a)*spd*0.8,life:90,dmg:dmg+3,owner:"player",type:"rocket",radius:6});
  } else if (u.gunType === 5) {
    // Плазма — мощный проникающий луч
    for (var i=-1;i<=1;i++) {
      var sa=a+i*0.08;
      dfBullets.push({x:s.x,y:s.y,vx:Math.cos(sa)*spd*1.4,vy:Math.sin(sa)*spd*1.4,life:50,dmg:dmg+2,owner:"player",type:"plasma"});
    }
  }
}

function specialAttack() {
  if (dfSpecialCD > 0) return;
  dfSpecialCD = 600; // 10 сек перезарядка

  // Energy burst — круговая волна пуль + ударная волна
  var s = dfShip;
  var num = 16;
  for (var i = 0; i < num; i++) {
    var a = (Math.PI*2/num)*i;
    dfBullets.push({x:s.x,y:s.y,vx:Math.cos(a)*7,vy:Math.sin(a)*7,life:50,dmg:dfUpgrades.gunDmg+2,owner:"player",type:"plasma",special:true});
  }
  // Shockwave particles
  for (var i = 0; i < 30; i++) {
    var a = (Math.PI*2/30)*i;
    dfParticles.push({x:s.x,y:s.y,vx:Math.cos(a)*4,vy:Math.sin(a)*4,life:30,maxLife:30,color:"#a855f7",size:3});
  }
  dfShake = 15;
  dfChromatic = 1;
}

function tryDash() {
  if (dfDashCD > 0 || dfDashActive > 0) return;
  var s = dfShip;
  var dashDir = Math.atan2(s.vy, s.vx);
  if (Math.abs(s.vx) < 0.5 && Math.abs(s.vy) < 0.5) {
    // Если нет движения — dash в сторону мыши
    dashDir = Math.atan2(dfMouseY - s.y, dfMouseX - s.x);
  }
  s.vx = Math.cos(dashDir) * 12;
  s.vy = Math.sin(dashDir) * 12;
  dfDashActive = 12;
  dfDashCD = 120;
  dfInvincible = Math.max(dfInvincible, 18);
  // Dash trail
  for (var i = 0; i < 10; i++) {
    dfParticles.push({x:s.x,y:s.y,vx:(Math.random()-0.5)*2,vy:(Math.random()-0.5)*2,life:20,maxLife:20,color:"#6ec6ff",size:3});
  }
}

function turretShoot() {
  if (dfUpgrades.turrets <= 0) return;
  var nearest = null, nd = Infinity;
  for (var i=0;i<dfEnemies.length;i++){var e=dfEnemies[i];var d=Math.hypot(e.x-dfBase.x,e.y-dfBase.y);if(d<nd&&d<320){nd=d;nearest=e;}}
  if (!nearest) return;
  var a = Math.atan2(nearest.y-dfBase.y,nearest.x-dfBase.x);
  for (var t=0;t<dfUpgrades.turrets;t++){
    var ta=a+(t-(dfUpgrades.turrets-1)/2)*0.3;
    dfBullets.push({x:dfBase.x,y:dfBase.y,vx:Math.cos(ta)*5,vy:Math.sin(ta)*5,life:50,dmg:1,owner:"turret",type:"normal"});
  }
}

function droneShoot(drone) {
  var dx=dfShip.x+Math.cos(drone.angle)*drone.dist,dy=dfShip.y+Math.sin(drone.angle)*drone.dist;
  var nearest=null,nd=Infinity;
  for(var i=0;i<dfEnemies.length;i++){var e=dfEnemies[i];var d=Math.hypot(e.x-dx,e.y-dy);if(d<nd&&d<250){nd=d;nearest=e;}}
  if(!nearest)return;
  var a=Math.atan2(nearest.y-dy,nearest.x-dx);
  dfBullets.push({x:dx,y:dy,vx:Math.cos(a)*5,vy:Math.sin(a)*5,life:40,dmg:1,owner:"drone",type:"normal"});
}

// ============================================================
// EFFECTS
// ============================================================
function spawnExplosion(x, y, color, count) {
  for (var i=0;i<count;i++){
    var a=Math.random()*Math.PI*2,sp=1+Math.random()*3;
    dfParticles.push({x:x,y:y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:20+Math.random()*20,maxLife:40,color:color,size:2+Math.random()*3});
  }
}

function spawnDamageNumber(x, y, text, color) {
  dfDamageNumbers.push({x:x, y:y, text:text, color:color||"#fff", life:50, maxLife:50, vy:-1.5});
}

function registerKill() {
  var now = dfTime;
  dfKillsInWindow.push(now);
  // Оставить только последние 2 секунды (120 кадров)
  while (dfKillsInWindow.length > 0 && now - dfKillsInWindow[0] > 120) dfKillsInWindow.shift();

  dfCombo++;
  dfComboTimer = 180; // 3 сек
  if (dfCombo > dfComboMax) dfComboMax = dfCombo;

  // Killstreak messages
  var kc = dfKillsInWindow.length;
  if (kc === 2) showKillstreak("DOUBLE KILL", "#6ec6ff");
  else if (kc === 3) showKillstreak("TRIPLE KILL", "#feca57");
  else if (kc === 4) showKillstreak("QUAD KILL", "#ff9f43");
  else if (kc === 5) showKillstreak("MEGA KILL!", "#ff4757");
  else if (kc >= 7) showKillstreak("RAMPAGE!!!", "#a855f7");

  if (dfCombo === 10) showKillstreak("COMBO x10", "#feca57");
  else if (dfCombo === 25) showKillstreak("COMBO x25!", "#ff9f43");
  else if (dfCombo === 50) showKillstreak("COMBO x50!!!", "#ff4757");
  else if (dfCombo === 100) showKillstreak("UNSTOPPABLE!", "#a855f7");
}

function showKillstreak(text, color) {
  dfKillstreakText = text;
  dfKillstreakTimer = 90;
  dfKillstreakColor = color || "#fff";
  dfZoomPunch = 0.5;
}
var dfKillstreakColor = "#fff";

// ============================================================
// UPDATE
// ============================================================
function updateDefense() {
  if (dfState !== "playing") return;
  var u = dfUpgrades, s = dfShip;
  var isLogicOwner = !dfCoop || dfIsHost;

  dfTime++;

  // Timers
  if (dfDashActive > 0) dfDashActive--;
  if (dfDashCD > 0) dfDashCD--;
  if (dfSpecialCD > 0) dfSpecialCD--;
  if (dfFrozen > 0) dfFrozen--;
  if (dfMagnet > 0) dfMagnet--;
  if (dfDoubleDamage > 0) dfDoubleDamage--;
  if (dfShieldActive > 0) dfShieldActive--;
  if (dfKillstreakTimer > 0) dfKillstreakTimer--;
  if (dfComboTimer > 0) { dfComboTimer--; if (dfComboTimer === 0) dfCombo = 0; }
  if (dfZoomPunch > 0) dfZoomPunch *= 0.85;

  // Кометы случайно
  if (Math.random() < 0.002) spawnComet();

  // Wave countdown
  if (isLogicOwner) {
    if (dfWaveTimer > 0) {
      dfWaveTimer--;
      if (dfWaveTimer <= 0) {
        // Cпавним первых врагов через отдельную функцию (избегаем closure issues)
        var toSpawn = Math.min(3, dfWaveEnemiesLeft);
        for (var si = 0; si < toSpawn; si++) {
          (function(delay) {
            setTimeout(function() { if (dfState === "playing") spawnEnemy(); }, delay * 500);
          })(si);
        }
      }
      coopSyncMyState();
      return;
    }
    if (dfWaveEnemiesLeft > 0 && Math.random() < 0.025 + dfWave * 0.005) spawnEnemy();
  } else {
    if (dfWaveTimer > 0) { coopSyncMyState(); return; }
  }

  // Регенерация базы во время боя (slow)
  if (isLogicOwner && u.baseRegen > 0 && dfTime % 120 === 0) {
    u.baseHP = Math.min(u.baseMaxHP, u.baseHP + Math.ceil(u.baseRegen / 2));
  }

  // Ship movement
  var accel = 0.12 + u.shipSpeed * 0.03, friction = 0.988;
  if (dfDashActive > 0) friction = 0.95; // Дэш быстрее затухает
  s.thrust = false;
  if (dfKeys["w"]||dfKeys["ц"]){s.vy-=accel;s.thrust=true;}
  if (dfKeys["s"]||dfKeys["ы"]){s.vy+=accel;s.thrust=true;}
  if (dfKeys["a"]||dfKeys["ф"]){s.vx-=accel;s.thrust=true;}
  if (dfKeys["d"]||dfKeys["в"]){s.vx+=accel;s.thrust=true;}
  s.vx*=friction;s.vy*=friction;
  s.x+=s.vx;s.y+=s.vy;
  s.x=Math.max(15,Math.min(dfW-15,s.x));
  s.y=Math.max(15,Math.min(dfH-15,s.y));
  s.angle=Math.atan2(dfMouseY-s.y,dfMouseX-s.x);

  // Thrust particles
  if (s.thrust && dfTime % 2 === 0) {
    var ta = s.angle + Math.PI;
    dfParticles.push({
      x: s.x + Math.cos(ta)*12, y: s.y + Math.sin(ta)*12,
      vx: Math.cos(ta)*2 + (Math.random()-0.5), vy: Math.sin(ta)*2 + (Math.random()-0.5),
      life: 15, maxLife: 15, color: "#6ec6ff", size: 2+Math.random()
    });
  }

  // Player shooting
  dfBulletCD--;
  var fireDelay = Math.max(4, 15 - u.fireRate * 1.5);
  if (dfMouseDown && dfBulletCD <= 0) { playerShoot(); dfBulletCD = fireDelay; }

  // Turrets
  if (isLogicOwner && u.turrets > 0 && Math.random() < 0.03 * u.turrets) turretShoot();

  // Drones
  for (var i=0;i<dfDrones.length;i++){
    dfDrones[i].angle+=0.02;
    dfDrones[i].shootCD--;
    if(dfDrones[i].shootCD<=0){droneShoot(dfDrones[i]);dfDrones[i].shootCD=30;}
  }

  // Shells
  for (var i = dfShells.length - 1; i >= 0; i--) {
    var sh = dfShells[i];
    sh.x += sh.vx; sh.y += sh.vy;
    sh.vy += 0.15; sh.vx *= 0.99;
    sh.rot += sh.rotSpeed;
    sh.life--;
    if (sh.life <= 0) dfShells.splice(i, 1);
  }

  // Powerups — движение + подбор + магнит
  for (var i = dfPowerups.length - 1; i >= 0; i--) {
    var p = dfPowerups[i];
    p.x += p.vx; p.y += p.vy;
    p.vx *= 0.97; p.vy *= 0.97;
    p.life--; p.spin += 0.05;

    // Magnet attraction
    if (dfMagnet > 0) {
      var md = Math.hypot(s.x - p.x, s.y - p.y);
      if (md < 250) {
        var ma = Math.atan2(s.y - p.y, s.x - p.x);
        p.x += Math.cos(ma)*3; p.y += Math.sin(ma)*3;
      }
    }

    // Подбор (либо игроком, либо кооп партнёром)
    if (Math.hypot(s.x - p.x, s.y - p.y) < 20 + s.radius) {
      applyPowerup(p.type);
      dfPowerups.splice(i, 1);
      continue;
    }
    if (dfCoop && dfPartnerShip && dfPartnerShip.x) {
      if (Math.hypot(dfPartnerShip.x - p.x, dfPartnerShip.y - p.y) < 24) {
        // Только хост удаляет (гость просто не видит эффекта — партнёр подобрал)
        if (isLogicOwner) {
          spawnExplosion(p.x, p.y, POWERUP_TYPES[p.type].color, 8);
          dfPowerups.splice(i, 1);
        }
        continue;
      }
    }

    if (p.life <= 0) dfPowerups.splice(i, 1);
  }

  // Bullets
  for (var i=dfBullets.length-1;i>=0;i--) {
    var b = dfBullets[i];

    // Homing (not for laser, not for special)
    if(b.owner==="player"&&dfUpgrades.homing>0&&b.type!=="laser"&&!b.special){
      var hStr=dfUpgrades.homing*0.012;
      var nearE=null,nearD=Infinity;
      for(var h=0;h<dfEnemies.length;h++){
        var he=dfEnemies[h];
        var hd=Math.hypot(he.x-b.x,he.y-b.y);
        if(hd<nearD&&hd<200+dfUpgrades.homing*40){nearD=hd;nearE=he;}
      }
      if(nearE){
        var ha=Math.atan2(nearE.y-b.y,nearE.x-b.x);
        var ba=Math.atan2(b.vy,b.vx);
        var diff=ha-ba;while(diff>Math.PI)diff-=Math.PI*2;while(diff<-Math.PI)diff+=Math.PI*2;
        ba+=diff*hStr;
        var bSpd=Math.hypot(b.vx,b.vy);
        b.vx=Math.cos(ba)*bSpd;b.vy=Math.sin(ba)*bSpd;
      }
    }

    b.x+=b.vx;b.y+=b.vy;b.life--;
    if(b.life<=0||b.x<-20||b.x>dfW+20||b.y<-20||b.y>dfH+20){dfBullets.splice(i,1);continue;}

    if(b.owner!=="enemy"){
      var bulletDone = false;
      for(var j=dfEnemies.length-1;j>=0;j--){
        var e=dfEnemies[j];
        if (e.stealth && e.phaseTimer > 30 && e.phaseTimer < 90) continue; // фаза невидимости
        var hitRadius = e.radius + 4;
        if (b.type === "rocket") hitRadius += 2;
        if(Math.hypot(b.x-e.x,b.y-e.y)<hitRadius){
          if(isLogicOwner){
            var finalDmg = b.dmg;
            // Крит
            var isCrit = false;
            if (b.owner === "player" && dfUpgrades.critChance > 0 && Math.random() < dfUpgrades.critChance * 0.1) {
              finalDmg *= 2;
              isCrit = true;
            }

            // Щит врага
            if (e.shielded && e.shieldHP > 0) {
              e.shieldHP -= Math.min(finalDmg, e.shieldHP);
              spawnExplosion(b.x, b.y, "#6ec6ff", 4);
              spawnDamageNumber(e.x, e.y - e.radius - 5, "ЩИТ", "#6ec6ff");
              if (e.shieldHP <= 0) { e.shielded = false; spawnExplosion(e.x, e.y, "#6ec6ff", 12); }
            } else {
              e.hp -= finalDmg;
              if (b.owner === "player") e._lastHitGuest = false;
              spawnDamageNumber(e.x, e.y - e.radius - 5, isCrit ? "КРИТ " + finalDmg : String(finalDmg), isCrit ? "#ff4757" : "#fff");
            }
          }

          spawnExplosion(b.x,b.y,b.owner==="player"?(dfUpgrades.piercing>0?"#a855f7":"#6ec6ff"):"#6ec6ff",3);

          // Rocket splash damage
          if (b.type === "rocket") {
            spawnExplosion(b.x, b.y, "#ff9f43", 20);
            dfShake = Math.max(dfShake, 8);
            for (var sp = dfEnemies.length - 1; sp >= 0; sp--) {
              if (sp === j) continue;
              var se = dfEnemies[sp];
              if (Math.hypot(se.x - b.x, se.y - b.y) < 50) {
                if (isLogicOwner) se.hp -= b.dmg * 0.5;
              }
            }
            dfBullets.splice(i, 1); bulletDone = true; break;
          }

          // Laser — уменьшает урон на каждом враге
          if(b.type==="laser"){
            b.dmg=Math.max(0,b.dmg-1);
            if(b.dmg<=0){dfBullets.splice(i,1); bulletDone = true; break;}
          }
          // Plasma — пробивает всех
          else if (b.type === "plasma") {
            if (!b.hit) b.hit = [];
            b.hit.push(j);
            // не ломаем — летит дальше
          }
          // Piercing upgrade
          else if(b.owner==="player"&&dfUpgrades.piercing>0){
            if(!b.pierced)b.pierced=0;
            b.pierced++;
            b.dmg=Math.max(1,b.dmg-1);
            if(b.pierced>=dfUpgrades.piercing){dfBullets.splice(i,1); bulletDone = true; break;}
          } else {
            dfBullets.splice(i,1); bulletDone = true; break;
          }
        }
      }
      if (bulletDone) continue;
    }

    // Enemy bullets vs ship
    if(b.owner==="enemy"&&dfInvincible<=0 && dfDashActive<=0){
      var hitShip = false;
      if(Math.hypot(b.x-s.x,b.y-s.y)<s.radius+3){
        if (dfShieldActive > 0) {
          // Щит блокирует
          spawnExplosion(b.x, b.y, "#6ec6ff", 6);
          dfBullets.splice(i, 1);
          continue;
        }
        u.shipHP--;dfInvincible=60;dfShake=10;dfFlash=1;dfChromatic=0.8;
        spawnExplosion(s.x,s.y,"#ff4757",8);
        dfCombo = 0;
        dfBullets.splice(i,1);
        if(u.shipHP<=0&&!dfCoop){gameOverDefense();return;}
        if(u.shipHP<=0&&dfCoop){
          u.shipHP=0;dfInvincible=180;
          (function(){setTimeout(function(){ if(dfState==="playing") u.shipHP=Math.max(1,Math.floor(u.shipMaxHP/2)); },3000);})();
        }
        continue;
      }
    }

    // Enemy bullets vs base
    if(isLogicOwner&&b.owner==="enemy"){
      if(Math.hypot(b.x-dfBase.x,b.y-dfBase.y)<dfBase.radius+3){
        u.baseHP--;spawnExplosion(dfBase.x,dfBase.y,"#ff9f43",4);
        dfBullets.splice(i,1);
        if(u.baseHP<=0){gameOverDefense();return;}
      }
    }
  }

  // Partner bullets (host tracks damage)
  if(dfCoop&&dfIsHost&&dfPartnerBullets.length>0){
    var guestDmg = (dfGuestUpgrades && dfGuestUpgrades.gunDmg) ? dfGuestUpgrades.gunDmg : 1;
    for(var i=0;i<dfPartnerBullets.length;i++){
      var pb=dfPartnerBullets[i];
      var pbId = Math.round(pb.x) + "_" + Math.round(pb.y) + "_" + Math.round(pb.vx*10) + "_" + Math.round(pb.vy*10);
      if(dfProcessedGuestBullets[pbId]) continue;
      for(var j=dfEnemies.length-1;j>=0;j--){
        var e=dfEnemies[j];
        if(Math.hypot(pb.x-e.x,pb.y-e.y)<e.radius+6){
          if (e.shielded && e.shieldHP > 0) {
            e.shieldHP -= Math.min(guestDmg, e.shieldHP);
            if (e.shieldHP <= 0) e.shielded = false;
          } else {
            e.hp -= guestDmg;
            e._lastHitGuest = true;
          }
          dfProcessedGuestBullets[pbId] = dfTime;
          spawnExplosion(pb.x, pb.y, "#ff9f43", 2);
          break;
        }
      }
    }
    if(dfTime % 60 === 0){
      for(var k in dfProcessedGuestBullets){
        if(dfTime - dfProcessedGuestBullets[k] > 30) delete dfProcessedGuestBullets[k];
      }
    }
  }

  // Enemies (host logic)
  if (isLogicOwner) {
    for(var i=dfEnemies.length-1;i>=0;i--){
      var e=dfEnemies[i];

      // Freeze
      var moveSpeed = e.speed;
      if (dfFrozen > 0) moveSpeed *= 0.15;

      var a=Math.atan2(dfBase.y-e.y,dfBase.x-e.x);

      // Splitter children have their own velocity initially
      if (e.splitChild && e.vx !== undefined && Math.abs(e.vx) + Math.abs(e.vy) > 0.1) {
        e.x += e.vx; e.y += e.vy;
        e.vx *= 0.95; e.vy *= 0.95;
      } else {
        e.x+=Math.cos(a)*moveSpeed;
        e.y+=Math.sin(a)*moveSpeed;
      }

      if(e.angle!==undefined)e.angle=a;

      // Stealth cycling
      if (e.stealth) {
        if (e.phaseTimer === undefined) e.phaseTimer = 0;
        e.phaseTimer = (e.phaseTimer + 1) % 120;
      }

      // Enemy shooting
      if((e.type==="ship"||e.type==="boss")&&e.shootCD!==undefined){
        e.shootCD--;
        if(e.shootCD<=0 && dfFrozen <= 0){
          var target=dfBase;
          if(dfCoop&&Math.random()<0.3){target=dfPartnerShip&&Math.random()<0.5?dfPartnerShip:s;}
          else if (Math.random() < 0.4) target = s;
          var ta=Math.atan2((target.y||dfBase.y)-e.y,(target.x||dfBase.x)-e.x);
          dfBullets.push({x:e.x,y:e.y,vx:Math.cos(ta)*3,vy:Math.sin(ta)*3,life:80,dmg:1,owner:"enemy",type:"normal"});
          if(e.type==="boss"){
            for(var bs=-1;bs<=1;bs+=2){
              dfBullets.push({x:e.x,y:e.y,vx:Math.cos(ta+bs*0.3)*3,vy:Math.sin(ta+bs*0.3)*3,life:80,dmg:1,owner:"enemy",type:"normal"});
            }
          }
          e.shootCD=e.type==="boss"?40:60-Math.min(dfWave,30);
        }
      }

      // Collision with base
      if(Math.hypot(e.x-dfBase.x,e.y-dfBase.y)<dfBase.radius+e.radius){
        u.baseHP-=(e.type==="boss"?5:(e.type==="ship"?2:1));
        spawnExplosion(e.x,e.y,"#ff4757",10);
        if (e.splits) spawnSmallAsteroidsFromSplit(e.x, e.y);
        dfEnemies.splice(i,1);dfShake=8;
        if(u.baseHP<=0){gameOverDefense();return;}
        continue;
      }

      // Death
      if(e.hp<=0){
        var killScore = (e.type==="boss"?100:(e.type==="ship"?25:(e.type==="stealth"?30:(e.type==="splitter"?20:(e.type==="shielded"?35:10)))));
        // Combo bonus
        if (dfCombo > 0) killScore += Math.floor(dfCombo * 0.5);
        var killCoins = e.coins||1;
        // Lucky — double coins
        if (dfUpgrades.luckyCoins > 0 && Math.random() < dfUpgrades.luckyCoins * 0.15) {
          killCoins *= 2;
          spawnDamageNumber(e.x, e.y - 10, "🍀 x2", "#2ed573");
        }
        dfScore += killScore;
        dfKills++;

        if(dfCoop && e._lastHitGuest){
          dfGuestCoins += killCoins;
        } else {
          dfCoins += killCoins;
        }

        spawnExplosion(e.x,e.y,e.type==="boss"?"#feca57":"#ff9f43",e.type==="boss"?30:12);
        spawnDamageNumber(e.x, e.y, "+"+killScore, "#feca57");

        // Splitter — разделяется
        if (e.splits) spawnSmallAsteroidsFromSplit(e.x, e.y);

        // Powerup drop chance
        var dropChance = e.type === "boss" ? 1.0 : (e.type === "ship" ? 0.18 : (e.type === "shielded" ? 0.25 : 0.08));
        if (Math.random() < dropChance) spawnPowerup(e.x, e.y);

        // Boss — особый эффект и гарантированный powerup
        if (e.type === "boss") {
          dfShake = 25; dfFlash = 1; dfZoomPunch = 0.8;
          spawnPowerup(e.x, e.y);
          for (var bp = 0; bp < 5; bp++) {
            var ba = (Math.PI*2/5)*bp;
            dfPowerups.push({x:e.x,y:e.y,vx:Math.cos(ba)*2,vy:Math.sin(ba)*2,type:"coin",life:600,spin:0});
          }
        }

        registerKill();
        dfEnemies.splice(i,1);
      }
    }

    if(dfWaveEnemiesLeft<=0&&dfEnemies.length===0&&dfWaveTimer<=0){
      u.baseHP=Math.min(u.baseMaxHP,u.baseHP+u.baseRegen*2);
      dfState="shop";
      if(dfCoop) coopNotifyShop();
    }
  }

  // Damage numbers
  for (var i = dfDamageNumbers.length - 1; i >= 0; i--) {
    var dn = dfDamageNumbers[i];
    dn.y += dn.vy; dn.vy *= 0.95;
    dn.life--;
    if (dn.life <= 0) dfDamageNumbers.splice(i, 1);
  }

  if(dfInvincible>0)dfInvincible--;
  if(dfShake>0)dfShake*=0.9;
  if(dfFlash>0)dfFlash*=0.9;
  if(dfChromatic>0)dfChromatic*=0.92;

  // Particles
  for(var i=dfParticles.length-1;i>=0;i--){
    var p=dfParticles[i];
    p.x+=p.vx;p.y+=p.vy;p.life--;p.vx*=0.97;p.vy*=0.97;
    if(p.life<=0)dfParticles.splice(i,1);
  }

  // Stars
  for(var i=0;i<dfStars.length;i++){
    var st=dfStars[i];
    st.twinkle+=st.twinkleSpeed;
    st.y+=st.speed;
    if(st.y>dfH+5){st.y=-5;st.x=Math.random()*dfW;}
  }

  // Comets
  for (var i = dfComets.length - 1; i >= 0; i--) {
    var c = dfComets[i];
    c.trail.push({x: c.x, y: c.y, life: 30});
    if (c.trail.length > 30) c.trail.shift();
    for (var t = c.trail.length - 1; t >= 0; t--) { c.trail[t].life--; if (c.trail[t].life <= 0) c.trail.splice(t, 1); }
    c.x += c.vx; c.y += c.vy;
    c.life--;
    if (c.life <= 0 || c.x < -100 || c.x > dfW + 100) dfComets.splice(i, 1);
  }

  // Warp rings
  for (var i = dfWarpRings.length - 1; i >= 0; i--) {
    var wr = dfWarpRings[i];
    wr.r += (wr.maxR - wr.r) * 0.1;
    wr.life--;
    if (wr.life <= 0) dfWarpRings.splice(i, 1);
  }

  coopSyncMyState();
}

// ============================================================
// DRAW
// ============================================================
function drawDefense() {
  var ctx = dfCtx;
  ctx.save();

  // Zoom punch
  if (dfZoomPunch > 0.01) {
    var zf = 1 + dfZoomPunch * 0.05;
    ctx.translate(dfW/2, dfH/2);
    ctx.scale(zf, zf);
    ctx.translate(-dfW/2, -dfH/2);
  }

  if(dfShake>0.5) ctx.translate((Math.random()-.5)*dfShake*2,(Math.random()-.5)*dfShake*2);

  // BG
  ctx.fillStyle="#050812";ctx.fillRect(0,0,dfW,dfH);

  // Nebulae
  var ng1=ctx.createRadialGradient(dfW*0.2,dfH*0.3,0,dfW*0.2,dfH*0.3,dfW*0.45);
  ng1.addColorStop(0,"rgba(40,60,140,0.12)");ng1.addColorStop(1,"transparent");ctx.fillStyle=ng1;ctx.fillRect(0,0,dfW,dfH);
  var ng2=ctx.createRadialGradient(dfW*0.8,dfH*0.7,0,dfW*0.8,dfH*0.7,dfW*0.4);
  ng2.addColorStop(0,"rgba(120,30,80,0.1)");ng2.addColorStop(1,"transparent");ctx.fillStyle=ng2;ctx.fillRect(0,0,dfW,dfH);
  var ng3=ctx.createRadialGradient(dfW*0.5,dfH*0.1,0,dfW*0.5,dfH*0.1,dfW*0.3);
  ng3.addColorStop(0,"rgba(70,0,110,0.08)");ng3.addColorStop(1,"transparent");ctx.fillStyle=ng3;ctx.fillRect(0,0,dfW,dfH);

  // Stars
  for(var i=0;i<dfStars.length;i++){
    var st=dfStars[i];
    var tw=0.25+Math.sin(st.twinkle)*0.35+st.b*0.4;
    ctx.globalAlpha=Math.max(0.05,tw);
    ctx.fillStyle=st.color;
    if(st.s>2){
      ctx.shadowColor=st.color;ctx.shadowBlur=st.s*2.5;
      ctx.beginPath();ctx.arc(st.x,st.y,st.s*0.5,0,Math.PI*2);ctx.fill();
      ctx.shadowBlur=0;
    } else {
      ctx.fillRect(st.x,st.y,st.s,st.s);
    }
  }
  ctx.globalAlpha=1;

  // Comets
  for (var i = 0; i < dfComets.length; i++) {
    var c = dfComets[i];
    for (var t = 0; t < c.trail.length; t++) {
      var tp = c.trail[t];
      var al = (t / c.trail.length) * 0.6;
      ctx.globalAlpha = al;
      ctx.fillStyle = "#aaddff";
      ctx.fillRect(tp.x, tp.y, 2, 2);
    }
    ctx.globalAlpha = 1;
    ctx.shadowColor = "#fff"; ctx.shadowBlur = 8;
    ctx.fillStyle = "#fff";
    ctx.beginPath(); ctx.arc(c.x, c.y, 2, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Warp rings
  for (var i = 0; i < dfWarpRings.length; i++) {
    var wr = dfWarpRings[i];
    ctx.globalAlpha = wr.life / wr.maxLife * 0.3;
    ctx.strokeStyle = "#6ec6ff";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(wr.x, wr.y, wr.r, 0, Math.PI*2); ctx.stroke();
    ctx.globalAlpha = 1;
  }

  drawBase(ctx);

  // Powerups
  for (var i = 0; i < dfPowerups.length; i++) drawPowerup(ctx, dfPowerups[i]);

  for(var i=0;i<dfEnemies.length;i++) drawEnemy(ctx,dfEnemies[i]);
  for(var i=0;i<dfBullets.length;i++) drawBullet(ctx,dfBullets[i]);

  // Shells
  for (var i = 0; i < dfShells.length; i++) {
    var sh = dfShells[i];
    ctx.save();
    ctx.translate(sh.x, sh.y);
    ctx.rotate(sh.rot);
    ctx.globalAlpha = Math.min(1, sh.life / 20);
    ctx.fillStyle = "#d4af37";
    ctx.fillRect(-2, -1, 4, 2);
    ctx.restore();
  }
  ctx.globalAlpha = 1;

  // Partner bullets
  if(dfCoop&&dfPartnerBullets.length>0){
    for(var i=0;i<dfPartnerBullets.length;i++){
      var pb=dfPartnerBullets[i];
      ctx.shadowColor = dfIsHost ? "#ff9f43" : "#6ec6ff"; ctx.shadowBlur = 4;
      ctx.fillStyle=dfIsHost?"#ff9f43":"#6ec6ff";
      ctx.globalAlpha=0.85;ctx.beginPath();ctx.arc(pb.x,pb.y,2.5,0,Math.PI*2);ctx.fill();
      ctx.shadowBlur = 0;
    }
    ctx.globalAlpha=1;
  }

  // Particles
  for(var i=0;i<dfParticles.length;i++){
    var p=dfParticles[i];
    ctx.globalAlpha=p.life/p.maxLife;
    if (p.ring) {
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(p.x, p.y, (1 - p.life/p.maxLife) * p.size * 3, 0, Math.PI*2);
      ctx.stroke();
    } else {
      ctx.fillStyle=p.color;
      ctx.fillRect(p.x-p.size/2,p.y-p.size/2,p.size,p.size);
    }
  }
  ctx.globalAlpha=1;

  // Drones
  for(var i=0;i<dfDrones.length;i++){
    var d=dfDrones[i];
    var dx=dfShip.x+Math.cos(d.angle)*d.dist,dy=dfShip.y+Math.sin(d.angle)*d.dist;
    ctx.shadowColor = "#54a0ff"; ctx.shadowBlur = 8;
    ctx.fillStyle="#54a0ff";ctx.beginPath();ctx.arc(dx,dy,6,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#aaddff";ctx.beginPath();ctx.arc(dx,dy,3,0,Math.PI*2);ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Partner ship
  if(dfCoop&&dfPartnerShip&&dfPartnerShip.x) drawPartnerShip(ctx,dfPartnerShip);

  // My ship
  if(dfUpgrades.shipHP>0&&(dfInvincible<=0||Math.floor(dfInvincible/4)%2===0)){
    if (dfShieldActive > 0) {
      var sr = 22 + Math.sin(dfTime * 0.1) * 2;
      ctx.strokeStyle = "rgba(110,198,255," + (0.4 + Math.sin(dfTime*0.15)*0.2) + ")";
      ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(dfShip.x, dfShip.y, sr, 0, Math.PI*2); ctx.stroke();
      ctx.strokeStyle = "rgba(110,198,255,0.15)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(dfShip.x, dfShip.y, sr + 4, 0, Math.PI*2); ctx.stroke();
    }
    drawPixelShipDefense(ctx, dfShip.x, dfShip.y, dfShip.angle + Math.PI/2, 30, dfShip.thrust);
  }

  // Damage numbers
  for (var i = 0; i < dfDamageNumbers.length; i++) {
    var dn = dfDamageNumbers[i];
    ctx.globalAlpha = Math.min(1, dn.life / dn.maxLife * 1.5);
    ctx.font = "bold 14px Inter";
    ctx.textAlign = "center";
    ctx.fillStyle = "#000"; ctx.fillText(dn.text, dn.x + 1, dn.y + 1);
    ctx.fillStyle = dn.color; ctx.fillText(dn.text, dn.x, dn.y);
  }
  ctx.globalAlpha = 1;

  drawHUD(ctx);

  // Wave intro
  if(dfWaveTimer>0){
    ctx.fillStyle="rgba(0,0,0,0.5)";ctx.fillRect(0,0,dfW,dfH);
    var scale = 1 + (1 - dfWaveTimer/180) * 0.1;
    ctx.save();
    ctx.translate(dfW/2, dfH/2 - 20);
    ctx.scale(scale, scale);
    ctx.fillStyle="#feca57";ctx.font="bold 54px Inter";ctx.textAlign="center";
    ctx.shadowColor="#feca57"; ctx.shadowBlur=20;
    ctx.fillText("ВОЛНА "+dfWave,0,0);
    ctx.shadowBlur=0;
    ctx.restore();
    ctx.font="20px Inter";ctx.fillStyle="#fff";ctx.textAlign="center";
    ctx.fillText(dfCoop?"Работайте в команде!":"Приготовьтесь!",dfW/2,dfH/2+30);
    if (dfWave % 5 === 0) {
      ctx.fillStyle = "#ff4757"; ctx.font = "bold 16px Inter";
      ctx.fillText("⚠ БОСС ⚠", dfW/2, dfH/2 + 60);
    }
  }

  // Killstreak
  if (dfKillstreakTimer > 0) {
    var ksY = 130;
    var ksScale = 1 + (90 - dfKillstreakTimer) / 30;
    if (ksScale > 1.5) ksScale = 1.5 - (ksScale - 1.5) * 0.3;
    ctx.save();
    ctx.translate(dfW/2, ksY);
    ctx.scale(Math.max(0.3, ksScale), Math.max(0.3, ksScale));
    ctx.globalAlpha = Math.min(1, dfKillstreakTimer / 30);
    ctx.fillStyle = dfKillstreakColor;
    ctx.font = "bold 28px Inter";
    ctx.textAlign = "center";
    ctx.shadowColor = dfKillstreakColor; ctx.shadowBlur = 15;
    ctx.fillText(dfKillstreakText, 0, 0);
    ctx.shadowBlur = 0;
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  // Minimap
  drawMinimap(ctx);

  ctx.restore();

  // Full-screen effects (after restore)
  if(dfFlash>0.01){
    ctx.fillStyle="rgba(255,71,87,"+(dfFlash*0.35)+")";
    ctx.fillRect(0,0,dfW,dfH);
  }
  if (dfChromatic > 0.05) {
    ctx.globalAlpha = dfChromatic * 0.3;
    ctx.fillStyle = "rgba(255,0,0,0.2)";
    ctx.fillRect(-2, 0, dfW, dfH);
    ctx.fillStyle = "rgba(0,255,255,0.2)";
    ctx.fillRect(2, 0, dfW, dfH);
    ctx.globalAlpha = 1;
  }
}

function drawMinimap(ctx) {
  var mw = 130, mh = 85, mx = dfW - mw - 12, my = dfH - mh - 12;
  ctx.fillStyle = "rgba(10,15,30,0.7)";
  drawRoundRect(ctx, mx, my, mw, mh, 8); ctx.fill();
  ctx.strokeStyle = "rgba(110,198,255,0.3)"; ctx.lineWidth = 1;
  drawRoundRect(ctx, mx, my, mw, mh, 8); ctx.stroke();

  var sx = mw / dfW, sy = mh / dfH;

  // Base
  ctx.fillStyle = "#6ec6ff";
  ctx.beginPath(); ctx.arc(mx + dfBase.x * sx, my + dfBase.y * sy, 2.5, 0, Math.PI*2); ctx.fill();

  // Enemies
  for (var i = 0; i < dfEnemies.length; i++) {
    var e = dfEnemies[i];
    ctx.fillStyle = e.type === "boss" ? "#feca57" : "#ff4757";
    ctx.fillRect(mx + e.x * sx - 1, my + e.y * sy - 1, 2, 2);
  }

  // Powerups
  for (var i = 0; i < dfPowerups.length; i++) {
    var p = dfPowerups[i];
    ctx.fillStyle = POWERUP_TYPES[p.type].color;
    ctx.fillRect(mx + p.x * sx - 1, my + p.y * sy - 1, 2, 2);
  }

  // Player
  ctx.fillStyle = "#2ed573";
  ctx.beginPath(); ctx.arc(mx + dfShip.x * sx, my + dfShip.y * sy, 2, 0, Math.PI*2); ctx.fill();

  // Partner
  if (dfCoop && dfPartnerShip && dfPartnerShip.x) {
    ctx.fillStyle = "#ff9f43";
    ctx.beginPath(); ctx.arc(mx + dfPartnerShip.x * sx, my + dfPartnerShip.y * sy, 2, 0, Math.PI*2); ctx.fill();
  }
}

// Pixel ship renderer (fallback to simple if global is missing)
function drawPixelShipDefense(ctx, x, y, angle, size, thrust) {
  if (typeof drawPixelShip === "function") {
    return drawPixelShip(ctx, x, y, angle, size, thrust);
  }
  // Fallback: clean vector ship
  ctx.save(); ctx.translate(x, y); ctx.rotate(angle);
  var sz = size/16;

  if (thrust) {
    var grd = ctx.createRadialGradient(0, sz*10, 0, 0, sz*10, sz*18);
    grd.addColorStop(0, 'rgba(110,198,255,0.9)');
    grd.addColorStop(1, 'rgba(110,198,255,0)');
    ctx.fillStyle = grd;
    ctx.beginPath(); ctx.arc(0, sz*10, sz*18, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#6ec6ff';
    ctx.beginPath();
    ctx.moveTo(-sz*3, sz*6);
    ctx.lineTo(0, sz*(10 + Math.random()*6));
    ctx.lineTo(sz*3, sz*6);
    ctx.fill();
  }

  // Hull
  var hullGrad = ctx.createLinearGradient(0, -sz*8, 0, sz*6);
  hullGrad.addColorStop(0, '#aaddff');
  hullGrad.addColorStop(0.5, '#6ec6ff');
  hullGrad.addColorStop(1, '#3a6fa8');
  ctx.fillStyle = hullGrad;
  ctx.beginPath();
  ctx.moveTo(0, -sz*8);
  ctx.lineTo(-sz*6, sz*6);
  ctx.lineTo(-sz*2, sz*4);
  ctx.lineTo(0, sz*5);
  ctx.lineTo(sz*2, sz*4);
  ctx.lineTo(sz*6, sz*6);
  ctx.closePath(); ctx.fill();

  // Cockpit
  ctx.fillStyle = '#feca57';
  ctx.beginPath();
  ctx.moveTo(0, -sz*5);
  ctx.lineTo(-sz*2, sz*1);
  ctx.lineTo(sz*2, sz*1);
  ctx.closePath(); ctx.fill();

  // Outline
  ctx.strokeStyle = '#1a2a40'; ctx.lineWidth = sz*0.8;
  ctx.beginPath();
  ctx.moveTo(0, -sz*8);
  ctx.lineTo(-sz*6, sz*6);
  ctx.lineTo(-sz*2, sz*4);
  ctx.lineTo(0, sz*5);
  ctx.lineTo(sz*2, sz*4);
  ctx.lineTo(sz*6, sz*6);
  ctx.closePath(); ctx.stroke();

  // Engines
  ctx.fillStyle = '#ff4757';
  ctx.fillRect(-sz*5, sz*3, sz*2, sz*1.5);
  ctx.fillRect(sz*3, sz*3, sz*2, sz*1.5);
  ctx.restore();
}

function drawPartnerShip(ctx, ps) {
  if(!ps||ps.hp<=0) return;
  ctx.save();ctx.translate(ps.x,ps.y);ctx.rotate(ps.angle+Math.PI/2);
  var sz=30/16;
  if(ps.thrust){
    var grd=ctx.createRadialGradient(0,sz*10,0,0,sz*10,sz*14);
    grd.addColorStop(0,'rgba(255,159,67,.8)');grd.addColorStop(1,'rgba(255,159,67,0)');
    ctx.fillStyle=grd;ctx.beginPath();ctx.arc(0,sz*10,sz*14,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#ff9f43';ctx.beginPath();ctx.moveTo(-sz*3,sz*6);ctx.lineTo(0,sz*(10+Math.random()*6));ctx.lineTo(sz*3,sz*6);ctx.fill();
  }
  ctx.fillStyle='#e8c088';ctx.beginPath();ctx.moveTo(0,-sz*8);ctx.lineTo(-sz*6,sz*6);ctx.lineTo(-sz*2,sz*4);ctx.lineTo(0,sz*5);ctx.lineTo(sz*2,sz*4);ctx.lineTo(sz*6,sz*6);ctx.closePath();ctx.fill();
  ctx.fillStyle='#ffaa44';ctx.beginPath();ctx.moveTo(0,-sz*5);ctx.lineTo(-sz*2,sz*1);ctx.lineTo(sz*2,sz*1);ctx.closePath();ctx.fill();
  ctx.strokeStyle='#8a6a3a';ctx.lineWidth=sz*0.8;ctx.beginPath();ctx.moveTo(0,-sz*8);ctx.lineTo(-sz*6,sz*6);ctx.lineTo(-sz*2,sz*4);ctx.lineTo(0,sz*5);ctx.lineTo(sz*2,sz*4);ctx.lineTo(sz*6,sz*6);ctx.closePath();ctx.stroke();
  ctx.fillStyle='#ff6b4a';ctx.fillRect(-sz*5,sz*3,sz*2,sz*1.5);ctx.fillRect(sz*3,sz*3,sz*2,sz*1.5);
  if (ps.shielded) {
    ctx.strokeStyle = "rgba(110,198,255,0.4)"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, 0, sz*10, 0, Math.PI*2); ctx.stroke();
  }
  ctx.restore();
  ctx.font="bold 10px Inter";ctx.fillStyle="#ff9f43";ctx.textAlign="center";
  ctx.fillText(dfPartnerName||"Напарник",ps.x,ps.y-24);
  if(ps.maxHp&&ps.hp!==undefined){
    var bw=30,bh=3;ctx.fillStyle="rgba(0,0,0,0.5)";ctx.fillRect(ps.x-bw/2,ps.y+20,bw,bh);
    var pct=ps.hp/ps.maxHp;ctx.fillStyle=pct>0.5?"#2ed573":(pct>0.25?"#feca57":"#ff4757");
    ctx.fillRect(ps.x-bw/2,ps.y+20,bw*pct,bh);
  }
}

function drawBase(ctx) {
  var b=dfBase,u=dfUpgrades,t=dfTime||0;

  // Outer energy rings (multiple for depth)
  ctx.save();ctx.translate(b.x,b.y);

  // Ring 1 - слабый, большой
  ctx.rotate(t*0.003);
  ctx.strokeStyle="rgba(110,198,255,0.08)";ctx.lineWidth=1;
  ctx.beginPath();ctx.arc(0,0,b.radius+16,0,Math.PI*2);ctx.stroke();
  for(var i=0;i<12;i++){
    var ra=(Math.PI*2/12)*i;
    ctx.fillStyle="rgba(110,198,255,0.15)";
    ctx.beginPath();ctx.arc(Math.cos(ra)*(b.radius+16),Math.sin(ra)*(b.radius+16),1.5,0,Math.PI*2);ctx.fill();
  }
  ctx.restore();

  // Ring 2 - средний, контр-вращение
  ctx.save();ctx.translate(b.x,b.y);ctx.rotate(-t*0.005);
  ctx.strokeStyle="rgba(110,198,255,0.15)";ctx.lineWidth=1;
  ctx.setLineDash([8,4]);
  ctx.beginPath();ctx.arc(0,0,b.radius+10,0,Math.PI*2);ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  // Energy arcs (electric effects)
  if (Math.random() < 0.3) {
    ctx.save();ctx.translate(b.x,b.y);
    ctx.strokeStyle="rgba(170,221,255,0.4)";ctx.lineWidth=1;
    for (var a = 0; a < 3; a++) {
      var sa = Math.random() * Math.PI * 2;
      var ea = sa + (Math.random() - 0.5) * 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, b.radius + 2, sa, ea);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Base body
  var grd=ctx.createRadialGradient(b.x-6,b.y-6,0,b.x,b.y,b.radius);
  grd.addColorStop(0,"#7aa0ff");grd.addColorStop(0.35,"#3a5cb7");grd.addColorStop(0.75,"#1a2a80");grd.addColorStop(1,"#0d1650");
  ctx.beginPath();ctx.arc(b.x,b.y,b.radius,0,Math.PI*2);ctx.fillStyle=grd;ctx.fill();

  // Hex pattern
  ctx.save();ctx.translate(b.x,b.y);ctx.rotate(t*-0.004);
  ctx.strokeStyle="rgba(170,221,255,0.2)";ctx.lineWidth=0.8;
  ctx.beginPath();
  for(var i=0;i<6;i++){
    var ha=(Math.PI*2/6)*i,hr=b.radius*0.7;
    var hx=Math.cos(ha)*hr,hy=Math.sin(ha)*hr;
    if(i===0)ctx.moveTo(hx,hy);else ctx.lineTo(hx,hy);
  }
  ctx.closePath();ctx.stroke();
  // Inner hex
  ctx.strokeStyle="rgba(170,221,255,0.1)";
  ctx.beginPath();
  for(var i=0;i<6;i++){
    var ha=(Math.PI*2/6)*i,hr=b.radius*0.45;
    var hx=Math.cos(ha)*hr,hy=Math.sin(ha)*hr;
    if(i===0)ctx.moveTo(hx,hy);else ctx.lineTo(hx,hy);
  }
  ctx.closePath();ctx.stroke();
  ctx.restore();

  // Pulsing core
  var pulse=0.5+Math.sin(t*0.08)*0.2;
  var cg=ctx.createRadialGradient(b.x,b.y,0,b.x,b.y,b.radius*0.5);
  cg.addColorStop(0,"rgba(170,221,255,"+pulse+")");
  cg.addColorStop(1,"rgba(110,198,255,0)");
  ctx.beginPath();ctx.arc(b.x,b.y,b.radius*0.5,0,Math.PI*2);ctx.fillStyle=cg;ctx.fill();

  // Core
  ctx.shadowColor="#aaddff"; ctx.shadowBlur=12;
  ctx.beginPath();ctx.arc(b.x,b.y,4,0,Math.PI*2);ctx.fillStyle="#ffffff";ctx.fill();
  ctx.shadowBlur=0;

  // Edge
  ctx.beginPath();ctx.arc(b.x,b.y,b.radius,0,Math.PI*2);
  ctx.strokeStyle="rgba(110,198,255,"+(0.5+Math.sin(t*0.06)*0.2)+")";ctx.lineWidth=2;ctx.stroke();

  // Co-op ring
  if(dfCoop){
    ctx.strokeStyle="rgba(255,159,67,0.3)";ctx.lineWidth=1;
    ctx.beginPath();ctx.arc(b.x,b.y,b.radius+5,0,Math.PI*2);ctx.stroke();
  }

  // Health bar
  var bw=80,bh=7;
  ctx.fillStyle="rgba(0,0,0,0.6)";
  drawRoundRect(ctx,b.x-bw/2,b.y+b.radius+14,bw,bh,3);ctx.fill();
  var pct=u.baseHP/u.baseMaxHP;
  var hpColor=pct>0.5?"#2ed573":(pct>0.25?"#feca57":"#ff4757");
  if(pct>0){
    var hpGrad = ctx.createLinearGradient(b.x-bw/2, 0, b.x+bw/2, 0);
    hpGrad.addColorStop(0, hpColor); hpGrad.addColorStop(1, hpColor);
    ctx.fillStyle=hpGrad;
    drawRoundRect(ctx,b.x-bw/2,b.y+b.radius+14,bw*pct,bh,3);ctx.fill();
  }
  ctx.fillStyle = "#fff"; ctx.font = "bold 9px 'JetBrains Mono'"; ctx.textAlign = "center";
  ctx.fillText(u.baseHP + "/" + u.baseMaxHP, b.x, b.y + b.radius + 19);

  // Turret pods (rotating)
  for(var i=0;i<u.turrets;i++){
    var ta=(Math.PI*2/Math.max(u.turrets,1))*i-Math.PI/2+t*0.012;
    var tx=b.x+Math.cos(ta)*(b.radius+7),ty=b.y+Math.sin(ta)*(b.radius+7);
    ctx.shadowColor="#feca57"; ctx.shadowBlur=6;
    ctx.fillStyle="#feca57";ctx.beginPath();ctx.arc(tx,ty,4.5,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#ffe066";ctx.beginPath();ctx.arc(tx,ty,2,0,Math.PI*2);ctx.fill();
    ctx.shadowBlur=0;
  }
}

function drawEnemy(ctx, e) {
  ctx.save();ctx.translate(e.x,e.y);

  if (e.type==="asteroid") {
    var rng=seedRng(e.seed), pts=10;
    // Shadow
    ctx.beginPath();
    for(var i=0;i<pts;i++){
      var a=(i/pts)*Math.PI*2,r=e.radius*(0.7+rng()*0.3);
      if(i===0)ctx.moveTo(Math.cos(a)*r+2,Math.sin(a)*r+2);
      else ctx.lineTo(Math.cos(a)*r+2,Math.sin(a)*r+2);
    }
    ctx.closePath();
    ctx.fillStyle="rgba(0,0,0,0.3)"; ctx.fill();

    // Body
    var rng2=seedRng(e.seed);
    ctx.beginPath();
    for(var i=0;i<pts;i++){
      var a=(i/pts)*Math.PI*2,r=e.radius*(0.7+rng2()*0.3);
      if(i===0)ctx.moveTo(Math.cos(a)*r,Math.sin(a)*r);
      else ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r);
    }
    ctx.closePath();
    var ag = ctx.createRadialGradient(-e.radius*0.3,-e.radius*0.3,0,0,0,e.radius);
    ag.addColorStop(0, "#8a7050"); ag.addColorStop(1, "#3a2a1a");
    ctx.fillStyle=ag; ctx.fill();
    ctx.strokeStyle="#2a1a0a"; ctx.lineWidth=1.5; ctx.stroke();

    // Craters
    var rng3 = seedRng(e.seed + 1);
    for (var c = 0; c < 3; c++) {
      var cx = (rng3()-0.5)*e.radius*0.8, cy = (rng3()-0.5)*e.radius*0.8;
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.beginPath(); ctx.arc(cx, cy, e.radius*0.15, 0, Math.PI*2); ctx.fill();
    }
  }
  else if (e.type==="ship") {
    ctx.rotate(e.angle||0);
    // Glow
    ctx.shadowColor="#ff4757"; ctx.shadowBlur=8;
    var hg = ctx.createLinearGradient(0, -8, 0, 8);
    hg.addColorStop(0, "#ff6b6b"); hg.addColorStop(1, "#8b0000");
    ctx.fillStyle=hg;
    ctx.beginPath();
    ctx.moveTo(14,0);ctx.lineTo(-10,-8);ctx.lineTo(-6,0);ctx.lineTo(-10,8);ctx.closePath();
    ctx.fill();
    ctx.shadowBlur=0;
    ctx.strokeStyle="#cc3344"; ctx.lineWidth=1.2; ctx.stroke();
    // Cockpit
    ctx.fillStyle="#ffeecc"; ctx.fillRect(-1, -2, 8, 4);
  }
  else if (e.type==="stealth") {
    var phase = e.phaseTimer || 0;
    var visible = phase < 30 || phase > 90;
    ctx.globalAlpha = visible ? 0.9 : 0.25;
    ctx.rotate(Math.atan2(dfBase.y-e.y,dfBase.x-e.x));
    ctx.shadowColor="#a855f7"; ctx.shadowBlur=10;
    ctx.fillStyle="#4a1f6a";
    ctx.beginPath();
    ctx.moveTo(12,0);ctx.lineTo(-8,-7);ctx.lineTo(-4,0);ctx.lineTo(-8,7);ctx.closePath();
    ctx.fill();
    ctx.strokeStyle="#a855f7"; ctx.lineWidth=1.2; ctx.stroke();
    ctx.shadowBlur=0;
    ctx.fillStyle="#ff4757"; ctx.fillRect(2, -1, 3, 2);
    ctx.globalAlpha = 1;
  }
  else if (e.type==="splitter") {
    var spin = dfTime * 0.05;
    ctx.rotate(spin);
    var sg = ctx.createRadialGradient(0,0,0,0,0,e.radius);
    sg.addColorStop(0, "#ff9f43"); sg.addColorStop(1, "#8b4513");
    ctx.fillStyle=sg;
    ctx.beginPath();
    for (var s = 0; s < 6; s++) {
      var sa = (Math.PI*2/6)*s;
      var sr = e.radius * (s%2===0 ? 1 : 0.7);
      if (s===0) ctx.moveTo(Math.cos(sa)*sr, Math.sin(sa)*sr);
      else ctx.lineTo(Math.cos(sa)*sr, Math.sin(sa)*sr);
    }
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle="#4a2a0a"; ctx.lineWidth=2; ctx.stroke();
    ctx.fillStyle="#feca57";
    ctx.beginPath(); ctx.arc(0,0,e.radius*0.3,0,Math.PI*2); ctx.fill();
  }
  else if (e.type==="shielded") {
    ctx.rotate(Math.atan2(dfBase.y-e.y,dfBase.x-e.x));
    var sgr = ctx.createRadialGradient(0,0,0,0,0,e.radius);
    sgr.addColorStop(0, "#ffaa44"); sgr.addColorStop(1, "#aa5522");
    ctx.fillStyle=sgr;
    ctx.beginPath();
    ctx.moveTo(e.radius, 0);
    for (var s = 1; s < 8; s++) {
      var sa = (Math.PI*2/8)*s;
      ctx.lineTo(Math.cos(sa)*e.radius, Math.sin(sa)*e.radius);
    }
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle="#552200"; ctx.lineWidth=1.5; ctx.stroke();
    ctx.rotate(-Math.atan2(dfBase.y-e.y,dfBase.x-e.x));

    // Shield bubble
    if (e.shielded && e.shieldHP > 0) {
      ctx.strokeStyle = "rgba(110,198,255,"+(0.4+Math.sin(dfTime*0.15)*0.2)+")";
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0,0,e.radius+5,0,Math.PI*2); ctx.stroke();
      ctx.strokeStyle = "rgba(110,198,255,0.15)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(0,0,e.radius+8,0,Math.PI*2); ctx.stroke();
    }
  }
  else if (e.type==="boss") {
    ctx.rotate(Math.atan2(dfBase.y-e.y,dfBase.x-e.x));
    var r = e.radius;
    // Glow aura
    ctx.shadowColor="#ff4757"; ctx.shadowBlur=20;
    var bgrd = ctx.createRadialGradient(0,0,0,0,0,r);
    bgrd.addColorStop(0, "#ff4757"); bgrd.addColorStop(0.7, "#8b0000"); bgrd.addColorStop(1, "#3a0000");
    ctx.fillStyle=bgrd;
    ctx.beginPath();
    ctx.moveTo(r,0);
    ctx.lineTo(-r*0.7,-r*0.85);
    ctx.lineTo(-r*0.3,-r*0.2);
    ctx.lineTo(-r*0.5,0);
    ctx.lineTo(-r*0.3,r*0.2);
    ctx.lineTo(-r*0.7,r*0.85);
    ctx.closePath();ctx.fill();
    ctx.shadowBlur=0;
    ctx.strokeStyle="#ff6b6b"; ctx.lineWidth=2; ctx.stroke();

    // Core
    ctx.shadowColor="#ffff00"; ctx.shadowBlur=10;
    ctx.fillStyle="#feca57";
    ctx.beginPath(); ctx.arc(-r*0.1, 0, r*0.25, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur=0;
    ctx.fillStyle="#fff";
    ctx.beginPath(); ctx.arc(-r*0.1, 0, r*0.1, 0, Math.PI*2); ctx.fill();

    ctx.rotate(-Math.atan2(dfBase.y-e.y,dfBase.x-e.x));

    // HP bar
    var bw=r*2.2, bh=5;
    ctx.fillStyle="rgba(0,0,0,0.7)";
    drawRoundRect(ctx,-bw/2,-r-14,bw,bh,2); ctx.fill();
    var bpct = e.hp/e.maxHp;
    ctx.fillStyle = bpct > 0.5 ? "#ff4757" : "#feca57";
    if (bpct > 0) { drawRoundRect(ctx,-bw/2,-r-14,bw*bpct,bh,2); ctx.fill(); }

    ctx.font = "bold 10px Inter"; ctx.fillStyle = "#feca57"; ctx.textAlign = "center";
    ctx.fillText("БОСС", 0, -r-20);
  }
  ctx.restore();
}

function drawPowerup(ctx, p) {
  var P = POWERUP_TYPES[p.type];
  if (!P) return;
  var bob = Math.sin(dfTime * 0.08 + p.x * 0.01) * 3;
  ctx.save();
  ctx.translate(p.x, p.y + bob);
  ctx.rotate(p.spin);

  // Outer glow
  ctx.shadowColor = P.color; ctx.shadowBlur = 15;
  var pulse = 0.5 + Math.sin(dfTime * 0.1) * 0.2;
  ctx.globalAlpha = Math.min(1, p.life / 60);

  // Crystal shape
  ctx.fillStyle = P.color;
  ctx.beginPath();
  ctx.moveTo(0, -12);
  ctx.lineTo(10, 0);
  ctx.lineTo(0, 12);
  ctx.lineTo(-10, 0);
  ctx.closePath();
  ctx.fill();

  // Inner shine
  ctx.shadowBlur = 0;
  ctx.fillStyle = "rgba(255,255,255," + pulse + ")";
  ctx.beginPath();
  ctx.moveTo(0, -6);
  ctx.lineTo(4, 0);
  ctx.lineTo(0, 6);
  ctx.lineTo(-4, 0);
  ctx.closePath();
  ctx.fill();

  // Emoji
  ctx.rotate(-p.spin);
  ctx.font = "bold 14px Inter"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillStyle = "#fff";
  ctx.fillText(P.emoji, 0, 1);

  ctx.globalAlpha = 1;
  ctx.restore();
}

function drawBullet(ctx, b) {
  if(b.owner==="enemy"){
    ctx.shadowColor="#ff4757"; ctx.shadowBlur=6;
    ctx.fillStyle="#ff4757";
    ctx.beginPath();ctx.arc(b.x,b.y,3,0,Math.PI*2);ctx.fill();
    ctx.shadowBlur=0;
    ctx.fillStyle="rgba(255,71,87,0.3)";
    ctx.beginPath();ctx.arc(b.x,b.y,5,0,Math.PI*2);ctx.fill();
  }
  else if(b.type==="laser"){
    ctx.strokeStyle="#ff4757";ctx.lineWidth=3;
    ctx.shadowColor="#ff4757";ctx.shadowBlur=10;
    ctx.beginPath();ctx.moveTo(b.x,b.y);ctx.lineTo(b.x-b.vx*2,b.y-b.vy*2);ctx.stroke();
    ctx.shadowBlur=0;
  }
  else if(b.type==="rocket"){
    // Rocket body + flame trail
    var ra = Math.atan2(b.vy, b.vx);
    ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(ra);
    ctx.shadowColor = "#ff9f43"; ctx.shadowBlur = 8;
    ctx.fillStyle="#feca57";
    ctx.beginPath();
    ctx.moveTo(5, 0); ctx.lineTo(-3, -3); ctx.lineTo(-3, 3); ctx.closePath();
    ctx.fill();
    ctx.fillStyle="#ff4757";
    ctx.beginPath();
    ctx.moveTo(-3, 0); ctx.lineTo(-8, -2); ctx.lineTo(-10, 0); ctx.lineTo(-8, 2); ctx.closePath();
    ctx.fill();
    ctx.restore();
    ctx.shadowBlur=0;
  }
  else if(b.type==="plasma"){
    ctx.shadowColor = "#a855f7"; ctx.shadowBlur = 10;
    ctx.fillStyle = "#a855f7";
    ctx.beginPath(); ctx.arc(b.x, b.y, 4, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = "#e0c0ff";
    ctx.beginPath(); ctx.arc(b.x, b.y, 2, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0;
    // Trail
    ctx.strokeStyle = "rgba(168,85,247,0.4)";
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(b.x - b.vx, b.y - b.vy); ctx.stroke();
  }
  else if(b.owner==="player"&&(dfUpgrades.homing>0||dfUpgrades.piercing>0)){
    var bc=dfUpgrades.piercing>0?"#a855f7":"#6ec6ff";
    var bg=dfUpgrades.piercing>0?"rgba(168,85,247,":"rgba(110,198,255,";
    ctx.strokeStyle=bg+"0.5)";ctx.lineWidth=dfUpgrades.piercing>0?2.5:1.8;
    ctx.beginPath();ctx.moveTo(b.x,b.y);ctx.lineTo(b.x-b.vx*1.5,b.y-b.vy*1.5);ctx.stroke();
    ctx.shadowColor = bc; ctx.shadowBlur = 6;
    ctx.fillStyle=bc;ctx.beginPath();ctx.arc(b.x,b.y,2.8,0,Math.PI*2);ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(b.x,b.y,1,0,Math.PI*2);ctx.fill();
  }
  else {
    ctx.shadowColor = b.owner==="turret"?"#feca57":"#6ec6ff"; ctx.shadowBlur = 4;
    ctx.fillStyle=b.owner==="turret"?"#feca57":"#6ec6ff";
    ctx.beginPath();ctx.arc(b.x,b.y,2.5,0,Math.PI*2);ctx.fill();
    ctx.shadowBlur = 0;
  }
}

function drawHUD(ctx) {
  var u=dfUpgrades;
  ctx.textAlign="left";

  // Left HUD panel
  ctx.fillStyle="rgba(10,15,30,0.6)";
  drawRoundRect(ctx, 8, 8, 170, 80, 6); ctx.fill();

  ctx.font="bold 14px 'JetBrains Mono'";
  ctx.fillStyle="#fff";ctx.fillText("ВОЛНА " + dfWave, 16, 28);
  ctx.fillStyle="#feca57";ctx.fillText(dfScore + " 🏆", 16, 50);
  ctx.fillStyle="#2ed573";ctx.fillText(dfCoins + " 💰", 16, 72);

  var hudY = 100;
  if(dfCoop){
    ctx.fillStyle="rgba(255,159,67,0.15)";
    drawRoundRect(ctx, 8, hudY-14, 180, 20, 4); ctx.fill();
    ctx.fillStyle="#ff9f43";ctx.font="bold 11px Inter";
    ctx.fillText("👥 " + (dfPartnerName||"..."), 14, hudY);
    hudY += 26;
  }

  // Combo indicator
  if (dfCombo >= 3 && dfComboTimer > 0) {
    var comboW = 120, comboH = 24;
    var alpha = dfComboTimer > 60 ? 1 : dfComboTimer / 60;
    ctx.globalAlpha = alpha;
    var comboColor = dfCombo >= 50 ? "#ff4757" : (dfCombo >= 25 ? "#ff9f43" : (dfCombo >= 10 ? "#feca57" : "#6ec6ff"));
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    drawRoundRect(ctx, 8, hudY, comboW, comboH, 4); ctx.fill();
    ctx.fillStyle = comboColor;
    var combW = (dfComboTimer / 180) * comboW;
    drawRoundRect(ctx, 8, hudY, combW, comboH, 4); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.font = "bold 13px Inter";
    ctx.textAlign = "center"; ctx.fillText("COMBO x" + dfCombo, 8 + comboW/2, hudY + 16);
    ctx.textAlign = "left";
    ctx.globalAlpha = 1;
    hudY += 32;
  }

  // Active powerup buffs
  var buffY = hudY;
  if (dfShieldActive > 0) { drawBuff(ctx, 8, buffY, "🛡", "#6ec6ff", dfShieldActive, 480); buffY += 28; }
  if (dfDoubleDamage > 0) { drawBuff(ctx, 8, buffY, "⚡", "#a855f7", dfDoubleDamage, 420); buffY += 28; }
  if (dfFrozen > 0) { drawBuff(ctx, 8, buffY, "❄", "#aaddff", dfFrozen, 240); buffY += 28; }
  if (dfMagnet > 0) { drawBuff(ctx, 8, buffY, "🧲", "#feca57", dfMagnet, 360); buffY += 28; }

  // Right HUD
  ctx.textAlign="right";
  ctx.fillStyle="rgba(10,15,30,0.6)";
  drawRoundRect(ctx, dfW-180, 8, 172, 60, 6); ctx.fill();

  ctx.fillStyle="#ff4757";
  var hearts="";
  for(var i=0;i<u.shipMaxHP;i++)hearts+=(i<u.shipHP)?"❤":"🖤";
  ctx.font="14px Inter";ctx.fillText(hearts,dfW-16,28);

  ctx.font="bold 11px Inter";
  ctx.fillStyle=GUN_COLORS[u.gunType];
  ctx.fillText("🔫 "+GUN_NAMES[u.gunType],dfW-16,48);

  ctx.font="bold 10px Inter";
  ctx.fillStyle="#aaa";
  ctx.fillText("Убито: " + dfKills, dfW-16, 62);

  // Modifier indicators
  var modY=78;
  if(u.homing>0){ctx.font="bold 10px Inter";ctx.fillStyle="#6ec6ff";ctx.fillText("🎯 Нав."+u.homing,dfW-16,modY);modY+=14;}
  if(u.piercing>0){ctx.font="bold 10px Inter";ctx.fillStyle="#a855f7";ctx.fillText("⚡ Проб."+u.piercing,dfW-16,modY);modY+=14;}
  if(u.critChance>0){ctx.font="bold 10px Inter";ctx.fillStyle="#ff4757";ctx.fillText("💥 Крит "+(u.critChance*10)+"%",dfW-16,modY);modY+=14;}

  // Abilities (bottom left)
  var abY = dfH - 60;
  drawAbility(ctx, 12, abY, "SHIFT", "Рывок", dfDashCD, 120);
  drawAbility(ctx, 100, abY, "Q", "Вспышка", dfSpecialCD, 600);

  if(dfCoop){
    ctx.font="bold 10px Inter";ctx.fillStyle="#6ec6ff";ctx.textAlign="center";
    ctx.fillText("ВЫ",dfShip.x,dfShip.y-24);
  }
  ctx.textAlign="left";
}

function drawBuff(ctx, x, y, emoji, color, time, maxTime) {
  var w = 80, h = 22;
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  drawRoundRect(ctx, x, y, w, h, 4); ctx.fill();
  ctx.fillStyle = color + "44";
  drawRoundRect(ctx, x, y, w * (time/maxTime), h, 4); ctx.fill();
  ctx.font = "bold 12px Inter"; ctx.fillStyle = color;
  ctx.textAlign = "left"; ctx.fillText(emoji, x + 6, y + 16);
  ctx.fillStyle = "#fff"; ctx.font = "bold 10px 'JetBrains Mono'";
  ctx.fillText((time/60).toFixed(1)+"с", x + 30, y + 16);
}

function drawAbility(ctx, x, y, key, name, cd, maxCd) {
  var w = 80, h = 40;
  var ready = cd <= 0;
  ctx.fillStyle = ready ? "rgba(46,213,115,0.25)" : "rgba(80,80,100,0.5)";
  drawRoundRect(ctx, x, y, w, h, 6); ctx.fill();
  ctx.strokeStyle = ready ? "#2ed573" : "rgba(255,255,255,0.1)";
  ctx.lineWidth = 1;
  drawRoundRect(ctx, x, y, w, h, 6); ctx.stroke();

  ctx.fillStyle = ready ? "#2ed573" : "#888";
  ctx.font = "bold 14px 'JetBrains Mono'"; ctx.textAlign = "center";
  ctx.fillText(key, x + w/2, y + 18);
  ctx.fillStyle = "#aaa"; ctx.font = "bold 9px Inter";
  ctx.fillText(name, x + w/2, y + 32);

  if (!ready) {
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    drawRoundRect(ctx, x, y + h - 4, w * (cd/maxCd), 4, 2); ctx.fill();
  }
}

// ============================================================
// SHOP / GAMEOVER / MENU / LOBBY / WAITING
// ============================================================
function drawShop() {
  var ctx=dfCtx;
  drawDfStarsBg(ctx, true);

  ctx.textAlign="center";
  ctx.shadowColor="#feca57"; ctx.shadowBlur=12;
  ctx.fillStyle="#feca57";ctx.font="bold 36px Inter";
  ctx.fillText("⚙ МАГАЗИН УЛУЧШЕНИЙ",dfW/2,48);
  ctx.shadowBlur=0;

  ctx.font="16px Inter";ctx.fillStyle="#2ed573";
  ctx.fillText("Ваши монеты: "+dfCoins+" 💰",dfW/2,72);
  ctx.font="14px Inter";ctx.fillStyle="#aaa";
  ctx.fillText("Волна "+dfWave+" завершена  |  Очки: "+dfScore+"  |  Макс. комбо: x"+dfComboMax,dfW/2,92);
  if(dfCoop){
    ctx.font="bold 12px Inter";ctx.fillStyle="#ff9f43";
    ctx.fillText("👥 "+(dfPartnerName||"Напарник")+": "+(dfIsHost?dfGuestCoins:"?")+" монет",dfW/2,110);
  }

  var items=getShopItems(),cols=3,itemW=205,itemH=76,gap=10;
  var startX=(dfW-(cols*itemW+(cols-1)*gap))/2,startY=dfCoop?128:118;

  for(var i=0;i<items.length;i++){
    var it=items[i],col=i%cols,row=Math.floor(i/cols);
    var x=startX+col*(itemW+gap),y=startY+row*(itemH+gap);
    var canBuy=!it.max&&dfCoins>=it.cost;
    var bg=canBuy?"rgba(46,213,115,0.12)":(it.max?"rgba(255,255,255,0.03)":"rgba(255,71,87,0.06)");
    ctx.fillStyle=bg;
    drawRoundRect(ctx,x,y,itemW,itemH,10); ctx.fill();
    ctx.strokeStyle=canBuy?"#2ed57366":"rgba(255,255,255,0.08)";ctx.lineWidth=1;
    drawRoundRect(ctx,x,y,itemW,itemH,10); ctx.stroke();

    ctx.textAlign="left";
    ctx.font="bold 12px Inter";
    ctx.fillStyle=it.max?"#666":"#fff";
    ctx.fillText(it.name,x+10,y+20);

    ctx.font="10px Inter";ctx.fillStyle="#888";
    ctx.fillText(it.desc,x+10,y+36);

    if(dfCoop){
      ctx.textAlign="right";ctx.font="bold 8px Inter";
      ctx.fillStyle=it.personal?"#6ec6ff":"#ff9f43";
      ctx.fillText(it.personal?"👤 ЛИЧНОЕ":"🏠 БАЗА",x+itemW-8,y+14);
      ctx.textAlign="left";
    }

    ctx.font="bold 14px 'JetBrains Mono'";
    ctx.fillStyle=it.max?"#444":(canBuy?"#2ed573":"#ff4757");
    ctx.fillText(it.max?"МАКС":(it.cost+" 💰"),x+10,y+62);

    // Hotkey hint
    if (i < 9) {
      ctx.textAlign="right"; ctx.font="bold 11px 'JetBrains Mono'";
      ctx.fillStyle="rgba(255,255,255,0.3)";
      ctx.fillText("["+(i+1)+"]", x+itemW-8, y+62);
      ctx.textAlign="left";
    }
  }

  ctx.textAlign="center";
  ctx.font="bold 18px Inter";ctx.fillStyle="#a855f7";
  ctx.shadowColor="#a855f7"; ctx.shadowBlur=8;
  ctx.fillText("[ ПРОБЕЛ — Следующая волна ]",dfW/2,dfH-24);
  ctx.shadowBlur=0;
}

function gameOverDefense() {
  dfState="gameover";
  if(currentUser&&dfScore>0){
    db.collection("defense-scores").add({
      uid:currentUser.uid,
      name:currentUser.displayName||currentUser.email,
      score:dfScore,wave:dfWave,kills:dfKills,
      maxCombo: dfComboMax,
      coop:dfCoop,
      createdAt:new Date().toISOString()
    }).catch(function(){});
  }
  if(dfCoop&&dfIsHost) coopNotifyGameOver();
}

function drawGameOver() {
  var ctx=dfCtx;
  ctx.fillStyle="rgba(10,10,24,0.94)";ctx.fillRect(0,0,dfW,dfH);

  ctx.textAlign="center";
  ctx.shadowColor="#ff4757"; ctx.shadowBlur=20;
  ctx.fillStyle="#ff4757";ctx.font="bold 48px Inter";
  ctx.fillText("БАЗА УНИЧТОЖЕНА",dfW/2,dfH/2-100);
  ctx.shadowBlur=0;

  if(dfCoop){
    ctx.fillStyle="#ff9f43";ctx.font="bold 16px Inter";
    ctx.fillText("👥 Кооператив с "+(dfPartnerName||"напарником"),dfW/2,dfH/2-65);
  }

  ctx.fillStyle="#feca57";ctx.font="bold 32px 'JetBrains Mono'";
  ctx.fillText("Очки: "+dfScore,dfW/2,dfH/2-20);

  ctx.fillStyle="#fff";ctx.font="18px Inter";
  ctx.fillText("Волна: "+dfWave+"  |  Убито: "+dfKills+"  |  Комбо: x"+dfComboMax,dfW/2,dfH/2+20);

  ctx.fillStyle="#a855f7";ctx.font="bold 16px Inter";
  ctx.fillText("[ R — Заново ]   [ ESC — Меню ]",dfW/2,dfH/2+80);
}

function drawDefenseMenu() {
  var ctx=dfCtx;
  drawDfStarsBg(ctx, false);

  ctx.textAlign="center";

  // Title with glow
  ctx.shadowColor="#a855f7"; ctx.shadowBlur=25;
  ctx.fillStyle="#a855f7";ctx.font="bold 58px Inter";
  ctx.fillText("SPACE DEFENSE",dfW/2,dfH/2-130);
  ctx.shadowBlur=0;

  ctx.fillStyle="#6ec6ff";ctx.font="20px Inter";
  ctx.fillText("Защити базу от волн врагов!",dfW/2,dfH/2-90);

  var btnW=220,btnH=60,gap=20,bx=dfW/2-btnW-gap/2,by=dfH/2-30;

  // Solo
  var soloH=dfMenuSelection===0;
  ctx.fillStyle=soloH?"rgba(110,198,255,0.2)":"rgba(255,255,255,0.05)";
  drawRoundRect(ctx,bx,by,btnW,btnH,14);ctx.fill();
  ctx.strokeStyle=soloH?"#6ec6ff":"rgba(255,255,255,0.12)";ctx.lineWidth=2;
  drawRoundRect(ctx,bx,by,btnW,btnH,14);ctx.stroke();
  ctx.fillStyle=soloH?"#6ec6ff":"#aaa";ctx.font="bold 22px Inter";
  ctx.fillText("🚀 СОЛО",bx+btnW/2,by+38);

  // Coop
  var cx=dfW/2+gap/2,coopH=dfMenuSelection===1;
  ctx.fillStyle=coopH?"rgba(255,159,67,0.2)":"rgba(255,255,255,0.05)";
  drawRoundRect(ctx,cx,by,btnW,btnH,14);ctx.fill();
  ctx.strokeStyle=coopH?"#ff9f43":"rgba(255,255,255,0.12)";ctx.lineWidth=2;
  drawRoundRect(ctx,cx,by,btnW,btnH,14);ctx.stroke();
  ctx.fillStyle=coopH?"#ff9f43":"#aaa";ctx.font="bold 22px Inter";
  ctx.fillText("👥 КООПЕРАТИВ",cx+btnW/2,by+38);

  // Controls
  ctx.fillStyle="#888";ctx.font="13px Inter";
  ctx.fillText("WASD — движение  |  Мышь — прицел + стрельба",dfW/2,dfH/2+70);
  ctx.fillStyle="#888";
  ctx.fillText("SHIFT — рывок  |  Q — вспышка  |  1-9 — покупки в магазине",dfW/2,dfH/2+92);
  ctx.fillStyle="#666";ctx.font="12px Inter";
  ctx.fillText("Нажмите на режим для начала",dfW/2,dfH/2+120);
}

function drawLobby() {
  var ctx=dfCtx;
  drawDfStarsBg(ctx, true);
  ctx.textAlign="center";
  ctx.shadowColor="#ff9f43"; ctx.shadowBlur=15;
  ctx.fillStyle="#ff9f43";ctx.font="bold 38px Inter";
  ctx.fillText("👥 КООПЕРАТИВ",dfW/2,60);
  ctx.shadowBlur=0;

  var btnW=200,btnH=50,gap=20,centerY=dfH/2-60;

  var createSel=dfCoopMenuSel===0;
  ctx.fillStyle=createSel?"rgba(46,213,115,0.2)":"rgba(255,255,255,0.05)";
  drawRoundRect(ctx,dfW/2-btnW-gap/2,centerY,btnW,btnH,12);ctx.fill();
  ctx.strokeStyle=createSel?"#2ed573":"rgba(255,255,255,0.1)";ctx.lineWidth=2;
  drawRoundRect(ctx,dfW/2-btnW-gap/2,centerY,btnW,btnH,12);ctx.stroke();
  ctx.fillStyle=createSel?"#2ed573":"#999";ctx.font="bold 18px Inter";
  ctx.fillText("🏠 Создать",dfW/2-btnW/2-gap/2,centerY+32);

  var joinSel=dfCoopMenuSel===1;
  ctx.fillStyle=joinSel?"rgba(84,160,255,0.2)":"rgba(255,255,255,0.05)";
  drawRoundRect(ctx,dfW/2+gap/2,centerY,btnW,btnH,12);ctx.fill();
  ctx.strokeStyle=joinSel?"#54a0ff":"rgba(255,255,255,0.1)";ctx.lineWidth=2;
  drawRoundRect(ctx,dfW/2+gap/2,centerY,btnW,btnH,12);ctx.stroke();
  ctx.fillStyle=joinSel?"#54a0ff":"#999";ctx.font="bold 18px Inter";
  ctx.fillText("🔗 Войти",dfW/2+btnW/2+gap/2,centerY+32);

  if(dfCoopMenuSel===1){
    var inputW=240,inputH=44,iy=centerY+btnH+30;
    ctx.fillStyle="rgba(255,255,255,0.06)";
    drawRoundRect(ctx,dfW/2-inputW/2,iy,inputW,inputH,10);ctx.fill();
    ctx.strokeStyle="#54a0ff44";ctx.lineWidth=1;
    drawRoundRect(ctx,dfW/2-inputW/2,iy,inputW,inputH,10);ctx.stroke();
    ctx.fillStyle=dfLobbyInput?"#fff":"#666";ctx.font="bold 22px 'JetBrains Mono'";
    ctx.fillText(dfLobbyInput||"Код комнаты...",dfW/2,iy+30);
    ctx.fillStyle="#54a0ff";ctx.font="bold 13px Inter";
    ctx.fillText("[ ENTER — Присоединиться ]",dfW/2,iy+inputH+25);
  }

  if(dfLobbyMsg){ctx.fillStyle="#feca57";ctx.font="bold 14px Inter";ctx.fillText(dfLobbyMsg,dfW/2,dfH-80);}
  if(dfLobbyError){ctx.fillStyle="#ff4757";ctx.font="bold 14px Inter";ctx.fillText(dfLobbyError,dfW/2,dfH-60);}
  ctx.fillStyle="#555";ctx.font="13px Inter";ctx.fillText("[ ESC — Назад ]",dfW/2,dfH-30);
}

function drawWaiting() {
  var ctx=dfCtx;
  drawDfStarsBg(ctx, true);
  ctx.textAlign="center";

  ctx.shadowColor="#ff9f43"; ctx.shadowBlur=15;
  ctx.fillStyle="#ff9f43";ctx.font="bold 34px Inter";
  ctx.fillText("👥 КОМНАТА",dfW/2,dfH/2-100);
  ctx.shadowBlur=0;

  ctx.shadowColor="#feca57"; ctx.shadowBlur=20;
  ctx.fillStyle="#feca57";ctx.font="bold 52px 'JetBrains Mono'";
  ctx.fillText(dfRoomCode,dfW/2,dfH/2-40);
  ctx.shadowBlur=0;

  ctx.fillStyle="#888";ctx.font="14px Inter";
  ctx.fillText("Отправьте этот код напарнику",dfW/2,dfH/2-10);

  var py=dfH/2+30;
  var myName=currentUser?(currentUser.displayName||currentUser.email||"Вы"):"Вы";
  ctx.fillStyle="#6ec6ff";ctx.font="bold 16px Inter";
  ctx.fillText("🚀 "+(dfIsHost?myName:dfPartnerName||"Хост"),dfW/2,py);
  ctx.fillStyle=(dfIsHost&&dfPartnerName)||(!dfIsHost)?"#ff9f43":"#555";ctx.font="bold 16px Inter";
  var gText=dfIsHost?(dfPartnerName?"🚀 "+dfPartnerName:"⏳ Ожидание игрока..."):"🚀 "+myName;
  ctx.fillText(gText,dfW/2,py+30);

  if(dfIsHost&&!dfPartnerName){
    var dots="",d=Math.floor(Date.now()/500)%4;
    for(var i=0;i<d;i++)dots+=".";
    ctx.fillStyle="#666";ctx.font="24px Inter";ctx.fillText(dots,dfW/2,py+65);
  }

  if(dfIsHost&&dfPartnerName){
    var sbw=260,sbh=50,sbx=dfW/2-sbw/2,sby=py+60;
    var blink=Math.sin(Date.now()/300)*0.15+0.85;
    ctx.globalAlpha=blink;
    ctx.fillStyle="rgba(46,213,115,0.2)";
    drawRoundRect(ctx,sbx,sby,sbw,sbh,14);ctx.fill();
    ctx.strokeStyle="#2ed573";ctx.lineWidth=2;
    drawRoundRect(ctx,sbx,sby,sbw,sbh,14);ctx.stroke();
    ctx.fillStyle="#2ed573";ctx.font="bold 20px Inter";
    ctx.fillText("[ ПРОБЕЛ — СТАРТ ]",dfW/2,sby+33);
    ctx.globalAlpha=1;
  }
  if(!dfIsHost&&dfPartnerName){
    ctx.fillStyle="#888";ctx.font="14px Inter";
    ctx.fillText("Ожидание старта от хоста...",dfW/2,py+85);
  }
  ctx.fillStyle="#555";ctx.font="13px Inter";
  ctx.fillText("[ ESC — Выйти ]",dfW/2,dfH-30);
}

// ============================================================
// HELPERS
// ============================================================
function drawRoundRect(ctx,x,y,w,h,r){
  ctx.beginPath();
  ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);
  ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);
  ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);
  ctx.closePath();
}

function drawDfStarsBg(ctx, dim) {
  ctx.fillStyle="#050812";ctx.fillRect(0,0,dfW,dfH);
  var ng=ctx.createRadialGradient(dfW*0.3,dfH*0.4,0,dfW*0.3,dfH*0.4,dfW*0.5);
  ng.addColorStop(0,"rgba(40,60,140,0.08)");ng.addColorStop(1,"transparent");
  ctx.fillStyle=ng;ctx.fillRect(0,0,dfW,dfH);
  for(var i=0;i<dfStars.length;i++){
    var st=dfStars[i];
    var tw=(dim?0.15:0.25)+Math.sin(st.twinkle||0)*0.2+st.b*0.3;
    ctx.globalAlpha=Math.max(0.03,tw);
    ctx.fillStyle=st.color||"#fff";
    if(st.s>2){ctx.beginPath();ctx.arc(st.x,st.y,st.s*0.4,0,Math.PI*2);ctx.fill();}
    else ctx.fillRect(st.x,st.y,st.s,st.s);
    if(st.twinkle!==undefined)st.twinkle+=st.twinkleSpeed||0.02;
    if(st.speed){st.y+=st.speed*0.3;if(st.y>dfH+5){st.y=-5;st.x=Math.random()*dfW;}}
  }
  ctx.globalAlpha=1;
}

// Fallback seedRng if not defined globally
if (typeof seedRng === "undefined") {
  function seedRng(seed) {
    var s = seed || 1;
    return function() { s = (s * 16807) % 2147483647; return s / 2147483647; };
  }
}

// ============================================================
// GAME LOOP
// ============================================================
function defenseFrame() {
  if(!dfCanvas)return;
  if(dfState==="menu") drawDefenseMenu();
  else if(dfState==="lobby") drawLobby();
  else if(dfState==="waiting") drawWaiting();
  else if(dfState==="playing"){updateDefense();drawDefense();}
  else if(dfState==="shop") drawShop();
  else if(dfState==="gameover") drawGameOver();
  dfLoop=requestAnimationFrame(defenseFrame);
}

function stopDefenseLoop(){
  if(dfLoop){cancelAnimationFrame(dfLoop);dfLoop=null;}
  if(dfCoop)coopLeave();
}

// ============================================================
// RENDER DEFENSE PAGE
// ============================================================
function renderDefensePage() {
  var el=document.getElementById("pnl-defense");
  if(!el)return;
  el.innerHTML='<canvas id="df-canvas" style="display:block;width:100%;height:100%;background:#050812;cursor:crosshair"></canvas>';
  dfCanvas=document.getElementById("df-canvas");
  dfCtx=dfCanvas.getContext("2d");

  function resize(){
    var rect=dfCanvas.parentElement.getBoundingClientRect();
    dfCanvas.width=rect.width;dfCanvas.height=rect.height;
    dfW=dfCanvas.width;dfH=dfCanvas.height;
    initDfStars();
  }
  resize();
  window.addEventListener("resize",resize);

  dfCanvas.addEventListener("mousemove",function(e){
    var r=dfCanvas.getBoundingClientRect();
    dfMouseX=(e.clientX-r.left)*(dfW/r.width);
    dfMouseY=(e.clientY-r.top)*(dfH/r.height);
    if(dfState==="menu"){
      var btnW=220,btnH=60,gap=20,by=dfH/2-30;
      if(dfMouseX>=dfW/2-btnW-gap/2&&dfMouseX<=dfW/2-gap/2&&dfMouseY>=by&&dfMouseY<=by+btnH)dfMenuSelection=0;
      else if(dfMouseX>=dfW/2+gap/2&&dfMouseX<=dfW/2+gap/2+btnW&&dfMouseY>=by&&dfMouseY<=by+btnH)dfMenuSelection=1;
    }
  });

  dfCanvas.addEventListener("mousedown",function(e){
    dfMouseDown=true;
    var r=dfCanvas.getBoundingClientRect(),mx=(e.clientX-r.left)*(dfW/r.width),my=(e.clientY-r.top)*(dfH/r.height);

    if(dfState==="menu"){
      var btnW=220,btnH=60,gap=20,by=dfH/2-30;
      if(mx>=dfW/2-btnW-gap/2&&mx<=dfW/2-gap/2&&my>=by&&my<=by+btnH){dfCoop=false;initDefenseGame();}
      else if(mx>=dfW/2+gap/2&&mx<=dfW/2+gap/2+btnW&&my>=by&&my<=by+btnH){dfState="lobby";dfCoopMenuSel=0;dfLobbyInput="";dfLobbyError="";dfLobbyMsg="";}
    } else if(dfState==="lobby"){
      var btnW=200,btnH=50,gap=20,centerY=dfH/2-60;
      if(mx>=dfW/2-btnW-gap/2&&mx<=dfW/2-gap/2&&my>=centerY&&my<=centerY+btnH){dfCoopMenuSel=0;coopCreateRoom();}
      else if(mx>=dfW/2+gap/2&&mx<=dfW/2+gap/2+btnW&&my>=centerY&&my<=centerY+btnH){dfCoopMenuSel=1;}
    } else if(dfState==="waiting"&&dfIsHost&&dfPartnerName){
      var sbw=260,py=dfH/2+30,sbx=dfW/2-sbw/2,sby=py+60;
      if(mx>=sbx&&mx<=sbx+sbw&&my>=sby&&my<=sby+50) coopStartGame();
    }
  });

  dfCanvas.addEventListener("mouseup",function(){dfMouseDown=false;});
  dfCanvas.addEventListener("contextmenu",function(e){e.preventDefault();});

  // Touch
  dfCanvas.addEventListener("touchstart",function(e){
    e.preventDefault();
    var t=e.touches[0],r=dfCanvas.getBoundingClientRect();
    dfMouseX=(t.clientX-r.left)*(dfW/r.width);dfMouseY=(t.clientY-r.top)*(dfH/r.height);
    dfMouseDown=true;
    if(dfState==="menu"){dfCoop=false;initDefenseGame();}
  });
  dfCanvas.addEventListener("touchmove",function(e){
    e.preventDefault();
    var t=e.touches[0],r=dfCanvas.getBoundingClientRect();
    dfMouseX=(t.clientX-r.left)*(dfW/r.width);dfMouseY=(t.clientY-r.top)*(dfH/r.height);
  });
  dfCanvas.addEventListener("touchend",function(){dfMouseDown=false;});

  document.addEventListener("keydown",function(e){
    dfKeys[e.key.toLowerCase()]=true;

    if(e.key===" "&&dfState==="shop"){dfState="playing";startWave();if(dfCoop&&dfIsHost)coopNotifyNextWave();e.preventDefault();}
    if(e.key===" "&&dfState==="waiting"&&dfIsHost&&dfPartnerName){coopStartGame();e.preventDefault();}
    if((e.key==="r"||e.key==="R")&&dfState==="gameover"){if(dfCoop)coopLeave();initDefenseGame();}

    // Abilities (играбельно)
    if (dfState === "playing") {
      if ((e.key === "Shift" || e.code === "ShiftLeft" || e.code === "ShiftRight") && dfDashCD <= 0) {
        tryDash(); e.preventDefault();
      }
      if ((e.key === "q" || e.key === "Q" || e.code === "KeyQ" || e.key === "й" || e.key === "Й") && dfSpecialCD <= 0) {
        specialAttack(); e.preventDefault();
      }
    }

    if(e.key==="Escape"){
      if(dfState==="gameover"){if(dfCoop)coopLeave();dfState="menu";}
      else if(dfState==="lobby"){dfState="menu";dfLobbyError="";dfLobbyMsg="";}
      else if(dfState==="waiting"){coopLeave();dfState="menu";}
    }

    if(dfState==="lobby"&&dfCoopMenuSel===1){
      if(e.key==="Enter"&&dfLobbyInput.length>=4){coopJoinRoom(dfLobbyInput);e.preventDefault();}
      else if(e.key==="Backspace"){dfLobbyInput=dfLobbyInput.slice(0,-1);e.preventDefault();}
      else if(e.key.length===1&&dfLobbyInput.length<6&&/[a-zA-Z0-9]/.test(e.key)){dfLobbyInput+=e.key.toUpperCase();e.preventDefault();}
    }

    if(dfState==="shop"&&e.key>="1"&&e.key<="9"){
      var idx=parseInt(e.key)-1,items=getShopItems();
      if(idx<items.length&&!items[idx].max&&dfCoins>=items[idx].cost){
        dfCoins-=items[idx].cost;items[idx].action();
        if(dfCoop) coopSyncShopPurchase();
      }
    }
  });
  document.addEventListener("keyup",function(e){dfKeys[e.key.toLowerCase()]=false;});

  // Shop click (FIX: используем click а не mousedown, чтобы не дублировалось)
  dfCanvas.addEventListener("click",function(e){
    if(dfState!=="shop")return;
    var r=dfCanvas.getBoundingClientRect(),mx=(e.clientX-r.left)*(dfW/r.width),my=(e.clientY-r.top)*(dfH/r.height);
    var items=getShopItems(),cols=3,itemW=205,itemH=76,gap=10;
    var startX=(dfW-(cols*itemW+(cols-1)*gap))/2,startY=dfCoop?128:118;
    for(var i=0;i<items.length;i++){
      var col=i%cols,row=Math.floor(i/cols),x=startX+col*(itemW+gap),y=startY+row*(itemH+gap);
      if(mx>=x&&mx<=x+itemW&&my>=y&&my<=y+itemH){
        if(!items[i].max&&dfCoins>=items[i].cost){
          dfCoins-=items[i].cost;items[i].action();
          if(dfCoop) coopSyncShopPurchase();
        }
        break;
      }
    }
  });

  dfState="menu";
  stopDefenseLoop();
  defenseFrame();
}
