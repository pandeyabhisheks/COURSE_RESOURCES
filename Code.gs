// Google Apps Script for the course site: visit counter, document-open log, questions, announcements and FAQ.
// Paste this whole file into Extensions > Apps Script of a new Google Sheet. See SETUP_STEPS.txt.

var HEAD = {
  Visits:        ['Time', 'Visitor ID', 'Page', 'City', 'Region', 'Country', 'Device'],
  Opens:         ['Time', 'Name', 'Roll number', 'Email', 'File', 'Visitor ID', 'City', 'Region', 'Country', 'Browser'],
  Questions:     ['Time', 'Name (optional)', 'Course', 'Question', 'Status'],
  Announcements: ['Date', 'Title', 'Message', 'Show (Yes/No)'],
  FAQ:           ['Question', 'Answer', 'Course', 'Show (Yes/No)']
};

function sheet_(name) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var s = ss.getSheetByName(name) || ss.insertSheet(name);
  if (s.getLastRow() === 0) s.appendRow(HEAD[name]);
  return s;
}

function doPost(e) {
  var p = e.parameter, now = new Date();
  var clip = function (x, n) { return String(x || '').substring(0, n); };
  if (p.type === 'visit') {
    sheet_('Visits').appendRow([now, clip(p.vid, 60), clip(p.page, 60), clip(p.city, 60), clip(p.region, 60), clip(p.country, 60), clip(p.device, 20)]);
  } else if (p.type === 'open') {
    sheet_('Opens').appendRow([now, clip(p.name, 80), clip(p.roll, 40), clip(p.email, 80), clip(p.file, 80), clip(p.vid, 60), clip(p.city, 60), clip(p.region, 60), clip(p.country, 60), clip(p.ua, 150)]);
  } else if (p.type === 'question') {
    sheet_('Questions').appendRow([now, clip(p.name, 80), clip(p.course, 20), clip(p.q, 1000), 'New']);
  }
  return ContentService.createTextOutput('ok');
}

function doGet(e) {
  var a = (e.parameter && e.parameter.action) || 'stats', out = {};
  var cache = CacheService.getScriptCache(), hit = cache.get(a);
  if (hit) return json_(hit);
  if (a === 'stats') {
    var s = sheet_('Visits'), n = s.getLastRow() - 1, ids = {};
    if (n > 0) s.getRange(2, 2, n, 1).getValues().forEach(function (r) { ids[r[0]] = 1; });
    out = { visits: Math.max(n, 0), unique: Object.keys(ids).length };
  } else if (a === 'board') {
    var rows = function (name) { var sh = sheet_(name); var n = sh.getLastRow() - 1; return n > 0 ? sh.getRange(2, 1, n, 4).getValues() : []; };
    out.announcements = rows('Announcements').filter(function (r) { return String(r[3]).toLowerCase() === 'yes'; })
      .map(function (r) { return { date: r[0] instanceof Date ? Utilities.formatDate(r[0], Session.getScriptTimeZone(), 'd MMM yyyy') : String(r[0]), title: String(r[1]), text: String(r[2]) }; }).reverse();
    out.faq = rows('FAQ').filter(function (r) { return String(r[3]).toLowerCase() === 'yes'; })
      .map(function (r) { return { q: String(r[0]), a: String(r[1]), course: String(r[2]) }; });
  }
  var text = JSON.stringify(out);
  cache.put(a, text, a === 'stats' ? 120 : 300);
  return json_(text);
}

function json_(text) { return ContentService.createTextOutput(text).setMimeType(ContentService.MimeType.JSON); }

// Run this once (Run > setup) to create all tabs and a Dashboard with summaries.
function setup() {
  Object.keys(HEAD).forEach(sheet_);
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var d = ss.getSheetByName('Dashboard') || ss.insertSheet('Dashboard', 0);
  d.clear();
  d.getRange('A1').setValue('Course site dashboard').setFontWeight('bold').setFontSize(14);
  d.getRange('A3:B6').setValues([
    ['Total visits', '=COUNTA(Visits!A2:A)'],
    ['Unique visitors', '=COUNTA(UNIQUE(Visits!B2:B))'],
    ['Documents opened', '=COUNTA(Opens!A2:A)'],
    ['New questions', '=COUNTIF(Questions!E2:E,"New")']]);
  var q = function (cell, label, formula) { d.getRange(cell).offset(-1, 0).setValue(label).setFontWeight('bold'); d.getRange(cell).setFormula(formula); };
  q('A9',  'Visits by region',   '=IFERROR(QUERY(Visits!A2:G,"select E, count(A) where E<>\'\' group by E order by count(A) desc label count(A) \'Visits\'",0),"")');
  q('D9',  'Visits by country',  '=IFERROR(QUERY(Visits!A2:G,"select F, count(A) where F<>\'\' group by F order by count(A) desc label count(A) \'Visits\'",0),"")');
  q('G9',  'Visits by page',     '=IFERROR(QUERY(Visits!A2:G,"select C, count(A) group by C order by count(A) desc label count(A) \'Visits\'",0),"")');
  q('J9',  'Visits by device',   '=IFERROR(QUERY(Visits!A2:G,"select G, count(A) group by G order by count(A) desc label count(A) \'Visits\'",0),"")');
  q('A25', 'Documents opened, by file', '=IFERROR(QUERY(Opens!A2:J,"select E, count(A) group by E order by count(A) desc label count(A) \'Opens\'",0),"")');
  q('D25', 'Documents opened, by region',  '=IFERROR(QUERY(Opens!A2:J,"select H, count(A) where H<>\'\' group by H order by count(A) desc label count(A) \'Opens\'",0),"")');
  q('G25', 'Questions by course', '=IFERROR(QUERY(Questions!A2:E,"select C, count(A) group by C order by count(A) desc label count(A) \'Questions\'",0),"")');
  d.setColumnWidths(1, 12, 150);
}
