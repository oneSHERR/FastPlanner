// ============================================================
// SPACE ASTEROIDS — WASD + Mouse Aim & Shoot
// ============================================================
var gameState = "menu";
var gameCanvas, gameCtx, gameW, gameH;
var gameLoop = null;
var gameScore = 0, gameLives = 3, gameLevel = 1;
var gameHighScores = [];
var unsubScores = null;
var comboCount = 0, comboTimer = 0, screenShake = 0, flashAlpha = 0;

var ship = null;
var keys = {};
var mouseX = 0, mouseY = 0, mouseDown = false;
var bullets = [], asteroids = [], particles = [], stars = [];
var bulletCooldown = 0, invincible = 0;

var SHIP_ACCEL = 0.12, SHIP_FRICTION = 0.988, BULLET_SPEED = 6, BULLET_LIFE = 50, MAX_BULLETS = 10;

// ============================================================
// SPRITE DRAWING
// ============================================================
function drawPixelShip(ctx, x, y, angle, size, thrustOn) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(angle); var s = size / 16;
  if (thrustOn) {
    var grd = ctx.createRadialGradient(0, s * 10, 0, 0, s * 10, s * 14);
    grd.addColorStop(0, 'rgba(100,180,255,.8)'); grd.addColorStop(1, 'rgba(60,120,255,0)');
    ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(0, s * 10, s * 14, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#6ec6ff'; ctx.beginPath(); ctx.moveTo(-s*3, s*6); ctx.lineTo(0, s*(10+Math.random()*6)); ctx.lineTo(s*3, s*6); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(-s*1.5, s*6); ctx.lineTo(0, s*(8+Math.random()*4)); ctx.lineTo(s*1.5, s*6); ctx.fill();
  }
  ctx.fillStyle = '#c0d0e8'; ctx.beginPath(); ctx.moveTo(0,-s*8); ctx.lineTo(-s*6,s*6); ctx.lineTo(-s*2,s*4); ctx.lineTo(0,s*5); ctx.lineTo(s*2,s*4); ctx.lineTo(s*6,s*6); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#7cc8ff'; ctx.beginPath(); ctx.moveTo(0,-s*5); ctx.lineTo(-s*2,s*1); ctx.lineTo(s*2,s*1); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#4a6a8a'; ctx.lineWidth = s*0.8; ctx.beginPath(); ctx.moveTo(0,-s*8); ctx.lineTo(-s*6,s*6); ctx.lineTo(-s*2,s*4); ctx.lineTo(0,s*5); ctx.lineTo(s*2,s*4); ctx.lineTo(s*6,s*6); ctx.closePath(); ctx.stroke();
  ctx.fillStyle = '#ff6b4a'; ctx.fillRect(-s*5,s*3,s*2,s*1.5); ctx.fillRect(s*3,s*3,s*2,s*1.5);
  ctx.restore();
}

function seedRng(seed) { var s = seed||1; return function(){ s=(s*16807)%2147483647; return(s-1)/2147483646; }; }

function drawAsteroid(ctx, x, y, radius, seed) {
  ctx.save(); ctx.translate(x,y); var rng=seedRng(seed), pts=10+Math.floor(rng()*4);
  ctx.rotate(seed*0.01);
  ctx.beginPath();
  for(var i=0;i<pts;i++){var a=(i/pts)*Math.PI*2,r=radius*(0.7+rng()*0.3);if(i===0)ctx.moveTo(Math.cos(a)*r,Math.sin(a)*r);else ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r);}
  ctx.closePath();
  var grd=ctx.createRadialGradient(-radius*.2,-radius*.2,0,0,0,radius);
  grd.addColorStop(0,'#8a7a6a');grd.addColorStop(0.6,'#6a5a4a');grd.addColorStop(1,'#4a3a2a');
  ctx.fillStyle=grd;ctx.fill();ctx.strokeStyle='#3a2a1a';ctx.lineWidth=1.5;ctx.stroke();
  for(var i=0;i<3;i++){ctx.beginPath();ctx.arc((rng()-.5)*radius,(rng()-.5)*radius,radius*(.08+rng()*.12),0,Math.PI*2);ctx.fillStyle='rgba(0,0,0,.2)';ctx.fill();}
  ctx.restore();
}

// ============================================================
// GAME INIT
// ============================================================
function initGame() {
  gameScore=0; gameLives=3; gameLevel=1; comboCount=0; comboTimer=0;
  bullets=[]; asteroids=[]; particles=[]; bulletCooldown=0; invincible=120; screenShake=0; flashAlpha=0;
  ship = {x:gameW/2, y:gameH/2, angle:-Math.PI/2, vx:0, vy:0, thrust:false, radius:14};
  spawnAsteroids(5); initStars();
}
function initStars() {
  stars=[];
  for(var i=0;i<120;i++) stars.push({x:Math.random()*gameW,y:Math.random()*gameH,s:Math.random()*2+.5,b:Math.random()*.6+.2,speed:Math.random()*.3+.05,twinkle:Math.random()*Math.PI*2});
}
function spawnAsteroids(count) {
  for(var i=0;i<count;i++){
    var x,y; do{x=Math.random()*gameW;y=Math.random()*gameH;}while(ship&&dist(x,y,ship.x,ship.y)<150);
    asteroids.push({x:x,y:y,vx:(Math.random()-.5)*2,vy:(Math.random()-.5)*2,radius:30+Math.random()*20,seed:Math.floor(Math.random()*99999),rotSpeed:(Math.random()-.5)*.02,hp:1});
  }
}
function splitAsteroid(a) {
  if(a.radius<16)return;
  for(var i=0;i<2;i++){var ang=Math.random()*Math.PI*2;asteroids.push({x:a.x+Math.cos(ang)*8,y:a.y+Math.sin(ang)*8,vx:(Math.random()-.5)*3.5,vy:(Math.random()-.5)*3.5,radius:a.radius*.55,seed:a.seed+i*1000+Math.floor(Math.random()*999),rotSpeed:(Math.random()-.5)*.04,hp:1});}
}

// ============================================================
// PARTICLES
// ============================================================
function spawnExplosion(x,y,count,color,speed){for(var i=0;i<count;i++){var a=Math.random()*Math.PI*2,s=Math.random()*(speed||3)+1;particles.push({x:x,y:y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:30+Math.random()*25,maxLife:55,size:Math.random()*3+1,color:color||'#ffaa44',type:'circle'});}}
function spawnDebris(x,y,count){for(var i=0;i<count;i++){var a=Math.random()*Math.PI*2,s=Math.random()*4+1;particles.push({x:x,y:y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:20+Math.random()*30,maxLife:50,size:Math.random()*4+2,color:'#8a7a6a',type:'square',rot:Math.random()*Math.PI*2,rotSpeed:(Math.random()-.5)*.2});}}
function spawnScorePopup(x,y,text,color){particles.push({x:x,y:y,vx:0,vy:-1.5,life:40,maxLife:40,text:text,color:color||'#fff',type:'text',size:14});}

// ============================================================
// UPDATE — WASD move, mouse aim & shoot
// ============================================================
function updateGame() {
  if(gameState!=="playing")return;

  // WASD movement (absolute directions, not rotation-based)
  var moveX=0, moveY=0;
  if(keys['KeyA'])moveX=-1;
  if(keys['KeyD'])moveX=1;
  if(keys['KeyW'])moveY=-1;
  if(keys['KeyS'])moveY=1;

  // Normalize diagonal
  if(moveX!==0&&moveY!==0){moveX*=0.707;moveY*=0.707;}

  ship.vx+=moveX*SHIP_ACCEL;
  ship.vy+=moveY*SHIP_ACCEL;
  ship.thrust=(moveX!==0||moveY!==0);

  // Aim towards mouse
  var canvasRect=gameCanvas.getBoundingClientRect();
  var mx=mouseX-canvasRect.left, my=mouseY-canvasRect.top;
  // Scale mouse coords to canvas
  mx=mx*(gameW/canvasRect.width);
  my=my*(gameH/canvasRect.height);
  ship.angle=Math.atan2(my-ship.y, mx-ship.x);

  // Thrust particles
  if(ship.thrust&&Math.random()>.3){
    var ta=Math.atan2(ship.vy,ship.vx)+Math.PI+(Math.random()-.5)*.5;
    particles.push({x:ship.x-Math.cos(ship.angle)*10,y:ship.y-Math.sin(ship.angle)*10,vx:Math.cos(ta)*(Math.random()*2+1),vy:Math.sin(ta)*(Math.random()*2+1),life:10+Math.random()*10,maxLife:20,size:Math.random()*3+1,color:Math.random()>.5?'#6ec6ff':'#fff',type:'circle'});
  }

  ship.vx*=SHIP_FRICTION; ship.vy*=SHIP_FRICTION;
  ship.x+=ship.vx; ship.y+=ship.vy;
  ship.x=wrap(ship.x,gameW); ship.y=wrap(ship.y,gameH);

  // Shoot with mouse click (hold to auto-fire)
  if(bulletCooldown>0)bulletCooldown--;
  if(mouseDown&&bulletCooldown<=0&&bullets.length<MAX_BULLETS){
    bullets.push({x:ship.x+Math.cos(ship.angle)*14,y:ship.y+Math.sin(ship.angle)*14,vx:Math.cos(ship.angle)*BULLET_SPEED+ship.vx*.3,vy:Math.sin(ship.angle)*BULLET_SPEED+ship.vy*.3,life:BULLET_LIFE});
    bulletCooldown=8;
  }

  if(invincible>0)invincible--;
  if(comboTimer>0){comboTimer--;if(comboTimer<=0)comboCount=0;}

  // Update bullets
  for(var i=bullets.length-1;i>=0;i--){var b=bullets[i];b.x+=b.vx;b.y+=b.vy;b.x=wrap(b.x,gameW);b.y=wrap(b.y,gameH);b.life--;if(b.life<=0)bullets.splice(i,1);}

  // Update asteroids
  for(var i=0;i<asteroids.length;i++){var a=asteroids[i];a.x+=a.vx;a.y+=a.vy;a.x=wrap(a.x,gameW);a.y=wrap(a.y,gameH);a.seed+=a.rotSpeed;}

  // Bullet-Asteroid collision
  for(var bi=bullets.length-1;bi>=0;bi--){for(var ai=asteroids.length-1;ai>=0;ai--){
    if(bi>=bullets.length||ai>=asteroids.length)continue;
    var b=bullets[bi],a=asteroids[ai];
    if(dist(b.x,b.y,a.x,a.y)<a.radius){
      bullets.splice(bi,1); comboCount++; comboTimer=90;
      var pts=Math.floor((50/a.radius)*100)*comboCount; gameScore+=pts;
      spawnExplosion(a.x,a.y,12,'#ffaa44',3); spawnDebris(a.x,a.y,6);
      spawnScorePopup(a.x,a.y-10,'+'+pts,comboCount>1?'#ffdd44':'#fff');
      if(comboCount>1)spawnScorePopup(a.x,a.y-25,'x'+comboCount+' COMBO!','#ff6644');
      splitAsteroid(a); asteroids.splice(ai,1); screenShake=6; flashAlpha=.15; break;
    }
  }}

  // Ship-Asteroid collision
  if(invincible<=0){for(var i=0;i<asteroids.length;i++){var a=asteroids[i];
    if(dist(ship.x,ship.y,a.x,a.y)<a.radius+ship.radius-4){
      gameLives--; invincible=150; screenShake=15; flashAlpha=.4;
      spawnExplosion(ship.x,ship.y,25,'#ff4444',4); spawnExplosion(ship.x,ship.y,15,'#ffaa44',3);
      ship.vx=0;ship.vy=0;
      if(gameLives<=0){gameState="gameover";spawnExplosion(ship.x,ship.y,40,'#ff2222',5);saveScore();}
      break;
    }
  }}

  // Next level
  if(asteroids.length===0){gameLevel++;invincible=90;spawnAsteroids(4+gameLevel);spawnScorePopup(gameW/2,gameH/2,'УРОВЕНЬ '+gameLevel,'#6ec6ff');flashAlpha=.2;}

  // Update particles
  for(var i=particles.length-1;i>=0;i--){var p=particles[i];p.x+=(p.vx||0);p.y+=(p.vy||0);if(p.vx)p.vx*=.97;if(p.vy)p.vy*=.97;if(p.rotSpeed)p.rot+=p.rotSpeed;p.life--;if(p.life<=0)particles.splice(i,1);}

  // Stars
  for(var i=0;i<stars.length;i++){stars[i].twinkle+=.02;stars[i].y+=stars[i].speed;if(stars[i].y>gameH){stars[i].y=0;stars[i].x=Math.random()*gameW;}}

  if(screenShake>0)screenShake*=.85;
  if(flashAlpha>0)flashAlpha*=.9;
}

// ============================================================
// DRAW
// ============================================================
function drawGame() {
  var ctx=gameCtx; ctx.save();
  if(screenShake>.5)ctx.translate((Math.random()-.5)*screenShake*2,(Math.random()-.5)*screenShake*2);
  ctx.fillStyle='#08080f'; ctx.fillRect(0,0,gameW,gameH);

  // Stars
  for(var i=0;i<stars.length;i++){var s=stars[i];ctx.globalAlpha=Math.max(0,Math.min(1,s.b+Math.sin(s.twinkle)*.2));ctx.fillStyle='#fff';ctx.fillRect(Math.floor(s.x),Math.floor(s.y),s.s>1.5?2:1,s.s>1.5?2:1);}
  ctx.globalAlpha=1;

  // Nebula
  var neb=ctx.createRadialGradient(gameW*.7,gameH*.3,0,gameW*.7,gameH*.3,gameW*.4);
  neb.addColorStop(0,'rgba(60,30,100,.06)');neb.addColorStop(1,'rgba(60,30,100,0)');ctx.fillStyle=neb;ctx.fillRect(0,0,gameW,gameH);

  if(gameState==="menu"){drawMenu(ctx);drawParticles(ctx);ctx.restore();return;}

  // Crosshair
  if(gameState==="playing"){
    var cr=gameCanvas.getBoundingClientRect();
    var mx2=mouseX-cr.left,my2=mouseY-cr.top;
    mx2*=(gameW/cr.width);my2*=(gameH/cr.height);
    ctx.strokeStyle='rgba(110,198,255,.4)';ctx.lineWidth=1;
    ctx.beginPath();ctx.arc(mx2,my2,12,0,Math.PI*2);ctx.stroke();
    ctx.beginPath();ctx.moveTo(mx2-16,my2);ctx.lineTo(mx2-8,my2);ctx.moveTo(mx2+8,my2);ctx.lineTo(mx2+16,my2);ctx.moveTo(mx2,my2-16);ctx.lineTo(mx2,my2-8);ctx.moveTo(mx2,my2+8);ctx.lineTo(mx2,my2+16);ctx.stroke();
  }

  // Asteroids
  for(var i=0;i<asteroids.length;i++){var a=asteroids[i];drawAsteroid(ctx,a.x,a.y,a.radius,a.seed);}

  // Bullets
  for(var i=0;i<bullets.length;i++){var b=bullets[i];var alpha=Math.min(1,b.life/10);ctx.globalAlpha=alpha;
    var bg2=ctx.createRadialGradient(b.x,b.y,0,b.x,b.y,8);bg2.addColorStop(0,'rgba(110,198,255,.6)');bg2.addColorStop(1,'rgba(110,198,255,0)');ctx.fillStyle=bg2;ctx.fillRect(b.x-8,b.y-8,16,16);
    ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(b.x,b.y,2,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;}

  // Ship
  if(gameState==="playing"||gameState==="paused"){
    if(invincible<=0||Math.floor(invincible/4)%2===0) drawPixelShip(ctx,ship.x,ship.y,ship.angle+Math.PI/2,28,ship.thrust);
  }

  drawParticles(ctx);

  if(flashAlpha>.01){ctx.globalAlpha=flashAlpha;ctx.fillStyle='#fff';ctx.fillRect(0,0,gameW,gameH);ctx.globalAlpha=1;}

  drawHUD(ctx);
  if(gameState==="gameover")drawGameOver(ctx);
  if(gameState==="paused")drawPaused(ctx);
  ctx.restore();
}

function drawParticles(ctx){for(var i=0;i<particles.length;i++){var p=particles[i];var a=Math.max(0,p.life/p.maxLife);ctx.globalAlpha=a;
  if(p.type==='text'){ctx.font='bold '+p.size+'px "JetBrains Mono",monospace';ctx.fillStyle=p.color;ctx.textAlign='center';ctx.fillText(p.text,p.x,p.y);}
  else if(p.type==='square'){ctx.save();ctx.translate(p.x,p.y);if(p.rot)ctx.rotate(p.rot);ctx.fillStyle=p.color;ctx.fillRect(-p.size/2,-p.size/2,p.size,p.size);ctx.restore();}
  else{ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,p.size*a,0,Math.PI*2);ctx.fill();}}
  ctx.globalAlpha=1;}

function drawHUD(ctx){
  ctx.font='bold 20px "JetBrains Mono",monospace';ctx.fillStyle='#fff';ctx.textAlign='left';
  ctx.fillText(gameScore.toString().padStart(6,'0'),16,32);
  for(var i=0;i<gameLives;i++)drawPixelShip(ctx,gameW-30-i*28,24,0,16,false);
  ctx.font='12px "JetBrains Mono",monospace';ctx.fillStyle='rgba(255,255,255,.5)';ctx.textAlign='left';
  ctx.fillText('УРОВЕНЬ '+gameLevel,16,52);
  if(comboCount>1&&comboTimer>0){ctx.globalAlpha=Math.min(1,comboTimer/30);ctx.font='bold 16px "JetBrains Mono",monospace';ctx.fillStyle='#ffdd44';ctx.textAlign='center';ctx.fillText('COMBO x'+comboCount,gameW/2,32);ctx.globalAlpha=1;}
}

function drawMenu(ctx){
  ctx.font='bold 42px "Inter",sans-serif';ctx.fillStyle='#fff';ctx.textAlign='center';ctx.fillText('ASTEROIDS',gameW/2,gameH*.3);
  ctx.font='14px "JetBrains Mono",monospace';ctx.fillStyle='rgba(255,255,255,.5)';ctx.fillText('WorkFlow Arcade',gameW/2,gameH*.3+30);
  ctx.font='13px "Inter",sans-serif';ctx.fillStyle='rgba(255,255,255,.7)';var cy=gameH*.48;
  ctx.fillText('W A S D — движение',gameW/2,cy);
  ctx.fillText('Мышь — прицел',gameW/2,cy+24);
  ctx.fillText('ЛКМ — стрельба (зажми)',gameW/2,cy+48);
  ctx.fillText('P — пауза',gameW/2,cy+72);
  var blink=Math.sin(Date.now()/400)*.3+.7;ctx.globalAlpha=blink;ctx.font='bold 18px "Inter",sans-serif';ctx.fillStyle='#6ec6ff';ctx.fillText('[ ENTER — СТАРТ ]',gameW/2,gameH*.78);ctx.globalAlpha=1;
  drawLeaderboard(ctx,gameH*.85);
}

function drawGameOver(ctx){
  ctx.fillStyle='rgba(0,0,0,.65)';ctx.fillRect(0,0,gameW,gameH);
  ctx.font='bold 36px "Inter",sans-serif';ctx.fillStyle='#ff4757';ctx.textAlign='center';ctx.fillText('GAME OVER',gameW/2,gameH*.3);
  ctx.font='bold 22px "JetBrains Mono",monospace';ctx.fillStyle='#fff';ctx.fillText(gameScore.toString(),gameW/2,gameH*.38);
  ctx.font='13px "Inter",sans-serif';ctx.fillStyle='rgba(255,255,255,.6)';ctx.fillText('Уровень '+gameLevel,gameW/2,gameH*.43);
  var blink=Math.sin(Date.now()/400)*.3+.7;ctx.globalAlpha=blink;ctx.font='bold 16px "Inter",sans-serif';ctx.fillStyle='#6ec6ff';ctx.fillText('[ ENTER — ЗАНОВО ]',gameW/2,gameH*.55);ctx.globalAlpha=1;
  drawLeaderboard(ctx,gameH*.65);
}

function drawPaused(ctx){
  ctx.fillStyle='rgba(0,0,0,.5)';ctx.fillRect(0,0,gameW,gameH);
  ctx.font='bold 30px "Inter",sans-serif';ctx.fillStyle='#fff';ctx.textAlign='center';ctx.fillText('ПАУЗА',gameW/2,gameH/2-10);
  ctx.font='14px "Inter",sans-serif';ctx.fillStyle='rgba(255,255,255,.5)';ctx.fillText('P — продолжить',gameW/2,gameH/2+20);
}

function drawLeaderboard(ctx,startY){
  if(!gameHighScores.length)return;
  ctx.font='bold 11px "JetBrains Mono",monospace';ctx.fillStyle='rgba(255,255,255,.4)';ctx.textAlign='center';ctx.fillText('🏆 РЕКОРДЫ',gameW/2,startY);
  ctx.font='11px "JetBrains Mono",monospace';
  var top5=gameHighScores.slice(0,5);
  for(var i=0;i<top5.length;i++){var s=top5[i];var medal=i===0?'🥇':i===1?'🥈':i===2?'🥉':'  ';
    ctx.fillStyle=i===0?'#ffd700':i===1?'#c0c0c0':i===2?'#cd7f32':'rgba(255,255,255,.45)';
    ctx.fillText(medal+' '+(s.name||'Аноним').substring(0,10)+' — '+s.score,gameW/2,startY+18+i*16);}
}

// ============================================================
// UTILS
// ============================================================
function dist(x1,y1,x2,y2){var dx=x1-x2,dy=y1-y2;return Math.sqrt(dx*dx+dy*dy);}
function wrap(v,max){if(v<-30)return max+30;if(v>max+30)return-30;return v;}

// ============================================================
// FIRESTORE LEADERBOARD
// ============================================================
function listenScores(){
  if(unsubScores)unsubScores();
  unsubScores=db.collection("game-scores").orderBy("score","desc").limit(10).onSnapshot(function(snap){
    gameHighScores=[];snap.forEach(function(doc){gameHighScores.push(doc.data());});
  });
}
function saveScore(){
  if(!currentUser||gameScore<=0)return;
  var name=currentUser.displayName||currentUser.email||'Аноним';
  db.collection("game-scores").where("uid","==",currentUser.uid).get().then(function(snap){
    var existing=null;snap.forEach(function(doc){existing=doc;});
    if(existing){if(gameScore>existing.data().score)existing.ref.update({score:gameScore,level:gameLevel,date:new Date().toISOString()});}
    else db.collection("game-scores").add({uid:currentUser.uid,name:name,score:gameScore,level:gameLevel,date:new Date().toISOString()});
  }).catch(function(err){console.log("Score save error:",err);});
}

// ============================================================
// INPUT — Keyboard + Mouse
// ============================================================
function setupGameInput(){
  document.addEventListener('keydown',function(e){
    keys[e.code]=true;
    if(e.code==='Enter'){if(gameState==="menu"||gameState==="gameover"){gameState="playing";initGame();}}
    if(e.code==='KeyP'){if(gameState==="playing")gameState="paused";else if(gameState==="paused")gameState="playing";}
    if(activeTab==="game"&&(e.code==='Space'||e.code.indexOf('Arrow')===0))e.preventDefault();
  });
  document.addEventListener('keyup',function(e){keys[e.code]=false;});
  document.addEventListener('mousemove',function(e){mouseX=e.clientX;mouseY=e.clientY;});
  document.addEventListener('mousedown',function(e){if(e.button===0&&activeTab==="game"){mouseDown=true;e.preventDefault();}});
  document.addEventListener('mouseup',function(e){if(e.button===0)mouseDown=false;});
  // Prevent context menu on canvas
  document.addEventListener('contextmenu',function(e){if(activeTab==="game"&&e.target&&e.target.id==='game-canvas')e.preventDefault();});
}

// ============================================================
// GAME LOOP
// ============================================================
function startGameLoop(){if(gameLoop)return;function loop(){if(activeTab!=="game"){gameLoop=null;return;}updateGame();drawGame();gameLoop=requestAnimationFrame(loop);}gameLoop=requestAnimationFrame(loop);}
function stopGameLoop(){if(gameLoop){cancelAnimationFrame(gameLoop);gameLoop=null;}}

// ============================================================
// RENDER GAME PAGE
// ============================================================
function renderGamePage(){
  var el=document.getElementById("pnl-game");
  var h='<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:16px;background:#08080f">';
  h+='<canvas id="game-canvas" style="border-radius:12px;border:1px solid rgba(255,255,255,.08);box-shadow:0 0 40px rgba(110,198,255,.08);max-width:100%;cursor:crosshair"></canvas>';
  h+='</div>';
  el.innerHTML=h;
  gameCanvas=document.getElementById("game-canvas");
  gameCtx=gameCanvas.getContext("2d");
  var maxW=Math.min(800,window.innerWidth-80),maxH=Math.min(600,window.innerHeight-40);
  gameW=maxW;gameH=maxH;gameCanvas.width=gameW;gameCanvas.height=gameH;
  gameCanvas.tabIndex=1;gameCanvas.focus();
  initStars();listenScores();startGameLoop();
}

setupGameInput();
