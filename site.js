(function () {
  var S = window.SITE = window.SITE || {};
  var API = S.API || '';
  var $ = function (id) { return document.getElementById(id); };

  function vid() {
    try {
      var v = localStorage.getItem('vid');
      if (!v) { v = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Math.random()).slice(2) + Date.now(); localStorage.setItem('vid', v); }
      return v;
    } catch (e) { return 'na'; }
  }
  S.vid = vid;
  S.consent = function () { try { return localStorage.getItem('consent'); } catch (e) { return null; } };
  S.loc = function () {
    if (!S._loc) {
      S._loc = fetch('https://ipwho.is/').then(function (r) { return r.json(); })
        .then(function (j) { return { city: j.city || '', region: j.region || '', country: j.country || '' }; })
        .catch(function () { return { city: '', region: '', country: '' }; });
    }
    return S._loc;
  };
  S.post = function (data) {
    if (!API) return;
    try { fetch(API, { method: 'POST', mode: 'no-cors', body: new URLSearchParams(data) }); } catch (e) {}
  };
  function get(action) { return fetch(API + '?action=' + action).then(function (r) { return r.json(); }); }
  function device() { return /Mobi|Android/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop'; }

  function trackVisit() {
    if (!API || S.consent() !== 'yes') return;
    var key = 'v:' + location.pathname;
    try { if (sessionStorage.getItem(key)) return; sessionStorage.setItem(key, '1'); } catch (e) {}
    S.loc().then(function (l) {
      S.post({ type: 'visit', vid: vid(), page: location.pathname.split('/').pop() || 'index.html',
               city: l.city, region: l.region, country: l.country, device: device() });
    });
  }

  function banner() {
    if (!API || S.consent()) return;
    var b = document.createElement('div');
    b.setAttribute('role', 'dialog'); b.setAttribute('aria-label', 'Visit counting notice');
    b.style.cssText = 'position:fixed;left:0;right:0;bottom:0;z-index:100;background:#1f2a44;color:#fff;padding:.8rem 1rem;font:15px/1.4 system-ui,sans-serif;display:flex;flex-wrap:wrap;gap:.6rem 1rem;align-items:center;justify-content:space-between';
    var t = document.createElement('span');
    t.textContent = 'This site counts visits and notes your approximate location (city, region, country) to improve the course material. Your name is recorded only if you open a document. Your exact address is not stored.';
    var w = document.createElement('span');
    function btn(label, val) {
      var x = document.createElement('button'); x.textContent = label;
      x.style.cssText = 'margin-left:.5rem;padding:.4rem .9rem;border:1px solid #fff;border-radius:4px;background:' + (val === 'yes' ? '#fff' : 'transparent') + ';color:' + (val === 'yes' ? '#1f2a44' : '#fff') + ';cursor:pointer;font:inherit';
      x.onclick = function () { try { localStorage.setItem('consent', val); } catch (e) {} b.remove(); if (val === 'yes') trackVisit(); };
      return x;
    }
    w.appendChild(btn('OK', 'yes')); w.appendChild(btn('No thanks', 'no'));
    b.appendChild(t); b.appendChild(w); document.body.appendChild(b);
  }

  function stats() {
    var el = $('stat'); if (!API || !el) return;
    get('stats').then(function (j) {
      if (j && typeof j.visits === 'number') el.textContent = 'Visits: ' + j.visits.toLocaleString() + '   |   Visitors: ' + j.unique.toLocaleString();
    }).catch(function () {});
  }

  function board() {
    var sec = $('board'); if (!API || !sec) return;
    get('board').then(function (j) {
      var ann = $('ann'), faq = $('faq'), any = false;
      (j.announcements || []).forEach(function (a) {
        any = true; var d = document.createElement('div'); d.className = 'note-item';
        var h = document.createElement('strong'); h.textContent = (a.date ? a.date + ': ' : '') + a.title;
        var p = document.createElement('p'); p.textContent = a.text; d.appendChild(h); d.appendChild(p); ann.appendChild(d);
      });
      (j.faq || []).forEach(function (f) {
        any = true; var d = document.createElement('details');
        var s = document.createElement('summary'); s.textContent = (f.course ? f.course + ': ' : '') + f.q;
        var p = document.createElement('p'); p.textContent = f.a; d.appendChild(s); d.appendChild(p); faq.appendChild(d);
      });
      $('ann-h').hidden = !(j.announcements || []).length; $('faq-h').hidden = !(j.faq || []).length;
    }).catch(function () {});
    sec.hidden = false;
    var form = $('qform');
    if (form) form.addEventListener('submit', function (e) {
      e.preventDefault();
      var q = $('q').value.trim(); if (!q) return;
      S.post({ type: 'question', name: $('qn').value.trim(), course: $('qc').value, q: q });
      form.reset(); $('qmsg').textContent = 'Thank you. If many students have this doubt, the answer will be posted above for everyone. Individual replies are not sent.';
    });
  }

  document.addEventListener('DOMContentLoaded', function () { banner(); trackVisit(); stats(); board(); });
})();
