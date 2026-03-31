// ============================================================
// PROFILE PAGE — with avatar upload
// ============================================================
function renderProfile() {
  var T = THEMES[themeId], el = document.getElementById("pnl-profile");
  var name = currentUser ? (currentUser.displayName || "") : "";
  var email = currentUser ? currentUser.email : "";
  var avatarUrl = userProfile ? userProfile.avatarUrl : "";

  var h = '<div style="padding:32px"><div style="max-width:520px;margin:0 auto">';
  h += '<h1 style="font-size:28px;font-weight:800;margin-bottom:28px;color:' + T.tx + ';display:flex;align-items:center;gap:10px;letter-spacing:-.02em"><span style="font-size:32px">👤</span> Профиль</h1>';

  // Profile card
  h += '<div style="background:' + T.cbg + ';border:1px solid ' + T.cb + ';border-radius:20px;padding:28px;backdrop-filter:blur(20px) saturate(1.3);-webkit-backdrop-filter:blur(20px) saturate(1.3);box-shadow:0 4px 24px ' + T.sh + ',inset 0 1px 0 rgba(255,255,255,.05)">';

  // Avatar + info row
  h += '<div style="display:flex;align-items:center;gap:18px;margin-bottom:22px">';

  // Avatar with upload overlay
  h += '<div style="position:relative;cursor:pointer" onclick="document.getElementById(\'avatar-input\').click()">';
  h += getUserAvatarHtml(72, name, avatarUrl);
  h += '<div style="position:absolute;inset:0;border-radius:20px;background:rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .2s" onmouseenter="this.style.opacity=\'1\'" onmouseleave="this.style.opacity=\'0\'"><span style="font-size:22px">📷</span></div>';
  h += '<input type="file" id="avatar-input" accept="image/*" style="display:none" onchange="handleAvatarUpload(this)">';
  h += '</div>';

  // Name & email
  h += '<div style="flex:1"><div style="font-size:20px;font-weight:700;color:' + T.tx + ';letter-spacing:-.01em">' + esc(name) + '</div>';
  h += '<div style="font-size:13px;color:' + T.tm + ';margin-top:3px">' + esc(email) + '</div>';
  h += '<div style="margin-top:8px"><button style="padding:5px 12px;border-radius:8px;border:1px solid ' + T.ibd + ';background:transparent;color:' + T.at + ';font-size:11px;cursor:pointer;transition:all .2s" onmouseenter="this.style.background=\'' + T.ab + '\'" onmouseleave="this.style.background=\'transparent\'" onclick="document.getElementById(\'avatar-input\').click()">Сменить фото</button>';
  if (avatarUrl) h += ' <button style="padding:5px 12px;border-radius:8px;border:1px solid rgba(255,71,87,.3);background:transparent;color:#ff4757;font-size:11px;cursor:pointer;transition:all .2s" onclick="removeAvatar()">Удалить</button>';
  h += '</div></div></div>';

  // Change name
  h += '<div style="border-top:1px solid ' + T.cb + ';padding-top:20px;margin-bottom:20px">';
  h += '<h3 style="font-size:14px;font-weight:700;color:' + T.tx + ';margin-bottom:10px">✏️ Имя</h3>';
  h += '<div style="display:flex;gap:8px"><input class="finp" id="edit-name" style="border:1px solid ' + T.ibd + ';background:' + T.ib + ';color:' + T.tx + ';flex:1" value="' + esc(name) + '" placeholder="Ваше имя">';
  h += '<button style="padding:9px 18px;border-radius:10px;border:none;background:' + T.ab + ';color:' + T.at + ';font-size:13px;font-weight:600;cursor:pointer;transition:all .2s;white-space:nowrap" onclick="updateDisplayName()">Сохранить</button></div></div>';

  // Change password
  h += '<div style="border-top:1px solid ' + T.cb + ';padding-top:20px">';
  h += '<h3 style="font-size:14px;font-weight:700;color:' + T.tx + ';margin-bottom:10px">🔒 Сменить пароль</h3>';
  h += '<input class="finp" id="new-pass" type="password" style="border:1px solid ' + T.ibd + ';background:' + T.ib + ';color:' + T.tx + ';margin-bottom:12px" placeholder="Новый пароль (мин. 6 символов)">';
  h += '<button class="btn-glow" style="padding:10px 24px;border-radius:12px;border:none;background:linear-gradient(135deg,' + T.ac + ',' + T.ac + 'cc);color:#fff;font-size:13px;font-weight:700;cursor:pointer;box-shadow:0 4px 20px ' + T.ag + '" onclick="doChangePassword()">Изменить пароль</button>';
  h += '</div></div>';

  // Invite code
  h += '<div style="margin-top:18px;padding:16px 20px;background:' + T.chb + ';border:1px solid ' + T.cb + ';border-radius:14px;backdrop-filter:blur(10px);text-align:center">';
  h += '<p style="font-size:12px;color:' + T.td + '">Код приглашения для коллег</p>';
  h += '<p style="font-size:18px;font-weight:700;color:' + T.at + ';margin-top:4px;font-family:\'JetBrains Mono\',monospace;letter-spacing:.1em">' + INVITE_CODE + '</p>';
  h += '</div>';

  h += '</div></div>';
  el.innerHTML = h;
}

// ============================================================
// AVATAR UPLOAD
// ============================================================
window.handleAvatarUpload = function(inp) {
  if (!inp.files || !inp.files[0]) return;
  var file = inp.files[0];
  if (!file.type.startsWith('image/')) { alert('Выберите изображение'); return; }
  if (file.size > 2 * 1024 * 1024) { alert('Макс. размер 2 МБ'); return; }

  var reader = new FileReader();
  reader.onload = function() {
    // Resize to 128x128 for Firestore storage
    var img = new Image();
    img.onload = function() {
      var canvas = document.createElement('canvas');
      var size = 128;
      canvas.width = size; canvas.height = size;
      var ctx = canvas.getContext('2d');

      // Crop to square center
      var s = Math.min(img.width, img.height);
      var sx = (img.width - s) / 2, sy = (img.height - s) / 2;
      ctx.drawImage(img, sx, sy, s, s, 0, 0, size, size);

      var dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      saveUserAvatar(dataUrl);
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
  inp.value = '';
};

window.removeAvatar = function() {
  saveUserAvatar('');
};

window.updateDisplayName = function() {
  var inp = document.getElementById('edit-name');
  if (!inp || !inp.value.trim()) return;
  var newName = inp.value.trim();
  currentUser.updateProfile({displayName: newName}).then(function() {
    if (userProfile) userProfile.displayName = newName;
    db.collection("users").doc(currentUser.uid).set({displayName: newName}, {merge: true});
    renderProfile();
    renderPlanner();
    renderSidebar();
  }).catch(function(err) { alert("Ошибка: " + err.message); });
};
