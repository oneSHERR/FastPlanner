// ============================================================
// SPACE DEFENSE — Protect the Base!
// WASD + Mouse, Upgrades between waves
// ============================================================
var dfState = "menu"; // menu | playing | shop | gameover
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
// UPGRADES
// ============================================================
var dfUpgrades = {
  gunType: 0,     // 0=normal, 1=double, 2=shotgun, 3=laser, 4=rockets
  gunDmg: 1,
  fireRate: 1,
  shipSpeed: 1,
  shipHP: 3,
  shipMaxHP: 3,
  shield: 0,      // base shield level
  baseHP: 20,
  baseMaxHP: 20,
  baseRegen: 0,
  turrets: 0,     // base turrets count
  drones: 0       // helper drones count
};

var GUN_NAMES = ["Обычная", "Двойная", "Дробовик", "Лазер", "Ракеты"];
var GUN_COLORS = ["#6ec6ff", "#54a0ff", "#feca57", "#ff4757", "#ff9f43"];

// ============================================================
// SHOP ITEMS
// ============================================================
function getShopItems() {
  var u = dfUpgrades;
  return [
    {id:"gun", name:"Пушка: " + GUN_NAMES[Math.min(u.gunType+1,4)], desc:"Следующий тип оружия", cost: 30 + u.gunType * 25, max: u.gunType >= 4, action:function(){ u.gunType = Math.min(u.gunType+1,4); }},
    {id:"dmg", name:"Урон +" + (u.gunDmg), desc:"Увеличить урон пуль", cost: 15 + u.gunDmg * 10, max: u.gunDmg >= 10, action:function(){ u.gunDmg++; }},
    {id:"rate", name:"Скорострельность", desc:"Быстрее стрельба", cost: 20 + u.fireRate * 15, max: u.fireRate >= 8, action:function(){ u.fireRate++; }},
    {id:"speed", name:"Скорость корабля", desc:"Быстрее движение", cost: 15 + u.shipSpeed * 10, max: u.shipSpeed >= 6, action:function(){ u.shipSpeed++; }},
    {id:"hp", name:"Здоровье +1", desc:"Доп. жизнь корабля", cost: 25 + u.shipMaxHP * 8, max: u.shipMaxHP >= 10, action:function(){ u.shipMaxHP++; u.shipHP = u.shipMaxHP; }},
    {id:"baseHP", name:"Броня базы +5", desc:"Укрепить базу", cost: 20 + u.baseMaxHP * 3, max: u.baseMaxHP >= 60, action:function(){ u.baseMaxHP += 5; u.baseHP = u.baseMaxHP; }},
    {id:"regen", name:"Регенерация базы", desc:"Авто-восстановление HP", cost: 40 + u.baseRegen * 30, max: u.baseRegen >= 5, action:function(){ u.baseRegen++; }},
    {id:"turret", name:"Турель на базе", desc:"База стреляет сама", cost: 50 + u.turrets * 40, max: u.turrets >= 4, action:function(){ u.turrets++; }},
    {id:"drone", name:"Дрон-помощник", desc:"Автоматический союзник", cost: 60 + u.drones * 50, max: u.drones >= 3, action:function(){ u.drones++; spawnDrones(); }},
    {id:"heal", name:"❤️ Починить базу", desc:"Полное восстановление", cost: 15, max: u.baseHP >= u.baseMaxHP, action:function(){ u.baseHP = u.baseMaxHP; }}
  ];
}

// ============================================================
// INIT
// ============================================================
function initDefenseGame() {
  dfWave = 0; dfScore = 0; dfCoins = 0; dfKills = 0;
  dfBullets = []; dfEnemies = []; dfParticles = []; dfDrones = [];
  dfBulletCD = 0; dfInvincible = 120; dfShake = 0; dfFlash = 0;
  dfWaveTimer = 0; dfWaveEnemiesLeft = 0;

  dfUpgrades = {gunType:0, gunDmg:1, fireRate:1, shipSpeed:1, shipHP:3, shipMaxHP:3, shield:0, baseHP:20, baseMaxHP:20, baseRegen:0, turrets:0, drones:0};

  dfBase = {x: dfW/2, y: dfH/2, radius: 32};
  dfShip = {x: dfW/2, y: dfH/2 - 80, angle: -Math.PI/2, vx:0, vy:0, thrust:false, radius:14};

  // Stars
  dfStars = [];
  for (var i = 0; i < 80; i++) dfStars.push({x:Math.random()*dfW, y:Math.random()*dfH, s:Math.random()*2+0.5, b:Math.random()});

  dfState = "playing";
  startWave();
}

// ============================================================
// WAVES
// ============================================================
function startWave() {
  dfWave++;
  dfWaveTimer = 180; // 3 sec countdown
  var count = 3 + dfWave * 2;
  if (dfWave % 5 === 0) count += 1; // boss wave has fewer grunts
  dfWaveEnemiesLeft = count;
}

function spawnEnemy() {
  if (dfWaveEnemiesLeft <= 0) return;
  dfWaveEnemiesLeft--;

  // Spawn from edges
  var side = Math.floor(Math.random() * 4);
  var ex, ey;
  if (side === 0) { ex = -30; ey = Math.random() * dfH; }
  else if (side === 1) { ex = dfW + 30; ey = Math.random() * dfH; }
  else if (side === 2) { ex = Math.random() * dfW; ey = -30; }
  else { ex = Math.random() * dfW; ey = dfH + 30; }

  var isBoss = (dfWave % 5 === 0 && dfWaveEnemiesLeft === 0);
  var isShip = (!isBoss && dfWave >= 3 && Math.random() < 0.3 + dfWave * 0.02);

  if (isBoss) {
    dfEnemies.push({
      x:ex, y:ey, type:"boss", hp: 15 + dfWave * 3, maxHp: 15 + dfWave * 3,
      radius: 28 + Math.min(dfWave, 20), speed: 0.4 + dfWave * 0.01,
      seed: Math.floor(Math.random()*9999), shootCD: 0, coins: 20 + dfWave * 2
    });
  } else if (isShip) {
    dfEnemies.push({
      x:ex, y:ey, type:"ship", hp: 2 + Math.floor(dfWave/3), maxHp: 2 + Math.floor(dfWave/3),
      radius: 12, speed: 0.8 + dfWave * 0.03, angle: 0,
      seed: Math.floor(Math.random()*9999), shootCD: 0, coins: 3 + Math.floor(dfWave/2)
    });
  } else {
    var sz = Math.random() < 0.3 ? "big" : (Math.random() < 0.5 ? "med" : "small");
    var r = sz === "big" ? 25+Math.random()*10 : (sz === "med" ? 15+Math.random()*5 : 8+Math.random()*4);
    dfEnemies.push({
      x:ex, y:ey, type:"asteroid", hp: sz === "big" ? 3 : (sz === "med" ? 2 : 1), maxHp: sz === "big" ? 3 : 2,
      radius: r, speed: 0.5 + Math.random() * 0.5 + dfWave * 0.02,
      seed: Math.floor(Math.random()*9999), coins: sz === "big" ? 3 : (sz === "med" ? 2 : 1)
    });
  }
}

// ============================================================
// DRONES
// ============================================================
function spawnDrones() {
  dfDrones = [];
  for (var i = 0; i < dfUpgrades.drones; i++) {
    dfDrones.push({angle: (Math.PI*2/dfUpgrades.drones)*i, dist:50, shootCD:0});
  }
}

// ============================================================
// SHOOTING
// ============================================================
function playerShoot() {
  var u = dfUpgrades;
  var s = dfShip;
  var a = Math.atan2(dfMouseY - s.y, dfMouseX - s.x);
  var spd = 6 + u.fireRate * 0.3;
  var dmg = u.gunDmg;

  if (u.gunType === 0) { // Normal
    dfBullets.push({x:s.x, y:s.y, vx:Math.cos(a)*spd, vy:Math.sin(a)*spd, life:60, dmg:dmg, owner:"player", type:"normal"});
  } else if (u.gunType === 1) { // Double
    for (var d = -1; d <= 1; d += 2) {
      var ox = Math.cos(a+Math.PI/2)*d*5;
      var oy = Math.sin(a+Math.PI/2)*d*5;
      dfBullets.push({x:s.x+ox, y:s.y+oy, vx:Math.cos(a)*spd, vy:Math.sin(a)*spd, life:60, dmg:dmg, owner:"player", type:"normal"});
    }
  } else if (u.gunType === 2) { // Shotgun
    for (var i = -2; i <= 2; i++) {
      var sa = a + i * 0.12;
      dfBullets.push({x:s.x, y:s.y, vx:Math.cos(sa)*(spd-1), vy:Math.sin(sa)*(spd-1), life:30, dmg:Math.max(1,dmg-1), owner:"player", type:"normal"});
    }
  } else if (u.gunType === 3) { // Laser
    dfBullets.push({x:s.x, y:s.y, vx:Math.cos(a)*spd*1.8, vy:Math.sin(a)*spd*1.8, life:40, dmg:dmg+1, owner:"player", type:"laser"});
  } else if (u.gunType === 4) { // Rockets
    dfBullets.push({x:s.x, y:s.y, vx:Math.cos(a)*spd*0.8, vy:Math.sin(a)*spd*0.8, life:90, dmg:dmg+3, owner:"player", type:"rocket", radius:6});
  }
}

function turretShoot() {
  if (dfUpgrades.turrets <= 0) return;
  // Find nearest enemy
  var nearest = null, nd = Infinity;
  for (var i = 0; i < dfEnemies.length; i++) {
    var e = dfEnemies[i];
    var d = Math.hypot(e.x - dfBase.x, e.y - dfBase.y);
    if (d < nd && d < 300) { nd = d; nearest = e; }
  }
  if (!nearest) return;
  var a = Math.atan2(nearest.y - dfBase.y, nearest.x - dfBase.x);
  for (var t = 0; t < dfUpgrades.turrets; t++) {
    var ta = a + (t - (dfUpgrades.turrets-1)/2) * 0.3;
    dfBullets.push({x:dfBase.x, y:dfBase.y, vx:Math.cos(ta)*5, vy:Math.sin(ta)*5, life:50, dmg:1, owner:"turret", type:"normal"});
  }
}

function droneShoot(drone) {
  var dx = dfShip.x + Math.cos(drone.angle) * drone.dist;
  var dy = dfShip.y + Math.sin(drone.angle) * drone.dist;
  var nearest = null, nd = Infinity;
  for (var i = 0; i < dfEnemies.length; i++) {
    var e = dfEnemies[i];
    var d = Math.hypot(e.x - dx, e.y - dy);
    if (d < nd && d < 250) { nd = d; nearest = e; }
  }
  if (!nearest) return;
  var a = Math.atan2(nearest.y - dy, nearest.x - dx);
  dfBullets.push({x:dx, y:dy, vx:Math.cos(a)*5, vy:Math.sin(a)*5, life:40, dmg:1, owner:"drone", type:"normal"});
}

// ============================================================
// PARTICLES
// ============================================================
function spawnExplosion(x, y, color, count) {
  for (var i = 0; i < count; i++) {
    var a = Math.random() * Math.PI * 2;
    var sp = 1 + Math.random() * 3;
    dfParticles.push({x:x, y:y, vx:Math.cos(a)*sp, vy:Math.sin(a)*sp, life:20+Math.random()*20, maxLife:40, color:color, size:2+Math.random()*3});
  }
}

// ============================================================
// UPDATE
// ============================================================
function updateDefense() {
  if (dfState !== "playing") return;
  var u = dfUpgrades;
  var s = dfShip;

  // Wave countdown
  if (dfWaveTimer > 0) {
    dfWaveTimer--;
    if (dfWaveTimer <= 0) {
      // Spawn first enemies
      for (var i = 0; i < Math.min(3, dfWaveEnemiesLeft); i++) { setTimeout(function(){ spawnEnemy(); }, i * 500); }
    }
    return;
  }

  // Spawn remaining enemies over time
  if (dfWaveEnemiesLeft > 0 && Math.random() < 0.02 + dfWave * 0.005) spawnEnemy();

  // Ship movement
  var accel = 0.12 + u.shipSpeed * 0.03;
  var friction = 0.988;
  s.thrust = false;
  if (dfKeys["w"] || dfKeys["ц"]) { s.vy -= accel; s.thrust = true; }
  if (dfKeys["s"] || dfKeys["ы"]) { s.vy += accel; s.thrust = true; }
  if (dfKeys["a"] || dfKeys["ф"]) { s.vx -= accel; s.thrust = true; }
  if (dfKeys["d"] || dfKeys["в"]) { s.vx += accel; s.thrust = true; }
  s.vx *= friction; s.vy *= friction;
  s.x += s.vx; s.y += s.vy;
  s.x = Math.max(15, Math.min(dfW-15, s.x));
  s.y = Math.max(15, Math.min(dfH-15, s.y));
  s.angle = Math.atan2(dfMouseY - s.y, dfMouseX - s.x);

  // Player shooting
  dfBulletCD--;
  var fireDelay = Math.max(4, 15 - u.fireRate * 1.5);
  if (dfMouseDown && dfBulletCD <= 0) { playerShoot(); dfBulletCD = fireDelay; }

  // Turret shooting
  if (u.turrets > 0 && Math.random() < 0.03 * u.turrets) turretShoot();

  // Drones
  for (var i = 0; i < dfDrones.length; i++) {
    dfDrones[i].angle += 0.02;
    dfDrones[i].shootCD--;
    if (dfDrones[i].shootCD <= 0) { droneShoot(dfDrones[i]); dfDrones[i].shootCD = 30; }
  }

  // Bullets
  for (var i = dfBullets.length - 1; i >= 0; i--) {
    var b = dfBullets[i];
    b.x += b.vx; b.y += b.vy; b.life--;
    if (b.life <= 0 || b.x < -20 || b.x > dfW+20 || b.y < -20 || b.y > dfH+20) { dfBullets.splice(i, 1); continue; }

    // Bullet vs enemies
    if (b.owner !== "enemy") {
      for (var j = dfEnemies.length - 1; j >= 0; j--) {
        var e = dfEnemies[j];
        if (Math.hypot(b.x - e.x, b.y - e.y) < e.radius + 4) {
          e.hp -= b.dmg;
          spawnExplosion(b.x, b.y, "#6ec6ff", 3);
          if (b.type !== "laser") { dfBullets.splice(i, 1); break; }
          else { b.dmg = Math.max(0, b.dmg - 1); if (b.dmg <= 0) { dfBullets.splice(i, 1); break; } }
        }
      }
    }
    // Enemy bullet vs ship
    if (b.owner === "enemy" && dfInvincible <= 0) {
      if (Math.hypot(b.x - s.x, b.y - s.y) < s.radius + 3) {
        u.shipHP--;
        dfInvincible = 60;
        dfShake = 10; dfFlash = 1;
        spawnExplosion(s.x, s.y, "#ff4757", 8);
        dfBullets.splice(i, 1);
        if (u.shipHP <= 0) { gameOverDefense(); return; }
      }
    }
    // Enemy bullet vs base
    if (b.owner === "enemy") {
      if (Math.hypot(b.x - dfBase.x, b.y - dfBase.y) < dfBase.radius + 3) {
        u.baseHP--;
        spawnExplosion(dfBase.x, dfBase.y, "#ff9f43", 4);
        dfBullets.splice(i, 1);
        if (u.baseHP <= 0) { gameOverDefense(); return; }
      }
    }
  }

  // Enemies
  for (var i = dfEnemies.length - 1; i >= 0; i--) {
    var e = dfEnemies[i];
    // Move toward base
    var a = Math.atan2(dfBase.y - e.y, dfBase.x - e.x);
    e.x += Math.cos(a) * e.speed;
    e.y += Math.sin(a) * e.speed;
    if (e.angle !== undefined) e.angle = a;

    // Enemy shooting (ships + bosses)
    if ((e.type === "ship" || e.type === "boss") && e.shootCD !== undefined) {
      e.shootCD--;
      if (e.shootCD <= 0) {
        var ta = Math.atan2(dfBase.y - e.y, dfBase.x - e.x);
        dfBullets.push({x:e.x, y:e.y, vx:Math.cos(ta)*3, vy:Math.sin(ta)*3, life:80, dmg:1, owner:"enemy", type:"normal"});
        if (e.type === "boss") {
          // Boss shoots spread
          for (var bs = -1; bs <= 1; bs += 2) {
            dfBullets.push({x:e.x, y:e.y, vx:Math.cos(ta+bs*0.3)*3, vy:Math.sin(ta+bs*0.3)*3, life:80, dmg:1, owner:"enemy", type:"normal"});
          }
        }
        e.shootCD = e.type === "boss" ? 40 : 60 - Math.min(dfWave, 30);
      }
    }

    // Enemy vs base collision
    if (Math.hypot(e.x - dfBase.x, e.y - dfBase.y) < dfBase.radius + e.radius) {
      u.baseHP -= (e.type === "boss" ? 5 : (e.type === "ship" ? 2 : 1));
      spawnExplosion(e.x, e.y, "#ff4757", 10);
      dfEnemies.splice(i, 1);
      dfShake = 8;
      if (u.baseHP <= 0) { gameOverDefense(); return; }
      continue;
    }

    // Dead enemies
    if (e.hp <= 0) {
      dfScore += (e.type === "boss" ? 100 : (e.type === "ship" ? 25 : 10));
      dfCoins += e.coins || 1;
      dfKills++;
      spawnExplosion(e.x, e.y, e.type === "boss" ? "#feca57" : "#ff9f43", e.type === "boss" ? 25 : 12);
      dfEnemies.splice(i, 1);
    }
  }

  // Wave complete?
  if (dfWaveEnemiesLeft <= 0 && dfEnemies.length === 0 && dfWaveTimer <= 0) {
    // Base regen
    u.baseHP = Math.min(u.baseMaxHP, u.baseHP + u.baseRegen);
    dfState = "shop";
  }

  // Invincibility
  if (dfInvincible > 0) dfInvincible--;
  if (dfShake > 0) dfShake *= 0.9;
  if (dfFlash > 0) dfFlash *= 0.9;

  // Particles
  for (var i = dfParticles.length - 1; i >= 0; i--) {
    var p = dfParticles[i];
    p.x += p.vx; p.y += p.vy; p.life--;
    p.vx *= 0.97; p.vy *= 0.97;
    if (p.life <= 0) dfParticles.splice(i, 1);
  }
}

// ============================================================
// DRAW
// ============================================================
function drawDefense() {
  var ctx = dfCtx;
  ctx.save();

  // Shake
  if (dfShake > 0.5) ctx.translate((Math.random()-.5)*dfShake*2, (Math.random()-.5)*dfShake*2);

  // Background
  ctx.fillStyle = "#0a0a18";
  ctx.fillRect(0, 0, dfW, dfH);

  // Stars
  for (var i = 0; i < dfStars.length; i++) {
    var st = dfStars[i];
    ctx.globalAlpha = 0.3 + st.b * 0.5;
    ctx.fillStyle = "#fff";
    ctx.fillRect(st.x, st.y, st.s, st.s);
  }
  ctx.globalAlpha = 1;

  // Base
  drawBase(ctx);

  // Enemies
  for (var i = 0; i < dfEnemies.length; i++) drawEnemy(ctx, dfEnemies[i]);

  // Bullets
  for (var i = 0; i < dfBullets.length; i++) drawBullet(ctx, dfBullets[i]);

  // Particles
  for (var i = 0; i < dfParticles.length; i++) {
    var p = dfParticles[i];
    ctx.globalAlpha = p.life / p.maxLife;
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x - p.size/2, p.y - p.size/2, p.size, p.size);
  }
  ctx.globalAlpha = 1;

  // Drones
  for (var i = 0; i < dfDrones.length; i++) {
    var d = dfDrones[i];
    var dx = dfShip.x + Math.cos(d.angle) * d.dist;
    var dy = dfShip.y + Math.sin(d.angle) * d.dist;
    ctx.fillStyle = "#54a0ff";
    ctx.beginPath(); ctx.arc(dx, dy, 6, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = "#6ec6ff";
    ctx.beginPath(); ctx.arc(dx, dy, 3, 0, Math.PI*2); ctx.fill();
  }

  // Ship
  if (dfInvincible <= 0 || Math.floor(dfInvincible/4) % 2 === 0) {
    drawPixelShip(ctx, dfShip.x, dfShip.y, dfShip.angle, 30, dfShip.thrust);
  }

  // HUD
  drawHUD(ctx);

  // Wave countdown
  if (dfWaveTimer > 0) {
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(0, 0, dfW, dfH);
    ctx.fillStyle = "#feca57";
    ctx.font = "bold 48px Inter";
    ctx.textAlign = "center";
    ctx.fillText("ВОЛНА " + dfWave, dfW/2, dfH/2 - 20);
    ctx.font = "24px Inter";
    ctx.fillStyle = "#fff";
    ctx.fillText("Приготовьтесь!", dfW/2, dfH/2 + 20);
  }

  // Flash
  if (dfFlash > 0.01) {
    ctx.fillStyle = "rgba(255,71,87," + (dfFlash * 0.3) + ")";
    ctx.fillRect(0, 0, dfW, dfH);
  }

  ctx.restore();
}

function drawBase(ctx) {
  var b = dfBase, u = dfUpgrades;
  // Shield glow
  if (u.shield > 0) {
    ctx.beginPath(); ctx.arc(b.x, b.y, b.radius + 10 + u.shield * 3, 0, Math.PI*2);
    ctx.strokeStyle = "rgba(84,160,255,0.2)"; ctx.lineWidth = 2; ctx.stroke();
  }
  // Base body
  var grd = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.radius);
  grd.addColorStop(0, "#4a6cf7"); grd.addColorStop(0.7, "#2a3cb7"); grd.addColorStop(1, "#1a2070");
  ctx.beginPath(); ctx.arc(b.x, b.y, b.radius, 0, Math.PI*2); ctx.fillStyle = grd; ctx.fill();
  ctx.strokeStyle = "#6ec6ff"; ctx.lineWidth = 2; ctx.stroke();
  // HP bar
  var bw = 60, bh = 6;
  ctx.fillStyle = "rgba(0,0,0,0.5)"; ctx.fillRect(b.x - bw/2, b.y + b.radius + 8, bw, bh);
  var pct = u.baseHP / u.baseMaxHP;
  ctx.fillStyle = pct > 0.5 ? "#2ed573" : (pct > 0.25 ? "#feca57" : "#ff4757");
  ctx.fillRect(b.x - bw/2, b.y + b.radius + 8, bw * pct, bh);
  // Turret indicators
  for (var t = 0; t < u.turrets; t++) {
    var ta = (Math.PI*2/Math.max(u.turrets,1))*t - Math.PI/2;
    var tx = b.x + Math.cos(ta) * (b.radius + 5);
    var ty = b.y + Math.sin(ta) * (b.radius + 5);
    ctx.fillStyle = "#feca57"; ctx.beginPath(); ctx.arc(tx, ty, 4, 0, Math.PI*2); ctx.fill();
  }
}

function drawEnemy(ctx, e) {
  ctx.save(); ctx.translate(e.x, e.y);
  if (e.type === "asteroid") {
    var rng = seedRng(e.seed), pts = 10;
    ctx.beginPath();
    for (var i = 0; i < pts; i++) {
      var a = (i/pts)*Math.PI*2, r = e.radius*(0.7+rng()*0.3);
      if (i === 0) ctx.moveTo(Math.cos(a)*r, Math.sin(a)*r);
      else ctx.lineTo(Math.cos(a)*r, Math.sin(a)*r);
    }
    ctx.closePath();
    ctx.fillStyle = "#6a5a4a"; ctx.fill(); ctx.strokeStyle = "#3a2a1a"; ctx.lineWidth = 1.5; ctx.stroke();
  } else if (e.type === "ship") {
    ctx.rotate(e.angle || 0);
    ctx.fillStyle = "#ff4757";
    ctx.beginPath(); ctx.moveTo(12,0); ctx.lineTo(-8,-7); ctx.lineTo(-5,0); ctx.lineTo(-8,7); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "#cc3344"; ctx.lineWidth = 1; ctx.stroke();
  } else if (e.type === "boss") {
    ctx.rotate(Math.atan2(dfBase.y - e.y, dfBase.x - e.x));
    var r = e.radius;
    ctx.fillStyle = "#8b0000";
    ctx.beginPath(); ctx.moveTo(r,0); ctx.lineTo(-r*0.7,-r*0.8); ctx.lineTo(-r*0.3,0); ctx.lineTo(-r*0.7,r*0.8); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#ff4757"; ctx.beginPath(); ctx.arc(0, 0, r*0.4, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = "#ff6b6b"; ctx.lineWidth = 2; ctx.stroke();
    // Boss HP bar
    ctx.rotate(-Math.atan2(dfBase.y - e.y, dfBase.x - e.x));
    var bw = r*2, bh = 4;
    ctx.fillStyle = "rgba(0,0,0,0.6)"; ctx.fillRect(-bw/2, -r-10, bw, bh);
    ctx.fillStyle = "#ff4757"; ctx.fillRect(-bw/2, -r-10, bw*(e.hp/e.maxHp), bh);
  }
  ctx.restore();
}

function drawBullet(ctx, b) {
  if (b.owner === "enemy") {
    ctx.fillStyle = "#ff4757";
    ctx.beginPath(); ctx.arc(b.x, b.y, 3, 0, Math.PI*2); ctx.fill();
  } else if (b.type === "laser") {
    ctx.strokeStyle = "#ff4757"; ctx.lineWidth = 3; ctx.shadowColor = "#ff4757"; ctx.shadowBlur = 8;
    ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(b.x - b.vx*2, b.y - b.vy*2); ctx.stroke();
    ctx.shadowBlur = 0;
  } else if (b.type === "rocket") {
    ctx.fillStyle = "#ff9f43";
    ctx.beginPath(); ctx.arc(b.x, b.y, 4, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = "#feca57";
    ctx.beginPath(); ctx.arc(b.x - b.vx*0.5, b.y - b.vy*0.5, 2, 0, Math.PI*2); ctx.fill();
  } else {
    ctx.fillStyle = b.owner === "turret" ? "#feca57" : "#6ec6ff";
    ctx.beginPath(); ctx.arc(b.x, b.y, 2.5, 0, Math.PI*2); ctx.fill();
  }
}

function drawHUD(ctx) {
  var u = dfUpgrades;
  ctx.textAlign = "left"; ctx.font = "bold 14px 'JetBrains Mono'";

  // Top left — wave + score
  ctx.fillStyle = "#fff"; ctx.fillText("ВОЛНА: " + dfWave, 15, 25);
  ctx.fillStyle = "#feca57"; ctx.fillText("ОЧКИ: " + dfScore, 15, 45);
  ctx.fillStyle = "#2ed573"; ctx.fillText("МОНЕТЫ: " + dfCoins, 15, 65);

  // Top right — ship HP
  ctx.textAlign = "right";
  ctx.fillStyle = "#ff4757";
  var hearts = "";
  for (var i = 0; i < u.shipMaxHP; i++) hearts += (i < u.shipHP) ? "❤️" : "🖤";
  ctx.font = "16px Inter";
  ctx.fillText(hearts, dfW - 15, 25);

  // Gun type
  ctx.font = "bold 12px Inter";
  ctx.fillStyle = GUN_COLORS[u.gunType];
  ctx.fillText("🔫 " + GUN_NAMES[u.gunType], dfW - 15, 45);

  ctx.textAlign = "left";
}

// ============================================================
// SHOP SCREEN
// ============================================================
function drawShop() {
  var ctx = dfCtx;
  ctx.fillStyle = "#0a0a18"; ctx.fillRect(0, 0, dfW, dfH);

  // Stars
  for (var i = 0; i < dfStars.length; i++) {
    var st = dfStars[i];
    ctx.globalAlpha = 0.2 + st.b * 0.3;
    ctx.fillStyle = "#fff"; ctx.fillRect(st.x, st.y, st.s, st.s);
  }
  ctx.globalAlpha = 1;

  ctx.textAlign = "center"; ctx.fillStyle = "#feca57";
  ctx.font = "bold 32px Inter";
  ctx.fillText("МАГАЗИН", dfW/2, 50);
  ctx.font = "16px Inter"; ctx.fillStyle = "#2ed573";
  ctx.fillText("Монеты: " + dfCoins, dfW/2, 78);
  ctx.font = "14px Inter"; ctx.fillStyle = "#aaa";
  ctx.fillText("Волна " + dfWave + " пройдена! Очки: " + dfScore, dfW/2, 100);

  var items = getShopItems();
  var cols = 2, itemW = 220, itemH = 80, gap = 12;
  var startX = (dfW - (cols * itemW + (cols-1) * gap)) / 2;
  var startY = 125;

  for (var i = 0; i < items.length; i++) {
    var it = items[i];
    var col = i % cols, row = Math.floor(i / cols);
    var x = startX + col * (itemW + gap);
    var y = startY + row * (itemH + gap);

    var canBuy = !it.max && dfCoins >= it.cost;
    var bg = canBuy ? "rgba(46,213,115,0.12)" : (it.max ? "rgba(255,255,255,0.03)" : "rgba(255,71,87,0.08)");
    ctx.fillStyle = bg;
    ctx.beginPath();
    // Rounded rect
    var r = 12;
    ctx.moveTo(x+r, y); ctx.lineTo(x+itemW-r, y); ctx.quadraticCurveTo(x+itemW, y, x+itemW, y+r);
    ctx.lineTo(x+itemW, y+itemH-r); ctx.quadraticCurveTo(x+itemW, y+itemH, x+itemW-r, y+itemH);
    ctx.lineTo(x+r, y+itemH); ctx.quadraticCurveTo(x, y+itemH, x, y+itemH-r);
    ctx.lineTo(x, y+r); ctx.quadraticCurveTo(x, y, x+r, y);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = canBuy ? "#2ed57366" : "rgba(255,255,255,0.08)";
    ctx.lineWidth = 1; ctx.stroke();

    ctx.textAlign = "left";
    ctx.font = "bold 13px Inter";
    ctx.fillStyle = it.max ? "#666" : "#fff";
    ctx.fillText(it.name, x + 12, y + 24);
    ctx.font = "11px Inter"; ctx.fillStyle = "#888";
    ctx.fillText(it.desc, x + 12, y + 42);
    ctx.font = "bold 14px 'JetBrains Mono'";
    ctx.fillStyle = it.max ? "#444" : (canBuy ? "#2ed573" : "#ff4757");
    ctx.fillText(it.max ? "МАКС" : (it.cost + "💰"), x + 12, y + 64);
  }

  ctx.textAlign = "center"; ctx.font = "bold 16px Inter"; ctx.fillStyle = "#7c5cff";
  ctx.fillText("[ ПРОБЕЛ — Следующая волна ]", dfW/2, dfH - 30);
}

// ============================================================
// GAME OVER
// ============================================================
function gameOverDefense() {
  dfState = "gameover";
  // Save score
  if (currentUser && dfScore > 0) {
    db.collection("defense-scores").add({
      uid: currentUser.uid,
      name: currentUser.displayName || currentUser.email,
      score: dfScore,
      wave: dfWave,
      kills: dfKills,
      createdAt: new Date().toISOString()
    }).catch(function(){});
  }
}

function drawGameOver() {
  var ctx = dfCtx;
  ctx.fillStyle = "rgba(10,10,24,0.92)"; ctx.fillRect(0, 0, dfW, dfH);
  ctx.textAlign = "center";
  ctx.fillStyle = "#ff4757"; ctx.font = "bold 42px Inter";
  ctx.fillText("БАЗА УНИЧТОЖЕНА", dfW/2, dfH/2 - 60);
  ctx.fillStyle = "#feca57"; ctx.font = "bold 28px 'JetBrains Mono'";
  ctx.fillText("Очки: " + dfScore, dfW/2, dfH/2);
  ctx.fillStyle = "#fff"; ctx.font = "18px Inter";
  ctx.fillText("Волна: " + dfWave + "  |  Убито: " + dfKills, dfW/2, dfH/2 + 35);
  ctx.fillStyle = "#7c5cff"; ctx.font = "bold 16px Inter";
  ctx.fillText("[ R — Заново ]  [ ESC — Меню ]", dfW/2, dfH/2 + 80);
}

// ============================================================
// MENU
// ============================================================
function drawDefenseMenu() {
  var ctx = dfCtx;
  ctx.fillStyle = "#0a0a18"; ctx.fillRect(0, 0, dfW, dfH);
  for (var i = 0; i < dfStars.length; i++) {
    var st = dfStars[i]; ctx.globalAlpha = 0.3 + st.b * 0.5;
    ctx.fillStyle = "#fff"; ctx.fillRect(st.x, st.y, st.s, st.s);
  }
  ctx.globalAlpha = 1; ctx.textAlign = "center";
  ctx.fillStyle = "#7c5cff"; ctx.font = "bold 48px Inter";
  ctx.fillText("SPACE DEFENSE", dfW/2, dfH/2 - 50);
  ctx.fillStyle = "#6ec6ff"; ctx.font = "20px Inter";
  ctx.fillText("Защити базу от волн врагов!", dfW/2, dfH/2);
  ctx.fillStyle = "#feca57"; ctx.font = "14px Inter";
  ctx.fillText("WASD — движение  |  Мышь — прицел + стрельба", dfW/2, dfH/2 + 40);
  ctx.fillStyle = "#2ed573"; ctx.font = "bold 18px Inter";
  ctx.fillText("[ НАЖМИТЕ ЧТОБЫ НАЧАТЬ ]", dfW/2, dfH/2 + 80);
}

// ============================================================
// GAME LOOP
// ============================================================
function defenseFrame() {
  if (!dfCanvas) return;
  if (dfState === "menu") drawDefenseMenu();
  else if (dfState === "playing") { updateDefense(); drawDefense(); }
  else if (dfState === "shop") drawShop();
  else if (dfState === "gameover") drawGameOver();
  dfLoop = requestAnimationFrame(defenseFrame);
}

function stopDefenseLoop() { if (dfLoop) { cancelAnimationFrame(dfLoop); dfLoop = null; } }

// ============================================================
// RENDER DEFENSE PAGE
// ============================================================
function renderDefensePage() {
  var T = THEMES[themeId], el = document.getElementById("pnl-defense");
  if (!el) return;
  el.innerHTML = '<canvas id="df-canvas" style="display:block;width:100%;height:100%;background:#0a0a18;cursor:crosshair"></canvas>';
  dfCanvas = document.getElementById("df-canvas");
  dfCtx = dfCanvas.getContext("2d");

  function resize() {
    var rect = dfCanvas.parentElement.getBoundingClientRect();
    dfCanvas.width = rect.width; dfCanvas.height = rect.height;
    dfW = dfCanvas.width; dfH = dfCanvas.height;
    // Re-generate stars
    dfStars = [];
    for (var i = 0; i < 80; i++) dfStars.push({x:Math.random()*dfW, y:Math.random()*dfH, s:Math.random()*2+0.5, b:Math.random()});
  }
  resize();
  window.addEventListener("resize", resize);

  dfCanvas.addEventListener("mousemove", function(e) { var r = dfCanvas.getBoundingClientRect(); dfMouseX = e.clientX - r.left; dfMouseY = e.clientY - r.top; });
  dfCanvas.addEventListener("mousedown", function(e) {
    dfMouseDown = true;
    if (dfState === "menu") initDefenseGame();
  });
  dfCanvas.addEventListener("mouseup", function() { dfMouseDown = false; });
  dfCanvas.addEventListener("contextmenu", function(e) { e.preventDefault(); });

  // Touch
  dfCanvas.addEventListener("touchstart", function(e) {
    e.preventDefault(); var t = e.touches[0]; var r = dfCanvas.getBoundingClientRect();
    dfMouseX = t.clientX - r.left; dfMouseY = t.clientY - r.top; dfMouseDown = true;
    if (dfState === "menu") initDefenseGame();
  });
  dfCanvas.addEventListener("touchmove", function(e) {
    e.preventDefault(); var t = e.touches[0]; var r = dfCanvas.getBoundingClientRect();
    dfMouseX = t.clientX - r.left; dfMouseY = t.clientY - r.top;
  });
  dfCanvas.addEventListener("touchend", function() { dfMouseDown = false; });

  document.addEventListener("keydown", function(e) {
    dfKeys[e.key.toLowerCase()] = true;
    if (e.key === " " && dfState === "shop") { dfState = "playing"; startWave(); e.preventDefault(); }
    if (e.key === "r" && dfState === "gameover") initDefenseGame();
    if (e.key === "Escape" && dfState === "gameover") dfState = "menu";
    // Shop purchase by number keys
    if (dfState === "shop" && e.key >= "1" && e.key <= "9") {
      var idx = parseInt(e.key) - 1;
      var items = getShopItems();
      if (idx < items.length && !items[idx].max && dfCoins >= items[idx].cost) {
        dfCoins -= items[idx].cost;
        items[idx].action();
      }
    }
  });
  document.addEventListener("keyup", function(e) { dfKeys[e.key.toLowerCase()] = false; });

  // Shop click handling
  dfCanvas.addEventListener("click", function(e) {
    if (dfState !== "shop") return;
    var r = dfCanvas.getBoundingClientRect();
    var mx = e.clientX - r.left, my = e.clientY - r.top;
    var items = getShopItems();
    var cols = 2, itemW = 220, itemH = 80, gap = 12;
    var startX = (dfW - (cols * itemW + (cols-1) * gap)) / 2;
    var startY = 125;
    for (var i = 0; i < items.length; i++) {
      var col = i % cols, row = Math.floor(i / cols);
      var x = startX + col * (itemW + gap);
      var y = startY + row * (itemH + gap);
      if (mx >= x && mx <= x + itemW && my >= y && my <= y + itemH) {
        if (!items[i].max && dfCoins >= items[i].cost) {
          dfCoins -= items[i].cost;
          items[i].action();
        }
        break;
      }
    }
  });

  dfState = "menu";
  stopDefenseLoop();
  defenseFrame();
}
