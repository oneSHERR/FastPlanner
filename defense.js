// ============================================================
// SPACE DEFENSE — Protect the Base!
// WASD + Mouse, Upgrades between waves
// Solo + Co-op modes via Firebase
// ============================================================
var dfState = "menu"; // menu | lobby | waiting | playing | shop | gameover
var dfCanvas, dfCtx, dfW, dfH;
var dfLoop = null;
var dfWave = 0, dfScore = 0, dfCoins = 0, dfKills = 0;
var dfBase = null, dfShip = null;
var dfBullets = [], dfEnemies = [], dfParticles = [], dfStars = [];
var dfDrones = [];
var dfKeys = {}, dfMouseX = 0, dfMouseY = 0, dfMouseDown = false;
var dfBulletCD = 0, dfInvincible = 0;
var dfShake = 0, dfFlash = 0;
var dfWaveTimer = 0, dfWaveEnemiesLeft = 0;
var dfHighScores = [];
var unsubDfScores = null;

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
var dfGuestCoins = 0;       // guest's own coins (tracked by host)
var dfGuestUpgrades = null;  // guest's personal upgrades (synced)
var dfProcessedGuestBullets = null; // dedupe guest bullet hits

// ============================================================
// UPGRADES
// ============================================================
var dfUpgrades = {
  gunType: 0, gunDmg: 1, fireRate: 1, shipSpeed: 1,
  shipHP: 3, shipMaxHP: 3, shield: 0,
  baseHP: 20, baseMaxHP: 20, baseRegen: 0,
  turrets: 0, drones: 0,
  homing: 0,    // bullet homing strength 0-5
  piercing: 0   // bullets pierce through enemies 0-4
};
var dfTime = 0; // global frame counter for animations

var GUN_NAMES = ["Обычная", "Двойная", "Дробовик", "Лазер", "Ракеты"];
var GUN_COLORS = ["#6ec6ff", "#54a0ff", "#feca57", "#ff4757", "#ff9f43"];

// ============================================================
// SHOP ITEMS
// ============================================================
function getShopItems() {
  var u = dfUpgrades;
  var items = [
    {id:"gun", name:"Пушка: " + GUN_NAMES[Math.min(u.gunType+1,4)], desc:"Следующий тип оружия", cost: 30 + u.gunType * 25, max: u.gunType >= 4, personal:true, action:function(){ u.gunType = Math.min(u.gunType+1,4); }},
    {id:"dmg", name:"Урон +" + (u.gunDmg), desc:"Увеличить урон пуль", cost: 15 + u.gunDmg * 10, max: u.gunDmg >= 10, personal:true, action:function(){ u.gunDmg++; }},
    {id:"rate", name:"Скорострельность", desc:"Быстрее стрельба", cost: 20 + u.fireRate * 15, max: u.fireRate >= 8, personal:true, action:function(){ u.fireRate++; }},
    {id:"speed", name:"Скорость корабля", desc:"Быстрее движение", cost: 15 + u.shipSpeed * 10, max: u.shipSpeed >= 6, personal:true, action:function(){ u.shipSpeed++; }},
    {id:"hp", name:"Здоровье +1", desc:"Доп. жизнь корабля", cost: 25 + u.shipMaxHP * 8, max: u.shipMaxHP >= 10, personal:true, action:function(){ u.shipMaxHP++; u.shipHP = u.shipMaxHP; }},
    {id:"homing", name:"🎯 Наведение ур." + (u.homing+1), desc:"Пули летят к врагам", cost: 35 + u.homing * 30, max: u.homing >= 5, personal:true, action:function(){ u.homing++; }},
    {id:"pierce", name:"⚡ Пробивание ур." + (u.piercing+1), desc:"Пули сквозь врагов", cost: 40 + u.piercing * 35, max: u.piercing >= 4, personal:true, action:function(){ u.piercing++; }},
    {id:"baseHP", name:"Броня базы +5", desc:"Укрепить базу", cost: 20 + u.baseMaxHP * 3, max: u.baseMaxHP >= 60, personal:false, action:function(){ u.baseMaxHP += 5; u.baseHP = u.baseMaxHP; }},
    {id:"regen", name:"Регенерация базы", desc:"Авто-восстановление HP", cost: 40 + u.baseRegen * 30, max: u.baseRegen >= 5, personal:false, action:function(){ u.baseRegen++; }},
    {id:"turret", name:"Турель на базе", desc:"База стреляет сама", cost: 50 + u.turrets * 40, max: u.turrets >= 4, personal:false, action:function(){ u.turrets++; }},
    {id:"drone", name:"Дрон-помощник", desc:"Автоматический союзник", cost: 60 + u.drones * 50, max: u.drones >= 3, personal:false, action:function(){ u.drones++; spawnDrones(); }},
    {id:"heal", name:"❤️ Починить базу", desc:"Полное восстановление", cost: 15, max: u.baseHP >= u.baseMaxHP, personal:false, action:function(){ u.baseHP = u.baseMaxHP; }}
  ];
  return items;
}

// ============================================================
// ROOM CODE GENERATOR
// ============================================================
function generateRoomCode() {
  var chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  var code = "";
  for (var i = 0; i < 6; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  return code;
}

// ============================================================
// CO-OP: CREATE ROOM
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
    guestUpgrades: JSON.stringify({gunType:0,gunDmg:1,fireRate:1,shipSpeed:1,shipHP:3,shipMaxHP:3,homing:0,piercing:0}),
    waveTimer: 0, waveEnemiesLeft: 0
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

// ============================================================
// CO-OP: JOIN ROOM
// ============================================================
function coopJoinRoom(code) {
  if (!currentUser) { dfLobbyError = "Войдите в аккаунт!"; return; }
  if (!code || code.length < 4) { dfLobbyError = "Введите код комнаты!"; return; }
  dfLobbyMsg = "Поиск комнаты...";
  dfLobbyError = "";

  // Search by code only — check status/guest in JS (avoids composite index issues)
  db.collection("defense-rooms").where("code", "==", code.toUpperCase()).limit(5).get()
    .then(function(snap) {
      if (snap.empty) { dfLobbyError = "Комната с кодом " + code + " не найдена"; dfLobbyMsg = ""; return; }

      // Find a joinable room
      var found = null;
      snap.forEach(function(doc) {
        var d = doc.data();
        if (d.status === "waiting" && !d.guestUid && d.hostUid !== currentUser.uid) {
          found = {doc: doc, data: d};
        }
      });

      if (!found) {
        // Check why
        var doc0 = snap.docs[0], d0 = doc0.data();
        if (d0.hostUid === currentUser.uid) { dfLobbyError = "Нельзя присоединиться к своей комнате!"; }
        else if (d0.guestUid) { dfLobbyError = "Комната уже заполнена!"; }
        else if (d0.status !== "waiting") { dfLobbyError = "Игра уже началась!"; }
        else { dfLobbyError = "Не удалось подключиться"; }
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

// ============================================================
// CO-OP: LISTEN TO ROOM
// ============================================================
function listenRoom() {
  if (dfUnsubRoom) dfUnsubRoom();
  if (!dfRoomRef && dfRoomId) dfRoomRef = db.collection("defense-rooms").doc(dfRoomId);
  if (!dfRoomRef) return;

  dfUnsubRoom = dfRoomRef.onSnapshot(function(doc) {
    if (!doc.exists) { coopLeave(); return; }
    var d = doc.data();

    // Partner name
    if (dfIsHost) { dfPartnerName = d.guestName || ""; }
    else { dfPartnerName = d.hostName || "Хост"; }

    // Guest follows host state transitions
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
      dfCoins = d.guestCoins || 0; // guest reads own coins
      dfKills = d.kills || 0;
      // Sync base-related upgrades from host
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
      if (d.hostShip) { try { dfPartnerShip = JSON.parse(d.hostShip); } catch(e){} }
      if (d.hostBullets) { try { dfPartnerBullets = JSON.parse(d.hostBullets); } catch(e){} }
    }

    // Host reads guest data
    if (dfIsHost) {
      if (d.guestShip) { try { dfPartnerShip = JSON.parse(d.guestShip); } catch(e){} }
      if (d.guestBullets) { try { dfPartnerBullets = JSON.parse(d.guestBullets); } catch(e){} }
      if (d.guestUpgrades) { try { dfGuestUpgrades = JSON.parse(d.guestUpgrades); } catch(e){} }
      dfGuestCoins = d.guestCoins || 0;
      // Sync base upgrades from Firestore (in case guest bought one)
      if (d.upgrades) {
        try {
          var up = JSON.parse(d.upgrades);
          if (up.baseMaxHP > dfUpgrades.baseMaxHP) {
            // Guest upgraded base armor — apply
            var diff = up.baseMaxHP - dfUpgrades.baseMaxHP;
            dfUpgrades.baseMaxHP = up.baseMaxHP;
            dfUpgrades.baseHP = Math.min(up.baseMaxHP, dfUpgrades.baseHP + diff);
          }
          if (up.baseRegen > dfUpgrades.baseRegen) dfUpgrades.baseRegen = up.baseRegen;
          if (up.turrets > dfUpgrades.turrets) dfUpgrades.turrets = up.turrets;
          if (up.drones > dfUpgrades.drones) { dfUpgrades.drones = up.drones; spawnDrones(); }
          // Heal: if base was healed by guest
          if (up.baseHP > dfUpgrades.baseHP && up.baseHP === up.baseMaxHP) dfUpgrades.baseHP = up.baseHP;
        } catch(e){}
      }
    }
  });
}

// ============================================================
// CO-OP: SYNC MY STATE
// ============================================================
function coopSyncMyState() {
  if (!dfCoop || !dfRoomRef || dfState !== "playing") return;
  dfSyncTimer++;
  if (dfSyncTimer % 3 !== 0) return;

  var shipData = JSON.stringify({
    x: Math.round(dfShip.x), y: Math.round(dfShip.y),
    angle: Math.round(dfShip.angle * 100) / 100,
    thrust: dfShip.thrust, hp: dfUpgrades.shipHP, maxHp: dfUpgrades.shipMaxHP
  });

  var myBullets = [];
  for (var i = 0; i < dfBullets.length; i++) {
    var b = dfBullets[i];
    if (b.owner === "player") myBullets.push({x:Math.round(b.x),y:Math.round(b.y),vx:Math.round(b.vx*10)/10,vy:Math.round(b.vy*10)/10,type:b.type});
  }
  var bulletData = JSON.stringify(myBullets.slice(0, 20));

  var update = {};
  if (dfIsHost) {
    update.hostShip = shipData;
    update.hostBullets = bulletData;
    if (dfSyncTimer % 6 === 0) {
      var ed = [];
      for (var i = 0; i < dfEnemies.length; i++) {
        var e = dfEnemies[i];
        ed.push({x:Math.round(e.x),y:Math.round(e.y),type:e.type,hp:e.hp,maxHp:e.maxHp,radius:Math.round(e.radius),speed:Math.round(e.speed*100)/100,seed:e.seed,angle:e.angle!==undefined?Math.round(e.angle*100)/100:undefined});
      }
      update.enemies = JSON.stringify(ed);
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

// ============================================================
// CO-OP: HOST STARTS GAME
// ============================================================
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
  dfBullets = []; dfParticles = []; dfDrones = [];
  dfBulletCD = 0; dfInvincible = 120; dfShake = 0; dfFlash = 0;
  dfUpgrades = {gunType:0,gunDmg:1,fireRate:1,shipSpeed:1,shipHP:3,shipMaxHP:3,shield:0,baseHP:roomData.baseHP||20,baseMaxHP:roomData.baseMaxHP||20,baseRegen:0,turrets:0,drones:0,homing:0,piercing:0};
  dfBase = {x: dfW/2, y: dfH/2, radius: 32};
  dfShip = {x: dfW/2 + 40, y: dfH/2 - 80, angle: -Math.PI/2, vx:0, vy:0, thrust:false, radius:14};
  initDfStars();
}

// ============================================================
// CO-OP: LEAVE / CLEANUP
// ============================================================
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

// Sync shop purchase — host syncs base upgrades + hostCoins, guest syncs guestUpgrades + guestCoins
function coopSyncShopPurchase() {
  if (!dfCoop || !dfRoomRef) return;
  var u = dfUpgrades;
  if (dfIsHost) {
    dfRoomRef.update({
      hostCoins: dfCoins,
      upgrades: JSON.stringify(u)  // includes base upgrades
    }).catch(function(){});
  } else {
    // Guest syncs own personal upgrades + coins + base upgrades they bought
    dfRoomRef.update({
      guestCoins: dfCoins,
      guestUpgrades: JSON.stringify({gunType:u.gunType,gunDmg:u.gunDmg,fireRate:u.fireRate,shipSpeed:u.shipSpeed,shipHP:u.shipHP,shipMaxHP:u.shipMaxHP,homing:u.homing,piercing:u.piercing}),
      // Also sync base upgrades guest may have bought
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
  dfBulletCD = 0; dfInvincible = 120; dfShake = 0; dfFlash = 0;
  dfWaveTimer = 0; dfWaveEnemiesLeft = 0; dfTime = 0;
  dfUpgrades = {gunType:0,gunDmg:1,fireRate:1,shipSpeed:1,shipHP:3,shipMaxHP:3,shield:0,baseHP:20,baseMaxHP:20,baseRegen:0,turrets:0,drones:0,homing:0,piercing:0};
  dfBase = {x: dfW/2, y: dfH/2, radius: 32};
  dfShip = {x: dfW/2, y: dfH/2 - 80, angle: -Math.PI/2, vx:0, vy:0, thrust:false, radius:14};
  initDfStars();
  dfPartnerShip = null; dfPartnerBullets = [];
  dfState = "playing";
  startWave();
}

// Animated parallax stars with layers, twinkle, drift
function initDfStars() {
  dfStars = [];
  for (var i = 0; i < 150; i++) {
    var layer = Math.random();
    dfStars.push({
      x: Math.random()*dfW, y: Math.random()*dfH,
      s: layer < 0.4 ? 0.5+Math.random()*0.5 : (layer < 0.75 ? 1+Math.random()*1 : 2+Math.random()*1.5),
      b: Math.random(),
      speed: layer < 0.4 ? 0.05+Math.random()*0.05 : (layer < 0.75 ? 0.1+Math.random()*0.15 : 0.2+Math.random()*0.2),
      twinkle: Math.random()*Math.PI*2,
      twinkleSpeed: 0.01 + Math.random()*0.04,
      color: Math.random() < 0.85 ? "#fff" : (Math.random() < 0.5 ? "#aac8ff" : "#ffeedd"),
      layer: layer
    });
  }
}

// ============================================================
// WAVES
// ============================================================
function startWave() {
  dfWave++;
  dfWaveTimer = 180;
  var count = 3 + dfWave * 2;
  if (dfCoop) count = Math.floor(count * 1.4);
  if (dfWave % 5 === 0) count += 1;
  dfWaveEnemiesLeft = count;
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

  var isBoss = (dfWave % 5 === 0 && dfWaveEnemiesLeft === 0);
  var isShip = (!isBoss && dfWave >= 3 && Math.random() < 0.3 + dfWave * 0.02);

  if (isBoss) {
    var bossHP = 15 + dfWave * 3;
    if (dfCoop) bossHP = Math.floor(bossHP * 1.5);
    dfEnemies.push({x:ex,y:ey,type:"boss",hp:bossHP,maxHp:bossHP,radius:28+Math.min(dfWave,20),speed:0.4+dfWave*0.01,seed:Math.floor(Math.random()*9999),shootCD:0,coins:20+dfWave*2});
  } else if (isShip) {
    dfEnemies.push({x:ex,y:ey,type:"ship",hp:2+Math.floor(dfWave/3),maxHp:2+Math.floor(dfWave/3),radius:12,speed:0.8+dfWave*0.03,angle:0,seed:Math.floor(Math.random()*9999),shootCD:0,coins:3+Math.floor(dfWave/2)});
  } else {
    var sz = Math.random()<0.3?"big":(Math.random()<0.5?"med":"small");
    var r = sz==="big"?25+Math.random()*10:(sz==="med"?15+Math.random()*5:8+Math.random()*4);
    dfEnemies.push({x:ex,y:ey,type:"asteroid",hp:sz==="big"?3:(sz==="med"?2:1),maxHp:sz==="big"?3:2,radius:r,speed:0.5+Math.random()*0.5+dfWave*0.02,seed:Math.floor(Math.random()*9999),coins:sz==="big"?3:(sz==="med"?2:1)});
  }
}

// ============================================================
// DRONES
// ============================================================
function spawnDrones() {
  dfDrones = [];
  for (var i = 0; i < dfUpgrades.drones; i++) dfDrones.push({angle:(Math.PI*2/dfUpgrades.drones)*i,dist:50,shootCD:0});
}

// ============================================================
// SHOOTING
// ============================================================
function playerShoot() {
  var u = dfUpgrades, s = dfShip;
  var a = Math.atan2(dfMouseY - s.y, dfMouseX - s.x);
  var spd = 6 + u.fireRate * 0.3, dmg = u.gunDmg;

  if (u.gunType === 0) {
    dfBullets.push({x:s.x,y:s.y,vx:Math.cos(a)*spd,vy:Math.sin(a)*spd,life:60,dmg:dmg,owner:"player",type:"normal"});
  } else if (u.gunType === 1) {
    for (var d=-1;d<=1;d+=2){var ox=Math.cos(a+Math.PI/2)*d*5,oy=Math.sin(a+Math.PI/2)*d*5;dfBullets.push({x:s.x+ox,y:s.y+oy,vx:Math.cos(a)*spd,vy:Math.sin(a)*spd,life:60,dmg:dmg,owner:"player",type:"normal"});}
  } else if (u.gunType === 2) {
    for (var i=-2;i<=2;i++){var sa=a+i*0.12;dfBullets.push({x:s.x,y:s.y,vx:Math.cos(sa)*(spd-1),vy:Math.sin(sa)*(spd-1),life:30,dmg:Math.max(1,dmg-1),owner:"player",type:"normal"});}
  } else if (u.gunType === 3) {
    dfBullets.push({x:s.x,y:s.y,vx:Math.cos(a)*spd*1.8,vy:Math.sin(a)*spd*1.8,life:40,dmg:dmg+1,owner:"player",type:"laser"});
  } else if (u.gunType === 4) {
    dfBullets.push({x:s.x,y:s.y,vx:Math.cos(a)*spd*0.8,vy:Math.sin(a)*spd*0.8,life:90,dmg:dmg+3,owner:"player",type:"rocket",radius:6});
  }
}

function turretShoot() {
  if (dfUpgrades.turrets <= 0) return;
  var nearest = null, nd = Infinity;
  for (var i=0;i<dfEnemies.length;i++){var e=dfEnemies[i];var d=Math.hypot(e.x-dfBase.x,e.y-dfBase.y);if(d<nd&&d<300){nd=d;nearest=e;}}
  if (!nearest) return;
  var a = Math.atan2(nearest.y-dfBase.y,nearest.x-dfBase.x);
  for (var t=0;t<dfUpgrades.turrets;t++){var ta=a+(t-(dfUpgrades.turrets-1)/2)*0.3;dfBullets.push({x:dfBase.x,y:dfBase.y,vx:Math.cos(ta)*5,vy:Math.sin(ta)*5,life:50,dmg:1,owner:"turret",type:"normal"});}
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
// PARTICLES
// ============================================================
function spawnExplosion(x, y, color, count) {
  for (var i=0;i<count;i++){var a=Math.random()*Math.PI*2,sp=1+Math.random()*3;dfParticles.push({x:x,y:y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:20+Math.random()*20,maxLife:40,color:color,size:2+Math.random()*3});}
}

// ============================================================
// UPDATE
// ============================================================
function updateDefense() {
  if (dfState !== "playing") return;
  var u = dfUpgrades, s = dfShip;
  var isLogicOwner = !dfCoop || dfIsHost;

  // Wave countdown
  if (isLogicOwner) {
    if (dfWaveTimer > 0) {
      dfWaveTimer--;
      if (dfWaveTimer <= 0) { for (var i=0;i<Math.min(3,dfWaveEnemiesLeft);i++){setTimeout(function(){spawnEnemy();},i*500);} }
      coopSyncMyState();
      return;
    }
    if (dfWaveEnemiesLeft > 0 && Math.random() < 0.02 + dfWave * 0.005) spawnEnemy();
  } else {
    if (dfWaveTimer > 0) { coopSyncMyState(); return; }
  }

  // Ship movement (always local)
  var accel = 0.12 + u.shipSpeed * 0.03, friction = 0.988;
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

  // Player shooting
  dfBulletCD--;
  var fireDelay = Math.max(4, 15 - u.fireRate * 1.5);
  if (dfMouseDown && dfBulletCD <= 0) { playerShoot(); dfBulletCD = fireDelay; }

  // Turrets (host only)
  if (isLogicOwner && u.turrets > 0 && Math.random() < 0.03 * u.turrets) turretShoot();

  // Drones
  for (var i=0;i<dfDrones.length;i++){dfDrones[i].angle+=0.02;dfDrones[i].shootCD--;if(dfDrones[i].shootCD<=0){droneShoot(dfDrones[i]);dfDrones[i].shootCD=30;}}

  // Bullets
  for (var i=dfBullets.length-1;i>=0;i--) {
    var b = dfBullets[i];

    // Homing: player bullets curve toward nearest enemy
    if(b.owner==="player"&&dfUpgrades.homing>0&&b.type!=="laser"){
      var hStr=dfUpgrades.homing*0.012; // homing strength
      var nearE=null,nearD=Infinity;
      for(var h=0;h<dfEnemies.length;h++){var he=dfEnemies[h];var hd=Math.hypot(he.x-b.x,he.y-b.y);if(hd<nearD&&hd<200+dfUpgrades.homing*40){nearD=hd;nearE=he;}}
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
      for(var j=dfEnemies.length-1;j>=0;j--){
        var e=dfEnemies[j];
        if(Math.hypot(b.x-e.x,b.y-e.y)<e.radius+4){
          if(isLogicOwner){ e.hp-=b.dmg; if(b.owner==="player") e._lastHitGuest=false; }
          spawnExplosion(b.x,b.y,b.owner==="player"?(dfUpgrades.piercing>0?"#a855f7":"#6ec6ff"):"#6ec6ff",3);
          // Piercing: bullet continues through enemies
          if(b.type==="laser"){b.dmg=Math.max(0,b.dmg-1);if(b.dmg<=0){dfBullets.splice(i,1);break;}}
          else if(b.owner==="player"&&dfUpgrades.piercing>0){
            if(!b.pierced)b.pierced=0;
            b.pierced++;
            b.dmg=Math.max(1,b.dmg-1);
            if(b.pierced>=dfUpgrades.piercing){dfBullets.splice(i,1);break;}
            // Don't remove bullet, it continues!
          } else {dfBullets.splice(i,1);break;}
        }
      }
    }
    if(b.owner==="enemy"&&dfInvincible<=0){
      if(Math.hypot(b.x-s.x,b.y-s.y)<s.radius+3){
        u.shipHP--;dfInvincible=60;dfShake=10;dfFlash=1;
        spawnExplosion(s.x,s.y,"#ff4757",8);
        dfBullets.splice(i,1);
        if(u.shipHP<=0&&!dfCoop){gameOverDefense();return;}
        if(u.shipHP<=0&&dfCoop){u.shipHP=0;dfInvincible=180;setTimeout(function(){u.shipHP=Math.max(1,Math.floor(u.shipMaxHP/2));},3000);}
        continue;
      }
    }
    if(isLogicOwner&&b.owner==="enemy"){
      if(Math.hypot(b.x-dfBase.x,b.y-dfBase.y)<dfBase.radius+3){
        u.baseHP--;spawnExplosion(dfBase.x,dfBase.y,"#ff9f43",4);
        dfBullets.splice(i,1);
        if(u.baseHP<=0){gameOverDefense();return;}
      }
    }
  }

  // Partner bullets vs enemies (host)
  if(dfCoop&&dfIsHost&&dfPartnerBullets.length>0){
    var guestDmg = (dfGuestUpgrades && dfGuestUpgrades.gunDmg) ? dfGuestUpgrades.gunDmg : 1;
    for(var i=0;i<dfPartnerBullets.length;i++){
      var pb=dfPartnerBullets[i];
      // Skip bullets we've already processed (by id)
      var pbId = pb.x + "_" + pb.y + "_" + pb.vx + "_" + pb.vy;
      if(!dfProcessedGuestBullets) dfProcessedGuestBullets = {};
      if(dfProcessedGuestBullets[pbId]) continue;
      for(var j=dfEnemies.length-1;j>=0;j--){
        var e=dfEnemies[j];
        if(Math.hypot(pb.x-e.x,pb.y-e.y)<e.radius+6){
          e.hp -= guestDmg;
          e._lastHitGuest = true;
          dfProcessedGuestBullets[pbId] = dfTime; // mark processed
          break;
        }
      }
    }
    // Cleanup old processed entries (older than 30 frames)
    if(dfTime % 60 === 0 && dfProcessedGuestBullets){
      for(var k in dfProcessedGuestBullets){
        if(dfTime - dfProcessedGuestBullets[k] > 30) delete dfProcessedGuestBullets[k];
      }
    }
  }

  // Enemies (host manages)
  if (isLogicOwner) {
    for(var i=dfEnemies.length-1;i>=0;i--){
      var e=dfEnemies[i];
      var a=Math.atan2(dfBase.y-e.y,dfBase.x-e.x);
      e.x+=Math.cos(a)*e.speed;e.y+=Math.sin(a)*e.speed;
      if(e.angle!==undefined)e.angle=a;

      if((e.type==="ship"||e.type==="boss")&&e.shootCD!==undefined){
        e.shootCD--;
        if(e.shootCD<=0){
          var target=dfBase;
          if(dfCoop&&Math.random()<0.3){target=dfPartnerShip&&Math.random()<0.5?dfPartnerShip:s;}
          var ta=Math.atan2((target.y||dfBase.y)-e.y,(target.x||dfBase.x)-e.x);
          dfBullets.push({x:e.x,y:e.y,vx:Math.cos(ta)*3,vy:Math.sin(ta)*3,life:80,dmg:1,owner:"enemy",type:"normal"});
          if(e.type==="boss"){for(var bs=-1;bs<=1;bs+=2)dfBullets.push({x:e.x,y:e.y,vx:Math.cos(ta+bs*0.3)*3,vy:Math.sin(ta+bs*0.3)*3,life:80,dmg:1,owner:"enemy",type:"normal"});}
          e.shootCD=e.type==="boss"?40:60-Math.min(dfWave,30);
        }
      }

      if(Math.hypot(e.x-dfBase.x,e.y-dfBase.y)<dfBase.radius+e.radius){
        u.baseHP-=(e.type==="boss"?5:(e.type==="ship"?2:1));
        spawnExplosion(e.x,e.y,"#ff4757",10);dfEnemies.splice(i,1);dfShake=8;
        if(u.baseHP<=0){gameOverDefense();return;}
        continue;
      }

      if(e.hp<=0){
        var killScore = (e.type==="boss"?100:(e.type==="ship"?25:10));
        var killCoins = e.coins||1;
        dfScore += killScore;
        dfKills++;
        // In coop, check who killed (lastHitBy) — default to host
        if(dfCoop && e._lastHitGuest){
          dfGuestCoins += killCoins; // guest gets coins
        } else {
          dfCoins += killCoins; // host (or solo) gets coins
        }
        spawnExplosion(e.x,e.y,e.type==="boss"?"#feca57":"#ff9f43",e.type==="boss"?25:12);
        dfEnemies.splice(i,1);
      }
    }

    if(dfWaveEnemiesLeft<=0&&dfEnemies.length===0&&dfWaveTimer<=0){
      u.baseHP=Math.min(u.baseMaxHP,u.baseHP+u.baseRegen);
      dfState="shop";
      if(dfCoop) coopNotifyShop();
    }
  }

  if(dfInvincible>0)dfInvincible--;
  if(dfShake>0)dfShake*=0.9;
  if(dfFlash>0)dfFlash*=0.9;

  for(var i=dfParticles.length-1;i>=0;i--){var p=dfParticles[i];p.x+=p.vx;p.y+=p.vy;p.life--;p.vx*=0.97;p.vy*=0.97;if(p.life<=0)dfParticles.splice(i,1);}

  // Animate stars
  dfTime++;
  for(var i=0;i<dfStars.length;i++){
    var st=dfStars[i];
    st.twinkle+=st.twinkleSpeed;
    st.y+=st.speed;
    if(st.y>dfH+5){st.y=-5;st.x=Math.random()*dfW;}
  }

  coopSyncMyState();
}

// ============================================================
// DRAW
// ============================================================
function drawDefense() {
  var ctx = dfCtx;
  ctx.save();
  if(dfShake>0.5) ctx.translate((Math.random()-.5)*dfShake*2,(Math.random()-.5)*dfShake*2);

  // Deep space background
  ctx.fillStyle="#050810";ctx.fillRect(0,0,dfW,dfH);
  // Nebula glow
  var ng1=ctx.createRadialGradient(dfW*0.2,dfH*0.3,0,dfW*0.2,dfH*0.3,dfW*0.4);
  ng1.addColorStop(0,"rgba(30,50,120,0.08)");ng1.addColorStop(1,"transparent");ctx.fillStyle=ng1;ctx.fillRect(0,0,dfW,dfH);
  var ng2=ctx.createRadialGradient(dfW*0.8,dfH*0.7,0,dfW*0.8,dfH*0.7,dfW*0.35);
  ng2.addColorStop(0,"rgba(100,20,60,0.06)");ng2.addColorStop(1,"transparent");ctx.fillStyle=ng2;ctx.fillRect(0,0,dfW,dfH);

  // Animated stars with twinkle + parallax
  for(var i=0;i<dfStars.length;i++){
    var st=dfStars[i];
    var tw=0.25+Math.sin(st.twinkle)*0.35+st.b*0.4;
    ctx.globalAlpha=Math.max(0.05,tw);
    ctx.fillStyle=st.color;
    if(st.s>2){
      // Big stars get a soft glow
      ctx.shadowColor=st.color;ctx.shadowBlur=st.s*2;
      ctx.beginPath();ctx.arc(st.x,st.y,st.s*0.5,0,Math.PI*2);ctx.fill();
      ctx.shadowBlur=0;
    } else {
      ctx.fillRect(st.x,st.y,st.s,st.s);
    }
  }
  ctx.globalAlpha=1;

  drawBase(ctx);
  for(var i=0;i<dfEnemies.length;i++) drawEnemy(ctx,dfEnemies[i]);
  for(var i=0;i<dfBullets.length;i++) drawBullet(ctx,dfBullets[i]);

  // Partner bullets
  if(dfCoop&&dfPartnerBullets.length>0){
    for(var i=0;i<dfPartnerBullets.length;i++){
      var pb=dfPartnerBullets[i];
      ctx.fillStyle=dfIsHost?"#ff9f43":"#6ec6ff";
      ctx.globalAlpha=0.7;ctx.beginPath();ctx.arc(pb.x,pb.y,2.5,0,Math.PI*2);ctx.fill();
    }
    ctx.globalAlpha=1;
  }

  for(var i=0;i<dfParticles.length;i++){var p=dfParticles[i];ctx.globalAlpha=p.life/p.maxLife;ctx.fillStyle=p.color;ctx.fillRect(p.x-p.size/2,p.y-p.size/2,p.size,p.size);}
  ctx.globalAlpha=1;

  for(var i=0;i<dfDrones.length;i++){var d=dfDrones[i];var dx=dfShip.x+Math.cos(d.angle)*d.dist,dy=dfShip.y+Math.sin(d.angle)*d.dist;ctx.fillStyle="#54a0ff";ctx.beginPath();ctx.arc(dx,dy,6,0,Math.PI*2);ctx.fill();ctx.fillStyle="#6ec6ff";ctx.beginPath();ctx.arc(dx,dy,3,0,Math.PI*2);ctx.fill();}

  // Partner ship
  if(dfCoop&&dfPartnerShip&&dfPartnerShip.x) drawPartnerShip(ctx,dfPartnerShip);

  // My ship
  if(dfUpgrades.shipHP>0&&(dfInvincible<=0||Math.floor(dfInvincible/4)%2===0)) drawPixelShip(ctx,dfShip.x,dfShip.y,dfShip.angle+Math.PI/2,30,dfShip.thrust);

  drawHUD(ctx);

  if(dfWaveTimer>0){
    ctx.fillStyle="rgba(0,0,0,0.5)";ctx.fillRect(0,0,dfW,dfH);
    ctx.fillStyle="#feca57";ctx.font="bold 48px Inter";ctx.textAlign="center";
    ctx.fillText("ВОЛНА "+dfWave,dfW/2,dfH/2-20);
    ctx.font="24px Inter";ctx.fillStyle="#fff";
    ctx.fillText(dfCoop?"Работайте в команде!":"Приготовьтесь!",dfW/2,dfH/2+20);
  }

  if(dfFlash>0.01){ctx.fillStyle="rgba(255,71,87,"+(dfFlash*0.3)+")";ctx.fillRect(0,0,dfW,dfH);}
  ctx.restore();
}

// ============================================================
// DRAW PARTNER SHIP
// ============================================================
function drawPartnerShip(ctx, ps) {
  if(!ps||ps.hp<=0) return;
  ctx.save();ctx.translate(ps.x,ps.y);ctx.rotate(ps.angle+Math.PI/2);
  var sz=30/16;
  if(ps.thrust){var grd=ctx.createRadialGradient(0,sz*10,0,0,sz*10,sz*14);grd.addColorStop(0,'rgba(255,159,67,.8)');grd.addColorStop(1,'rgba(255,159,67,0)');ctx.fillStyle=grd;ctx.beginPath();ctx.arc(0,sz*10,sz*14,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ff9f43';ctx.beginPath();ctx.moveTo(-sz*3,sz*6);ctx.lineTo(0,sz*(10+Math.random()*6));ctx.lineTo(sz*3,sz*6);ctx.fill();}
  ctx.fillStyle='#e8c088';ctx.beginPath();ctx.moveTo(0,-sz*8);ctx.lineTo(-sz*6,sz*6);ctx.lineTo(-sz*2,sz*4);ctx.lineTo(0,sz*5);ctx.lineTo(sz*2,sz*4);ctx.lineTo(sz*6,sz*6);ctx.closePath();ctx.fill();
  ctx.fillStyle='#ffaa44';ctx.beginPath();ctx.moveTo(0,-sz*5);ctx.lineTo(-sz*2,sz*1);ctx.lineTo(sz*2,sz*1);ctx.closePath();ctx.fill();
  ctx.strokeStyle='#8a6a3a';ctx.lineWidth=sz*0.8;ctx.beginPath();ctx.moveTo(0,-sz*8);ctx.lineTo(-sz*6,sz*6);ctx.lineTo(-sz*2,sz*4);ctx.lineTo(0,sz*5);ctx.lineTo(sz*2,sz*4);ctx.lineTo(sz*6,sz*6);ctx.closePath();ctx.stroke();
  ctx.fillStyle='#ff6b4a';ctx.fillRect(-sz*5,sz*3,sz*2,sz*1.5);ctx.fillRect(sz*3,sz*3,sz*2,sz*1.5);
  ctx.restore();
  ctx.font="bold 10px Inter";ctx.fillStyle="#ff9f43";ctx.textAlign="center";
  ctx.fillText(dfPartnerName||"Напарник",ps.x,ps.y-22);
  if(ps.maxHp&&ps.hp!==undefined){var bw=30,bh=3;ctx.fillStyle="rgba(0,0,0,0.5)";ctx.fillRect(ps.x-bw/2,ps.y+18,bw,bh);var pct=ps.hp/ps.maxHp;ctx.fillStyle=pct>0.5?"#2ed573":(pct>0.25?"#feca57":"#ff4757");ctx.fillRect(ps.x-bw/2,ps.y+18,bw*pct,bh);}
}

function drawBase(ctx) {
  var b=dfBase,u=dfUpgrades,t=dfTime||0;

  // Shield bubble (if upgraded)
  if(u.shield>0){
    var sr=b.radius+12+u.shield*4;
    ctx.save();
    ctx.beginPath();ctx.arc(b.x,b.y,sr,0,Math.PI*2);
    ctx.strokeStyle="rgba(100,180,255,"+(0.15+Math.sin(t*0.05)*0.05)+")";ctx.lineWidth=1.5;ctx.stroke();
    ctx.restore();
  }

  // Rotating outer ring
  ctx.save();ctx.translate(b.x,b.y);ctx.rotate(t*0.005);
  ctx.strokeStyle="rgba(110,198,255,0.15)";ctx.lineWidth=1;
  ctx.beginPath();ctx.arc(0,0,b.radius+8,0,Math.PI*2);ctx.stroke();
  // Ring segments
  for(var i=0;i<8;i++){var ra=(Math.PI*2/8)*i;ctx.fillStyle="rgba(110,198,255,0.2)";ctx.beginPath();ctx.arc(Math.cos(ra)*(b.radius+8),Math.sin(ra)*(b.radius+8),2,0,Math.PI*2);ctx.fill();}
  ctx.restore();

  // Base body - layered station
  var grd=ctx.createRadialGradient(b.x-4,b.y-4,0,b.x,b.y,b.radius);
  grd.addColorStop(0,"#5a7cf7");grd.addColorStop(0.4,"#3a5cb7");grd.addColorStop(0.8,"#1a2a80");grd.addColorStop(1,"#0d1650");
  ctx.beginPath();ctx.arc(b.x,b.y,b.radius,0,Math.PI*2);ctx.fillStyle=grd;ctx.fill();

  // Inner hex pattern
  ctx.save();ctx.translate(b.x,b.y);ctx.rotate(t*-0.003);
  ctx.strokeStyle="rgba(110,198,255,0.15)";ctx.lineWidth=0.5;
  ctx.beginPath();
  for(var i=0;i<6;i++){var ha=(Math.PI*2/6)*i,hr=b.radius*0.65;var hx=Math.cos(ha)*hr,hy=Math.sin(ha)*hr;if(i===0)ctx.moveTo(hx,hy);else ctx.lineTo(hx,hy);}
  ctx.closePath();ctx.stroke();
  ctx.restore();

  // Central core glow
  var cg=ctx.createRadialGradient(b.x,b.y,0,b.x,b.y,b.radius*0.4);
  var pulse=0.5+Math.sin(t*0.08)*0.15;
  cg.addColorStop(0,"rgba(110,198,255,"+pulse+")");cg.addColorStop(1,"rgba(110,198,255,0)");
  ctx.beginPath();ctx.arc(b.x,b.y,b.radius*0.4,0,Math.PI*2);ctx.fillStyle=cg;ctx.fill();

  // Core dot
  ctx.beginPath();ctx.arc(b.x,b.y,3,0,Math.PI*2);ctx.fillStyle="#aaddff";ctx.fill();

  // Outer edge glow
  ctx.beginPath();ctx.arc(b.x,b.y,b.radius,0,Math.PI*2);
  ctx.strokeStyle="rgba(110,198,255,"+(0.4+Math.sin(t*0.06)*0.15)+")";ctx.lineWidth=2;ctx.stroke();

  // Co-op ring
  if(dfCoop){ctx.strokeStyle="rgba(255,159,67,0.25)";ctx.lineWidth=1;ctx.beginPath();ctx.arc(b.x,b.y,b.radius+4,0,Math.PI*2);ctx.stroke();}

  // HP bar
  var bw=60,bh=6;
  ctx.fillStyle="rgba(0,0,0,0.6)";
  drawRoundRect(ctx,b.x-bw/2,b.y+b.radius+10,bw,bh,3);ctx.fill();
  var pct=u.baseHP/u.baseMaxHP;
  var hpColor=pct>0.5?"#2ed573":(pct>0.25?"#feca57":"#ff4757");
  ctx.fillStyle=hpColor;
  if(pct>0)drawRoundRect(ctx,b.x-bw/2,b.y+b.radius+10,bw*pct,bh,3);ctx.fill();

  // Turret pods
  for(var i=0;i<u.turrets;i++){
    var ta=(Math.PI*2/Math.max(u.turrets,1))*i-Math.PI/2+t*0.01;
    var tx=b.x+Math.cos(ta)*(b.radius+6),ty=b.y+Math.sin(ta)*(b.radius+6);
    ctx.fillStyle="#feca57";ctx.beginPath();ctx.arc(tx,ty,4,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#ffe066";ctx.beginPath();ctx.arc(tx,ty,2,0,Math.PI*2);ctx.fill();
    // Turret glow
    ctx.beginPath();ctx.arc(tx,ty,6,0,Math.PI*2);ctx.fillStyle="rgba(254,202,87,0.1)";ctx.fill();
  }
}

function drawEnemy(ctx, e) {
  ctx.save();ctx.translate(e.x,e.y);
  if(e.type==="asteroid"){var rng=seedRng(e.seed),pts=10;ctx.beginPath();for(var i=0;i<pts;i++){var a=(i/pts)*Math.PI*2,r=e.radius*(0.7+rng()*0.3);if(i===0)ctx.moveTo(Math.cos(a)*r,Math.sin(a)*r);else ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r);}ctx.closePath();ctx.fillStyle="#6a5a4a";ctx.fill();ctx.strokeStyle="#3a2a1a";ctx.lineWidth=1.5;ctx.stroke();}
  else if(e.type==="ship"){ctx.rotate(e.angle||0);ctx.fillStyle="#ff4757";ctx.beginPath();ctx.moveTo(12,0);ctx.lineTo(-8,-7);ctx.lineTo(-5,0);ctx.lineTo(-8,7);ctx.closePath();ctx.fill();ctx.strokeStyle="#cc3344";ctx.lineWidth=1;ctx.stroke();}
  else if(e.type==="boss"){ctx.rotate(Math.atan2(dfBase.y-e.y,dfBase.x-e.x));var r=e.radius;ctx.fillStyle="#8b0000";ctx.beginPath();ctx.moveTo(r,0);ctx.lineTo(-r*0.7,-r*0.8);ctx.lineTo(-r*0.3,0);ctx.lineTo(-r*0.7,r*0.8);ctx.closePath();ctx.fill();ctx.fillStyle="#ff4757";ctx.beginPath();ctx.arc(0,0,r*0.4,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#ff6b6b";ctx.lineWidth=2;ctx.stroke();ctx.rotate(-Math.atan2(dfBase.y-e.y,dfBase.x-e.x));var bw=r*2,bh=4;ctx.fillStyle="rgba(0,0,0,0.6)";ctx.fillRect(-bw/2,-r-10,bw,bh);ctx.fillStyle="#ff4757";ctx.fillRect(-bw/2,-r-10,bw*(e.hp/e.maxHp),bh);}
  ctx.restore();
}

function drawBullet(ctx, b) {
  if(b.owner==="enemy"){ctx.fillStyle="#ff4757";ctx.beginPath();ctx.arc(b.x,b.y,3,0,Math.PI*2);ctx.fill();ctx.fillStyle="rgba(255,71,87,0.3)";ctx.beginPath();ctx.arc(b.x,b.y,5,0,Math.PI*2);ctx.fill();}
  else if(b.type==="laser"){ctx.strokeStyle="#ff4757";ctx.lineWidth=3;ctx.shadowColor="#ff4757";ctx.shadowBlur=8;ctx.beginPath();ctx.moveTo(b.x,b.y);ctx.lineTo(b.x-b.vx*2,b.y-b.vy*2);ctx.stroke();ctx.shadowBlur=0;}
  else if(b.type==="rocket"){ctx.fillStyle="#ff9f43";ctx.beginPath();ctx.arc(b.x,b.y,4,0,Math.PI*2);ctx.fill();ctx.fillStyle="#feca57";ctx.beginPath();ctx.arc(b.x-b.vx*0.5,b.y-b.vy*0.5,2,0,Math.PI*2);ctx.fill();ctx.fillStyle="rgba(255,159,67,0.2)";ctx.beginPath();ctx.arc(b.x,b.y,7,0,Math.PI*2);ctx.fill();}
  else if(b.owner==="player"&&(dfUpgrades.homing>0||dfUpgrades.piercing>0)){
    // Enhanced bullet with homing/piercing visuals
    var bc=dfUpgrades.piercing>0?"#a855f7":"#6ec6ff";
    var bg=dfUpgrades.piercing>0?"rgba(168,85,247,":"rgba(110,198,255,";
    // Trail
    ctx.strokeStyle=bg+"0.4)";ctx.lineWidth=dfUpgrades.piercing>0?2:1.5;
    ctx.beginPath();ctx.moveTo(b.x,b.y);ctx.lineTo(b.x-b.vx*1.5,b.y-b.vy*1.5);ctx.stroke();
    // Glow
    ctx.beginPath();ctx.arc(b.x,b.y,dfUpgrades.piercing>0?4:3.5,0,Math.PI*2);ctx.fillStyle=bg+"0.15)";ctx.fill();
    // Core
    ctx.fillStyle=bc;ctx.beginPath();ctx.arc(b.x,b.y,2.5,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(b.x,b.y,1,0,Math.PI*2);ctx.fill();
  }
  else{ctx.fillStyle=b.owner==="turret"?"#feca57":"#6ec6ff";ctx.beginPath();ctx.arc(b.x,b.y,2.5,0,Math.PI*2);ctx.fill();}
}

function drawHUD(ctx) {
  var u=dfUpgrades;ctx.textAlign="left";ctx.font="bold 14px 'JetBrains Mono'";
  ctx.fillStyle="#fff";ctx.fillText("ВОЛНА: "+dfWave,15,25);
  ctx.fillStyle="#feca57";ctx.fillText("ОЧКИ: "+dfScore,15,45);
  ctx.fillStyle="#2ed573";ctx.fillText("МОНЕТЫ: "+dfCoins,15,65);
  var hudY=85;
  if(dfCoop){ctx.fillStyle="#ff9f43";ctx.font="bold 11px Inter";ctx.fillText("👥 КООП: "+(dfPartnerName||"..."),15,hudY);hudY+=18;}

  ctx.textAlign="right";ctx.fillStyle="#ff4757";
  var hearts="";for(var i=0;i<u.shipMaxHP;i++)hearts+=(i<u.shipHP)?"❤️":"🖤";
  ctx.font="16px Inter";ctx.fillText(hearts,dfW-15,25);
  ctx.font="bold 12px Inter";ctx.fillStyle=GUN_COLORS[u.gunType];ctx.fillText("🔫 "+GUN_NAMES[u.gunType],dfW-15,45);

  // Show homing/piercing indicators
  var modY=60;
  if(u.homing>0){ctx.font="bold 11px Inter";ctx.fillStyle="#6ec6ff";ctx.fillText("🎯 Навед."+u.homing,dfW-15,modY);modY+=15;}
  if(u.piercing>0){ctx.font="bold 11px Inter";ctx.fillStyle="#a855f7";ctx.fillText("⚡ Проб."+u.piercing,dfW-15,modY);modY+=15;}

  if(dfCoop){ctx.font="bold 10px Inter";ctx.fillStyle="#6ec6ff";ctx.textAlign="center";ctx.fillText("Вы",dfShip.x,dfShip.y-22);}
  ctx.textAlign="left";
}

// ============================================================
// SHOP
// ============================================================
function drawShop() {
  var ctx=dfCtx;
  drawDfStarsBg(ctx, true);

  ctx.textAlign="center";ctx.fillStyle="#feca57";ctx.font="bold 32px Inter";ctx.fillText("МАГАЗИН",dfW/2,50);
  ctx.font="16px Inter";ctx.fillStyle="#2ed573";ctx.fillText("Ваши монеты: "+dfCoins,dfW/2,78);
  ctx.font="14px Inter";ctx.fillStyle="#aaa";ctx.fillText("Волна "+dfWave+" пройдена! Очки: "+dfScore,dfW/2,100);
  if(dfCoop){ctx.font="bold 12px Inter";ctx.fillStyle="#ff9f43";ctx.fillText("👥 "+(dfPartnerName||"Напарник")+": "+(dfIsHost?dfGuestCoins:("?"))+" монет",dfW/2,118);}

  var items=getShopItems(),cols=2,itemW=220,itemH=80,gap=12;
  var startX=(dfW-(cols*itemW+(cols-1)*gap))/2,startY=dfCoop?138:125;

  for(var i=0;i<items.length;i++){
    var it=items[i],col=i%cols,row=Math.floor(i/cols);
    var x=startX+col*(itemW+gap),y=startY+row*(itemH+gap);
    var canBuy=!it.max&&dfCoins>=it.cost;
    var bg=canBuy?"rgba(46,213,115,0.12)":(it.max?"rgba(255,255,255,0.03)":"rgba(255,71,87,0.08)");
    ctx.fillStyle=bg;
    ctx.beginPath();var r=12;ctx.moveTo(x+r,y);ctx.lineTo(x+itemW-r,y);ctx.quadraticCurveTo(x+itemW,y,x+itemW,y+r);ctx.lineTo(x+itemW,y+itemH-r);ctx.quadraticCurveTo(x+itemW,y+itemH,x+itemW-r,y+itemH);ctx.lineTo(x+r,y+itemH);ctx.quadraticCurveTo(x,y+itemH,x,y+itemH-r);ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath();ctx.fill();
    ctx.strokeStyle=canBuy?"#2ed57366":"rgba(255,255,255,0.08)";ctx.lineWidth=1;ctx.stroke();
    ctx.textAlign="left";ctx.font="bold 13px Inter";ctx.fillStyle=it.max?"#666":"#fff";ctx.fillText(it.name,x+12,y+24);
    ctx.font="11px Inter";ctx.fillStyle="#888";ctx.fillText(it.desc,x+12,y+42);
    // Coop tag: personal or base
    if(dfCoop){ctx.textAlign="right";ctx.font="bold 9px Inter";ctx.fillStyle=it.personal?"#6ec6ff":"#ff9f43";ctx.fillText(it.personal?"👤 ЛИЧНОЕ":"🏠 БАЗА",x+itemW-10,y+16);ctx.textAlign="left";}
    ctx.font="bold 14px 'JetBrains Mono'";ctx.fillStyle=it.max?"#444":(canBuy?"#2ed573":"#ff4757");ctx.fillText(it.max?"МАКС":(it.cost+"💰"),x+12,y+64);
  }
  ctx.textAlign="center";ctx.font="bold 16px Inter";ctx.fillStyle="#7c5cff";ctx.fillText("[ ПРОБЕЛ — Следующая волна ]",dfW/2,dfH-30);
}

// ============================================================
// GAME OVER
// ============================================================
function gameOverDefense() {
  dfState="gameover";
  if(currentUser&&dfScore>0){db.collection("defense-scores").add({uid:currentUser.uid,name:currentUser.displayName||currentUser.email,score:dfScore,wave:dfWave,kills:dfKills,coop:dfCoop,createdAt:new Date().toISOString()}).catch(function(){});}
  if(dfCoop&&dfIsHost) coopNotifyGameOver();
}

function drawGameOver() {
  var ctx=dfCtx;ctx.fillStyle="rgba(10,10,24,0.92)";ctx.fillRect(0,0,dfW,dfH);
  ctx.textAlign="center";ctx.fillStyle="#ff4757";ctx.font="bold 42px Inter";ctx.fillText("БАЗА УНИЧТОЖЕНА",dfW/2,dfH/2-80);
  if(dfCoop){ctx.fillStyle="#ff9f43";ctx.font="bold 18px Inter";ctx.fillText("👥 Кооператив с "+(dfPartnerName||"напарником"),dfW/2,dfH/2-45);}
  ctx.fillStyle="#feca57";ctx.font="bold 28px 'JetBrains Mono'";ctx.fillText("Очки: "+dfScore,dfW/2,dfH/2);
  ctx.fillStyle="#fff";ctx.font="18px Inter";ctx.fillText("Волна: "+dfWave+"  |  Убито: "+dfKills,dfW/2,dfH/2+35);
  ctx.fillStyle="#7c5cff";ctx.font="bold 16px Inter";ctx.fillText("[ R — Заново ]  [ ESC — Меню ]",dfW/2,dfH/2+80);
}

// ============================================================
// MENU
// ============================================================
function drawDefenseMenu() {
  var ctx=dfCtx;
  drawDfStarsBg(ctx, false);
  ctx.textAlign="center";
  ctx.fillStyle="#7c5cff";ctx.font="bold 48px Inter";ctx.fillText("SPACE DEFENSE",dfW/2,dfH/2-110);
  ctx.fillStyle="#6ec6ff";ctx.font="20px Inter";ctx.fillText("Защити базу от волн врагов!",dfW/2,dfH/2-75);

  var btnW=220,btnH=55,gap=20,bx=dfW/2-btnW-gap/2,by=dfH/2-20;

  // Solo
  var soloH=dfMenuSelection===0;
  ctx.fillStyle=soloH?"rgba(110,198,255,0.2)":"rgba(255,255,255,0.05)";
  drawRoundRect(ctx,bx,by,btnW,btnH,14);ctx.fill();
  ctx.strokeStyle=soloH?"#6ec6ff":"rgba(255,255,255,0.12)";ctx.lineWidth=2;drawRoundRect(ctx,bx,by,btnW,btnH,14);ctx.stroke();
  ctx.fillStyle=soloH?"#6ec6ff":"#aaa";ctx.font="bold 20px Inter";ctx.fillText("🚀 СОЛО",bx+btnW/2,by+34);

  // Coop
  var cx=dfW/2+gap/2,coopH=dfMenuSelection===1;
  ctx.fillStyle=coopH?"rgba(255,159,67,0.2)":"rgba(255,255,255,0.05)";
  drawRoundRect(ctx,cx,by,btnW,btnH,14);ctx.fill();
  ctx.strokeStyle=coopH?"#ff9f43":"rgba(255,255,255,0.12)";ctx.lineWidth=2;drawRoundRect(ctx,cx,by,btnW,btnH,14);ctx.stroke();
  ctx.fillStyle=coopH?"#ff9f43":"#aaa";ctx.font="bold 20px Inter";ctx.fillText("👥 КООПЕРАТИВ",cx+btnW/2,by+34);

  ctx.fillStyle="#666";ctx.font="13px Inter";ctx.fillText("WASD — движение  |  Мышь — прицел + стрельба",dfW/2,dfH/2+70);
  ctx.fillStyle="#555";ctx.font="12px Inter";ctx.fillText("Нажмите на режим для начала",dfW/2,dfH/2+100);
}

// ============================================================
// LOBBY
// ============================================================
function drawLobby() {
  var ctx=dfCtx;
  drawDfStarsBg(ctx, true);
  ctx.textAlign="center";
  ctx.fillStyle="#ff9f43";ctx.font="bold 36px Inter";ctx.fillText("👥 КООПЕРАТИВ",dfW/2,60);

  var btnW=200,btnH=50,gap=20,centerY=dfH/2-60;

  // Create
  var createSel=dfCoopMenuSel===0;
  ctx.fillStyle=createSel?"rgba(46,213,115,0.2)":"rgba(255,255,255,0.05)";
  drawRoundRect(ctx,dfW/2-btnW-gap/2,centerY,btnW,btnH,12);ctx.fill();
  ctx.strokeStyle=createSel?"#2ed573":"rgba(255,255,255,0.1)";ctx.lineWidth=2;drawRoundRect(ctx,dfW/2-btnW-gap/2,centerY,btnW,btnH,12);ctx.stroke();
  ctx.fillStyle=createSel?"#2ed573":"#999";ctx.font="bold 18px Inter";ctx.fillText("🏠 Создать",dfW/2-btnW/2-gap/2,centerY+32);

  // Join
  var joinSel=dfCoopMenuSel===1;
  ctx.fillStyle=joinSel?"rgba(84,160,255,0.2)":"rgba(255,255,255,0.05)";
  drawRoundRect(ctx,dfW/2+gap/2,centerY,btnW,btnH,12);ctx.fill();
  ctx.strokeStyle=joinSel?"#54a0ff":"rgba(255,255,255,0.1)";ctx.lineWidth=2;drawRoundRect(ctx,dfW/2+gap/2,centerY,btnW,btnH,12);ctx.stroke();
  ctx.fillStyle=joinSel?"#54a0ff":"#999";ctx.font="bold 18px Inter";ctx.fillText("🔗 Войти",dfW/2+btnW/2+gap/2,centerY+32);

  if(dfCoopMenuSel===1){
    var inputW=240,inputH=44,iy=centerY+btnH+30;
    ctx.fillStyle="rgba(255,255,255,0.06)";drawRoundRect(ctx,dfW/2-inputW/2,iy,inputW,inputH,10);ctx.fill();
    ctx.strokeStyle="#54a0ff44";ctx.lineWidth=1;drawRoundRect(ctx,dfW/2-inputW/2,iy,inputW,inputH,10);ctx.stroke();
    ctx.fillStyle=dfLobbyInput?"#fff":"#666";ctx.font="bold 22px 'JetBrains Mono'";ctx.fillText(dfLobbyInput||"Код комнаты...",dfW/2,iy+30);
    ctx.fillStyle="#54a0ff";ctx.font="bold 13px Inter";ctx.fillText("[ ENTER — Присоединиться ]",dfW/2,iy+inputH+25);
  }

  if(dfLobbyMsg){ctx.fillStyle="#feca57";ctx.font="bold 14px Inter";ctx.fillText(dfLobbyMsg,dfW/2,dfH-80);}
  if(dfLobbyError){ctx.fillStyle="#ff4757";ctx.font="bold 14px Inter";ctx.fillText(dfLobbyError,dfW/2,dfH-60);}
  ctx.fillStyle="#555";ctx.font="13px Inter";ctx.fillText("[ ESC — Назад ]",dfW/2,dfH-30);
}

// ============================================================
// WAITING ROOM
// ============================================================
function drawWaiting() {
  var ctx=dfCtx;
  drawDfStarsBg(ctx, true);
  ctx.textAlign="center";

  ctx.fillStyle="#ff9f43";ctx.font="bold 32px Inter";ctx.fillText("👥 КОМНАТА",dfW/2,dfH/2-100);
  ctx.fillStyle="#feca57";ctx.font="bold 48px 'JetBrains Mono'";ctx.fillText(dfRoomCode,dfW/2,dfH/2-40);
  ctx.fillStyle="#888";ctx.font="14px Inter";ctx.fillText("Отправьте этот код напарнику",dfW/2,dfH/2-10);

  var py=dfH/2+30;
  var myName=currentUser?(currentUser.displayName||currentUser.email||"Вы"):"Вы";
  ctx.fillStyle="#6ec6ff";ctx.font="bold 16px Inter";ctx.fillText("🚀 "+(dfIsHost?myName:dfPartnerName||"Хост"),dfW/2,py);
  ctx.fillStyle=(dfIsHost&&dfPartnerName)||(!dfIsHost)?"#ff9f43":"#555";ctx.font="bold 16px Inter";
  var gText=dfIsHost?(dfPartnerName?"🚀 "+dfPartnerName:"⏳ Ожидание игрока..."):"🚀 "+myName;
  ctx.fillText(gText,dfW/2,py+30);

  if(dfIsHost&&!dfPartnerName){var dots="",d=Math.floor(Date.now()/500)%4;for(var i=0;i<d;i++)dots+=".";ctx.fillStyle="#666";ctx.font="24px Inter";ctx.fillText(dots,dfW/2,py+65);}

  if(dfIsHost&&dfPartnerName){
    var sbw=260,sbh=50,sbx=dfW/2-sbw/2,sby=py+60;
    var blink=Math.sin(Date.now()/300)*0.15+0.85;ctx.globalAlpha=blink;
    ctx.fillStyle="rgba(46,213,115,0.2)";drawRoundRect(ctx,sbx,sby,sbw,sbh,14);ctx.fill();
    ctx.strokeStyle="#2ed573";ctx.lineWidth=2;drawRoundRect(ctx,sbx,sby,sbw,sbh,14);ctx.stroke();
    ctx.fillStyle="#2ed573";ctx.font="bold 20px Inter";ctx.fillText("[ ПРОБЕЛ — СТАРТ ]",dfW/2,sby+33);ctx.globalAlpha=1;
  }
  if(!dfIsHost&&dfPartnerName){ctx.fillStyle="#888";ctx.font="14px Inter";ctx.fillText("Ожидание старта от хоста...",dfW/2,py+85);}
  ctx.fillStyle="#555";ctx.font="13px Inter";ctx.fillText("[ ESC — Выйти ]",dfW/2,dfH-30);
}

// ============================================================
// HELPER
// ============================================================
function drawRoundRect(ctx,x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath();}

// Shared animated star drawing for menus/screens
function drawDfStarsBg(ctx, dim) {
  ctx.fillStyle="#050810";ctx.fillRect(0,0,dfW,dfH);
  // Subtle nebula
  var ng=ctx.createRadialGradient(dfW*0.3,dfH*0.4,0,dfW*0.3,dfH*0.4,dfW*0.4);
  ng.addColorStop(0,"rgba(30,50,120,0.06)");ng.addColorStop(1,"transparent");ctx.fillStyle=ng;ctx.fillRect(0,0,dfW,dfH);
  for(var i=0;i<dfStars.length;i++){
    var st=dfStars[i];
    var tw=(dim?0.15:0.25)+Math.sin(st.twinkle||0)*0.2+st.b*0.3;
    ctx.globalAlpha=Math.max(0.03,tw);
    ctx.fillStyle=st.color||"#fff";
    if(st.s>2){ctx.beginPath();ctx.arc(st.x,st.y,st.s*0.4,0,Math.PI*2);ctx.fill();}
    else ctx.fillRect(st.x,st.y,st.s,st.s);
    // Animate in menus too
    if(st.twinkle!==undefined)st.twinkle+=st.twinkleSpeed||0.02;
    if(st.speed){st.y+=st.speed*0.3;if(st.y>dfH+5){st.y=-5;st.x=Math.random()*dfW;}}
  }
  ctx.globalAlpha=1;
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

function stopDefenseLoop(){if(dfLoop){cancelAnimationFrame(dfLoop);dfLoop=null;}if(dfCoop)coopLeave();}

// ============================================================
// RENDER DEFENSE PAGE
// ============================================================
function renderDefensePage() {
  var T=THEMES[themeId],el=document.getElementById("pnl-defense");
  if(!el)return;
  el.innerHTML='<canvas id="df-canvas" style="display:block;width:100%;height:100%;background:#0a0a18;cursor:crosshair"></canvas>';
  dfCanvas=document.getElementById("df-canvas");
  dfCtx=dfCanvas.getContext("2d");

  function resize(){var rect=dfCanvas.parentElement.getBoundingClientRect();dfCanvas.width=rect.width;dfCanvas.height=rect.height;dfW=dfCanvas.width;dfH=dfCanvas.height;initDfStars();}
  resize();window.addEventListener("resize",resize);

  dfCanvas.addEventListener("mousemove",function(e){var r=dfCanvas.getBoundingClientRect();dfMouseX=(e.clientX-r.left)*(dfW/r.width);dfMouseY=(e.clientY-r.top)*(dfH/r.height);});

  dfCanvas.addEventListener("mousedown",function(e){
    dfMouseDown=true;
    var r=dfCanvas.getBoundingClientRect(),mx=(e.clientX-r.left)*(dfW/r.width),my=(e.clientY-r.top)*(dfH/r.height);

    if(dfState==="menu"){
      var btnW=220,btnH=55,gap=20,by=dfH/2-20;
      if(mx>=dfW/2-btnW-gap/2&&mx<=dfW/2-gap/2&&my>=by&&my<=by+btnH){dfCoop=false;initDefenseGame();}
      else if(mx>=dfW/2+gap/2&&mx<=dfW/2+gap/2+btnW&&my>=by&&my<=by+btnH){dfState="lobby";dfCoopMenuSel=0;dfLobbyInput="";dfLobbyError="";dfLobbyMsg="";}
    } else if(dfState==="lobby"){
      var btnW=200,btnH=50,gap=20,centerY=dfH/2-60;
      if(mx>=dfW/2-btnW-gap/2&&mx<=dfW/2-gap/2&&my>=centerY&&my<=centerY+btnH){dfCoopMenuSel=0;coopCreateRoom();}
      else if(mx>=dfW/2+gap/2&&mx<=dfW/2+gap/2+btnW&&my>=centerY&&my<=centerY+btnH){dfCoopMenuSel=1;}
    } else if(dfState==="waiting"&&dfIsHost&&dfPartnerName){
      var sbw=260,sbh=50,py=dfH/2+30,sbx=dfW/2-sbw/2,sby=py+60;
      if(mx>=sbx&&mx<=sbx+sbw&&my>=sby&&my<=sby+sbh) coopStartGame();
    }
  });
  dfCanvas.addEventListener("mouseup",function(){dfMouseDown=false;});
  dfCanvas.addEventListener("contextmenu",function(e){e.preventDefault();});

  // Touch
  dfCanvas.addEventListener("touchstart",function(e){e.preventDefault();var t=e.touches[0],r=dfCanvas.getBoundingClientRect();dfMouseX=(t.clientX-r.left)*(dfW/r.width);dfMouseY=(t.clientY-r.top)*(dfH/r.height);dfMouseDown=true;if(dfState==="menu"){dfCoop=false;initDefenseGame();}});
  dfCanvas.addEventListener("touchmove",function(e){e.preventDefault();var t=e.touches[0],r=dfCanvas.getBoundingClientRect();dfMouseX=(t.clientX-r.left)*(dfW/r.width);dfMouseY=(t.clientY-r.top)*(dfH/r.height);});
  dfCanvas.addEventListener("touchend",function(){dfMouseDown=false;});

  document.addEventListener("keydown",function(e){
    dfKeys[e.key.toLowerCase()]=true;
    if(e.key===" "&&dfState==="shop"){dfState="playing";startWave();if(dfCoop&&dfIsHost)coopNotifyNextWave();e.preventDefault();}
    if(e.key===" "&&dfState==="waiting"&&dfIsHost&&dfPartnerName){coopStartGame();e.preventDefault();}
    if(e.key==="r"&&dfState==="gameover"){if(dfCoop)coopLeave();initDefenseGame();}
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

  dfCanvas.addEventListener("click",function(e){
    if(dfState!=="shop")return;
    var r=dfCanvas.getBoundingClientRect(),mx=(e.clientX-r.left)*(dfW/r.width),my=(e.clientY-r.top)*(dfH/r.height);
    var items=getShopItems(),cols=2,itemW=220,itemH=80,gap=12;
    var startX=(dfW-(cols*itemW+(cols-1)*gap))/2,startY=dfCoop?138:125;
    for(var i=0;i<items.length;i++){
      var col=i%cols,row=Math.floor(i/cols),x=startX+col*(itemW+gap),y=startY+row*(itemH+gap);
      if(mx>=x&&mx<=x+itemW&&my>=y&&my<=y+itemH){
        if(!items[i].max&&dfCoins>=items[i].cost){dfCoins-=items[i].cost;items[i].action();if(dfCoop) coopSyncShopPurchase();}
        break;
      }
    }
  });

  // Menu hover
  dfCanvas.addEventListener("mousemove",function(e){
    if(dfState!=="menu")return;
    var r=dfCanvas.getBoundingClientRect(),mx=(e.clientX-r.left)*(dfW/r.width),my=(e.clientY-r.top)*(dfH/r.height);
    var btnW=220,btnH=55,gap=20,by=dfH/2-20;
    if(mx>=dfW/2-btnW-gap/2&&mx<=dfW/2-gap/2&&my>=by&&my<=by+btnH)dfMenuSelection=0;
    else if(mx>=dfW/2+gap/2&&mx<=dfW/2+gap/2+btnW&&my>=by&&my<=by+btnH)dfMenuSelection=1;
  });

  dfState="menu";
  stopDefenseLoop();
  defenseFrame();
}
