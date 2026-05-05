// ============================================================
// DECODER — Восстановление текста из "кракозябр"
// Поддержка авто-определения и ручного выбора пары кодировок
// ============================================================

// CP1251 — таблица позиций 0x80..0xFF в Unicode
// Позволяет ЗАКОДИРОВАТЬ JS-строку обратно в байты CP1251
// (TextEncoder умеет только UTF-8, поэтому таблица нужна)
var CP1251_MAP = (function() {
  var hi = "ЂЃ‚ѓ„…†‡€‰Љ‹ЊЌЋЏђ‘’“”•–—\u0098™љ›њќћџ\u00A0ЎўЈ¤Ґ¦§Ё©Є«¬\u00AD®Ї°±Ііґµ¶·ё№є»јЅѕјАБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдежзийклмнопрстуфхцчшщъыьэюя";
  // (символ 0x98 в CP1251 не определён — ставим placeholder)
  var m = {};
  for (var i = 0; i < hi.length; i++) {
    m[hi.charCodeAt(i)] = 0x80 + i;
  }
  // 0x00..0x7F совпадают с ASCII
  for (var j = 0; j < 0x80; j++) m[j] = j;
  return m;
})();

// KOI8-R — таблица 0x80..0xFF
var KOI8R_HI = "─│┌┐└┘├┤┬┴┼▀▄█▌▐░▒▓⌠■∙√≈≤≥\u00A0⌡°²·÷═║╒ё╓╔╕╖╗╘╙╚╛╜╝╞╟╠╡Ё╢╣╤╥╦╧╨╩╪╫╬©юабцдефгхийклмнопярстужвьызшэщчъЮАБЦДЕФГХИЙКЛМНОПЯРСТУЖВЬЫЗШЭЩЧЪ";

var KOI8R_MAP = (function() {
  var m = {};
  for (var j = 0; j < 0x80; j++) m[j] = j;
  for (var i = 0; i < KOI8R_HI.length; i++) {
    m[KOI8R_HI.charCodeAt(i)] = 0x80 + i;
  }
  return m;
})();

// Закодировать строку в байты по карте (Uint8Array)
function encodeWithMap(str, map) {
  var out = new Uint8Array(str.length * 2); // запас
  var n = 0;
  for (var i = 0; i < str.length; i++) {
    var c = str.charCodeAt(i);
    var b = map[c];
    if (b === undefined) {
      // символ не в кодировке — '?'
      out[n++] = 0x3F;
    } else {
      out[n++] = b;
    }
  }
  return out.slice(0, n);
}

// UTF-8 кодирование через TextEncoder
function encodeUtf8(str) {
  return new TextEncoder().encode(str);
}

// Кодирование строки как Latin1 (windows-1252) — каждый символ = 1 байт
function encodeLatin1(str) {
  var out = new Uint8Array(str.length);
  for (var i = 0; i < str.length; i++) {
    var c = str.charCodeAt(i);
    out[i] = c > 0xFF ? 0x3F : c;
  }
  return out;
}

// Декодирование байт через TextDecoder с заданной меткой
function decodeBytes(bytes, label) {
  try {
    return new TextDecoder(label, {fatal: false}).decode(bytes);
  } catch (e) {
    return null;
  }
}

// ============================================================
// КАНДИДАТЫ — пара (как было прочитано → как закодировать обратно → как декодировать)
// ============================================================
// "Кракозябры" появляются когда байты в кодировке A прочитали как B.
// Чтобы починить — кодируем обратно в B, декодируем как A.
var CANDIDATES = [
  // ⭐ ГЛАВНЫЙ для писем из китайских/японских клиентов:
  // GB18030 байты, "обработанные" как Latin1/Windows-1252.
  // Виден паттерн §X §X §X — где § это 0xA7, маркер русской буквы в GB18030.
  {id: "latin1-gb18030", label: "Latin1 → GB18030 (рус. в GB)", encode: encodeLatin1, decodeAs: "gb18030"},
  {id: "latin1-euc-jp", label: "Latin1 → EUC-JP (рус. в EUC-JP)", encode: encodeLatin1, decodeAs: "euc-jp"},
  // CP1251 байты, прочитанные как Shift-JIS (классика — частая для писем из китайских/японских клиентов)
  {id: "sjis-cp1251", label: "Shift-JIS → CP1251 (рус.)", encode: function(s){return encodeWithSJIS(s);}, decodeAs: "windows-1251"},
  // CP1251 байты, прочитанные как UTF-8 (потеряны при декодировании, частично восстановимо)
  {id: "utf8-cp1251", label: "UTF-8 → CP1251 (рус.)", encode: encodeUtf8, decodeAs: "windows-1251"},
  // UTF-8 байты, прочитанные как CP1251 — самая частая ошибка для русских писем
  {id: "cp1251-utf8", label: "CP1251 → UTF-8 (рус.)", encode: function(s){return encodeWithMap(s, CP1251_MAP);}, decodeAs: "utf-8"},
  // UTF-8 байты, прочитанные как Latin1 (Western)
  {id: "latin1-utf8", label: "Latin1 → UTF-8", encode: encodeLatin1, decodeAs: "utf-8"},
  // CP1251 байты, прочитанные как Latin1
  {id: "latin1-cp1251", label: "Latin1 → CP1251 (рус.)", encode: encodeLatin1, decodeAs: "windows-1251"},
  // KOI8-R байты, прочитанные как CP1251
  {id: "cp1251-koi8", label: "CP1251 → KOI8-R (рус.)", encode: function(s){return encodeWithMap(s, CP1251_MAP);}, decodeAs: "koi8-r"},
  // KOI8-R байты, прочитанные как UTF-8
  {id: "utf8-koi8", label: "UTF-8 → KOI8-R (рус.)", encode: encodeUtf8, decodeAs: "koi8-r"},
  // CP866 (DOS) → CP1251
  {id: "cp1251-cp866", label: "CP1251 → CP866 (рус.)", encode: function(s){return encodeWithMap(s, CP1251_MAP);}, decodeAs: "ibm866"},
  // GB18030 → CP1251 (китайский клиент, обратное направление)
  {id: "gb-cp1251", label: "GB18030 → CP1251 (рус.)", encode: function(s){return encodeWithGB(s);}, decodeAs: "windows-1251"}
];

// SJIS-кодирование — TextEncoder это не умеет, делаем через TextDecoder с круговым трюком:
// Берём строку, для каждой пары ord-символа смотрим, какая пара байт даёт его в SJIS.
// Реализация — через тестовую таблицу в браузере при первом вызове (lazy).
var SJIS_REVERSE = null;
function buildReverseTable(label) {
  // Перебираем все 1- и 2-байтовые последовательности, декодируем — получаем символы.
  // Для каждого символа сохраняем его байтовое представление.
  var rev = {};
  var dec = new TextDecoder(label, {fatal: false});
  // 1-байтовые
  for (var b = 0; b <= 0xFF; b++) {
    var s = dec.decode(new Uint8Array([b]));
    if (s.length === 1 && s.charCodeAt(0) !== 0xFFFD) {
      var c = s.charCodeAt(0);
      if (rev[c] === undefined) rev[c] = [b];
    }
  }
  // 2-байтовые (только пары, начинающиеся с lead-байтов)
  for (var lead = 0x81; lead <= 0xFC; lead++) {
    for (var trail = 0x40; trail <= 0xFC; trail++) {
      var pair = new Uint8Array([lead, trail]);
      var s2 = dec.decode(pair);
      if (s2.length === 1 && s2.charCodeAt(0) !== 0xFFFD) {
        var c2 = s2.charCodeAt(0);
        if (rev[c2] === undefined) rev[c2] = [lead, trail];
      }
    }
  }
  return rev;
}

function encodeWithSJIS(str) {
  if (!SJIS_REVERSE) SJIS_REVERSE = buildReverseTable("shift_jis");
  return encodeWithReverse(str, SJIS_REVERSE);
}

var GB_REVERSE = null;
function encodeWithGB(str) {
  if (!GB_REVERSE) GB_REVERSE = buildReverseTable("gb18030");
  return encodeWithReverse(str, GB_REVERSE);
}

function encodeWithReverse(str, rev) {
  var buf = [];
  for (var i = 0; i < str.length; i++) {
    var c = str.charCodeAt(i);
    var b = rev[c];
    if (b) {
      for (var k = 0; k < b.length; k++) buf.push(b[k]);
    } else {
      buf.push(0x3F); // '?'
    }
  }
  return new Uint8Array(buf);
}

// ============================================================
// СКОРИНГ — насколько результат похож на "нормальный текст"
// ============================================================
// Идея: считаем долю букв (рус./лат.), пробелов, цифр, типичных знаков.
// Штрафуем за U+FFFD (replacement), управляющие символы и редкие диапазоны.
function scoreText(text) {
  if (!text || text.length === 0) return -1e9;
  var len = text.length;
  var goodCyr = 0, goodLat = 0, digit = 0, space = 0, punct = 0;
  var bad = 0, repl = 0, ctrl = 0;

  for (var i = 0; i < len; i++) {
    var c = text.charCodeAt(i);
    if (c === 0xFFFD) { repl++; continue; }
    if (c < 0x20 && c !== 0x09 && c !== 0x0A && c !== 0x0D) { ctrl++; continue; }
    if (c === 0x20 || c === 0x09 || c === 0x0A || c === 0x0D) { space++; continue; }
    // Кириллица
    if ((c >= 0x0410 && c <= 0x044F) || c === 0x0401 || c === 0x0451) { goodCyr++; continue; }
    // Латиница
    if ((c >= 0x41 && c <= 0x5A) || (c >= 0x61 && c <= 0x7A)) { goodLat++; continue; }
    // Цифры
    if (c >= 0x30 && c <= 0x39) { digit++; continue; }
    // Пунктуация ASCII + обычные
    if ((c >= 0x21 && c <= 0x2F) || (c >= 0x3A && c <= 0x40) || (c >= 0x5B && c <= 0x60) || (c >= 0x7B && c <= 0x7E)) { punct++; continue; }
    // "Хорошие" типографские: тире, кавычки, неразр. пробел и т.п.
    if (c === 0xA0 || c === 0x2014 || c === 0x2013 || c === 0x00AB || c === 0x00BB || c === 0x201C || c === 0x201D || c === 0x2026) { punct++; continue; }
    // Всё остальное — подозрительно (CJK, спецсимволы CP1251 в неподходящих местах и т.д.)
    bad++;
  }

  // Базовые баллы
  var score = 0;
  score += goodCyr * 3;        // кириллица — главный признак русского
  score += goodLat * 1.5;      // латиница тоже ок (англ. слова, номера контейнеров)
  score += digit * 1;
  score += space * 0.5;
  score += punct * 0.3;
  score -= bad * 5;            // штраф
  score -= repl * 10;          // сильный штраф за � replacement chars
  score -= ctrl * 8;           // сильный штраф за управляющие

  // Бонус за биграммы кириллицы (тексты на русском содержат "ст", "но", "то", "ра"...)
  if (goodCyr > 5) {
    var lower = text.toLowerCase();
    var bigrams = ["ст","но","то","ра","на","ен","не","ов","ко","ро","по","ни","ре","ть","ал"];
    var hits = 0;
    for (var b = 0; b < bigrams.length; b++) {
      var idx = -1;
      while ((idx = lower.indexOf(bigrams[b], idx + 1)) !== -1) hits++;
    }
    score += hits * 2;
  }

  // Нормируем на длину, чтобы длинные пустяки не обыгрывали короткие осмысленные
  return score / Math.max(1, len);
}

// ============================================================
// ОСНОВНОЙ ВЫЗОВ
// ============================================================
window.decoderRecode = function(text, candidateId) {
  if (!text) return {result: "", label: "", score: 0};
  for (var i = 0; i < CANDIDATES.length; i++) {
    var c = CANDIDATES[i];
    if (c.id !== candidateId) continue;
    try {
      var bytes = c.encode(text);
      var decoded = decodeBytes(bytes, c.decodeAs);
      return {result: decoded || "", label: c.label, score: scoreText(decoded || "")};
    } catch (e) {
      return {result: "", label: c.label, score: -1e9, error: e.message};
    }
  }
  return {result: text, label: "Без изменений", score: scoreText(text)};
};

window.decoderAuto = function(text) {
  if (!text) return {result: "", label: "—", score: 0, all: []};
  var results = [];
  // Базовая оценка "оставить как есть"
  var baseScore = scoreText(text);
  results.push({id: "none", label: "Без изменений (как введено)", result: text, score: baseScore});

  for (var i = 0; i < CANDIDATES.length; i++) {
    var c = CANDIDATES[i];
    try {
      var bytes = c.encode(text);
      var decoded = decodeBytes(bytes, c.decodeAs);
      if (decoded === null) continue;
      results.push({id: c.id, label: c.label, result: decoded, score: scoreText(decoded)});
    } catch (e) { /* skip */ }
  }
  // Сортируем по убыванию score
  results.sort(function(a, b) { return b.score - a.score; });
  var top = results[0];
  return {result: top.result, label: top.label, score: top.score, all: results};
};

window.decoderListCandidates = function() {
  var arr = [{id: "auto", label: "🪄 Авто-определение"}];
  for (var i = 0; i < CANDIDATES.length; i++) {
    arr.push({id: CANDIDATES[i].id, label: CANDIDATES[i].label});
  }
  return arr;
};
