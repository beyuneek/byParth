/* =========================================================================
   Sandbox 1 — "Ask this page anything about me"

   In-browser BM25 (k1=1.5, b=0.75) over passages built from CONTENT.
   Three response cases: cited answer · honest refusal · warm greeting.
   No network calls. Everything runs here.
   ========================================================================= */
(function () {
  "use strict";

  const K1 = 1.5;
  const B = 0.75;
  const THRESHOLD = 0.35; // keep hits scoring above 35% of the top hit

  const STOP = new Set(
    ("a an the and or but of to in on for with is are was were be been being do does did " +
     "has have had he she it they i you we at by as from that this these those what which who " +
     "whom whose his her their its about can could would should will my me your our us him them " +
     "into over under out up down then than so if not no yes there here how when where why " +
     "am been being get got very just also more most such own same too").split(/\s+/)
  );

  const GREET = new Set([
    "hi", "hey", "hello", "yo", "namaste", "hola", "sup",
    "good morning", "good evening", "thanks", "test", "ok",
  ]);

  const GREET_TEXT =
    "Hello. Ask me something specific and I'll search my background for it — " +
    "try one of the suggestions below, or ask about chatbots, document AI, or where I have worked.";

  const REFUSE_HTML =
    '<span class="refuse">Nothing on this page covers that — I\'ve only indexed my own background. ' +
    'If it\'s something you\'re working on, <a href="#contact">tell me about it</a> and I\'ll answer you directly.</span>';

  let index = null;   // { docs, df, idf, avgdl, N }
  let initialised = false;
  let els = null;

  /* ---------------- text utils ---------------- */
  function stem(w) {
    w = w.toLowerCase();
    if (w.length > 4) {
      if (w.endsWith("ies")) return w.slice(0, -3) + "y";
      if (w.endsWith("ing")) return w.slice(0, -3);
      if (w.endsWith("ed"))  return w.slice(0, -2);
      if (w.endsWith("es"))  return w.slice(0, -2);
      if (w.endsWith("s"))   return w.slice(0, -1);
    }
    return w;
  }

  function tokenize(str) {
    return String(str)
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((t) => t && t.length >= 2 && !STOP.has(t))
      .map(stem);
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  /* ---------------- build passages from CONTENT ---------------- */
  function buildPassages(C) {
    return (C.index || [])
      .filter((p) => p && p.text && String(p.text).trim())
      .map((p) => ({ title: p.title, text: String(p.text), href: p.href || "#title" }));
  }

  /* ---------------- BM25 index ---------------- */
  function buildIndex(passages) {
    const docs = passages.map((p) => {
      const toks = tokenize(p.text);
      const tf = Object.create(null);
      toks.forEach((t) => (tf[t] = (tf[t] || 0) + 1));
      return { ...p, tf, len: toks.length };
    });

    const N = docs.length;
    const df = Object.create(null);
    docs.forEach((d) => Object.keys(d.tf).forEach((t) => (df[t] = (df[t] || 0) + 1)));

    const idf = Object.create(null);
    Object.keys(df).forEach((t) => {
      idf[t] = Math.log(1 + (N - df[t] + 0.5) / (df[t] + 0.5));
    });

    const avgdl = docs.reduce((s, d) => s + d.len, 0) / (N || 1);
    return { docs, df, idf, avgdl, N };
  }

  function scoreQuery(qTokens) {
    const { docs, idf, avgdl } = index;
    return docs
      .map((d) => {
        let s = 0;
        qTokens.forEach((t) => {
          const f = d.tf[t];
          if (!f) return;
          const denom = f + K1 * (1 - B + (B * d.len) / avgdl);
          s += (idf[t] || 0) * ((f * (K1 + 1)) / denom);
        });
        return { doc: d, score: s };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score);
  }

  /* ---------------- sentence pick + highlight ---------------- */
  function splitSentences(text) {
    const parts = text.match(/[^.!?]+[.!?]*/g);
    return parts ? parts.map((s) => s.trim()).filter(Boolean) : [text];
  }

  function bestSentence(text, qset) {
    const sentences = splitSentences(text);
    let best = sentences[0], bestScore = -1;
    sentences.forEach((s) => {
      const toks = tokenize(s);
      let sc = 0;
      toks.forEach((t) => { if (qset.has(t)) sc++; });
      if (sc > bestScore) { bestScore = sc; best = s; }
    });
    return best;
  }

  // Turn a sentence into typed segments: plain chars + atomic highlight spans.
  function sentenceSegments(sentence, qset) {
    const segs = [];
    const re = /[A-Za-z0-9']+|[^A-Za-z0-9']+/g;
    let m;
    while ((m = re.exec(sentence))) {
      const tok = m[0];
      if (/[A-Za-z0-9]/.test(tok[0]) && qset.has(stem(tok))) {
        segs.push({ t: "atom", v: `<span class="hl">${escapeHtml(tok)}</span>` });
      } else {
        for (const ch of tok) segs.push({ t: "char", v: escapeHtml(ch) });
      }
    }
    return segs;
  }

  function plainSegments(text) {
    const segs = [];
    for (const ch of text) segs.push({ t: "char", v: escapeHtml(ch) });
    return segs;
  }

  /* ---------------- typing ---------------- */
  function typeSegments(container, segments) {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      container.innerHTML = segments.map((s) => s.v).join("");
      return;
    }
    let html = "", i = 0;
    const caret = '<span class="caret" aria-hidden="true"></span>';
    (function step() {
      if (i >= segments.length) { container.innerHTML = html; return; }
      html += segments[i].v;
      const wasAtom = segments[i].t === "atom";
      i++;
      container.innerHTML = html + caret;
      setTimeout(step, wasAtom ? 8 : 13);
    })();
  }

  /* ---------------- responses ---------------- */
  function greet() {
    typeSegments(els.answer, plainSegments(GREET_TEXT));
    els.sources.innerHTML = "";
    els.suggestions.classList.add("nudge");
    setTimeout(() => els.suggestions.classList.remove("nudge"), 2600);
  }

  function refuse() {
    els.answer.innerHTML = REFUSE_HTML;
    els.sources.innerHTML = "";
  }

  function respond(hits, qset) {
    // Build one flat segment stream across the top hits.
    let segs = [];
    hits.forEach((h, i) => {
      const sentence = bestSentence(h.doc.text, qset);
      segs = segs.concat(sentenceSegments(sentence, qset));
      segs.push({ t: "atom", v: ` <sup class="cite">[${i + 1}]</sup> ` });
    });
    typeSegments(els.answer, segs);

    // Sources with relevance, in mono.
    const top = hits[0].score;
    els.sources.innerHTML = hits
      .map((h, i) => {
        const pct = Math.round((h.score / top) * 100);
        return `<div class="ask-source">
          <span class="src-n">[${i + 1}]</span>
          <a href="${h.doc.href}">${escapeHtml(h.doc.title)}</a>
          <span class="src-score">${pct}% match</span>
        </div>`;
      })
      .join("");
  }

  /* ---------------- main query flow ---------------- */
  function runQuery(rawInput) {
    const raw = String(rawInput || "").trim();
    els.input.value = raw;

    const norm = raw.toLowerCase();
    if (norm.length < 3 || GREET.has(norm)) return greet();

    const qTokens = tokenize(raw);
    if (qTokens.length === 0) return greet(); // every word was a stopword

    const ranked = scoreQuery(qTokens);
    if (!ranked.length) return refuse();

    const top = ranked[0].score;
    const hits = ranked.filter((r) => r.score >= THRESHOLD * top).slice(0, 3);
    if (!hits.length) return refuse();

    respond(hits, new Set(qTokens));
  }

  /* ---------------- init ---------------- */
  function init() {
    if (initialised) return;
    initialised = true;

    const C = window.CONTENT;
    index = buildIndex(buildPassages(C));

    els = {
      root: document.getElementById("ask-sandbox"),
      form: document.getElementById("ask-form"),
      input: document.getElementById("ask-input"),
      suggestions: document.getElementById("ask-suggestions"),
      answer: document.getElementById("ask-answer"),
      sources: document.getElementById("ask-sources"),
    };
    if (!els.form) return;

    els.form.addEventListener("submit", (e) => {
      e.preventDefault();
      runQuery(els.input.value);
    });

    els.suggestions.addEventListener("click", (e) => {
      const chip = e.target.closest(".chip");
      if (!chip) return;
      runQuery(chip.dataset.q);
      els.input.focus();
    });

    // Answer the first suggestion so the box is never empty.
    const first = C.ask.suggestions[0];
    runQuery(first);
  }

  /* ---------------- lazy init on scroll into view ----------------
     IntersectionObserver is the primary trigger; a scroll listener and an
     immediate in-view check back it up so init never gets stuck. */
  function setup() {
    const root = document.getElementById("ask-sandbox");
    if (!root) return;
    let done = false, io = null;
    const near = () => {
      const r = root.getBoundingClientRect();
      return r.top < (window.innerHeight || 800) + 300 && r.bottom > -300;
    };
    const cleanup = () => {
      if (io) io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
    const go = () => { if (done) return; done = true; cleanup(); init(); };
    const onScroll = () => { if (near()) go(); };
    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) go(); }), { rootMargin: "150px" });
      io.observe(root);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    if (near()) go();
  }

  window.addEventListener("page:rendered", setup);
})();
