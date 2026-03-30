// ============================================================
// PROFILE PAGE
// ============================================================
function renderProfile() {
  var T = THEMES[themeId], el = document.getElementById("pnl-profile");
  var name = currentUser ? (currentUser.displayName || "") : "";
  var email = currentUser ? currentUser.email : "";

  var h = '<div style="padding:32px"><div style="max-width:520px;margin:0 auto">';

  h += '<h1 style="font-size:28px;font-weight:800;margin-bottom:28px;color:' + T.tx + ';display:flex;align-items:center;gap:10px;letter-spacing:-.02em"><span style="font-size:32px">👤</span> Профиль</h1>';

  // Profile card
  h += '<div style="background:' + T.cbg + ';border:1px solid ' + T.cb + ';border-radius:20px;padding:28px;backdrop-filter:blur(20px) saturate(1.3);-webkit-backdrop-filter:blur(20px) saturate(1.3);box-shadow:0 4px 24px ' + T.sh + ',inset 0 1px 0 rgba(255,255,255,.05)">';

  // Avatar area
  h += '<div style="display:flex;align-items:center;gap:16px;margin-bottom:20px">';
  h += '<div style="width:56px;height:56px;border-radius:16px;background:linear-gradient(135deg,' + T.ac + ',' + T.ac + '88);display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:700;color:#fff;box-shadow:0 4px 16px ' + T.ag + '">' + (name ? name.charAt(0).toUpperCase() : '?') + '</div>';
  h += '<div><div style="font-size:18px;font-weight:700;color:' + T.tx + ';letter-spacing:-.01em">' + esc(name) + '</div>';
  h += '<div style="font-size:13px;color:' + T.tm + ';margin-top:2px">' + esc(email) + '</div></div></div>';

  // Change password
  h += '<div style="border-top:1px solid ' + T.cb + ';padding-top:22px">';
  h += '<h3 style="font-size:15px;font-weight:700;color:' + T.tx + ';margin-bottom:14px;letter-spacing:.01em">🔒 Сменить пароль</h3>';
  h += '<input class="finp" id="new-pass" type="password" style="border:1px solid ' + T.ibd + ';background:' + T.ib + ';color:' + T.tx + ';margin-bottom:14px" placeholder="Новый пароль (мин. 6 символов)">';
  h += '<button class="btn-glow" style="padding:11px 26px;border-radius:12px;border:none;background:linear-gradient(135deg,' + T.ac + ',' + T.ac + 'cc);color:#fff;font-size:13px;font-weight:700;cursor:pointer;box-shadow:0 4px 20px ' + T.ag + ';letter-spacing:.02em" onclick="doChangePassword()">Изменить пароль</button>';
  h += '</div></div>';

  // Invite code
  h += '<div style="margin-top:18px;padding:16px 20px;background:' + T.chb + ';border:1px solid ' + T.cb + ';border-radius:14px;backdrop-filter:blur(10px);text-align:center">';
  h += '<p style="font-size:12px;color:' + T.td + ';letter-spacing:.02em">Код приглашения для коллег</p>';
  h += '<p style="font-size:18px;font-weight:700;color:' + T.at + ';margin-top:4px;font-family:\'JetBrains Mono\',monospace;letter-spacing:.1em">' + INVITE_CODE + '</p>';
  h += '</div>';

  h += '</div></div>';
  el.innerHTML = h;
}
