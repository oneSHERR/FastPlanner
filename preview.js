// ============================================================
// FILE PREVIEW MODAL
// ============================================================
function renderPreviewModal() {
  if (!previewingFile) return;
  var T = THEMES[themeId], fi = gfi(previewingFile.name);
  var isImg = previewingFile.type && previewingFile.type.indexOf("image/") === 0;

  var ov = document.createElement("div"); ov.id = "pvov"; ov.className = "overlay";
  ov.style.background = T.ob;
  ov.onclick = function() { ov.remove(); previewingFile = null; };

  var h = '<div style="background:' + T.fb + ';border:1px solid ' + T.cb + ';border-radius:24px;padding:28px;width:100%;max-width:620px;backdrop-filter:blur(40px) saturate(1.5);-webkit-backdrop-filter:blur(40px) saturate(1.5);box-shadow:0 32px 80px ' + T.sh + ',inset 0 1px 0 rgba(255,255,255,.08);animation:cardSlideUp .4s cubic-bezier(.4,0,.2,1)" onclick="event.stopPropagation()">';

  // Header
  h += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:22px;flex-wrap:wrap;gap:12px">';
  h += '<div style="display:flex;align-items:center;gap:12px">';
  h += '<div style="width:44px;height:44px;border-radius:12px;background:' + fi.c + '18;display:flex;align-items:center;justify-content:center;font-size:22px">' + fi.i + '</div>';
  h += '<div><div style="font-weight:600;font-size:15px;color:' + T.tx + ';letter-spacing:.01em">' + esc(previewingFile.name) + '</div>';
  h += '<div style="font-size:11px;color:' + T.tm + ';margin-top:2px">' + fsz(previewingFile.size) + '</div></div></div>';

  h += '<div style="display:flex;gap:8px">';
  h += '<button class="btn-glow" style="padding:8px 18px;border-radius:10px;border:none;background:' + T.ab + ';color:' + T.at + ';font-size:12px;font-weight:600;cursor:pointer" onclick="dlf(previewingFile)">⬇ Скачать</button>';
  h += '<button class="close-btn" style="padding:8px 12px;border-radius:10px;border:1px solid ' + T.ibd + ';background:transparent;color:' + T.tm + ';font-size:15px;cursor:pointer" onclick="document.getElementById(\'pvov\').remove();previewingFile=null">✕</button>';
  h += '</div></div>';

  // Content
  if (isImg) {
    h += '<img src="' + previewingFile.dataUrl + '" style="max-width:100%;max-height:70vh;border-radius:16px;box-shadow:0 8px 32px rgba(0,0,0,.15)">';
  } else {
    h += '<div style="text-align:center;padding:40px 20px">';
    h += '<div style="font-size:64px;margin-bottom:16px">' + fi.i + '</div>';
    h += '<p style="color:' + T.tm + ';letter-spacing:.02em">Предпросмотр недоступен для этого типа файла</p></div>';
  }

  h += '</div>';
  ov.innerHTML = h;
  document.body.appendChild(ov);
}
