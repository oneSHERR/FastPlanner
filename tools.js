// ============================================================
// TOOLS PAGE — Unified Tool
// ============================================================
var toolMode = "split"; // "split" | "join"

function renderTools() {
  var T = THEMES[themeId], el = document.getElementById("pnl-tools");
  var h = '<div class="tools-page"><div class="tools-inner">';

  h += '<h1 style="font-size:28px;font-weight:800;margin-bottom:8px;display:flex;align-items:center;gap:10px;color:' + T.tx + ';letter-spacing:-.02em"><span style="font-size:32px">🔧</span> Инструменты</h1>';
  h += '<p style="font-size:14px;margin-bottom:24px;font-weight:400;color:' + T.tm + '">Обработка текста — выберите режим</p>';

  h += '<div class="tcard" style="background:' + T.cbg + ';border:1px solid ' + T.cb + '">';

  // Mode switcher
  h += '<div style="display:flex;gap:4px;padding:4px;border-radius:14px;background:' + T.chb + ';border:1px solid ' + T.cb + ';margin-bottom:20px">';
  var modes = [
    {id:"split", icon:"📝", label:"Перенос в столбик"},
    {id:"join",  icon:"📦", label:"Соединить контейнеры"}
  ];
  for (var i = 0; i < modes.length; i++) {
    var m = modes[i], isA = toolMode === m.id;
    h += '<button style="flex:1;padding:10px 16px;border-radius:11px;border:none;font-size:13px;font-weight:' + (isA ? '700' : '500') + ';cursor:pointer;transition:all .2s;';
    h += 'background:' + (isA ? T.ab : 'transparent') + ';';
    h += 'color:' + (isA ? T.at : T.tm) + ';';
    if (isA) h += 'box-shadow:0 2px 8px ' + T.ag + ';';
    h += '" onclick="setToolMode(\'' + m.id + '\')">' + m.icon + ' ' + m.label + '</button>';
  }
  h += '</div>';

  // Description
  if (toolMode === "split") {
    h += '<p style="font-size:13px;margin-bottom:16px;color:' + T.tm + '">Разбивает строку на столбик по разделителю. Убирает запятые и лишние пробелы.</p>';
    // Options
    h += '<div class="topts">';
    h += '<label style="color:' + T.tx + '">Разделитель: <input id="tsep" style="width:80px;padding:8px 10px;border-radius:10px;border:1px solid ' + T.ibd + ';background:' + T.ib + ';color:' + T.tx + ';font-size:13px;outline:none;text-align:center;backdrop-filter:blur(10px)" value=" "></label>';
    h += '<label style="color:' + T.tx + '"><input type="checkbox" id="trmc" checked> Убрать запятые</label>';
    h += '<label style="color:' + T.tx + '"><input type="checkbox" id="tcap"> С заглавной</label>';
    h += '<label style="color:' + T.tx + '"><input type="checkbox" id="ttrm" checked> Убрать пробелы</label></div>';
  } else {
    h += '<p style="font-size:13px;margin-bottom:16px;color:' + T.tm + '">Извлекает 4 буквы + 7 цифр, убирает пробелы, запятые, типы (40HC, 20DV и т.д.).<br>';
    h += '<span style="font-family:\'JetBrains Mono\',monospace;color:' + T.td + '">MSKU 123 4567 40HC</span> → <span style="font-family:\'JetBrains Mono\',monospace;color:#2ed573">MSKU1234567</span></p>';
  }

  // Text areas
  h += '<div class="trow">';
  h += '<div class="tcol"><label style="color:' + T.tm + ';font-size:11px;text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px;display:block;font-weight:600">Введите текст</label>';
  var placeholder = toolMode === "split" ? "Например: яблоко, банан, апельсин" : "TKRU 4236025\nTKRU 4236026,\nMSKU 123 4567";
  h += '<textarea class="tta" id="tinp" style="border:1px solid ' + T.ibd + ';background:' + T.ib + ';color:' + T.tx + '" placeholder="' + placeholder + '"></textarea></div>';
  h += '<div class="tcol"><label style="color:' + T.tm + ';font-size:11px;text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px;display:block;font-weight:600">Результат</label>';
  h += '<textarea class="tta" id="tout" style="border:1px solid ' + T.ibd + ';background:' + T.ib + ';color:' + T.tx + '" readonly placeholder="Результат"></textarea>';
  h += '<div id="tcnt" style="font-size:12px;margin-top:8px;color:' + T.td + ';letter-spacing:.02em"></div></div></div>';

  // Buttons
  var btnLabel = toolMode === "split" ? "Перенести" : "Соединить";
  h += '<div style="display:flex;gap:10px;margin-top:18px;flex-wrap:wrap">';
  h += '<button class="tbtn btn-glow" style="background:linear-gradient(135deg,' + T.ac + ',' + T.ac + 'cc);box-shadow:0 4px 20px ' + T.ag + '" onclick="runTool()">' + btnLabel + '</button>';
  h += '<button class="tbtn2" style="background:' + T.ab + ';color:' + T.at + '" onclick="copyTool()">📋 Скопировать</button>';
  h += '<button class="tbtn2" style="background:' + T.chb + ';color:' + T.tm + '" onclick="clearTool()">Очистить</button>';
  h += '<button class="tbtn2" style="background:' + T.chb + ';color:' + T.tm + '" onclick="demoTool()">Демо</button>';
  h += '</div></div></div></div>';
  el.innerHTML = h;
}

// ============================================================
// MODE SWITCH
// ============================================================
window.setToolMode = function(mode) {
  toolMode = mode;
  renderTools();
};

// ============================================================
// RUN TOOL — dispatches to active mode
// ============================================================
window.runTool = function() {
  if (toolMode === "split") runSplit();
  else runJoin();
};

// ============================================================
// MODE 1 — Split to column
// ============================================================
function runSplit() {
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
}

// ============================================================
// MODE 2 — Join containers (4 letters + 7 digits)
// ============================================================
function runJoin() {
  var inp = document.getElementById("tinp");
  if (!inp || !inp.value.trim()) return;

  var lines = inp.value.split(/\n/);
  var res = [];

  // Pattern: 4 letters followed by 7 digits (with optional spaces/junk between)
  var re = /([A-Za-zА-Яа-я]{4})\s*(\d[\d\s]{6,})/;

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].trim();
    if (!line) continue;

    // Remove commas, semicolons
    line = line.replace(/[,;]/g, " ");

    var match = re.exec(line);
    if (match) {
      var prefix = match[1].toUpperCase();
      // Extract exactly 7 digits from the number part
      var digits = match[2].replace(/\D/g, "").substring(0, 7);
      if (digits.length === 7) {
        res.push(prefix + digits);
      }
    }
  }

  var out = document.getElementById("tout"), cnt = document.getElementById("tcnt");
  if (out) out.value = res.join("\n");
  if (cnt) cnt.textContent = "Контейнеров: " + res.length;
}

// ============================================================
// SHARED BUTTONS
// ============================================================
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
  if (!i) return;
  if (toolMode === "split") {
    i.value = "яблоко, банан, апельсин, манго, виноград, персик, ананас, киви";
  } else {
    i.value = "TKRU 4236025\nTKRU 4236026, \nMSKU 123 4567 40HC\nGATU      9876543,\nFFAU 1112 233 20DV";
  }
  runTool();
};
