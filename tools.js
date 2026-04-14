// ============================================================
// TOOLS PAGE
// ============================================================
function renderTools() {
  var T = THEMES[themeId], el = document.getElementById("pnl-tools");
  var h = '<div class="tools-page"><div class="tools-inner">';

  h += '<h1 style="font-size:28px;font-weight:800;margin-bottom:8px;display:flex;align-items:center;gap:10px;color:' + T.tx + ';letter-spacing:-.02em"><span style="font-size:32px">🔧</span> Инструменты</h1>';
  h += '<p style="font-size:14px;margin-bottom:30px;font-weight:400;color:' + T.tm + ';letter-spacing:.01em">Полезные утилиты для работы с текстом</p>';

  h += '<div class="tcard" style="background:' + T.cbg + ';border:1px solid ' + T.cb + '">';
  h += '<h3 style="font-size:18px;font-weight:700;margin-bottom:6px;display:flex;align-items:center;gap:8px;color:' + T.tx + ';letter-spacing:-.01em">📝 Перенос слов в столбик</h3>';
  h += '<p style="font-size:13px;margin-bottom:18px;color:' + T.tm + ';letter-spacing:.01em">Разбивает строку на столбик по разделителю. Убирает запятые и лишние пробелы.</p>';

  // Options
  h += '<div class="topts">';
  h += '<label style="color:' + T.tx + '">Разделитель: <input id="tsep" style="width:80px;padding:8px 10px;border-radius:10px;border:1px solid ' + T.ibd + ';background:' + T.ib + ';color:' + T.tx + ';font-size:13px;outline:none;text-align:center;backdrop-filter:blur(10px);transition:border-color .3s,box-shadow .3s" value=" "></label>';
  h += '<label style="color:' + T.tx + '"><input type="checkbox" id="trmc" checked> Убрать запятые</label>';
  h += '<label style="color:' + T.tx + '"><input type="checkbox" id="tcap"> С заглавной</label>';
  h += '<label style="color:' + T.tx + '"><input type="checkbox" id="ttrm" checked> Убрать пробелы</label></div>';

  // Text areas
  h += '<div class="trow">';
  h += '<div class="tcol"><label style="color:' + T.tm + ';font-size:11px;text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px;display:block;font-weight:600">Введите текст</label>';
  h += '<textarea class="tta" id="tinp" style="border:1px solid ' + T.ibd + ';background:' + T.ib + ';color:' + T.tx + '" placeholder="Например: яблоко, банан, апельсин"></textarea></div>';
  h += '<div class="tcol"><label style="color:' + T.tm + ';font-size:11px;text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px;display:block;font-weight:600">Результат</label>';
  h += '<textarea class="tta" id="tout" style="border:1px solid ' + T.ibd + ';background:' + T.ib + ';color:' + T.tx + '" readonly placeholder="Результат"></textarea>';
  h += '<div id="tcnt" style="font-size:12px;margin-top:8px;color:' + T.td + ';letter-spacing:.02em"></div></div></div>';

  // Buttons
  h += '<div style="display:flex;gap:10px;margin-top:18px;flex-wrap:wrap">';
  h += '<button class="tbtn btn-glow" style="background:linear-gradient(135deg,' + T.ac + ',' + T.ac + 'cc);box-shadow:0 4px 20px ' + T.ag + '" onclick="runTool()">Перенести</button>';
  h += '<button class="tbtn2" style="background:' + T.ab + ';color:' + T.at + '" onclick="copyTool()">📋 Скопировать</button>';
  h += '<button class="tbtn2" style="background:' + T.chb + ';color:' + T.tm + '" onclick="clearTool()">Очистить</button>';
  h += '<button class="tbtn2" style="background:' + T.chb + ';color:' + T.tm + '" onclick="demoTool()">Демо</button>';
  h += '</div></div></div></div>';
  el.innerHTML = h;
}

// ============================================================
// TOOL LOGIC
// ============================================================
window.runTool = function() {
  var inp = document.getElementById("tinp"), sep = document.getElementById("tsep"),
      rmc = document.getElementById("trmc"), cap = document.getElementById("tcap"),
      trm = document.getElementById("ttrm");
  if (!inp) return;
  var text = inp.value;
  var sv = sep ? (sep.value || " ") : " ";

  text = text.replace(/\r\n/g, sv).replace(/\r/g, sv).replace(/\n/g, sv);
  if (rmc && rmc.checked) text = text.replace(/,/g, sv);

  if (sv === " ") {
    text = text.replace(/\s+/g, " ");
  } else {
    var escaped = sv.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    var re = new RegExp("[\\s" + escaped + "]+", "g");
    text = text.replace(re, sv);
  }

  var parts = text.split(sv);
  var res = [];
  for (var i = 0; i < parts.length; i++) {
    var s = parts[i].trim();
    if (!s) continue;
    s = s.replace(/[\u00A0\u200B\u200C\u200D\uFEFF\u2000-\u200A\u2028\u2029\u202F\u205F\u3000]/g, " ");
    if (trm && trm.checked) s = s.replace(/\s+/g, " ").trim();
    if (!s) continue;
    if (cap && cap.checked) s = s.charAt(0).toUpperCase() + s.slice(1);
    res.push(s);
  }
  var out = document.getElementById("tout"), cnt = document.getElementById("tcnt");
  if (out) out.value = res.join("\n");
  if (cnt) cnt.textContent = "Строк: " + res.length;
};

window.copyTool = function() {
  var o = document.getElementById("tout");
  if (o && o.value) navigator.clipboard.writeText(o.value).catch(function() { o.select(); document.execCommand("copy"); });
};

window.clearTool = function() {
  var i = document.getElementById("tinp"), o = document.getElementById("tout"), c = document.getElementById("tcnt");
  if (i) i.value = ""; if (o) o.value = ""; if (c) c.textContent = "";
};

window.demoTool = function() {
  var i = document.getElementById("tinp");
  if (i) i.value = "яблоко, банан, апельсин, манго, виноград, персик, ананас, киви";
  runTool();
};
